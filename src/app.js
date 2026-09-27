<<<<<<< HEAD
import bodyParser from './common/middleware/body-parser.middleware.js';
=======
>>>>>>> develop
import { Router } from './common/server/router.js'
import { Server } from './common/server/server.js'

const server = new Server()
const testRouter = new Router()

server.use('*', (req, res, next) => {
  if (!req.readableEnded) req.resume()
  next()
})

<<<<<<< HEAD
const tt = (req, res, next) => {
  next()
}

testRouter.post('/', [bodyParser], (req, res) => {
  console.log(req.body)
  res.text('dd')
})

testRouter.get('/t', [tt], (req, res) => {
=======
const bodyParser = (req, res, next) => {}

const testMiddleware = (req, res, next) => {
  console.log('미들웨어 진입')
  next()
}

testRouter.get('/', [testMiddleware], (req, res) => {
  console.log('라우터 진입')
  res.text('야르')
})

testRouter.get('/t', [], (req, res) => {
>>>>>>> develop
  res.text('야르2')
})

server.router('', testRouter)

server.listen(3000)
