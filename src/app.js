import { Server } from "./server/server.js";

const server = new Server()

server.use('*', (req, res, next) => {
  console.log(req.url, ': 요청')
  next()
})

server.get('/x', (req, res) => {
  res.text('반갑다')
})

server.listen(3000)