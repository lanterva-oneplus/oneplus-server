import { HttpException } from './http.exception.js'

export default class InternalServerErrorException extends HttpException {
  constructor(message = '', error = '내부 서버 오류') {
    super(500, message, error)
  }
}