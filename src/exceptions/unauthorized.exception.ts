import { BaseException } from "./base.exceptions";

export class UnauthorizedException extends BaseException {
  constructor(message: string) {
    super(message);
    this.name = UnauthorizedException.name;
  }
}