import { Pool } from 'pg'

/**
 * @returns {number}
 */
const getPort = () => {
  const port = process.env.POSTGRES_PORT
  if (port) return parseInt(port)
  return 5432
}

const pool = new Pool({
  host: 'localhost',
  port: getPort(),
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  max: 10, // 최대 커넥션
  idleTimeoutMillis: 10000, // 대기 커넥션 유지 시간 제한
  connectionTimeoutMillis: 100000, // 커넥션 얻기까지의 대기 시간 제한
})

const checkConnection = async () => {
  try {
    const client = await pool.connect()
    console.log('connected pg')
    client.release()
  } catch (e) {
    //@ts-ignore
    console.error('pg error: ', e.message)
    await pool.end()
    process.exit(1)
  }
}

await checkConnection()

pool.on('error', (err) => {
  console.error('postgreSQL 서버에서 에러가 발생했습니다.')
  console.error(err)
})

export default pool
