/**
 * @import {req as sReq, res as sRes} from './server.types.js'
 * @import HttpException from '../../http_exceptions/http.exception.js'
 */

/**
 * @typedef {object} RedirectOption
 * @property {301 | 302 | 303 | 304 | 307 | 308} statusCode - 리다이렉션 코드임.
 *  301 / 308: 영구 이동 (308은 POST 유지)
 *  302 / 307: 일시 이동 (307은 POST 유지)
 *  303: 다른 주소로 이동. POST요청 처리 후 GET 메서드로 보여줌
 *  304: 변경 없음. 저장된 캐시 사용
 * @property {boolean} [cache]
 * @property {number} [maxAge]
 */

/**
 * @typedef {sReq & {
 * query: Record<string, string>
 * params: Record<string, string | undefined> | {}
 * }} req
 *
 * @typedef {sRes & {
 * json: (data: any, status: number) => void
 * text: (data: string, status: number) => void
 * redirect: (path: string, option: RedirectOption) => void
 * sendSuccess: (data: any, message: string, status: number) => void
 * sendError: (httpException: HttpException) => void
 * }} res
 */

export {}
