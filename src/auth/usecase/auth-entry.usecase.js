import redis from '../../common/modules/redis.module.js'
import InternalServerErrorException from '../../common/http_exceptions/internal-server-error.exception.js'
import { OAuthService } from '../oauth.service.js'

/**
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 */
const authEntry = async (req, res) => {
  const oAuthService = new OAuthService()

  const state = oAuthService.generateState()
  const { codeVerifier, codeChallenge } = oAuthService.generateCodeVerifierSet()
  const url = oAuthService.generateAuthURL(state, codeChallenge)

  try {
    await redis.set(`auth:state:${state}`, codeVerifier, 'EX', 300)
  } catch (e) {
    console.error('레디스 에러: ', e)
    throw new InternalServerErrorException('임시 인증 정보 저장 중 문제가 발생했습니다.')
  }

  res.redirect(url, {
    statusCode: 302,
    cache: false,
    maxAge: 0,
  })
}

export default authEntry
