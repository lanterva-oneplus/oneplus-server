import authRouter from './auth/auth.controller.js';
import { Server } from './common/server/server.js'

const server = new Server()

server.router('/api/auth', authRouter)

server.listen(3000)
