import UnauthorizedException from '../../common/http_exceptions/unauthorized.exception.js'
import ForbiddenException from '../../common/http_exceptions/forbidden.exception.js'
import InternalServerErrorException from '../../common/http_exceptions/internal-server-error.exception.js'
import { OAuthService } from '../oauth.service.js'
import redis from '../../common/modules/redis.module.js'
import AuthService from '../auth.service.js'
import { sign } from '../../common/modules/jwt.module.js'
import { setCookie } from '../../common/modules/cookie.module.js'

/**
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 */
const authCallback = async (req, res) => {
  // 콜백 에러처리
  const error = req.query['error']

  if (error) {
    if (error === 'access_denied') throw new ForbiddenException('사용자가 인증을 거절했습니다.')
    throw new UnauthorizedException('서버에 문제가 발생했습니다.', req.query['error_description'])
  }

  // 토큰 교환 정보 검증
  /** @type {string} */
  const callbackState = req.query['state']
  if (!callbackState) throw new ForbiddenException('인증 정보가 누락되었습니다')

  /** @type {string} */
  const callbackCode = req.query['code']
  if (!callbackCode) throw new ForbiddenException('인증 정보가 누락되었습니다')

  const codeVerifier = await redis.get(`auth:state:${callbackState}`).catch((err) => {
    throw new InternalServerErrorException(err)
  })

  // oauth 객체
  const oAuthService = new OAuthService()

  // 토큰교환
  const tradeTokenResult = await oAuthService.tradeToken(callbackCode, codeVerifier)

  const delResult = await redis.del(`auth:state:${callbackState}`).catch((err) => {
    throw new InternalServerErrorException(err)
  })

  if (delResult < 1) throw new InternalServerErrorException('임시 인증 정보를 만료하는 중 문제가 발생했습니다.')

  if (!tradeTokenResult.success) {
    const code = tradeTokenResult.error.errorCode
    if (code === 'invalid_grant') {
      throw new ForbiddenException('인증 정보가 만료되었거나 일치하지 않습니다.', tradeTokenResult.error.errorCode)
    }
    throw new InternalServerErrorException('서버 에러가 발생했습니다.', code)
  }

  // 사용자 정보 요청
  const getUserInfoResult = await oAuthService.getUserInfo(tradeTokenResult.data.accessToken)

  if (!getUserInfoResult.success) {
    /** @type {number} */
    const code = getUserInfoResult.error.errorCode
    /** @type {string} */
    const message = getUserInfoResult.error.errorMessage

    console.error(`code: ${code}\nerrorMessage: ${message}`)
    throw new InternalServerErrorException('인증 정보에 문제가 있습니다.')
  }

  const authService = new AuthService()

  // 사용자 정보 upsert
  const userResult = await authService.upsert(getUserInfoResult.data.userInfo)
  const user = userResult.data.user

  // 액세스토큰 jwt 생성
  const accessTokenJWT = sign(
    {
      nickname: user.nickname,
      profile: user.profile,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      iss: 'oneplus',
      sub: user.id,
      exp: 60 * 15,
      iat: Math.floor(Date.now() / 1000),
    },
  )

  // 리프래시토큰 jwt 생성
  const refreshToken = crypto.randomUUID()

  const refreshTokenJWT = sign({}, process.env.REFRESH_TOKEN_SECRET, {
    iss: 'oneplus',
    sub: user.id,
    jti: refreshToken,
    exp: 60 * 60 * 24 * 30,
    iat: Math.floor(Date.now() / 1000),
  })

  // 30일 TTL
  await redis.set(`session:${jti}`, user.id, 'EX', 60 * 60 * 24 * 30)

  // 쿠키 넣기
  void setCookie(res, process.env.ACCESS_COOKIE_NAME, accessTokenJWT, {
    path: '/',
    maxAge: 60 * 15,
    httpOnly: true,
    secure: true,
    sameSite: 'Lax',
  })

  void setCookie(res, process.env.REFRESH_COOKIE_NAME, refreshTokenJWT, {
    path: '/api/auth/refresh',
    maxAge: 60 * 60 * 24 * 30,
    httpOnly: true,
    secure: true,
    sameSite: 'Lax',
  })

  return res.redirect(process.env.DEFAULT_PATH)
}

export default authCallback
