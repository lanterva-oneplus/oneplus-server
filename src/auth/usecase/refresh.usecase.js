import ForbiddenException from '../../common/http_exceptions/forbidden.exception.js'
import InternalServerErrorException from '../../common/http_exceptions/internal-server-error.exception.js'
import { getCookie } from '../../common/modules/cookie.module.js'
import { verify } from '../../common/modules/jwt.module.js'
import pool from '../../common/modules/postgresql.module.js'
import redis from '../../common/modules/redis.module.js'
import AuthService from '../auth.service.js'

/**
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 */
const refresh = async (req, res) => {
  const accessTokenJWTCookie = getCookie(req, process.env.ACCESS_COOKIE_NAME)
  const refreshTokenJWTCookie = getCookie(req, process.env.REFRESH_COOKIE_NAME)

  // 액세스토큰 만료
  if (!accessTokenJWTCookie) {
    // 리프래시 토큰도 만료 => 로그인 만료됨
    if (!refreshTokenJWTCookie) throw new ForbiddenException('로그인이 만료되었습니다', 'session_expired')

    // 리프래시 토큰 살아있음. 액세스 토큰 재발급 필요
    const refreshTokenJWT = verify(refreshTokenJWTCookie.value, process.env.REFRESH_TOKEN_SECRET)
    const [userId, leftSessionTimeSec] = await redis
      .pipeline()
      .get(`session:${refreshTokenJWT.jti}`)
      .ttl(`session:${refreshTokenJWT.jti}`)
      .exec()
      .catch((err) => {
        console.error(err.message)
        throw new InternalServerErrorException('사용자 정보 요청 중 서버에서 문제가 발생했습니다.')
      })
    if (leftSessionTimeSec === -2) throw new ForbiddenException('로그인이 만료되었습니다', 'session_expired')
    
    const authService = new AuthService()

    // 사용자 정보 얻기
    const userResult = await pool.query('select nickname, profile from users where id = $1;', [userId]).catch((err) => {
      console.error(err)
      throw new InternalServerErrorException('사용자 정보 요청 중 서버에서 문제가 발생했습니다.', 'failed_request_user_info')
    })

    const user = userResult.rows[0]

    // 액세스 토큰 재발급
    const accessTokenJWT = authService.createAccessTokenJWT({
      nickName: user.nickName,
      profile: user.profile,
    })
    authService.setAccessTokenJWTCookie(res, accessTokenJWT)

    // 리프래시 토큰 7일 미만 => 재발급
    if (leftSessionTimeSec < 604800) {
      const { jti, refreshTokenJWT } = authService.createRefreshTokenJWT(user.id)
      authService.setRefreshTokenJWTCookie(res, refreshTokenJWT)
      await redis.set(`session:${jti}`, user.id, 'EX', 60 * 60 * 24 * 30).catch((err) => {
        throw new InternalServerErrorException('사용자 로그인 처리 중 문제가 발생했습니다.', 'server_session_error')
      })
    }
  } else {
    throw new ForbiddenException('로그인 상태가 이미 정상입니다.', 'aleady_logged_in')
  }
}

export default refresh
