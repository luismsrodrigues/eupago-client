import { ZodTypeAny, infer as zInfer} from "zod";
import {ValidationException} from "../exceptions";

export function parseZodSchemaOrThrow<S extends ZodTypeAny>(
    props: unknown,
    schema: S,
    errorMessage?: string
): zInfer<S> {
  const result = schema.safeParse(props);

  if (!result.success) {
    const exp = new ValidationException(errorMessage);

    result.error.errors.forEach(({ path, message }) => {
      const key = path.length ? path.join(".") : "root";
      exp.withData(key, message);
    });

    console.error(exp.toString());
    

    throw exp;
  }

  return result.data;
}
