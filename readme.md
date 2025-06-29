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
import { EuPagoWithApiKeyClient, PayByLinkRequestDto } from "@luisrodrigues/eupago-client";
import { ValidationException, GenericException } from "@luisrodrigues/eupago-client/exceptions";

(async () => {
  // 1. Configure the client
  const client = new EuPagoWithApiKeyClient({
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

All API errors are normalized into rich, custom exception classes that extend `BaseException`, carrying structured metadata you can inspect via `.responseData`.

### `BusinessException`
Thrown when EuPago returns a 4xx business error (status 400 or 409).  
- Parses the response body with `PayBeLinkErrorResponseSchema`  
- Attaches two data fields:  
  - `code` – the EuPago error code  
  - `message` – the human-readable error text  

```ts
throw new BusinessException("…")
  .withData("code", parsed.code)
  .withData("message", parsed.text);
```

### `UnauthorizedException`
Thrown when the API responds with HTTP 401.  
- Indicates an invalid or missing API key  
- Message is always `"EuPago unauthorized"`

### `GenericException`
Thrown for all other network or server errors.  
- Wraps unexpected failures (timeouts, 5xx status codes, parsing errors)  
- Uses a default message: `"EuPago Client Unexpected Error"`

### Inspecting Exception Data

Each exception inherits from `BaseException`, which provides:

```ts
exception.responseData // Record<string, string[]>
exception.toString()   // includes attached key/value arrays
```


#### `ValidationException`

Thrown by `parseZodSchemaOrThrow` when input fails schema validation. Carries a `responseData` mapping each field name (or dotted path) to its error messages.

#### `GenericException`

Thrown on network or API-level errors when calling `payByLink`. Contains `code` and `message` from the EuPago error payload.

---

## Reference

Everything in this SDK maps directly to the EuPago API [API Reference](https://eupago.readme.io/reference/api-eupago). See their docs for full details on request parameters and response fields.

## EuPago API Integration Matrix

This matrix details each EuPago API endpoint, its documentation link, and whether it’s been integrated into the client.  
It provides a clear at-a-glance view of supported methods and authentication requirements.


| Integrated | Method                     | HTTP Request                                           | Docs                                                                                         | Authentication                               |
|------------|----------------------------|--------------------------------------------------------|---------------------------------------------------------------------------------------------|----------------------------------------------|
| ✅         | `payByLink`                | `POST /api/v1.02/paybylink/create`                     | [PayByLink](https://eupago.readme.io/reference/paybylink)                                   | API key in header: `ApiKey: YOUR_API_KEY`    |
| ❌         | `createMultibanco`         | `POST /clientes/rest_api/multibanco/create`            | [Multibanco](https://eupago.readme.io/reference/api-eupago#operation/multibanco)            | API key in body: `"chave": "YOUR_API_KEY"`   |
| ❌         | `createMultibancoDPG`      | `POST /clientes/rest_api/multibanco/apg`               | [Multibanco DPG](https://eupago.readme.io/reference/api-eupago#operation/multibanco-dpg)    | API key in body: `"chave": "YOUR_API_KEY"`   |
| ❌         | `createMBWay`              | `POST /clientes/rest_api/mbway/create`                 | [MB WAY](https://eupago.readme.io/reference/api-eupago#operation/mb-way)                    | API key in body: `"chave": "YOUR_API_KEY"`   |
| ❌         | `createMBWayMealPasses`    | `POST /clientes/rest_api/mbway_refeicao/create`        | [MB WAY Meal Passes](https://eupago.readme.io/reference/api-eupago#operation/mb-way-meal-passes) | API key in body: `"chave": "YOUR_API_KEY"`   |
| ❌         | `createPayshop`            | `POST /clientes/rest_api/payshop/create`               | [Payshop](https://eupago.readme.io/reference/api-eupago#operation/payshop)                  | API key in body: `"chave": "YOUR_API_KEY"`   |
| ❌         | `createPaysafecard`        | `POST /clientes/rest_api/paysafecard/create`           | [Paysafecard](https://eupago.readme.io/reference/api-eupago#operation/paysafecard)          | API key in body: `"chave": "YOUR_API_KEY"`   |
| ❌         | `createCreditCard3DS`      | `POST /clientes/rest_api/cc/form`                      | [Credit Card 3DS](https://eupago.readme.io/reference/api-eupago#operation/credit-card-3ds)  | API key in body: `"chave": "YOUR_API_KEY"`   |
| ❌         | `getReferenceInfo`         | `POST /clientes/rest_api/multibanco/info`              | [Reference Information](https://eupago.readme.io/reference/api-eupago#operation/reference-information) | API key in body: `"chave": "YOUR_API_KEY"`   |
