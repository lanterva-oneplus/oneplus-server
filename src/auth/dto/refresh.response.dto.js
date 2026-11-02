/**
 * @import {DTO} from '../../common/modules/dto.module.js'
 * @implements {DTO}
 */
export default class RefreshResponseDto {
  /**
   * @param {string} accessToken
   */
  constructor(accessToken) {
    this.accessToken = accessToken
  }

  isValid() {
    return true
  }

  /**
   * @returns {{accessToken: string}}
   */
  toObject() {
    return {
      accessToken: this.accessToken,
    }
  }
}
