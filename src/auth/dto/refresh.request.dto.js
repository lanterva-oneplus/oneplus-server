/**
 * @import {DTO} from '../../common/modules/dto.module.js'
 * @implements {DTO}
 */
export default class RefreshRequestDto {
  /**
   * @param {string | any} refreshToken
   * @param {string | any} deviceId
   */
  constructor(refreshToken, deviceId) {
    this.refreshToken = refreshToken
    this.deviceId = deviceId
  }

  isValid() {
    if (!this.refreshToken) return false
    if (typeof this.refreshToken !== 'string') return false
    if (!this.deviceId) return false
    if (typeof this.deviceId !== 'string') return false
    const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!regex.test(this.deviceId)) return false
    return true
  }

  /** @returns {{refreshToken: string, deviceId: string}} */
  toObject() {
    return {
      refreshToken: this.refreshToken,
      deviceId: this.deviceId,
    }
  }
}
