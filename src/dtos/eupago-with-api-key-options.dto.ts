import {z} from "zod";
import { AxiosInterceptorSchema } from "./axios-interceptor.dto";

export const EuPagoWithApiKeyClientOptionsSchema = z.object({
  apiKey: z.string().nonempty(),
  isSandbox: z.boolean().nullable().default(false),
  timeout: z.number().default(5000),
  interceptors: AxiosInterceptorSchema.optional(),
});

export type EuPagoWithApiKeyClientOptionsDto = z.infer<typeof EuPagoWithApiKeyClientOptionsSchema>;