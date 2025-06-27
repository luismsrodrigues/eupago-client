import { z } from "zod";
import { parseZodSchemaOrThrow } from "../src/utils";
import { ValidationException } from "../src/exceptions";

describe("parseZodSchemaOrThrow", () => {
  it("returns parsed data when the input matches the schema", () => {
    const schema = z.object({
      name: z.string(),
      age: z.number().int().positive(),
    });
    const input = { name: "Alice", age: 30 };

    const result = parseZodSchemaOrThrow(input, schema);
    expect(result).toEqual(input);
  });

  it("throws ValidationException on missing required fields", () => {
    const schema = z.object({
      name: z.string().min(1, "Name is required"),
      age: z.number(),
    });
    const input = { age: 25 };

    let caught: any;
    try {
      parseZodSchemaOrThrow(input, schema);
    } catch (err) {
      caught = err;
    }
    expect(caught).toBeInstanceOf(ValidationException);

    expect(caught.responseData).toHaveProperty("name");
    const msgs = caught.responseData.name!;
    expect(Array.isArray(msgs) && msgs.length).toBeGreaterThan(0);

    expect(msgs[0]).toMatch(/Name is required|Required/);

    const out = caught.toString();
    expect(out).toContain("Validation failed");
    expect(out).toContain("name");
  });

  it("records nested field errors under a single dotted key", () => {
    const schema = z.object({
      user: z.object({
        email: z.string().email("Invalid email"),
      }),
    });
    const input = { user: { email: "not-an-email" } };

    let caught: any;
    try {
      parseZodSchemaOrThrow(input, schema);
    } catch (err) {
      caught = err;
    }
    expect(caught).toBeInstanceOf(ValidationException);

    expect(Object.keys(caught.responseData)).toContain("user.email");
    expect(caught.responseData["user.email"]![0]).toBe("Invalid email");

    const out = caught.toString();
    expect(out).toContain("user.email");
    expect(out).toContain('"Invalid email"');
  });

  it("uses 'root' for top‐level type mismatches", () => {
    const schema = z.string().min(5, "Too short");
    const input = 123;

    let caught: any;
    try {
      parseZodSchemaOrThrow(input, schema);
    } catch (err) {
      caught = err;
    }
    expect(caught).toBeInstanceOf(ValidationException);

    expect(Object.keys(caught.responseData)).toContain("root");
    expect(caught.responseData.root![0]).toMatch(/Too short|Expected string/);

    expect(caught.toString()).toContain("root");
  });

  it("reports the array‐length error for too‐small arrays", () => {
    const schema = z.object({
      tags: z
          .array(z.string().min(3, "Tag too short"))
          .min(2, "Need at least two tags"),
    });
    const input = { tags: ["a"] };

    let caught: any;
    try {
      parseZodSchemaOrThrow(input, schema);
    } catch (err) {
      caught = err;
    }
    expect(caught).toBeInstanceOf(ValidationException);

    const tagsErrs = caught.responseData.tags!;
    expect(tagsErrs).toContain("Need at least two tags");

    if (tagsErrs.length > 1) {
      expect(tagsErrs).toContain("Tag too short");
    }

    const out = caught.toString();
    expect(out).toContain("tags");
    expect(out).toContain('"Need at least two tags"');
  });
});
