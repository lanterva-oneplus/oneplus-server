import { HttpException } from './http.exception.js'

export class GoneException extends HttpException {
  constructor(message = '리소스가 영구적으로 사라짐', error) {
    super(410, message, error)
  }
}
