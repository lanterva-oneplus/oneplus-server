import { HttpException } from './http.exception.js'

export default class ForbiddenException extends HttpException {
  constructor(message = '접근 권한 없음', error) {
    super(403, message, error)
  }
}
