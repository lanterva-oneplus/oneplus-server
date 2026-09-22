import HttpException from './http.exception.js'

export default class RequestTimeoutException extends HttpException {
  constructor(message = '요청 시간 초과', error = 'request_timeout') {
    super(408, message, error)
  }
}