/**
 * @import {DTO} from '../../common/modules/dto.module.js'
 * @implements {DTO}
 */
export default class EntryRequestDto {
  /** @param {string | any} deviceId */
  constructor(deviceId) {
    this.deviceId = deviceId
  }

  isValid() {
    if (!this.deviceId) return false
    if (typeof this.deviceId !== 'string') return false
    const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!regex.test(this.deviceId)) return false
    return true
  }

  /** @returns {{deviceId: string}} */
  toObject() {
    return { deviceId: this.deviceId }
  }
}
