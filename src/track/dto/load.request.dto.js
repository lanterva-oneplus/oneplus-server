/**
 * @import {DTO} from '../../common/modules/dto.module.js'
 * @implements {DTO}
 */
export default class LoadRequestDto {
  /** @param {string | undefined} id 트랙 id */
  constructor(id) {
    this.id = typeof id === 'string' && /^[1-9]\d{0,15}$/.test(id) ? Number(id) : NaN
  }

  isValid() {
    return !Number.isNaN(this.id)
  }

  /** @returns {{id: number}} */
  toObject() {
    return { id: this.id }
  }
}
