import HttpException from './http.exception.js'

export default class BadRequestException extends HttpException {
  constructor(message = '', error = '잘못된 요청') {
    super(400, message, error)
  }
}
