import { z } from "zod";
import type { InternalAxiosRequestConfig, AxiosResponse } from "axios";

export const AxiosInterceptorSchema = z.object({
  onRequest: z
    .array(
      z
        .function()
        .args(z.custom<InternalAxiosRequestConfig>())
        .returns(
          z.union([
            z.custom<InternalAxiosRequestConfig>(),
            z.promise(z.custom<InternalAxiosRequestConfig>()),
          ])
        )
    )
    .optional(),
  onResponse: z
    .array(
      z
        .function()
        .args(z.custom<AxiosResponse>())
        .returns(
          z.union([
            z.custom<AxiosResponse>(),
            z.promise(z.custom<AxiosResponse>()),
          ])
        )
    )
    .optional(),
});

export type AxiosInterceptorDto = z.infer<typeof AxiosInterceptorSchema>;
