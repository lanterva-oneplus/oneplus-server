import { mock, test } from 'node:test'
import assert from 'node:assert/strict'
import entryUsecase from '../usecase/entry.usecase.js'

/**
 * @param {object} [overrides]
 */
const setup = (overrides = {}) => {
  const redis = { set: mock.fn(async () => 'OK') }
  const oAuthService = {
    generateState: mock.fn(() => 'mock_state'),
    generateCodeSet: mock.fn(() => ({
      codeVerifier: 'mock_codeVerifier',
      codeChallenge: 'mock_codeChallenge',
    })),
    generateAuthURL: mock.fn(() => 'auth_url'),
  }
  return { redis, oAuthService, ...overrides }
}

test('redis 저장 후 url반환', async () => {
  const dependency = setup()
  const redis = dependency.redis
  const oAuthService = dependency.oAuthService

  const result = await entryUsecase(/** @type {any} */ (dependency), {
    deviceId: 'uuidx',
  })

  assert.deepEqual(redis.set.mock.calls[0].arguments, [
    'state:mock_state',
    'did:uuidx:code_verifier:mock_codeVerifier',
    'EX',
    600,
  ])

  assert.ok(redis.set.mock.calls[0].result)

  assert.deepEqual(oAuthService.generateAuthURL.mock.calls[0].arguments, [
    'mock_state',
    'mock_codeChallenge',
  ])
})
