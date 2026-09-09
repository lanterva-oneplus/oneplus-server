import redis from './common/modules/redis.module.js';
import { Server } from './common/server/server.js'

const server = new Server()

redis.get('kd')

server.listen(3000)
