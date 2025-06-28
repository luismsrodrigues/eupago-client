import { EuPagoWithApiKeyClient } from "../src";
import { Currency, Language } from "../src/constants";
import {
  BusinessException,
  GenericException,
  UnauthorizedException,
  ValidationException,
} from "../src/exceptions";

describe("EuPagoWithApiKeyClient", () => {
  it("invalid api key must throw a UnauthorizedException", async () => {
    const client = new EuPagoWithApiKeyClient({
      apiKey: "INVALID_API_KEY",
      isSandbox: true,
      timeout: 5000,
    });

    expect(client).toBeInstanceOf(EuPagoWithApiKeyClient);

    let caught: any;
    try {
      const result = await client.payByLink({
        payment: {
          amount: { currency: Currency.EUR, value: 1.0 },
          lang: Language.PT,
          expirationDate: new Date("2099-12-31 23:59:59"),
        },
      });
    } catch (err) {
      caught = err;
    }

    expect(caught).toBeInstanceOf(UnauthorizedException);
  });

  const client = new EuPagoWithApiKeyClient({
    apiKey: process.env.API_KEY as string,
    isSandbox: true,
    timeout: 5000,
  });

  it("passing invalid expirationDate must throw BusinessException", async () => {
    expect(client).toBeInstanceOf(EuPagoWithApiKeyClient);

    let caught: any;
    try {
      const result = await client.payByLink({
        payment: {
          amount: { currency: Currency.EUR, value: 1.0 },
          lang: Language.PT,
          expirationDate: new Date("2000-12-31 23:59:59"),
        },
      });
    } catch (err) {
      caught = err;
    }
    expect(caught).toBeInstanceOf(BusinessException);

    const keys = Object.keys(caught.responseData);

    expect(keys).toContain("code");
    expect(keys).toContain("message");
  });

  it("passing invalid currency must throw BusinessException", async () => {
    expect(client).toBeInstanceOf(EuPagoWithApiKeyClient);

    let caught: any;
    try {
      const result = await client.payByLink({
        payment: {
          amount: { currency: "INVALID_CURRENCY" as Currency, value: 1.0 },
          lang: Language.PT,
          expirationDate: new Date("2099-12-31 23:59:59"),
        },
      });
    } catch (err) {
      caught = err;
    }
    expect(caught).toBeInstanceOf(ValidationException);
    expect(caught.responseData).toHaveProperty(
      ["payment.amount.currency"],
      expect.any(Array)
    );
  });

  it("passing valid value", async () => {
    expect(client).toBeInstanceOf(EuPagoWithApiKeyClient);

    const result = await client.payByLink({
      payment: {
        successUrl: "https://eupago.luisrodrigues.dev/success",
        failUrl: "https://eupago.luisrodrigues.dev/failUrl",
        backUrl: "https://eupago.luisrodrigues.dev/backUrl",
        amount: { currency: Currency.EUR, value: 10 },
        lang: Language.ES,
        expirationDate: new Date("2099-12-31 23:59:59"),
      },
    });

    expect(result).toBeDefined();
    expect(result.redirectUrl).not.toHaveLength(0);
  });
});
