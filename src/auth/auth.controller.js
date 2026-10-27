import BadRequestException from '../common/http_exceptions/bad-request.exception.js'
import * as jwt from '../common/modules/jwt.module.js'
import { setCookie } from '../common/modules/cookie.module.js'
import pool from '../common/modules/postgresql.module.js'
import redis from '../common/modules/redis.module.js'
import { Router } from '../common/server/router.js'
import CallbackRequestDto from './dto/callback.request.dto.js'
import EntryRequestDto from './dto/entry.request.dto.js'
import OAuthService from './service/oauth.service.js'
import callbackUsecase from './usecase/callback.usecase.js'
import entryUsecase from './usecase/entry.usecase.js'

const authRouter = new Router()

authRouter.get('', [], async (req, res) => {
  const deviceIdHeader = req.headers['x-device-id']

  const entryRequestDto = new EntryRequestDto(deviceIdHeader)
  if (!entryRequestDto.isValid())
    return res.sendError(new BadRequestException('요청값이 올바르지 않습니다.'))

  const result = await entryUsecase(
    { redis: redis, oAuthService: new OAuthService() },
    { deviceId: entryRequestDto.toObject().deviceId },
  )

  if (result.error) return res.sendError(result.error)

  const authorizationURL = /** @type {string} */ (
    result.data?.toObject().authorizationURL
  )
  return res.redirect(authorizationURL, {
    statusCode: 307,
    cache: false,
  })
})

authRouter.get('/callback', [], async (req, res) => {
  const state = req.query['state']
  const code = req.query['code']

  const callbackRequestDto = new CallbackRequestDto(code, state)
  if (!callbackRequestDto.isValid()) {
    return res.sendError(new BadRequestException('요청값이 올바르지 않습니다.'))
  }

  const result = await callbackUsecase(
    { redis: redis, oAuthService: new OAuthService(), pool: pool, jwt: jwt },
    callbackRequestDto.toObject(),
  )

  if (result.error) return res.sendError(result.error)

  const tokens = /** @type {{accessToken: string, refreshToken: string}} */ (
    result.data?.toObject()
  )

  /** @type {string} */
  //@ts-ignore
  const accessCookieName = process.env.ACCESS_COOKIE_NAME

  /** @type {string} */
  //@ts-ignore
  const refreshCookieName = process.env.REFRESH_COOKIE_NAME

  setCookie(res, accessCookieName, tokens.accessToken, {
    path: '/',
    httpOnly: true,
    secure: true,
    sameSite: 'Strict',
    maxAge: 60 * 30,
  })

  setCookie(res, refreshCookieName, tokens.refreshToken, {
    path: '/',
    httpOnly: true,
    secure: true,
    sameSite: 'Strict',
    maxAge: 60 * 60 * 24 * 14,
  })

  return res.sendSuccess(null, '로그인에 성공했습니다.', 200)
})

authRouter.get('/refresh', [], async (req, res) => {})

authRouter.post('/logout', [], (req, res) => {})

authRouter.get('/me', [], (req, res) => {})

export default authRouter
