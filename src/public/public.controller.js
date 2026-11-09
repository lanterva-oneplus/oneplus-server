import fs from 'node:fs/promises'
import path from 'node:path'
import NotFoundException from '../common/http_exceptions/not-found.exception.js'
import { Router } from '../common/server/router.js'
import StorageService from '../track/service/storage.service.js'

/** @import {req, res} from '../common/server/types/context.types.js' */

const publicRouter = new Router()
const storageService = new StorageService()

/** @type {Record<string, string>} */
const CONTENT_TYPES = {
  mp3: 'audio/mpeg',
  wav: 'audio/wav',
  png: 'image/png',
  jpg: 'image/jpeg',
  webp: 'image/webp',
}

/**
 * @param {'tracks' | 'images'} kind
 * @returns {(req: req, res: res) => Promise<void>}
 */
const serve = (kind) => async (req, res) => {
  // @ts-ignore
  const name = path.basename(req.params.file ?? '')
  const ext = path.extname(name).slice(1)
  try {
    const buf = await fs.readFile(path.join(storageService.PUBLIC_DIR, kind, name))
    res.writeHead(200, {
      'Content-Type': CONTENT_TYPES[ext] || 'application/octet-stream',
      'Content-Length': buf.length,
    })
    res.end(buf)
  } catch {
    res.sendError(new NotFoundException('파일을 찾을 수 없습니다.'))
  }
}

publicRouter.get('/tracks/:file', [], serve('tracks'))
publicRouter.get('/images/:file', [], serve('images'))

export default publicRouter
