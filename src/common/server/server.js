import https from 'node:https'
import fs from 'fs'
import { Router } from './router.js'
import setContext from './context.js'
import handler from './handler.js'

export class Server {
  /**
   * @typedef {(req: http.IncomingMessage, res: http.ServerResponse, next: Function) => void | Promise<void>} Middleware
   * @typedef {(req: http.IncomingMessage, res: http.ServerResponse) => void | Promise<void>} Handler
   */

  /**
   * @type {{
   * method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE',
   * path: URLPattern,
   * middleware: Middleware[]
   * handler: Handler
   * }[]}
   */
  routes = []

  /** 
   * @type {{
   * path: URLPattern,
   * handler: Middlewares[]
   * }}
   */
  middlewares = []

  /**
   * @param { string } path
   * @param { Middleware } middleware
   */
  use(path, middleware) {
    this.middlewares.push({
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
      this.middlewares.push(...router.middlewares)
      return
    }

    for (const route of router.routes) {
      route.path = new URLPattern({ pathname: `${path}${route.path.pathname}` })
      this.routes.push(route)
    }

    for (const middleware of router.middlewares) {
      middleware.path = new URLPattern({ pathname: `${path}${route.path.pathname}` })
      this.middlewares.push(middleware)
    }
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
          setContext(req, res)
          handler(this.routes, this.middlewares, req, res)
        },
      )
      .listen(port, () => {
        console.log(`서버 시작됨`)
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
