export class Router {
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

  /**
   * @type {{
   * path: URLPattern,
   * handler: Middlewares[]
   * }}
   */
  middlewares = []

  /**
   * @param { string } path
   * @param { Middleware } handler
   */
  use(path, handler) {
    this.middlewares.push({
      path: new URLPattern({ pathname: path }),
      middleware: handler,
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
