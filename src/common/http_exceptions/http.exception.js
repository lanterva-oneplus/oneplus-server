/**
 * throw new BadRequestException('하이', '에러') <- 서브에러
 * BadRequestException [Error] 
 *     at 에러 위치
 *   statusCode: 400, <- 에러 값
 *   error: '에러' <- 에러 값
 * }
 */
export default class HttpException extends Error {
  constructor(statusCode, message, error) {
    super(message)
    this.statusCode = statusCode
    this.error = error
  }
}
