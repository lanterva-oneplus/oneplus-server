import authRouter from './auth/auth.controller.js';
import { Router } from './common/server/router.js'
import { Server } from './common/server/server.js'

const server = new Server()

// body 데이터 찌꺼기 처리
server.use('*', (req, res, next) => {
  if (!req.readableEnded) req.resume()
  next()
})

server.router('/api/auth', authRouter)

server.listen(3000)
