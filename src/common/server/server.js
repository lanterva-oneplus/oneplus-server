import https from 'node:https'
import fs from 'fs'
import { Router } from './router.js'
import setContext from './context.js'
import handler from './handler.js'

/** @import {req, res, Middleware, Handler, Routes, Middlewares} from './types/server.types.js' */

export class Server {
  /** @type {Routes[]} */
  routes = []

  /** @type {Middlewares[]} */
  middlewares = []

  /**
   * @param { string } path
   * @param { Middleware } middleware
   */
  use(path, middleware) {
    this.middlewares.push({
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
      middleware.path = new URLPattern({ pathname: `${path}${middleware.path.pathname}` })
      this.middlewares.push(middleware)
    }
  }

  /**
   * @param { number } port
   */
  listen(port = 3000) {
    const server = https
      .createServer(
        //@ts-ignore
        { key: fs.readFileSync(process.env.HTTPS_CA_KEY), cert: fs.readFileSync(process.env.HTTPS_CA) },
        //@ts-ignore
        (req, res) => {
          //@ts-ignore
          setContext(req, res)
          //@ts-ignore
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
  }
}
