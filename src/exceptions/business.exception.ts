import { BaseException } from "./base.exceptions";

export class BusinessException extends BaseException {
  constructor(message: string) {
    super(message);
    this.name = BusinessException.name;
  }
}