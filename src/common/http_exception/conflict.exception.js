import { HttpException } from './http.exception.js'

export class ConflictException extends HttpException {
  constructor(message = '리소스 충돌', error) {
    super(409, message, error)
  }
}
