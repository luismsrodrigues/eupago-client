import { z } from "zod";
import type { InternalAxiosRequestConfig, AxiosResponse, AxiosError } from "axios";

export const AxiosInterceptorOnRequestSchema = z
  .function()
  .args(z.custom<InternalAxiosRequestConfig>())
  .returns(
    z.union([
      z.custom<InternalAxiosRequestConfig>(),
      z.promise(z.custom<InternalAxiosRequestConfig>()),
    ])
  );

export type AxiosInterceptorOnRequestDto = z.infer<typeof AxiosInterceptorOnRequestSchema>;

export const AxiosInterceptorOnResponseSchema = z
  .function()
  .args(z.custom<AxiosResponse>())
  .returns(
    z.union([z.custom<AxiosResponse>(), z.promise(z.custom<AxiosResponse>())])
  );

export type AxiosInterceptorOnResponseDto = z.infer<typeof AxiosInterceptorOnResponseSchema>;

export const AxiosInterceptorOnResponseErrorSchema = z
  .function()
  .args(z.custom<AxiosResponse>().optional())
  .returns(
    z.union([
      z.any(),
      z.promise(z.any())
    ])
  );

export type AxiosInterceptorOnResponseErrorDto = z.infer<typeof AxiosInterceptorOnResponseErrorSchema>;