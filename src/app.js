import envFactory from './common/modules/config.module.js'
import redis from './common/modules/redis.module.js' // <- new Redis
import { Server } from './common/server/server.js'

envFactory()

const server = new Server()

server.listen(3000)
