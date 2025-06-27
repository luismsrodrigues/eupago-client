# EuPago Client Client

A TypeScript client library for integrating with the [EuPago PayByLink API](https://eupago.readme.io/reference/api-eupago). This Client handles request serialization, schema validation via Zod, and structured error handling using custom exceptions.

---

## Features

* **Zod-powered validation**: All inputs and responses are validated against Zod schemas. Invalid data throws a `ValidationException` with detailed error information.
* **Typed DTOs (Data Transfer Objects)**: Request and response shapes are defined in `dtos/*.ts` and inferred via `z.infer` for end-to-end type safety.
* **Automatic serialization**: `serializePayByLinkRequest` converts your DTO to the payload format expected by the API.
* **Configurable HTTP client**: Uses Axios under the hood, with support for sandbox and production endpoints, timeouts, and API key authorization.
* **Structured error handling**: Network or API errors are wrapped in a `GenericException` (or `ValidationException`), carrying metadata via the `ExceptionBase` class.

---

## Installation

```bash
npm install @luisrodrigues/eupago-client
# or
yarn add TypeScript icon, indicating that this package has built-in type declarations
```

---

## Quick Start

```ts
import { EuPagoClient } from "@your-org/eupago-client";
import { PayByLinkRequestDto } from "@your-org/eupago-client/dtos";

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
```

---

## Configuration Options

| Option      | Type      | Required | Description                                                             |
| ----------- | --------- | -------- | ----------------------------------------------------------------------- |
| `apiKey`    | `string`  | Yes      | Your EuPago API key                                                     |
| `timeout`   | `number`  | No       | Axios request timeout in milliseconds (default: 5000)                   |
| `isSandbox` | `boolean` | No       | Whether to use the sandbox environment (`true`) or production (`false`) |

---

## DTOs & Schemas

All request and response DTOs live under the `dtos/` folder. Each has a matching Zod schema for parsing:

* **`PayByLinkRequestDto`** (`PayByLinkRequestSchema`)
* **`PayBeLinkResponseDto`** (`PayBeLinkResponseSchema`)
* **`PayBeLinkErrorResponseSchema`**
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

Everything in this SDK maps directly to the EuPago PayByLink [API Reference](https://eupago.readme.io/reference/api-eupago). See their docs for full details on request parameters and response fields.
