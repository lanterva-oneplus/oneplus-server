/**
 * @import {DTO} from '../../common/modules/dto.module.js'
 * @implements {DTO}
 */
export default class MeRequestDto {
  /**
   * @param {string | any} accessToken
   */
  constructor(accessToken) {
    this.accessToken = accessToken
  }

  isValid() {
    if (!this.accessToken) return false
    if (typeof this.accessToken !== 'string') return false
    return true
  }

  /** @returns {{accessToken: string}} */
  toObject() {
    return {
      accessToken: this.accessToken,
    }
  }
}
