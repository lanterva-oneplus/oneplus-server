import HttpException from './http.exception.js'

export default class ConflictException extends HttpException {
  constructor(message = '', error = '리소스 충돌') {
    super(409, message, error)
  }
}
