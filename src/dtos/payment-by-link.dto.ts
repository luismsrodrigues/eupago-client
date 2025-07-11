import {z} from "zod";
import {format} from "date-fns";
import { Currency, Language } from "../constants";

export const PayByLinkRequestSchema = z.object({
  payment: z.object({
    successUrl: z.string().url().optional().describe("URL to redirect after successful payment"),
    failUrl: z.string().url().optional().describe("URL to redirect after failed payment"),
    backUrl: z.string().url().optional().describe("The payer will be forwarded to this url if the user presses back."),
    amount: z.object({
      currency: z.nativeEnum(Currency).describe("Defines the currency of the payment amount. Must be one of the supported currencies."),
      value: z.number().describe("Payment amount"),
    }),
    lang:  z.nativeEnum(Language).describe("Defines the Language of the email notifications."),
    expirationDate: z.date().describe("Defines the date when the link will expire (Default value is 24 hours after the link creation)")
  }),
  products: z.array(z.object({
    sku: z.string().optional().describe("Required to pay with Cofidis Pay"),
    name: z.string().nonempty(),
    value: z.number(),
    quantity: z.number(),
    tax: z.number().optional(),
    description: z.string().optional(),
  })).optional(),
  customer: z.object({
    notify: z.boolean().default(false).optional(),
    email: z.string().optional().describe("Email address"),
    name: z.string().nonempty(),
  }).optional(),
});



export type PayByLinkRequestDto = z.infer<typeof PayByLinkRequestSchema>;

export const serializePayByLinkRequest = (data: PayByLinkRequestDto) => ({
  ...data,
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