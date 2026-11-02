/**
 * @import {DTO} from '../../common/modules/dto.module.js'
 * @implements {DTO}
 */
export default class MeResponseDto {
  /**
   * @param {string} id
   * @param {string} email
   * @param {string} nickname
   * @param {string} profile
   */
  constructor(id, email, nickname, profile) {
    this.id = id
    this.email = email
    this.nickname = nickname
    this.profile = profile
  }

  isValid() {
    return true
  }

  /**
   * @returns {{id: string, email: string, nickname: string, profile: string}}
   */
  toObject() {
    return {
      id: this.id,
      email: this.email,
      nickname: this.nickname,
      profile: this.profile,
    }
  }
}
