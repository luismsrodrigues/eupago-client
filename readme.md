# EuPago API Client

A TypeScript client library for integrating with the [EuPago API](https://eupago.readme.io/reference/api-eupago). This client handles request serialization, schema validation via Zod, structured error handling using custom exceptions, and includes unit test suites.

[![npm downloads](https://img.shields.io/npm/dm/@luisrodrigues/eupago-client.svg)](https://www.npmjs.com/package/@luisrodrigues/eupago-client)
[![CI](https://github.com/luismsrodrigues/eupago-client/actions/workflows/publish.yml/badge.svg)](https://github.com/luismsrodrigues/eupago-client/actions/workflows/publish.yml)

---

## Features

* **Zod-powered validation**: All inputs and responses are validated against Zod schemas. Invalid data throws a `ValidationException` with detailed error information.
* **Typed DTOs (Data Transfer Objects)**: Request and response shapes are defined in `dtos/*.ts` and inferred via `z.infer` for end-to-end type safety.
* **Configurable HTTP client**: Uses Axios under the hood, with support for sandbox and production endpoints, timeouts, and API key authorization.
* **Structured error handling**: Network or API errors are wrapped in a `GenericException` (or `ValidationException`), carrying metadata via the `ExceptionBase` class.

---

## Installation

```bash
npm install @luisrodrigues/eupago-client
# or
yarn add @luisrodrigues/eupago-client
```

---

## Quick Start

```ts
import { EuPagoClient, PayByLinkRequestDto } from "@luisrodrigues/eupago-client";
import { ValidationException, GenericException } from "@luisrodrigues/eupago-client/exceptions";

(async () => {
  // 1. Configure the client
  const client = new EuPagoClient({
    apiKey: process.env.EUPAGO_API_KEY!,
    timeout: 5000,
    isSandbox: true,
  });

  // 2. Build your request DTO
  const request: PayByLinkRequestDto = {
    amount: 25.0,
    clientReference: "ORDER-1234",
    description: "Payment for order #1234",
    // ... other required fields
  };

  // 3. Call the API
  try {
    const result = await client.payByLink(request);
    console.log("Redirect URL:", result.redirectUrl);
  } catch (err) {
    if (err instanceof ValidationException) {
      console.error("Validation errors:", err.responseData);
    } else if (err instanceof GenericException) {
      console.error("API error:", err.responseData);
    } else {
      console.error("Unexpected error:", err);
    }
  }
})();
```

---

## Configuration Options

| Option      | Type      | Required | Description                                                              |
| ----------- | --------- | -------- | ------------------------------------------------------------------------ |
| `apiKey`    | `string`  | Yes      | Your EuPago API key                                                      |
| `timeout`   | `number`  | No       | Axios request timeout in milliseconds (default: 5000)                    |
| `isSandbox` | `boolean` | No       | Whether to use the sandbox environment (`true`) or production (`false`). |

When `isSandbox` is set to `true`, the client will use the **Sandbox Environment**:

```
https://sandbox.eupago.pt/api/
```

When `isSandbox` is set to `false`, the client will use the **Production Environment**:

```
https://clientes.eupago.pt/api/
```

---

## DTOs & Schemas

All request and response DTOs live under the `dtos/` folder. Each has a matching Zod schema for parsing:

* **`PayByLinkRequestDto`** (`PayByLinkRequestSchema`)
* **`PayBeLinkResponseDto`** (`PayBeLinkResponseSchema`)
* **`PayBeLinkErrorResponseDto`** (`PayBeLinkErrorResponseSchema`)
* **`ClientOptionsDto`** (`ClientOptionsSchema`)

---

## Error Handling

### `ExceptionBase`

An abstract base class extending `Error`, allowing you to attach arbitrary key/value arrays:

```ts
export abstract class ExceptionBase extends Error {
  private readonly _data: Record<string, string[]> = {};

  protected constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }

  public withData(key: string, value: string): this {
    (this._data[key] ??= []).push(value);
    return this;
  }

  public override toString(): string {
    const base = `${this.name}: ${this.message}`;
    const entries = Object.entries(this._data);
    if (!entries.length) return base;
    const formatted = entries
      .map(([k, vals]) => `\n  ${k} = [${vals.join(', ')}]`)
      .join('');
    return `${base}\nData:${formatted}`;
  }

  public get responseData(): Record<string, string[]> {
    return this._data;
  }
}
```

#### `ValidationException`

Thrown by `parseZodSchemaOrThrow` when input fails schema validation. Carries a `responseData` mapping each field name (or dotted path) to its error messages.

#### `GenericException`

Thrown on network or API-level errors when calling `payByLink`. Contains `code` and `message` from the EuPago error payload.

---

## Reference

Everything in this SDK maps directly to the EuPago API [API Reference](https://eupago.readme.io/reference/api-eupago). See their docs for full details on request parameters and response fields.
