/**
 * @import {req, res} from '../server/types/server.types.js'
 */

/**
 * @typedef {Record<string, string>} CookieOptions
 * @property {string} [path] - 쿠키 경로
 * @property {string} [domain] - 쿠키 도메인
 * @property {number} [maxAge] - 쿠키 유효 기간 (초 단위)
 * @property {Date} [expires] - 쿠키 만료 날짜
 * @property {boolean} [httpOnly] - HTTP 전송 전용 여부
 * @property {boolean} [secure] - HTTPS 전송 전용 여부
 * @property {'Strict' | 'Lax' | 'None'} [sameSite] - SameSite 설정
 */

/**
 *
 * @param { res } res
 * @param { string } name
 * @param { string } value
 * @param { CookieOptions } [option]
 * @returns { void }
 */
export const setCookie = (res, name, value, option) => {
  const encodedName = encodeURIComponent(name)
  const encodedValue = encodeURIComponent(value)
  let cookie = `${encodedName}=${encodedValue}`

  /**
   * @type {Record<string, string>}
   */
  const mappingKeys = {
    path: 'Path',
    domain: 'Domain',
    maxAge: 'Max-Age',
    expires: 'Expires',
    httpOnly: 'HttpOnly',
    secure: 'Secure',
    sameSite: 'SameSite',
  }

  if (option) Object.keys(option).forEach((key) => (cookie += `; ${mappingKeys[key]}=${option[key]}`))
  const existsCookies = res.getHeader('Set-Cookie')
  if (existsCookies) {
    if (!(typeof existsCookies === 'number')) {
      res.setHeader('Set-Cookie', [...existsCookies, cookie])
    }
  } else res.setHeader('Set-Cookie', [cookie])
}

/**
 *
 * @param { req } req
 * @param { string } name
 * @returns { string | false }
 */
export const getCookie = (req, name) => {
  /** @type {string[] | undefined} */
  const cookies = req.headers['cookie']?.split('; ')
  if (!cookies) return false

  const encodedName = encodeURIComponent(name)
  const cookie = cookies.find((cookie) => cookie.split('=')[0] === encodedName)
  if (!cookie) return false
  const [_, cookieValue] = cookie.split('=')
  return decodeURIComponent(cookieValue)
}

/**
 * @param { res } res
 * @param { string } name
 * @returns { void | false }
 */
export const revokeCookie = (res, name) => {
  res.setHeader('Set-Cookie', `${encodeURIComponent(name)}=; Max-Age=0`)
}
