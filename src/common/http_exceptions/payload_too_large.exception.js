import HttpException from './http.exception.js'

export default class PayloadTooLargeException extends HttpException {
  constructor(message = '페이로드 최대 용량 초과', error = 'payload_too_large') {
    super(413, message, error)
  }
}
