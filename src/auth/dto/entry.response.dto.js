/**
 * @import {DTO} from '../../common/modules/dto.module.js'
 * @implements {DTO}
 */
export default class EntryResponseDto {
  /**
   * @param {string} authorizationURL
   */
  constructor(authorizationURL) {
    this.authorizationURL = authorizationURL
  }

  isValid() {
    return true
  }

  /**
   * @returns {{authorizationURL: string}}
   */
  toObject() {
    return {
      authorizationURL: this.authorizationURL,
    }
  }
}
