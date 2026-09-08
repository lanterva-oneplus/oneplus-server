import { HttpException } from './http.exception.js'

export class ForbiddenException extends HttpException {
  constructor(message = '접근 권한 없음', error) {
    super(403, message, error)
  }
}
