import { HttpException } from './http.exception.js'

export class NotImplementedException extends HttpException {
  constructor(message = '구현되지 않음', error) {
    super(501, message, error)
  }
}
