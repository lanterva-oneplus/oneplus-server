/**
 * @import {DTO} from '../../common/modules/dto.module.js'
 * @implements {DTO}
 */

/**
 * @typedef {object} TrackInfoItem
 * @property {string} id
 * @property {string} title
 * @property {string | null} artist
 * @property {number | null} lengthSec
 * @property {number | null} noteCount
 * @property {string | null} difficulty
 * @property {string} audioUrl
 * @property {string | null} imageUrl
 * @property {string | null} addedDate
 */
export default class InfoResponseDto {
  /**
   * @param {TrackInfoItem[]} items
   * @param {boolean} hasNext
   */
  constructor(items, hasNext) {
    this.items = items
    this.hasNext = hasNext
  }

  isValid() {
    return true
  }

  /** @returns {{items: TrackInfoItem[], hasNext: boolean, nextCursor: string | null}} */
  toObject() {
    const last = this.items[this.items.length - 1]
    return {
      items: this.items,
      hasNext: this.hasNext,
      nextCursor: this.hasNext && last ? last.id : null,
    }
  }
}
