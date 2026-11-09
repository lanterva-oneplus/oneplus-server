/**
 * @import {DTO} from '../../common/modules/dto.module.js'
 * @implements {DTO}
 */
export default class CallbackResponseDto {
  /**
   * @param {string} accessToken
   * @param {string} refreshToken
   */
  constructor(accessToken, refreshToken) {
    this.accessToken = accessToken
    this.refreshToken = refreshToken
  }

  isValid() {
    return true
  }

  /**
   * @returns {{accessToken: string, refreshToken: string}}
   */
  toObject() {
    return {
      accessToken: this.accessToken,
      refreshToken: this.refreshToken,
    }
  }
}
