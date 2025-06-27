import axios, {AxiosError, AxiosInstance, AxiosResponse} from "axios";
import {
  ClientOptionsDto,
  ClientOptionsSchema, PayBeLinkErrorResponseSchema, PayBeLinkResponseDto, PayBeLinkResponseSchema,
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
    this.options = parseZodSchemaOrThrow(options, ClientOptionsSchema);

    this.axios = axios.create({
      baseURL: this.options.isSandbox ? EnvironmentUrls.Sandbox : EnvironmentUrls.Production,
      timeout: this.options.timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  public async payByLink(payload: PayByLinkRequestDto): Promise<PayBeLinkResponseDto> {
    const payloadParsed = parseZodSchemaOrThrow(payload, PayByLinkRequestSchema);
    const request = serializePayByLinkRequest(payloadParsed);

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `ApiKey ${this.options.apiKey}`,
    };

    let response: AxiosResponse<PayBeLinkResponseDto>;

    try {
      response = await this.axios.post<PayBeLinkResponseDto>(
        "v1.02/paybylink/create",
          request,
        {
          headers
        }
      );
    } catch (e) {
      if(e instanceof AxiosError) {
        const errorParsed = parseZodSchemaOrThrow(e.response?.data, PayBeLinkErrorResponseSchema);
        throw new GenericException('EuPago Return a error when try create a pay by link')
            .withData('code', errorParsed.code)
            .withData('message', errorParsed.text);
      }

      throw new GenericException('EuPago Generic a error when try create a pay by link');
    }

    return parseZodSchemaOrThrow(response.data, PayBeLinkResponseSchema);
  }
}