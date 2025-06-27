import {z} from "zod";

export const ClientOptionsSchema = z.object({
  apiKey: z.string().nonempty(),
  isSandbox: z.boolean().nullable().default(false),
  timeout: z.number().default(5000),
});

export type ClientOptionsDto = z.infer<typeof ClientOptionsSchema>;