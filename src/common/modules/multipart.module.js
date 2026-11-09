import { Readable } from 'node:stream'

/**
 * @import {req} from '../server/types/context.types.js'
 *
 * @param {req} req
 * @returns {Promise<FormData>}
 */
export const parseMultipart = (req) => {
  return new Request(`https://${req.headers.host}${req.url}`, {
    method: req.method,
    headers: /** @type {Record<string, string>} */ (req.headers),
    body: /** @type {ReadableStream} */ (Readable.toWeb(req)),
    //@ts-ignore
    duplex: 'half',
  }).formData()
}
