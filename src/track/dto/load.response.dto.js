/**
 * @import {DTO} from '../../common/modules/dto.module.js'
 * @implements {DTO}
 */

/**
 * @typedef {object} Note
 * @property {number} time
 * @property {'south' | 'east' | 'west' | 'north'} dir
 *
 * @typedef {object} LoadTrack
 * @property {string} id
 * @property {string} title
 * @property {string | null} artist
 * @property {number | null} lengthSec
 * @property {string} difficulty
 * @property {number} noteCount
 * @property {Note[]} notes
 * @property {string} audioUrl
 * @property {string | null} imageUrl
 */
export default class LoadResponseDto {
  /** @param {LoadTrack} track */
  constructor(track) {
    this.track = track
  }

  isValid() {
    return true
  }

  /** @returns {LoadTrack} */
  toObject() {
    return this.track
  }
}
