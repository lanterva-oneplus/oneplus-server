import HttpException from './http.exception.js'

export default class ForbiddenException extends HttpException {
  constructor(message = '', error = '접근 권한 없음') {
    super(403, message, error)
  }
}
