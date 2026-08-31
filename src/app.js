import { Server } from "./server/server.js";

const server = new Server()

server.get('/', (req, res) => {
  res.setHeader('Content-Type', 'text/Plain')
  res.statusCode = 200
  res.write('welcome')
  res.end()
})

server.listen(3000)