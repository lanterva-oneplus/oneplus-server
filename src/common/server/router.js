/** @import {req, res, Middleware, Handler, Routes, Middlewares} from './types/server.types.js' */

export class Router {
  /** @type {Routes[]} */
  routes = []
  
  /** @type {Middlewares[]} */
  middlewares = []

  /**
   * @param { string } path
   * @param { Middleware } middlewareHandler
   */
  use(path, middlewareHandler) {
    this.middlewares.push({
      path: new URLPattern({ pathname: path }),
      handler: middlewareHandler,
    })
    return this
  }

  /**
   * @param { string } path
   * @param { Middleware[] } middleware
   * @param { Handler } handler
   */
  get(path, middleware = [], handler) {
    this.routes.push({
      method: 'GET',
      path: new URLPattern({ pathname: path }),
      middleware: [...middleware],
      handler: handler,
    })
    return this
  }

  /**
   * @param { string } path
   * @param { Middleware[] } middleware
   * @param { Handler } handler
   */
  post(path, middleware = [], handler) {
    this.routes.push({
      method: 'POST',
      path: new URLPattern({ pathname: path }),
      middleware: [...middleware],
      handler: handler,
    })
    return this
  }

  /**
   * @param { string } path
   * @param { Middleware[] } middleware
   * @param { Handler } handler
   */
  patch(path, middleware = [], handler) {
    this.routes.push({
      method: 'PATCH',
      path: new URLPattern({ pathname: path }),
      middleware: [...middleware],
      handler: handler,
    })
    return this
  }

  /**
   * @param { string } path
   * @param { Middleware[] } middleware
   * @param { Handler } handler
   */
  put(path, middleware = [], handler) {
    this.routes.push({
      method: 'PUT',
      path: new URLPattern({ pathname: path }),
      middleware: [...middleware],
      handler: handler,
    })
    return this
  }

  /**
   * @param { string } path
   * @param { Middleware[] } middleware
   * @param { Handler } handler
   */
  delete(path, middleware = [], handler) {
    this.routes.push({
      method: 'DELETE',
      path: new URLPattern({ pathname: path }),
      middleware: [...middleware],
      handler: handler,
    })
    return this
  }
}
