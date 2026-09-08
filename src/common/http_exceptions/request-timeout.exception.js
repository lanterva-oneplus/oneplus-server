import { HttpException } from './http.exception.js'

export class RequestTimeoutException extends HttpException {
  constructor(message = '요청 시간 초과', error) {
    super(408, message, error)
  }
}