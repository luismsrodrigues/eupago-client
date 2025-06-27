import {EuPagoClient} from '../src';
import {GenericException} from "../src/exceptions";

describe('EuPagoClient', () => {
  const client = new EuPagoClient({
    apiKey: process.env.API_KEY as string,
    isSandbox: true,
    timeout: 5000
  });

  it('passing invalid expirationDate generic exception must throw', async () => {

    expect(client).toBeInstanceOf(EuPagoClient);

    let caught: any;
    try {
      const result = await client.payByLink({
        payment: {
          amount: {currency: 'EUR', value: 1.0},
          lang: 'PT',
          expirationDate: new Date('2000-12-31 23:59:59'),
        },
      });
    } catch (err) {
      caught = err;
    }
    expect(caught).toBeInstanceOf(GenericException);

    const keys = Object.keys(caught.responseData);

    expect(keys).toContain("code");
    expect(keys).toContain("message");
  });

  it('passing valid value', async () => {

    expect(client).toBeInstanceOf(EuPagoClient);

    const result = await client.payByLink({
      payment: {
        amount: {currency: 'EUR', value: 10},
        lang: 'PT',
        expirationDate: new Date('2099-12-31 23:59:59'),
      },
    });

    expect(result).toBeDefined();
    expect(result.redirectUrl).not.toHaveLength(0);
  });
});