/**
 * @typedef {object} CookieOptions
 * @property {string} [Path] - 쿠키 경로
 * @property {string} [Domain] - 쿠키 도메인
 * @property {number} [MaxAge] - 쿠키 유효 기간 (초 단위)
 * @property {Date} [Expires] - 쿠키 만료 날짜
 * @property {boolean} [HttpOnly] - HTTP 전송 전용 여부
 * @property {boolean} [Secure] - HTTPS 전송 전용 여부
 * @property {'Strict' | 'Lax' | 'None'} [SameSite] - SameSite 설정
 */

/**
 *
 * @param { http.ServerResponse } res
 * @param { string } name
 * @param { string } value
 * @param { CookieOptions } [option]
 */
export const setCookie = (res, name, value, option) => {
  let cookie = ''

  if (value.match(/[;=]/g)) throw new Error('허용되지 않는 문자가 포함되어있습니다.')
  cookie += `${name}=${value}`

  if (option) Object.keys(option).forEach((key) => (cookie += `; ${key}=${option[key]}`))
  res.setHeader('Set-Cookie', cookie)
}

/**
 *
 * @param { http.IncomingMessage } req
 * @param { string } name
 * @returns { {name: string, value: string} | undefined }
 */
export const getCookie = (req, name) => {
  if (!req.headers.cookie) return undefined

  const cookies = {}
  req.headers.cookie.split('; ').forEach((c) => {
    const [name, value] = c.split('=')
    cookies[name] = decodeURIComponent(v)
  })

  if (cookies[name]) {
    return { name, value: cookies[name] }
  }
  return undefined
}

export const revokeCookie = (res, name) => {
  res.setHeader('Set-Cookie', `${name}=; Max-Age=0`)
}
