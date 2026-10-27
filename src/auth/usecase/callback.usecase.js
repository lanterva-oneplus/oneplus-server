import crypto from 'crypto'
import InternalServerErrorException from '../../common/http_exceptions/internal-server-error.exception.js'
import UnauthorizedException from '../../common/http_exceptions/unauthorized.exception.js'
import Result from '../../common/modules/result.module.js'
import CallbackResponseDto from '../dto/callback.response.dto.js'
import OAuthService from '../service/oauth.service.js'

/**
 * @import {Usecase} from '../../common/modules/usecase.module.js'
 * @import { Pool } from 'pg'
 * @import { Redis } from 'ioredis';
 * @import * as jwt from '../../common/modules/jwt.module.js'
 */

/**
 * @typedef {object} CallbackDependency
 * @property {OAuthService} oAuthService
 * @property {Redis} redis
 * @property {Pool} pool
 * @property {typeof jwt} jwt
 *
 * @typedef {object} CallbackCommand
 * @property {string} code
 * @property {string} state
 */
/**
 * @type {Usecase<CallbackDependency, CallbackCommand, CallbackResponseDto, InternalServerErrorException | UnauthorizedException>}
 */
const callbackUsecase = async (dependency, command) => {
  const redis = dependency.redis
  const oAuthService = dependency.oAuthService
  const pool = dependency.pool
  const jwt = dependency.jwt

  // state 검증
  const stateValue = await redis.getdel(`state:${command.state}`).catch((err) => {
    console.error(err)
    return Result.fail(
      new InternalServerErrorException(
        '임시 인증 정보 반환 중 문제가 발생했습니다.',
        'imdb_cb_error',
      ),
    )
  })

  if (stateValue instanceof Result) return stateValue

  if (!stateValue) {
    console.error('redis state 미일치')
    return Result.fail(
      new UnauthorizedException('인증 정보가 일치하지 않습니다.', 'invalid_state_error'),
    )
  }

  // `did:${command.deviceId}:code_verifier:${codeVerifier}`
  const [deviceId, codeVerifier] = stateValue.split(':').filter((val, idx) => idx % 2 !== 0)

  // 액세스토큰
  const oauthAccessToken = await oAuthService
    .tradeToken(command.code, codeVerifier)
    .catch((err) => {
      console.error(err)
      return Result.fail(
        new InternalServerErrorException(
          '사용자 인증 정보 요청 중 문제가 발생했습니다.',
          'user_auth_error',
        ),
      )
    })

  if (oauthAccessToken instanceof Result) return oauthAccessToken

  // 사용자정보
  const userInfo = await oAuthService.getUserInfo(oauthAccessToken).catch((err) => {
    console.error(err)
    return Result.fail(
      new InternalServerErrorException(
        '사용자 정보 요청 중 문제가 발생했습니다.',
        'userinfo_error',
      ),
    )
  })

  if (userInfo instanceof Result) return userInfo

  // 사용자 조회
  let user = await pool
    .query('select * from users where sub = $1', [userInfo.sub])
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

  // 사용자 계정이 없을 경우 생성
  if (!user) {
    user = await pool
      .query(
        'insert into users (sub, email, nickname, profile) values ($1, $2, $3, $4) returning *',
        [userInfo.sub, userInfo.email, userInfo.name, userInfo.picture],
      )
      .then((result) => result.rows[0])
      .catch((err) => {
        console.error(err)
        return Result.fail(
          new InternalServerErrorException(
            '사용자 생성 중 문제가 발생했습니다.',
            'user_insert_error',
          ),
        )
      })

    if (user instanceof Result) return user
  }

  // 사용자 로그인 처리 (세션)
  const sessionId = crypto.randomUUID()

  try {
    await redis
      .multi()
      .hset(`session:${sessionId}`, { did: deviceId, uid: user.id })
      .expire(`session:${sessionId}`, 60 * 60 * 24 * 14)
      .exec()
  } catch (err) {
    console.error(err)
    return Result.fail(
      new InternalServerErrorException(
        '사용자 로그인 처리중 문제가 발생했습니다.',
        'session_error',
      ),
    )
  }

  // 토큰 발급
  /** @type {string} */
  //@ts-ignore
  const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET

  /** @type {string} */
  //@ts-ignore
  const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET

  const now = new Date()
  const accessTokenExp = new Date(now.getTime() + 1000 * 60 * 30)
  const refreshTokenExp = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 14)

  const accessToken = jwt.sign({ sub: String(user.id) }, accessTokenSecret, {
    iat: now,
    exp: accessTokenExp,
  })

  const refreshToken = jwt.sign({ sub: String(user.id) }, refreshTokenSecret, {
    iat: now,
    exp: refreshTokenExp,
    jti: sessionId,
  })

  return Result.ok(new CallbackResponseDto(accessToken, refreshToken))
}

export default callbackUsecase
