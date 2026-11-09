/**
 * @import {DTO} from '../../common/modules/dto.module.js'
 * @implements {DTO}
 */
export default class InfoRequestDto {
  /**
   * @param {string | undefined} id 트랙 id
   * @param {string | undefined} cursor 마지막 트랙 id
   */
  constructor(id, cursor) {
    this.id = InfoRequestDto.#toId(id)
    this.cursor = InfoRequestDto.#toId(cursor)
  }

  /** @param {string | undefined} value */
  static #toId(value) {
    if (value === undefined) return null
    if (typeof value !== 'string' || !/^[1-9]\d{0,15}$/.test(value)) return NaN
    return Number(value)
  }

  isValid() {
    if (Number.isNaN(this.id)) return false
    if (Number.isNaN(this.cursor)) return false
    return true
  }

  /** @returns {{id: number | null, cursor: number | null}} */
  toObject() {
    return { id: this.id, cursor: this.cursor }
  }
}
