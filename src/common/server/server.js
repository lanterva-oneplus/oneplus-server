import http from 'node:http'
import { Router } from './router.js'

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
    res['json'] = (data) => {
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify(data))
      return
    }

    /** @param {string} data */
    res['text'] = (data) => {
      if (typeof data !== 'string') throw new Error('string 타입만 허용합니다.')
      res.setHeader('Content-Type', 'text/plain; charset=utf-8')
      res.setHeader('Content-Length', Buffer.byteLength(data, 'utf-8'))
      res.statusCode = 200
      res.end(String(data))
      return
    }
  }

  /**
   * @param { http.IncomingMessage } req
   * @param { http.ServerResponse } res
   */
  #handle(req, res) {
    const url = new URL(`http://localhost:3000${req.url}`)
    let idx = 0

    const next = (err) => {
      if (err) {
        res.statusCode = 500
        res.json({ message: err })
        return
      }

      const route = this.routes[idx++]
      if (!route) {
        res.statusCode = 404
        res.json({ message: 'not found' })
        return
      }

      if (route.method === null) {
        const handler = route.path.exec(url)
        if (handler) {
          req.params = handler.pathname.groups
          return route.handler(req, res, next)
        }
      }

      if (route.method === req.method) {
        const handler = route.path.exec(url)
        if (handler) {
          req.params = handler.pathname.groups
          return route.handler(req, res)
        }
      }

      next()
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
