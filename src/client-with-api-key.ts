import axios, {AxiosError, AxiosInstance, AxiosResponse} from "axios";
import {
  EuPagoWithApiKeyClientOptionsDto,
  EuPagoWithApiKeyClientOptionsSchema, 
  PayBeLinkErrorResponseSchema, 
  PayBeLinkResponseDto, 
  PayBeLinkResponseSchema,
  PayByLinkRequestDto,
  PayByLinkRequestSchema,
  serializePayByLinkRequest
} from "./dtos";
import {EnvironmentUrls} from "./environments.config";
import {parseZodSchemaOrThrow} from "./utils";
import {BaseException, BusinessException, GenericException, UnauthorizedException} from "./exceptions";

export class EuPagoWithApiKeyClient {
  private readonly _axios: AxiosInstance;
  private readonly _options: EuPagoWithApiKeyClientOptionsDto;
  private readonly _defaultMessage = 'EuPago Client Unexpected  Error';

  constructor(options: EuPagoWithApiKeyClientOptionsDto) {
    this._options = parseZodSchemaOrThrow(options, EuPagoWithApiKeyClientOptionsSchema, 'Error when parsing client options');

    this._axios = axios.create({
      baseURL: this._options.isSandbox ? EnvironmentUrls.Sandbox : EnvironmentUrls.Production,
      timeout: this._options.timeout,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `ApiKey ${this._options.apiKey}`,
      },
    });
  }

  public async payByLink(payload: PayByLinkRequestDto): Promise<PayBeLinkResponseDto> {
    const payloadParsed = parseZodSchemaOrThrow(payload, PayByLinkRequestSchema, 'Error when parsing request payload for pay by link');
    const request = serializePayByLinkRequest(payloadParsed);

    let response: AxiosResponse<PayBeLinkResponseDto>;

    try {
      response = await this._axios.post<PayBeLinkResponseDto>(
        "v1.02/paybylink/create",
          request,
      );
    } catch (e) {
      throw this.handleAxiosError(e, "EuPago return a error when try create a pay by link");
    }

    return parseZodSchemaOrThrow(response.data, PayBeLinkResponseSchema, 'Error when parsing response from EuPago');
  }

  
  private handleAxiosError(err: unknown, message: string): BaseException {
    if (err instanceof AxiosError && err.response) {
      const status = err.response.status;
      if (status === 400 || status === 409) {
        const parsed = parseZodSchemaOrThrow(
          err.response.data,
          PayBeLinkErrorResponseSchema,
          "Error when parsing business error response from EuPago"
        );
        
        return new BusinessException(
          message
        )
          .withData("code", parsed.code)
          .withData("message", parsed.text);
      }

      if (status === 401) {
        return new UnauthorizedException("EuPago unauthorized");
      }
    }

    return new GenericException(this._defaultMessage);
  }
}