import { HttpException } from './http.exception.js'

export default class NotFoundException extends HttpException {
  constructor(message = '리소스를 찾을 수 없음', error) {
    super(404, message, error)
  }
}