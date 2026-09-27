import HttpException from './http.exception.js'

export default class UnauthorizedException extends HttpException {
  constructor(message = '인증 실패', error = 'unauthorized') {
    super(401, message, error)
  }
}
