import { HttpException } from "./http.exception.js";

export class UnauthorizedException extends HttpException {
  constructor(message = '인증 실패', error) {
    super(401, message, error)
  }
}