import crypto from 'node:crypto'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { AUDIO_TYPES, IMAGE_TYPES } from '../dto/upload.request.dto.js'

/** @typedef {'tracks' | 'images'} StorageKind */

export default class StorageService {
  PUBLIC_DIR = fileURLToPath(new URL('../../../public/', import.meta.url))

  /** @type {Record<StorageKind, Record<string, string>>} */
  EXTENSIONS = { tracks: AUDIO_TYPES, images: IMAGE_TYPES }

  /**
   * @param {StorageKind} kind
   * @param {File} file
   * @returns {Promise<string>}
   */
  async save(kind, file) {
    const name = `${crypto.randomUUID()}.${this.EXTENSIONS[kind][file.type]}`
    const dir = path.join(this.PUBLIC_DIR, kind)

    await fs.mkdir(dir, { recursive: true })
    await fs.writeFile(path.join(dir, name), Buffer.from(await file.arrayBuffer()))
    
    return name
  }

  /**
   * @param {StorageKind} kind
   * @param {string} name
   */
  async remove(kind, name) {
    await fs.rm(path.join(this.PUBLIC_DIR, kind, path.basename(name)), { force: true }).catch((err) => {
      console.error(err)
    })
  }

  /**
   * @param {StorageKind} kind
   * @param {string} name
   */
  url(kind, name) {
    return `/public/${kind}/${name}`
  }
}
