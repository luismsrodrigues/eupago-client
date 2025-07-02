import { AxiosInstance } from "axios";
import {
  AxiosInterceptorOnRequestDto,
  AxiosInterceptorOnRequestSchema,
  AxiosInterceptorOnResponseDto,
  AxiosInterceptorOnResponseErrorDto,
  AxiosInterceptorOnResponseErrorSchema,
  AxiosInterceptorOnResponseSchema,
} from "./dtos";
import { parseZodSchemaOrThrow } from "./utils";

export abstract class BaseClient<T> {
  protected readonly _options: T;
  protected _axios: AxiosInstance;

  constructor(options: T) {
    this._options = options;
    this._axios = this.buildAxiosInstance();
  }

  protected abstract buildAxiosInstance(): AxiosInstance;

  public addOnRequestInterceptor(
    interceptor: AxiosInterceptorOnRequestDto
  ): this {
    const parsedInterceptor = parseZodSchemaOrThrow(
      interceptor,
      AxiosInterceptorOnRequestSchema,
      "Error when parsing interceptor on request"
    );

    this._axios.interceptors.request.use(
      (config) => parsedInterceptor(config),
      undefined
    );

    return this;
  }

  public addOnResponseInterceptor(
    interceptor: AxiosInterceptorOnResponseDto
  ): this {
    const parsedInterceptor = parseZodSchemaOrThrow(
      interceptor,
      AxiosInterceptorOnResponseSchema,
      "Error when parsing interceptor on response"
    );

    this._axios.interceptors.response.use(
      (config) => parsedInterceptor(config),
      undefined
    );

    return this;
  }

  public addOnResponseErrorInterceptor(
    interceptor: AxiosInterceptorOnResponseErrorDto
  ): this {
    const parsedInterceptor = parseZodSchemaOrThrow(
      interceptor,
      AxiosInterceptorOnResponseErrorSchema,
      "Error when parsing interceptor on response error"
    );

    this._axios.interceptors.response.use(
      undefined,
      (error) => parsedInterceptor(error)
    );

    return this;
  }
}
