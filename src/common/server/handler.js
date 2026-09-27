import HttpException from '../http_exceptions/http.exception.js'
import InternalServerErrorException from '../http_exceptions/internal-server-error.exception.js'
import NotFoundException from '../http_exceptions/not-found.exception.js'
import PayloadTooLargeException from '../http_exceptions/payload_too_large.exception.js'

/** 
 * @import {Middleware, Handler, Routes, Middlewares} from './types/server.types.js'
 * @import {req, res} from './types/context.types.js'
 */

/** 
 * @param { res } res
 * @param { unknown } err 
 */
const catchError = (res, err) => {
  console.error(err)
  if (err instanceof HttpException) return res.sendError(err)
  return res.sendError(new InternalServerErrorException())
}

/**
 * 
 * @param {Routes[]} routes 
 * @param {Middlewares[]} middlewares 
 * @param {req} req 
 * @param {res} res 
 * @returns 
 */
const handler = (routes, middlewares, req, res) => {
  //@ts-ignore
  const url = new URL(process.env.DEFAULT_PATH + req.url)
  const maxContentLength = 1028 * 1028 * 10 // 10mb
  let idx = 0

  // body 고용량 공격 방어로직
  const contentLength = parseInt(req.headers['content-length'] || '')
  if (contentLength > maxContentLength) return res.sendError(new PayloadTooLargeException())

  if (req.headers['transfer-encoding'] === 'chunked') {
    req.setTimeout(3000)
    let received = 0

    req.on('data', (chunk) => {
      received += chunk.length
      if (received > maxContentLength) {
        req.destroy()
        return res.sendError(new PayloadTooLargeException())
      }
    })
  }

  // 1. 전역 미들웨어
  /** @param {unknown | HttpException} [err] */
  const middlewareNext = (err) => {
    if (err) return catchError(res, err)

    const middleware = middlewares[idx++]
    if (!middleware) {
      idx = 0
      return routeHandlerNext()
    }

    if (!middleware.path.exec(url)) {
      return middlewareNext()
    }

    try {
      const result = middleware.handler(req, res, middlewareNext)
      if (result instanceof Promise) result.catch((err) => middlewareNext(err))
    } catch (err) {
      middlewareNext(err)
    }
  }

  // 2. 라우트 탐색 + 핸들러 실행
  /** @param {unknown | HttpException} [err] */
  const routeHandlerNext = (err) => {
    if (err) return catchError(res, err)

    const routeHandler = routes[idx++]
    if (!routeHandler) return catchError(res, new NotFoundException())

    if (!routeHandler.path.exec(url)) {
      // 경로가 안 맞으면 다음 라우트 탐색
      return routeHandlerNext()
    }

    // 파라미터 파싱
    req.params = routeHandler.path.exec(url)?.pathname?.groups || {}

    const runHandler = () => {
      try {
        const result = routeHandler.handler(req, res)
        if (result instanceof Promise) result.catch((err) => catchError(res, err))
      } catch (err) {
        catchError(res, err)
      }
    }

    // 라우트 전용 미들웨어가 없으면 바로 핸들러 실행
    if (!routeHandler.middleware || routeHandler.middleware.length === 0) {
      return runHandler()
    }

    // 3. 라우트 전용 미들웨어
    let routeMiddlewareIdx = 0
    /** @param {unknown | HttpException} [err] */
    const routeMiddlewareNext = (err) => {
      if (err) return catchError(res, err)

      /** @type {Middleware} */
      const routeMiddleware = routeHandler.middleware[routeMiddlewareIdx++]
      if (!routeMiddleware) return runHandler()

      try {
        const result = routeMiddleware(req, res, routeMiddlewareNext)
        if (result instanceof Promise) result.catch((err) => routeMiddlewareNext(err))
      } catch (err) {
        routeMiddlewareNext(err)
      }
    }

    return routeMiddlewareNext()
  }

  middlewareNext()
}

export default handler