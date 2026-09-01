export class Router {
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
  get(path, callback) {
    this.routes.push({
      method: 'GET',
      path: new URLPattern({ pathname: path }),
      handler: callback,
    })
    return this
  }

  /**
   * @param { string } path
   * @param { (req: http.IncomingMessage, res: http.ServerResponse) => any } callback
   */
  post(path, callback) {
    this.routes.push({
      method: 'POST',
      path: new URLPattern({ pathname: path }),
      handler: callback,
    })
    return this
  }

  /**
   * @param { string } path
   * @param { (req: http.IncomingMessage, res: http.ServerResponse) => any } callback
   */
  patch(path, callback) {
    this.routes.push({
      method: 'PATCH',
      path: new URLPattern({ pathname: path }),
      handler: callback,
    })
    return this
  }

  /**
   * @param { string } path
   * @param { (req: http.IncomingMessage, res: http.ServerResponse) => any } callback
   */
  put(path, callback) {
    this.routes.push({
      method: 'PUT',
      path: new URLPattern({ pathname: path }),
      handler: callback,
    })
    return this
  }

  /**
   * @param { string } path
   * @param { (req: http.IncomingMessage, res: http.ServerResponse) => any } callback
   */
  delete(path, callback) {
    this.routes.push({
      method: 'DELETE',
      path: new URLPattern({ pathname: path }),
      handler: callback,
    })
    return this
  }
}
