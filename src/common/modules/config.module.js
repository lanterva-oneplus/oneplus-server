import { loadEnvFile } from 'node:process'

const envFactory = () => {
  loadEnvFile('.env')
}

export default envFactory