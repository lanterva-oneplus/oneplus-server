import ForbiddenException from '../http_exceptions/forbidden.exception.js'
import UnauthorizedException from '../http_exceptions/unauthorized.exception.js'
import meUsecase from '../../auth/usecase/me.usecase.js'
import { getCookie } from '../modules/cookie.module.js'
import * as jwt from '../modules/jwt.module.js'
import pool from '../modules/postgresql.module.js'

/**
 * @import {req, res} from '../server/types/context.types.js'
 */

/**
 * @param {req} req
 * @param {res} res
 * @param {Function} next
 */
const authMiddleware = async (req, res, next) => {
  const fail = (/** @type {any} */ error) => {
    if (!req.readableEnded) req.resume()
    return res.sendError(error)
  }

  /** @type {string} */
  //@ts-ignore
  const accessCookieName = process.env.ACCESS_COOKIE_NAME

  const accessToken = getCookie(req, accessCookieName)
  if (!accessToken) {
    return fail(new UnauthorizedException('권한이 없습니다.', 'invalid_access_error'))
  }

  const result = await meUsecase({ pool: pool, jwt: jwt }, { accessToken })
  if (result.error) return fail(result.error)

  const { id, email, nickname, profile, role } = /** @type {any} */ (result.data?.toObject())
  req.user = { id, email, nickname, profile, role }

  next()
}

/**
 * @param {req} req
 * @param {res} res
 * @param {Function} next
 */
const adminAuthMiddleware = async (req, res, next) => {
  // 인증 단계가 통과해야만 다음으로 진행 (실패 응답은 authMiddleware가 처리)
  await authMiddleware(req, res, () => {
    if (req.user?.role !== 'admin') {
      if (!req.readableEnded) req.resume()
      return res.sendError(new ForbiddenException('관리자 권한이 필요합니다.', 'forbidden_error'))
    }
    next()
  })
}

export { authMiddleware, adminAuthMiddleware }
export default authMiddleware
