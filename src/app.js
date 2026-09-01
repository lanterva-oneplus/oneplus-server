import server2 from "./s2.test.js";
import { Server } from "./server/server.js";

const server = new Server()

server.use('*', (req, res, next) => {
  console.log(req.url, ': 요청')
  next()
})

server.get('/x', (req, res) => {
  res.text('반갑다')
})

server.router('/t', server2)

server.routes.forEach(route => console.log(route.path.pathname))

server.listen(3000)