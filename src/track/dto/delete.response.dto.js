/**
 * @import {DTO} from '../../common/modules/dto.module.js'
 * @implements {DTO}
 */
export default class DeleteResponseDto {
  /** @param {string} id 삭제된 트랙 id */
  constructor(id) {
    this.id = id
  }

  isValid() {
    return true
  }

  /** @returns {{id: string}} */
  toObject() {
    return { id: this.id }
  }
}
