import HttpException from './http.exception.js'

export default class InternalServerErrorException extends HttpException {
  constructor(message = '내부 서버 오류', error = 'internal_server_error') {
    super(500, message, error)
  }
}