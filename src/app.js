import bodyParser from './common/middleware/body-parser.middleware.js';
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

const tt = (req, res, next) => {
  next()
}

testRouter.post('/', [bodyParser], (req, res) => {
  console.log(req.body)
  res.text('dd')
})

testRouter.get('/t', [tt], (req, res) => {
  res.text('야르2')
})

server.router('', testRouter)

server.listen(3000)
