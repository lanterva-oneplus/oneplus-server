/**
 * @import {Middleware, Handler, Routes, Middlewares} from './types/server.types.js'
 * @import {req, res, RedirectOption} from './types/context.types.js'
 * @import HttpException from '../http_exceptions/http.exception.js'
 */

/**
 * @param {req} req
 * @param {res} res
 */
const setContext = (req, res) => {
  req['query'] = Object.fromEntries(new URLSearchParams(req.url?.split('?')[1])) || {}

  // response 콘텍스트
  res['json'] = (data, status = 200) => {
    res.setHeader('Content-Type', 'application/json')
    res.statusCode = status
    res.end(JSON.stringify(data))
  }

  res['text'] = (data, status = 200) => {
    if (typeof data !== 'string') throw new Error('string 타입만 허용합니다.')
    res.setHeader('Content-Type', 'text/plain; charset=utf-8')
    res.setHeader('Content-Length', Buffer.byteLength(data, 'utf-8'))
    res.statusCode = status
    res.end(String(data))
  }

  res['redirect'] = (path, option = { statusCode: 302, cache: false, maxAge: 0 }) => {
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
