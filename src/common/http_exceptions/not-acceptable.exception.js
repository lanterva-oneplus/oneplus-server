import HttpException from './http.exception.js'

export default class NotAcceptableException extends HttpException {
  constructor(message = '', error = '허용되지 않음') {
    super(406, message, error)
  }
}
