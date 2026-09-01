import { Cookie } from './server/cookie.js'
import { Router } from './server/router.js'
import { Server } from './server/server.js'

const server = new Server()
const router1 = new Router()

router1.get('/', (req, res) => {
  Cookie.setCookie(res, 'name', 'd', {
    MaxAge: 1200,
    HttpOnly: true,
  })
  res.json({ msg: '반갑습니다.' })
})

router1.get('/c', (req, res) => {
  Cookie.revokeCookie(res, 'name')
  res.text('쿠키 삭제됨')
})

server.router('/ra', router1)

server.listen(3000)
