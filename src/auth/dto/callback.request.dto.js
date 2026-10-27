/**
 * @import {DTO} from '../../common/modules/dto.module.js'
 * @implements {DTO}
 */
export default class CallbackRequestDto {
  /**
   * @param {string} code
   * @param {string} state
   */
  constructor(code, state) {
    this.code = code
    this.state = state
  }

  isValid() {
    if (!this.code) return false
    if (!this.state) return false
    return true
  }

  toObject() {
    return {
      code: this.code,
      state: this.state,
    }
  }
}
