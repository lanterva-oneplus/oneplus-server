import BadRequestException from '../common/http_exceptions/bad-request.exception.js'
import InternalServerErrorException from '../common/http_exceptions/internal-server-error.exception.js'
import redis from '../common/modules/redis.module.js'
import { Router } from '../common/server/router.js'
import EntryRequestDto from './dto/entry.request.dto.js'
import OauthService from './service/oauth.service.js'
import entryUsecase from './usecase/entry.usecase.js'

const authRouter = new Router()

authRouter.get('', [], async (req, res) => {
  const deviceIdHeader = req.headers['x-device-id']

  const entryRequestDto = new EntryRequestDto(deviceIdHeader)
  if (!entryRequestDto.isValid())
    return res.sendError(new BadRequestException('요청값이 올바르지 않습니다.'))

  const result = await entryUsecase(
    { redis: redis, oauthService: new OauthService() },
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
})

authRouter.get('/refresh', [], async (req, res) => {})

authRouter.post('/logout', [], (req, res) => {})

authRouter.get('/me', [], (req, res) => {})

export default authRouter
