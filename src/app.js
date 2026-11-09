import authRouter from './auth/auth.controller.js';
import trackRouter from './track/track.controller.js';
import { Router } from './common/server/router.js'
import { Server } from './common/server/server.js'

const server = new Server()

server.use('*', (req, res, next) => {
  const isMultipart = req.headers['content-type']?.startsWith('multipart/form-data')
  if (!isMultipart && !req.readableEnded) req.resume()
  next()
})

server.router('/api/auth', authRouter)
server.router('/api/track', trackRouter)

server.listen(3000)
