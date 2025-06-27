import { BaseException } from "./base.exceptions";

export class GenericException extends BaseException {
  constructor(message: string) {
    super(message);
  }
}