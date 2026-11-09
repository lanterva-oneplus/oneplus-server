/** @type {(req: http.IncomingMessage, res: http.ServerResponse, next: Function) => void | Promise<void>} */
const bodyParser = (req, res, next) => {
  /** @type {Buffer[]} */
  const received = []
  req.on('data', (chunk) => received.push(chunk))
  req.on('end', () => {
    console.log(received)
    req.body = Buffer.concat(received).toString()
    next()
  })
}

export default bodyParser
