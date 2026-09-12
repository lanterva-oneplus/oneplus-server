import authRouter from './auth/auth.controller.js'
import { Router } from './common/server/router.js'
import { Server } from './common/server/server.js'

const server = new Server()

server.router('/api/auth', authRouter)

const testRouter = new Router()

testRouter.get('/q', (req, res) => {
  const q = req.query['q']
  console.log(q)
  res.json(q)
})

testRouter.get('/p/:id', (req, res) => {
  const p = req.params
  console.log(p)
  res.json(p)
})

server.router('/t', testRouter)

server.listen(3000)
