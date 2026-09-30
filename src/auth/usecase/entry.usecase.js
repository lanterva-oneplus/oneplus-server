import { Redis } from 'ioredis'
import Result from '../../common/modules/result.module.js'
import EntryResponseDto from '../dto/entry.response.dto.js'
import EntryRequestDto from '../dto/entry.request.dto.js'
import OauthService from '../service/oauth.service.js'
import { RedisError } from '../../common/modules/db.error.js'
import InternalServerErrorException from '../../common/http_exceptions/internal-server-error.exception.js'

/**
 * @import {Usecase} from '../../common/modules/usecase.module.js'
 */

/**
 * @typedef {object} EntryDependency
 * @property {Redis} redis
 * @property {OauthService} oauthService
 *
 * @typedef {object} EntryCommand
 * @property {string} deviceId
 */
/**
 * @type {Usecase<EntryDependency, EntryCommand, EntryResponseDto, InternalServerErrorException>}
 * @returns {Promise<Result<EntryResponseDto, InternalServerErrorException>>}
 */
const entryUsecase = async (dependency, command) => {
  const oAuthService = dependency.oauthService

  const state = oAuthService.generateState()
  const { codeVerifier, codeChallenge } = oAuthService.generateCodeSet()

  try {
    await dependency.redis.set(
      `state:${state}`,
      `did:${command.deviceId}:code_verifier:${codeVerifier}`,
      'EX',
      600,
    )
  } catch (err) {
    console.error(err)
    return Result.fail(
      new InternalServerErrorException(
        '임시 인증 정보 처리 중 문제가 발생했습니다.',
        'imdb_error',
      ),
    )
  }

  const authUrl = dependency.oauthService.generateAuthURL(state, codeChallenge)
  return Result.ok(new EntryResponseDto(authUrl))
}

export default entryUsecase
