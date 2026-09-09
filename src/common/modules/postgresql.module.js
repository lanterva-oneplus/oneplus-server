import { Pool } from 'pg'

const pool = new Pool({
  host: 'localhost',
  port: process.env.POSTGRES_PORT || 5432,
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
  } catch(e) {
    console.error('pg error: ', e.message)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

await checkConnection()

pool.on('error', (err) => {
  console.error('postgreSQL 서버에서 에러가 발생했습니다.')
  console.error(err)
})

export default pool