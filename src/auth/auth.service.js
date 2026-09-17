import { setCookie } from '../common/modules/cookie.module.js'
import { sign } from '../common/modules/jwt.module.js'
import pool from '../common/modules/postgresql.module.js'
import Result from '../common/modules/result.module.js'

export default class AuthService {
  /**
   * @typedef {object} userInfo
   * @property {string} sub
   * @property {string} name
   * @property {string} picture
   * @property {string} email
   *
   * @param {userInfo} userInfo
   * @returns {Promise<Result>}
   */
  async upsert(userInfo) {
    try {
      const userResult = await pool.query(
        `
        insert into users (sub, email, nickname, profile, status)
        values($1, $2, $3, $4, 'active')
        on conflict (sub)
        do update set
          sub = excluded.sub,
          email = excluded.email,
          nickname = excluded.nickname,
          profile = excluded.profile
        returning *;
        `,
        [userInfo.sub, userInfo.email, userInfo.name, userInfo.picture],
      )

      return Result.success({ message: '사용자 정보를 성공적으로 불러왔습니다.', user: userResult.rows[0] })
    } catch (e) {
      console.error(e)
      return Result.fail({ message: 'db upsert 에러', errorMessage: e.message })
    }
  }

  /**
   * @typedef {object} UserInfo
   * @property {string} nickName
   * @property {string} profile
   *
   * @param {UserInfo} userInfo
   * @returns {string}
   */
  createAccessTokenJWT(userInfo) {
    return sign(
      {
        nickname: userInfo.nickname,
        profile: userInfo.profile,
      },
      process.env.ACCESS_TOKEN_SECRET,
      {
        iss: 'oneplus',
        sub: user.id,
        exp: 60 * 15,
        iat: Math.floor(Date.now() / 1000),
      },
    )
  }

  /**
   * @param {http.ServerResponse} res
   * @param {string} accessTokenJWT
   */
  setAccessTokenJWTCookie(res, accessTokenJWT) {
    void setCookie(res, process.env.ACCESS_COOKIE_NAME, accessTokenJWT, {
      path: '/',
      maxAge: 60 * 15,
      httpOnly: true,
      secure: true,
      sameSite: 'Lax',
    })
  }

  /**
   * @typedef {object} RefreshRes
   * @property {string} refreshTokenJWT
   * @property {string} jti
   *
   * @param {string} userId
   * @returns {RefreshRes}
   */
  createRefreshTokenJWT(userId) {
    const jti = crypto.randomUUID()
    const refreshTokenJWT = sign({}, process.env.REFRESH_TOKEN_SECRET, {
      iss: 'oneplus',
      sub: userId,
      jti: jti,
      exp: 60 * 60 * 24 * 30,
      iat: Math.floor(Date.now() / 1000),
    })
    return {
      refreshTokenJWT: refreshTokenJWT,
      jti: jti,
    }
  }

  /**
   * @param {http.ServerResponse} res
   * @param {string} refreshTokenJWT
   */
  setRefreshTokenJWTCookie(res, refreshTokenJWT) {
    void setCookie(res, process.env.REFRESH_COOKIE_NAME, refreshTokenJWT, {
      path: '/api/auth/refresh',
      maxAge: 60 * 60 * 24 * 30,
      httpOnly: true,
      secure: true,
      sameSite: 'Lax',
    })
  }
}
