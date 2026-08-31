import http from 'node:http'

export class Server {
  /**
   * @type {{
   * method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE',
   * path: string,
   * handler: (req: http.IncomingMessage, res: http.ServerResponse) => any
   * }[]}
   */
  routes = []

  use(path, callback) {
    this.routes.push({
      method: null,
      path: path,
      handler: callback,
    })
    return this
  }

  /**
   * @param { string } path
   * @param { (req: http.IncomingMessage, res: http.ServerResponse) => any } callback
   */
  get(path, callback) {
    this.routes.push({
      method: 'GET',
      path: path,
      handler: callback,
    })
    return this
  }

  post(path, callback) {
    this.routes.push({
      method: 'POST',
      path: path,
      handler: callback,
    })
    return this
  }

  patch(path, callback) {
    this.routes.push({
      method: 'PATCH',
      path: path,
      handler: callback,
    })
    return this
  }

  put(path, callback) {
    this.routes.push({
      method: 'PUT',
      path: path,
      handler: callback,
    })
    return this
  }

  delete(path, callback) {
    this.routes.push({
      method: 'DELETE',
      path: path,
      handler: callback,
    })
    return this
  }

  /**
   * @param { http.IncomingMessage } req
   * @param { http.ServerResponse } res
   */
  #handle(req, res) {
    // url 체크 후 핸들러 받기
    const handle = this.routes.find((route) => new URLPattern({ path: route.path }).test({ path: path }))

    if (!handle) console.log('에러다') // 에러 던지도록 수정

    // 미들웨어 받기
  }

  /**
   * @param { http.IncomingMessage } req
   * @param { http.ServerResponse } res
   */
  #setContext(req, res) {
    res['json'] = (data) => {
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify(data))
    }

    /** @param {string} data */
    res['text'] = (data) => {
      if (typeof data !== 'string') throw new Error('string 타입만 허용합니다.')
      res.setHeader('Content-Type', 'text/plain; charset=utf-8')
      res.setHeader('Content-Length', Buffer.byteLength(data, 'utf-8'))
      res.statusCode = 200
      res.end(String(data))
    }
  }

  listen(port) {
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
