import HttpException from './http.exception.js'

export default class NotImplementedException extends HttpException {
  constructor(message = '', error = '구현되지 않음') {
    super(501, message, error)
  }
}
