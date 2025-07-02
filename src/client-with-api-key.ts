import axios, { AxiosInstance, AxiosResponse, HttpStatusCode } from "axios";
import {
  EuPagoWithApiKeyClientOptionsDto,
  EuPagoWithApiKeyClientOptionsSchema,
  PayBeLinkErrorResponseSchema,
  PayBeLinkResponseDto,
  PayBeLinkResponseSchema,
  PayByLinkRequestDto,
  PayByLinkRequestSchema,
  serializePayByLinkRequest,
} from "./dtos";
import { EnvironmentUrls } from "./environments.config";
import { parseZodSchemaOrThrow } from "./utils";
import {
  BusinessException,
  GenericException,
  UnauthorizedException,
} from "./exceptions";
import { BaseClient } from "./base.client";

export class EuPagoWithApiKeyClient extends BaseClient<EuPagoWithApiKeyClientOptionsDto> {
  private readonly _defaultMessage = "EuPago With Api Key Client Unexpected Error";

  constructor(options: EuPagoWithApiKeyClientOptionsDto) {
    super(
      parseZodSchemaOrThrow(
        options,
        EuPagoWithApiKeyClientOptionsSchema,
        "Error when parsing client options"
      )
    );

    this.addOnResponseErrorInterceptor((response?: AxiosResponse) => {
      if (response) {
        const status = response.status;
        if (
          status === HttpStatusCode.BadRequest ||
          status === HttpStatusCode.Conflict
        ) {
          const parsed = parseZodSchemaOrThrow(
            response.data,
            PayBeLinkErrorResponseSchema,
            "Error when parsing business error response from EuPago"
          );

          throw new BusinessException("EuPago business error")
            .withData("code", parsed.code)
            .withData("message", parsed.text);
        }

        if (status === HttpStatusCode.Unauthorized) {
          throw new UnauthorizedException("EuPago unauthorized");
        }
      }

      throw new GenericException(this._defaultMessage);
    });

    this.addOnRequestInterceptor((config) => {
      config.headers.Authorization = `ApiKey ${this._options.apiKey}`;
      return config;
    });
  }

  protected buildAxiosInstance(): AxiosInstance {
    return axios.create({
      baseURL: this._options.isSandbox
        ? EnvironmentUrls.Sandbox
        : EnvironmentUrls.Production,
      timeout: this._options.timeout,
    });
  }

  public async payByLink(
    payload: PayByLinkRequestDto
  ): Promise<PayBeLinkResponseDto> {
    const payloadParsed = parseZodSchemaOrThrow(
      payload,
      PayByLinkRequestSchema,
      "Error when parsing request payload for pay by link"
    );
    const request = serializePayByLinkRequest(payloadParsed);

    const response = await this._axios.post<PayBeLinkResponseDto>(
      "v1.02/paybylink/create",
      request
    );

    return parseZodSchemaOrThrow(
      response.data,
      PayBeLinkResponseSchema,
      "Error when parsing response from EuPago"
    );
  }
}
