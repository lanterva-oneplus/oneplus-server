import { HttpException } from './http.exception.js'

export class InternalServerErrorException extends HttpException {
  constructor(message = '내부 서버 오류', error) {
    super(500, message, error)
  }
}