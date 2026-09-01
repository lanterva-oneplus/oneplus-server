import { Router } from './server/router.js'
import { Server } from './server/server.js'

const server = new Server()
const router1 = new Router()

router1.get('/', (req, res) => {
  res.json({ msg: '반갑습니다.' })
})

server.router('/ra', router1)

server.listen(3000)
