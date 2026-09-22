/**
 * @param { http.IncomingMessage } req
 * @param { http.ServerResponse } res
 */
const setContext = (req, res) => {
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
  res['sendError'] = (httpError) => {
    return res.json(
      {
        status: httpError.statusCode,
        success: false,
        message: httpError.message,
        error: httpError.error,
      },
      httpError.statusCode,
    )
  }
}

export default setContext
