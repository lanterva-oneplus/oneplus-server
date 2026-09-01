import { Server } from './server/server.js'

const server2 = new Server()

server2.get('/s', (req, res) => {
  res.text('테스트 2')
})

server2.post('/s', (req, res) => {
  res.text('테스트 2')
})


export default server2
