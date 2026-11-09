import HttpException from './http.exception.js'

export default class ConflictException extends HttpException {
  constructor(message = '리소스 충돌', error = 'conflict') {
    super(409, message, error)
  }
}
