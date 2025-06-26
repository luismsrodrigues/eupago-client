import { ExampleDto } from "./dtos/example.dto";

export function greet(arg: ExampleDto) {
  return "Hello from tsup!" + arg.id;
}