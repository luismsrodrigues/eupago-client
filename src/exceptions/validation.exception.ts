import {BaseException} from "./base.exceptions";

export class ValidationException extends BaseException {
  constructor( message: string = "Validation failed") {
    super(message);
    this.name = ValidationException.name;
  }
}
