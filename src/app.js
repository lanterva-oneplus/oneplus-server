import { Router } from './common/server/router.js';
import { Server } from './common/server/server.js'

const server = new Server()
const testRouter = new Router()

const testMiddleware = (req, res, next) => {
  console.log('미들웨어 진입')
  next()
}

testRouter.get('/', [testMiddleware], (req, res) => {
  console.log('라우터 진입')
  res.text('야르')
})

testRouter.get('/t', [], (req, res) => {
  res.text('야르2')
})

server.router('', testRouter)

server.listen(3000)
