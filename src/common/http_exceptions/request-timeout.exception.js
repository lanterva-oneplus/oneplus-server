import { HttpException } from './http.exception.js'

export default class RequestTimeoutException extends HttpException {
  constructor(message = '', error = '요청 시간 초과') {
    super(408, message, error)
  }
}