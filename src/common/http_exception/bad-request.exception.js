import { HttpException } from './http.exception.js'

export class BadRequestException extends HttpException {
  constructor(message = '잘못된 요청', error) {
    super(400, message, error)
  }
}
