import { IMAGE_TYPES } from './upload.request.dto.js'

/**
 * @import {DTO} from '../../common/modules/dto.module.js'
 */

/**
 * @implements {DTO}
 */
export default class UpdateRequestDto {
  /**
   * @param {string | any} title 
   * @param {File | any} image 
   */
  constructor(title, image) {
    this.title = typeof title === 'string' ? title.trim() : title
    this.image = image
  }

  isValid() {
    if (this.title === null && this.image === null) return false
    if (this.title !== null && !isText(this.title)) return false
    if (this.image !== null && !isImage(this.image)) return false

    return true
  }

  /** @returns {{title: string | null, image: File | null}} */
  toObject() {
    return { title: this.title, image: this.image }
  }
}

/** @param {unknown} value */
const isText = (value) => {
  if (typeof value !== 'string') return false
  if (value.length <= 0) return false
  if (value.length > 64) return false

  return true
}

/** @param {unknown} value */
const isImage = (value) => {
  if (!(value instanceof File)) return false
  if (value.size <= 0) return false
  if (!Object.hasOwn(IMAGE_TYPES, value.type)) return false

  return true
}
