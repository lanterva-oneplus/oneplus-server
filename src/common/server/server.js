import http from 'node:http'
import { Router } from './router.js'
import HttpException from '../http_exceptions/http.exception.js'

export class Server {
  /**
   * @type {{
   * method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE' | null,
   * path: URLPattern,
   * handler: (req: http.IncomingMessage, res: http.ServerResponse) => any
   * }[]}
   */
  routes = []

  /**
   * @param { string } path
   * @param { (req: http.IncomingMessage, res: http.ServerResponse) => any } callback
   */
  use(path, callback) {
    this.routes.push({
      method: null,
      path: new URLPattern({ pathname: path }),
      handler: callback,
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
    res['sendError'] = (httpError, status = 400) => {
      return res.json(
        {
          status: status,
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
    const url = new URL(`http://localhost:3000${req.url}`)
    let idx = 0

    // 재귀호출함
    const next = async (err) => {
      // 내부 에러 처리
      if (err) {
        if (err instanceof HttpException) {
          return res.json(
            err.statusCode,
            {
              message: err.message,
              error: err.error,
            },
            err.statusCode,
          )
        }

        return res.json(
          {
            message: '알 수 없는 문제가 발생했습니다.',
            error: '내부 서버 오류',
          },
          500,
        )
      }

      try {
        const route = this.routes[idx++]
        // 배열 넘어가서 undefined임. 라우트 미존재
        if (!route) {
          return res.json(
            {
              message: '요청한 정보를 찾을 수 없습니다.',
              error: '리소스를 찾을 수 없음',
            },
            404,
          )
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
          // 패스 매칭
          const handler = route.path.exec(url)

          if (handler) {
            // req 쿼리스트링
            req.query = handler.search?.groups || {}
            req.params = handler.pathname?.groups || {}

            const result = route.handler(req, res)
            if (result instanceof Promise) {
              await result
            }
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
    http
      .createServer((req, res) => {
        this.#setContext(req, res)
        this.#handle(req, res)
      })
      .listen(port, () => {
        console.log('Start Server')
      })
  }
}
