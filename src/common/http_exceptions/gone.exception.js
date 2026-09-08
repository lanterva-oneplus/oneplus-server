import { HttpException } from './http.exception.js'

export default class GoneException extends HttpException {
  constructor(message = '', error = '리소스가 영구적으로 사라짐') {
    super(410, message, error)
  }
}
