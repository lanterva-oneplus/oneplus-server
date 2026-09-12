import UnauthorizedException from '../../common/http_exceptions/unauthorized.exception.js'
import ForbiddenException from '../../common/http_exceptions/forbidden.exception.js'
import InternalServerErrorException from '../../common/http_exceptions/internal-server-error.exception.js'
import { OAuthService } from '../oauth.service.js'
import redis from '../../common/modules/redis.module.js'

/**
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 */
const authCallback = async (req, res) => {
  const isError = req.query['error']

  if (isError) {
    const errorCode = req.query['error_description']
    // 사용자 인증 거부
    if (errorCode === 'access_denied') {
      return res.sendError(new ForbiddenException('사용자가 인증을 거절했습니다.'), 403)
    }
    // 나머지 서버 문제
    return res.sendError(new UnauthorizedException('서버에 문제가 발생했습니다.', errorCode), 500)
  }

  /** @type {string} */
  const callbackState = req.query['state']
  if (!callbackState) return res.sendError(new ForbiddenException('인증 정보가 누락되었습니다'), 403)

  /** @type {string} */
  const callbackCode = req.query['code']
  if (!callbackCode) return res.sendError(new ForbiddenException('인증 정보가 누락되었습니다'), 403)

  /** @type {string} */
  const codeVerifier = await redis.get(`auth:state:${callbackState}`)
  if (!codeVerifier) return res.sendError(new ForbiddenException('임시 인증값을 검증에 실패했습니다.'), 403)

  const oAuthService = new OAuthService()
  const result = await oAuthService.getUserInfo(callbackCode)

  if (!result.success) {
    switch (result.errorCode) {
      case 'invalid_grant':
        throw new ForbiddenException('인증 정보가 만료되었거나 일치하지 않습니다.')
      case 'invalid_client':
      case 'invalid_request':
      case 'unauthorized_client':
      case 'unsupported_grant_type':
        throw new InternalServerErrorException('서버에서 사용자 인증 중 문제가 발생했습니다.')
      case 'UNAUTHENTICATED':
        throw new ForbiddenException('사용자 정보 요청을 위한 정보가 잘못되었거나 만료되었습니다.')
      case 'PERMISSION_DENIED':
        throw new InternalServerErrorException('서버에서 사용자 정보를 요청했으나 거부되었습니다.')
    }
  }

  return res.sendSuccess(result.data, '사용자 정보를 성공적으로 불러왔습니다.', 200)
}

export default authCallback
