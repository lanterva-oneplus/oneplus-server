import InternalServerErrorException from '../../common/http_exceptions/internal-server-error.exception.js'
import UnauthorizedException from '../../common/http_exceptions/unauthorized.exception.js'
import Result from '../../common/modules/result.module.js'
import RefreshResponseDto from '../dto/refresh.response.dto.js'

/**
 * @import {Usecase} from '../../common/modules/usecase.module.js'
 * @import { Redis } from 'ioredis';
 * @import * as jwt from '../../common/modules/jwt.module.js'
 */

/**
 * @typedef {object} RefreshDependency
 * @property {Redis} redis
 * @property {typeof jwt} jwt
 *
 * @typedef {object} RefreshCommand
 * @property {string} refreshToken
 * @property {string} deviceId
 */
/**
 * @type {Usecase<RefreshDependency, RefreshCommand, RefreshResponseDto, InternalServerErrorException | UnauthorizedException>}
 */
const refreshUsecase = async (dependency, command) => {
  const redis = dependency.redis
  const jwt = dependency.jwt

  const unauthorized = () =>
    Result.fail(new UnauthorizedException('권한이 없습니다.', 'invalid_refresh_error'))

  /** @type {string} */
  //@ts-ignore
  const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET

  /** @type {string} */
  //@ts-ignore
  const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET

  // 리프레시 토큰 검증 (변조된 토큰은 verify에서 throw 될 수 있음)
  /** @type {Record<string, string> | false} */
  let payload
  try {
    payload = jwt.verify(command.refreshToken, refreshTokenSecret)
  } catch (err) {
    console.error(err)
    return unauthorized()
  }

  if (!payload || !payload.sub || !payload.jti) {
    console.error('refresh token 검증 실패')
    return unauthorized()
  }

  // 세션 조회
  const session = await redis.hgetall(`session:${payload.jti}`).catch((err) => {
    console.error(err)
    return Result.fail(
      new InternalServerErrorException(
        '세션 조회 중 문제가 발생했습니다.',
        'session_error',
      ),
    )
  })

  if (session instanceof Result) return session

  if (!session || !session.uid) {
    console.error('redis 세션 없음')
    return unauthorized()
  }

  // 사용자, 디바이스 일치 검증
  if (session.uid !== String(payload.sub) || session.did !== command.deviceId) {
    console.error('세션 사용자/디바이스 불일치')
    return unauthorized()
  }

  // 액세스토큰 재발급
  const now = new Date()
  const accessTokenExp = new Date(now.getTime() + 1000 * 60 * 30)

  const accessToken = jwt.sign({ sub: String(payload.sub) }, accessTokenSecret, {
    iat: now,
    exp: accessTokenExp,
  })

  return Result.ok(new RefreshResponseDto(accessToken))
}

export default refreshUsecase
