import {z} from "zod";
import {format} from "date-fns";

export const PayByLinkRequestSchema = z.object({
  payment: z.object({
    successUrl: z.string().url().optional(),
    failUrl: z.string().url().optional(),
    backUrl: z.string().url().optional(),
    amount: z.object({
      currency: z.string(),
      value: z.number(),
    }),
    lang: z.string(),
    expirationDate: z.date()
  }),
});

export type PayByLinkRequestDto = z.infer<typeof PayByLinkRequestSchema>;

export const serializePayByLinkRequest = (data: PayByLinkRequestDto) => ({
  payment: {
    ...data.payment,
    expirationDate: format(data.payment.expirationDate, "yyyy-MM-dd HH:mm:ss"),
  },
});

export const PayBeLinkResponseSchema = z.object({
  transactionStatus: z.string(),
  transactionID: z.string(),
  status: z.string(),
  redirectUrl: z.string().url(),
});

export type PayBeLinkResponseDto = z.infer<typeof PayBeLinkResponseSchema>;

export const PayBeLinkErrorResponseSchema = z.object({
  transactionStatus: z.string(),
  code: z.string(),
  text: z.string(),
});

export type PayBeLinkErrorResponseDto = z.infer<typeof PayBeLinkErrorResponseSchema>;