import { Router } from '../common/server/router.js'
<<<<<<< HEAD

const authRouter = new Router()

authRouter.get('', async (req, res) => {})

authRouter.get('/callback', async (req, res) => {})

authRouter.get('/refresh', async (req, res) => {})
=======
import entryUsecase from './usecase/entry.usecase.js'

const authRouter = new Router()

authRouter.get('', [], async (req, res) => {})

authRouter.get('/callback', [], async (req, res) => {})

authRouter.get('/refresh', [], async (req, res) => {})
>>>>>>> develop

authRouter.post('/logout', [], (req, res) => {})

authRouter.get('/me', [], (req, res) => {})

export default authRouter
