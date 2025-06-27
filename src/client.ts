import axios, {AxiosError, AxiosInstance, AxiosResponse} from "axios";
import {
  ClientOptionsDto,
  ClientOptionsSchema, 
  PayBeLinkErrorResponseSchema, 
  PayBeLinkResponseDto, 
  PayBeLinkResponseSchema,
  PayByLinkRequestDto,
  PayByLinkRequestSchema,
  serializePayByLinkRequest
} from "./dtos";
import {EnvironmentUrls} from "./environments.config";
import {parseZodSchemaOrThrow} from "./utils";
import {GenericException} from "./exceptions";

export class EuPagoClient {
  private readonly axios: AxiosInstance;
  private readonly options: ClientOptionsDto;

  constructor(options: ClientOptionsDto) {
    this.options = parseZodSchemaOrThrow(options, ClientOptionsSchema, 'Error when parsing client options');

    this.axios = axios.create({
      baseURL: this.options.isSandbox ? EnvironmentUrls.Sandbox : EnvironmentUrls.Production,
      timeout: this.options.timeout,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `ApiKey ${this.options.apiKey}`,
      },
    });
  }

  public async payByLink(payload: PayByLinkRequestDto): Promise<PayBeLinkResponseDto> {
    const payloadParsed = parseZodSchemaOrThrow(payload, PayByLinkRequestSchema, 'Error when parsing request payload for pay by link');
    const request = serializePayByLinkRequest(payloadParsed);

    let response: AxiosResponse<PayBeLinkResponseDto>;

    try {
      response = await this.axios.post<PayBeLinkResponseDto>(
        "v1.02/paybylink/create",
          request,
      );
    } catch (e) {
      if(e instanceof AxiosError) {
        const errorParsed = parseZodSchemaOrThrow(e.response?.data, PayBeLinkErrorResponseSchema, 'Error when parsing error response from EuPago');
        throw new GenericException('EuPago Return a error when try create a pay by link')
            .withData('code', errorParsed.code)
            .withData('message', errorParsed.text);
      }

      throw new GenericException('EuPago Generic a error when try create a pay by link');
    }

    return parseZodSchemaOrThrow(response.data, PayBeLinkResponseSchema, 'Error when parsing response from EuPago');
  }
}