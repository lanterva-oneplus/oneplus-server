/**
 * @import {DTO} from '../../common/modules/dto.module.js'
 */

export const AUDIO_TYPES = {
  'audio/mpeg': 'mp3',
  'audio/wav': 'wav',
  'audio/x-wav': 'wav',
}

export const IMAGE_TYPES = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
}

/**
 * @implements {DTO}
 */
export default class UploadRequestDto {
  /**
   * @param {string | any} title
   * @param {string | any} artist
   * @param {File | any} audio
   * @param {File | any} image
   */
  constructor(title, artist, audio, image) {
    this.title = String(title).trim()
    this.artist = artist
    this.audio = audio
    this.image = image
  }

  isValid() {
    if (!isText(this.title)) return false
    if (!isText(this.artist)) return false
    if (!isFile(this.audio, AUDIO_TYPES)) return false
    if (!isFile(this.image, IMAGE_TYPES)) return false

    return true
  }

  /** @returns {{title: string, artist: string, audio: File, image: File}} */
  toObject() {
    return {
      title: this.title,
      artist: this.artist,
      audio: this.audio,
      image: this.image,
    }
  }
}

/** @param {unknown} value */
const isText = (value) => {
  if (typeof value !== 'string') return false
  if (value.length <= 0) return false
  if (value.length > 64) return false

  return true
}

/**
 * @param {unknown} value
 * @param {Record<string, string>} allowed
 */
const isFile = (value, allowed) => {
  if(!(value instanceof File)) return false
  if(value.size <= 0) return false
  if(!Object.hasOwn(allowed, value.type)) return false

  return true
}
