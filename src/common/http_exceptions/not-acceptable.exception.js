import { HttpException } from './http.exception.js'

export default class NotAcceptableException extends HttpException {
  constructor(message = '허용되지 않음', error) {
    super(406, message, error)
  }
}
