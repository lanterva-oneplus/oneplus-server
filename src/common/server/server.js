import https from 'node:https'
import fs from 'fs'
import { Router } from './router.js'
import HttpException from '../http_exceptions/http.exception.js'
import InternalServerErrorException from '../http_exceptions/internal-server-error.exception.js'
import NotFoundException from '../http_exceptions/not-found.exception.js'
import PayloadTooLargeException from '../http_exceptions/payload_too_large.exception.js'

export class Server {
  /**
   * @typedef {(req: http.IncomingMessage, res: http.ServerResponse, next: Function) => void | Promise<void>} Middleware
   * @typedef {(req: http.IncomingMessage, res: http.ServerResponse) => void | Promise<void>} Handler
   */

  /**
   * @type {{
   * method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE' | null,
   * path: URLPattern,
   * middleware: Middleware[]
   * handler: Handler
   * }[]}
   */
  routes = []

  maxContentLength = 10 // 1028 * 1028 * 10

  /**
   * @param { string } path
   * @param { Middleware } middleware
   */
  use(path, middleware) {
    this.routes.push({
      method: null,
      path: new URLPattern({ pathname: path }),
      handler: middleware,
    })
    return this
  }

  /**
   * 라우팅 처리
   * @param { string } path
   * @param { Router } router
   */
  router(path = '', router) {
    if (path === '') {
      this.routes.push(...router.routes)
      return
    }

    for (const route of router.routes) {
      const newPathName = new URLPattern({ pathname: `${path}${route.path.pathname}` })
      route.path = newPathName
      this.routes.push(route)
    }
  }

  /**
   * @param { http.IncomingMessage } req
   * @param { http.ServerResponse } res
   */
  #setContext(req, res) {
    // response 콘텍스트
    res['json'] = (data, status = 200) => {
      res.setHeader('Content-Type', 'application/json')
      res.statusCode = status
      res.end(JSON.stringify(data))
    }

    /**
     * @param {string} data
     * @param {number} status
     */
    res['text'] = (data, status = 200) => {
      if (typeof data !== 'string') throw new Error('string 타입만 허용합니다.')
      res.setHeader('Content-Type', 'text/plain; charset=utf-8')
      res.setHeader('Content-Length', Buffer.byteLength(data, 'utf-8'))
      res.statusCode = status
      res.end(String(data))
    }

    /**
     * @typedef {object} RedirectOption
     * @property {301 | 302 | 307} statusCode
     * @property {boolean} [cache]
     * @property {number} [maxAge]
     */

    /**
     * @param { string } path
     * @param {RedirectOption} option
     */
    res['redirect'] = (path, option = {}) => {
      res.setHeader('Location', path)

      if (option.cache) {
        let control = 'public, immutable, '
        if (option.maxAge) control += `max-age=${option.maxAge}`
        res.setHeader('Cache-Control', control)
      } else {
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
      }
      res.statusCode = option.statusCode || 302
      res.end()
    }

    /**
     * @param {object} data
     * @param {string} message
     * @param {number} status
     */
    res['sendSuccess'] = (data, message, status = 200) => {
      return res.json(
        {
          status: status,
          success: true,
          message: message,
          data: data,
        },
        status,
      )
    }

    /**
     * @param {HttpException} httpError
     * @param {number} status
     */
    res['sendError'] = (httpError, status = 500) => {
      return res.json(
        {
          status: httpError.statusCode || status,
          success: false,
          message: httpError.message,
          error: httpError.error,
        },
        status,
      )
    }
  }

  /**
   * @param { http.IncomingMessage } req
   * @param { http.ServerResponse } res
   */
  #handle(req, res) {
    const url = new URL(process.env.DEFAULT_PATH + req.url)
    let idx = 0

    // 재귀호출함
    const next = async (err) => {
      // 내부 에러 처리
      if (err) {
        if (err instanceof HttpException) return res.sendError(err, err.statusCode)
        return res.sendError(new InternalServerErrorException(err.message), 500)
      }

      try {
        const route = this.routes[idx++]
        // 배열 넘어가서 undefined임. 라우트 미존재
        if (!route) {
          return res.sendError(new NotFoundException('라우트를 찾을 수 없습니다.'), 404)
        }

        // 미들웨어 처리
        if (route.method === null) {
          const handler = route.path.exec(url)
          if (handler) {
            req.params = handler.pathname.groups
            const result = route.handler(req, res, next)
            if (result instanceof Promise) {
              await result
            }
            return
          }
        }

        // 라우팅 처리
        if (route.method === req.method) {
          const handler = route.path.exec(url)
          // 라우트 존재
          if (handler) {
            // req 쿼리스트링
            /** @returns {{[query: string]: string}} */
            req.query = Object.fromEntries(new URLSearchParams(req.url.split('?')[1])) || {}

            // req 파라미터
            req.params = handler.pathname?.groups || {}

            // body 요청 처리
            const contentLength = parseInt(req.headers['content-length'])
            if (contentLength > this.maxContentLength) return res.sendError(new PayloadTooLargeException())

            if (req.headers['transfer-encoding'] === 'chunked') {
              req.setTimeout(3000)
              let received = 0

              req.on('data', (chunk) => {
                received += chunk.length
                if (received > this.maxContentLength) {
                  req.destroy()
                  return res.sendError(new PayloadTooLargeException())
                }
              })
            }

            // 라우트용 미들웨어 처리
            if (route.middleware) {
              let middlewareIdx = 0

              const middlewareNext = async () => {
                try {
                  const middleware = route.middleware[middlewareIdx++]
                  if (!middleware) return
                  const middlewareResult = middleware(req, res, middlewareNext)
                  if (middleware instanceof Promise) await middlewareResult
                } catch (err) {
                  if (err instanceof HttpException) throw err
                  throw new InternalServerErrorException(err.message)
                }
              }

              middlewareNext()
            }

            // 핸들러 처리
            const result = route.handler(req, res)
            if (result instanceof Promise) await result
            return
          }
        }

        next()
      } catch (err) {
        next(err)
      }
    }

    next()
  }

  /**
   *
   * @param { number } port
   */
  listen(port = 3000) {
    const server = https
      .createServer(
        { key: fs.readFileSync(process.env.HTTPS_CA_KEY), cert: fs.readFileSync(process.env.HTTPS_CA) },
        (req, res) => {
          this.#setContext(req, res)
          this.#handle(req, res)
        },
      )
      .listen(port, () => {
        console.log('Start Server')
      })

    server.headersTimeout = 5000
    server.requestTimeout = 10000
    server.keepAliveTimeout = 5000
    server.maxHeadersCount = 100
    server.maxConnections = 1000

    // req.socket.connectTime으로 연결 시작 시간 체크
    server.on('connection', (socket) => (socket.connectTime = Date.now()))
  }
}
