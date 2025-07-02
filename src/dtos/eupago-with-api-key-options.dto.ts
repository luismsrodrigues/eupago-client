import {z} from "zod";

export const EuPagoWithApiKeyClientOptionsSchema = z.object({
  apiKey: z.string().nonempty(),
  isSandbox: z.boolean().nullable().default(false),
  timeout: z.number().default(5000),
});

export type EuPagoWithApiKeyClientOptionsDto = z.infer<typeof EuPagoWithApiKeyClientOptionsSchema>;