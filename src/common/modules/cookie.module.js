/**
 * @typedef {object} CookieOptions
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
 * @param { http.ServerResponse } res
 * @param { string } name
 * @param { string } value
 * @param { CookieOptions } [option]
 * @returns { void }
 */
export const setCookie = (res, name, value, option) => {
  const encodedName = encodeURIComponent(name)
  const encodedValue = encodeURIComponent(value)
  let cookie = `${encodedName}=${encodedValue}`

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
  if (existsCookies) res.setHeader('Set-Cookie', [...existsCookies, cookie])
  else res.setHeader('Set-Cookie', [cookie])
}

/**
 *
 * @param { http.IncomingMessage } req
 * @param { string } name
 * @returns { {name: string, value: string} | false }
 */
export const getCookie = (req, name) => {
  /** @type {string[]} */
  const cookies = req.headers['cookie'].split('; ')
  if (!cookies) return false

  const encodedName = encodeURIComponent(name)
  const cookie = cookies.find((cookie) => cookie.split('=')[0] === encodedName)
  const [cookieName, cookieValue] = cookie.split('=')
  return { name: decodeURIComponent(cookieName), value: decodeURIComponent(cookieValue) }
}

/**
 *
 * @param { http.ServerResponse } req
 * @param { http.IncomingMessage } res
 * @param { string } name
 * @returns { void | false }
 */
export const revokeCookie = (res, name) => {
  res.setHeader('Set-Cookie', `${encodeURIComponent(name)}=; Max-Age=0`)
}
