import HttpException from './http.exception.js'

export default class UnauthorizedException extends HttpException {
  constructor(message = '', error = '인증 실패') {
    super(401, message, error)
  }
}
