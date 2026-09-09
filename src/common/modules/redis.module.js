import Redis from 'ioredis'

const redis = new Redis({
  port: process.env.REDIS_PORT || 6379,
  host: '127.0.0.1',
  username: 'default',
  password: process.env.REDIS_PASSWORD,
  db: 0,
})

export default redis

