import authRouter from './auth/auth.controller.js';
import trackRouter from './track/track.controller.js';
import publicRouter from './public/public.controller.js'
import { Router } from './common/server/router.js'
import { Server } from './common/server/server.js'

const server = new Server()

// cors
server.use('*', (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*')
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', req.headers['access-control-request-headers'] || '*')

  if (req.method === 'OPTIONS') {
    res.statusCode = 204
    res.end()
    return
  }
  next()
})

// body찌꺼기처리
server.use('*', (req, res, next) => {
  const isMultipart = req.headers['content-type']?.startsWith('multipart/form-data')
  if (!isMultipart && !req.readableEnded) req.resume()
  next()
})

server.router('/api/auth', authRouter)
server.router('/api/track', trackRouter)
server.router('/public', publicRouter)

server.listen(3000)
