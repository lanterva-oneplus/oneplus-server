import InternalServerErrorException from '../../common/http_exceptions/internal-server-error.exception.js'
import UnauthorizedException from '../../common/http_exceptions/unauthorized.exception.js'
import Result from '../../common/modules/result.module.js'

/**
 * @import {Usecase} from '../../common/modules/usecase.module.js'
 * @import { Redis } from 'ioredis';
 * @import * as jwt from '../../common/modules/jwt.module.js'
 */

/**
 * @typedef {object} LogoutDependency
 * @property {Redis} redis
 * @property {typeof jwt} jwt
 *
 * @typedef {object} LogoutCommand
 * @property {string} refreshToken
 * @property {string} deviceId
 */
/**
 * 토큰이 만료됐거나 세션이 이미 없는 경우도 성공으로 처리한다. (쿠키는 컨트롤러에서 항상 삭제)
 * @type {Usecase<LogoutDependency, LogoutCommand, null, InternalServerErrorException | UnauthorizedException>}
 */
const logoutUsecase = async (dependency, command) => {
  const redis = dependency.redis
  const jwt = dependency.jwt

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
    return Result.ok(null)
  }

  // 만료/위조된 토큰: 지울 세션이 없으므로 쿠키만 삭제하도록 성공 처리
  if (!payload || !payload.sub || !payload.jti) return Result.ok(null)

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

  // 이미 삭제된 세션
  if (!session || !session.uid) return Result.ok(null)

  // 유효한 토큰이지만 다른 사용자/디바이스의 세션이면 삭제하지 않는다
  if (session.uid !== String(payload.sub) || session.did !== command.deviceId) {
    console.error('세션 사용자/디바이스 불일치')
    return Result.fail(new UnauthorizedException('권한이 없습니다.', 'invalid_logout_error'))
  }

  // 세션 삭제
  const deleted = await redis.del(`session:${payload.jti}`).catch((err) => {
    console.error(err)
    return Result.fail(
      new InternalServerErrorException(
        '세션 삭제 중 문제가 발생했습니다.',
        'session_error',
      ),
    )
  })

  if (deleted instanceof Result) return deleted

  return Result.ok(null)
}

export default logoutUsecase
