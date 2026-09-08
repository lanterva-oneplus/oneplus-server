import crypto from 'crypto'

/**
 * @typedef {object} JWTOption
 * @property {string} [iss] - 발급자
 * @property {string} [sub] - 사용자 id
 * @property {string} [aud] - 토큰을 사용할 서비스
 * @property {Date} [exp] - 만료 시간 unix timestamp
 * @property {Date} [iat] - 발급 시간
 * @property {Date} [nbf] - 언제부터 유효한가
 * @property {string} [jti] - 리프레시 토큰용 uuid v4
 */

/**
 * @param {object} payload
 * @param {string} secret
 * @param {JWTOption} [option]
 */
export const sign = (payload, secret, option) => {
  const header = {
    alg: 'HS256',
    typ: 'JWT',
  }

  if (typeof payload !== 'object') throw new Error('페이로드는 object 타입이여야 합니다.')
  Object.keys(option).forEach((key) => (payload[key] = option[key]))

  const jwt = new JWT()

  const encodedHeader = jwt.encodeBase64(header)
  const encodedPayload = jwt.encodeBase64(payload)
  const signature = crypto.createHmac('sha256', secret).update(`${encodedHeader}.${encodedPayload}`).digest('hex')

  return `${encodedHeader}.${encodedPayload}.${signature}`
}

/**
 * @param {string} jwt
 * @returns {object}
 */
export const decode = (jwt) => {
  const [header, payload, signature] = jwt.split('.')
  return Buffer.from(payload, 'base64').toString('utf-8')
}

/**
 * @param {string} jwt
 * @param {string} secret
 * @returns {object | false}
 */
export const verify = (jwt, secret) => {
  const [header, payload, signature] = jwt.split('.')
  const serverSignature = crypto.createHmac('sha256', secret).update(`${header}.${payload}`).digest('hex')
  if (!crypto.timingSafeEqual(Buffer.from(signature, 'base64'), Buffer.from(serverSignature, 'base64'))) return false
  return Buffer.from(payload, 'base64').toString('utf-8')
}

/**
 * @param {object} obj
 * @returns {string}
 */
export const encodeBase64 = (obj) => {
  return Buffer.from(JSON.stringify(obj), 'utf-8')
    .toString('base64')
    .replaceAll(/\+/g, '-')
    .replaceAll(/\_/g, '_')
    .replaceAll(/=+$/g, '')
}

/**
 * @param {string} base64String
 * @returns {object}
 */
export const decodeBase64 = (base64String) => {
  return JSON.parse(Buffer.from(base64String, 'base64').toString('base64'))
}
