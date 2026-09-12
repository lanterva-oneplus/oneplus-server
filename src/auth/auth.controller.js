import { Router } from '../common/server/router.js'
import authCallback from './usecase/auth-callback.usecase.js';
import authEntry from './usecase/auth-entry.usecase.js';

const authRouter = new Router()

authRouter.get('', async (req, res) => {
  return await authEntry(req, res)
})

// url은 제대로 옴.
authRouter.get('/callback', async (req, res) => {
  return await authCallback(req, res)
})

authRouter.post('/refresh', (req, res) => {})

authRouter.post('/logout', (req, res) => {})

authRouter.get('/me', (req, res) => {})

export default authRouter
