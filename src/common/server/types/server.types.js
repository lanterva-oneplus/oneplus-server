import http from 'node:http'

/**
 * @typedef {http.IncomingMessage} req 요청
 * @typedef {http.ServerResponse} res 응답
 */

/**
 * @typedef {(req: req, res: res, next: Function) => void | Promise<void>} Middleware 미들웨어 핸들러
 * @typedef {(req: req, res: res) => void | Promise<void>} Handler 라우트 핸들러
 */

/**
 * @typedef {object} Routes 서버 라우트 리스트
 * @property {'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'} method
 * @property {URLPattern} path
 * @property {Middleware[]} middleware
 * @property {Handler} handler
 */

/**
 * @typedef {object} Middlewares 서버 미들웨어 리스트
 * @property {URLPattern} path
 * @property {Middleware} handler
 */

export {}
