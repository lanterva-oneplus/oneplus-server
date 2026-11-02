import InternalServerErrorException from '../../common/http_exceptions/internal-server-error.exception.js'
import UnauthorizedException from '../../common/http_exceptions/unauthorized.exception.js'
import Result from '../../common/modules/result.module.js'
import MeResponseDto from '../dto/me.response.dto.js'

/**
 * @import {Usecase} from '../../common/modules/usecase.module.js'
 * @import { Pool } from 'pg'
 * @import * as jwt from '../../common/modules/jwt.module.js'
 */

/**
 * @typedef {object} MeDependency
 * @property {Pool} pool
 * @property {typeof jwt} jwt
 *
 * @typedef {object} MeCommand
 * @property {string} accessToken
 */
/**
 * @type {Usecase<MeDependency, MeCommand, MeResponseDto, InternalServerErrorException | UnauthorizedException>}
 */
const meUsecase = async (dependency, command) => {
  const pool = dependency.pool
  const jwt = dependency.jwt

  const unauthorized = () =>
    Result.fail(new UnauthorizedException('권한이 없습니다.', 'invalid_access_error'))

  /** @type {string} */
  //@ts-ignore
  const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET

  // 액세스토큰 검증 (변조된 토큰은 verify에서 throw 될 수 있음)
  /** @type {Record<string, string> | false} */
  let payload
  try {
    payload = jwt.verify(command.accessToken, accessTokenSecret)
  } catch (err) {
    console.error(err)
    return unauthorized()
  }

  if (!payload || !payload.sub) {
    console.error('access token 검증 실패')
    return unauthorized()
  }

  // 사용자 조회
  const user = await pool
    .query('select id, email, nickname, profile, status from users where id = $1', [
      payload.sub,
    ])
    .then((result) => result.rows[0])
    .catch((err) => {
      console.error(err)
      return Result.fail(
        new InternalServerErrorException(
          '사용자 조회 중 문제가 발생했습니다.',
          'user_select_error',
        ),
      )
    })

  if (user instanceof Result) return user

  if (!user) {
    console.error('사용자 없음')
    return unauthorized()
  }

  // 가입 시 status를 지정하지 않으므로 null은 활성 사용자로 취급
  if (user.status !== null && user.status !== 'active') {
    console.error('비활성 사용자')
    return unauthorized()
  }

  return Result.ok(
    new MeResponseDto(String(user.id), user.email, user.nickname, user.profile),
  )
}

export default meUsecase
