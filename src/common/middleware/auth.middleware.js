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
  // 인증 실패 시 읽지 않은 body(multipart 등)가 연결을 붙잡지 않도록 비운다
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

  const { id, email, nickname, profile } = /** @type {any} */ (result.data?.toObject())
  req.user = { id, email, nickname, profile }

  next()
}

export default authMiddleware
