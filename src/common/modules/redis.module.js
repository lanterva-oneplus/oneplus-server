import RedisPkg from 'ioredis'
const Redis = RedisPkg.default ?? RedisPkg

const getPort = () => {
  const port = process.env.REDIS_PORT
  if (port) return parseInt(port)
  else 6379
}

const redis = new Redis({
  port: getPort(),
  host: '127.0.0.1',
  username: 'default',
  password: process.env.REDIS_PASSWORD,
  db: 0,
})

export default redis
