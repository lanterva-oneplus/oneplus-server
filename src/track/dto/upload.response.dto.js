/**
 * @import {DTO} from '../../common/modules/dto.module.js'
 * @implements {DTO}
 */
export default class UploadResponseDto {
  /**
   * @param {string} id
   * @param {string} title
   * @param {string} artist
   * @param {string} audioUrl
   * @param {string} imageUrl
   */
  constructor(id, title, artist, audioUrl, imageUrl) {
    this.id = id
    this.title = title
    this.artist = artist
    this.audioUrl = audioUrl
    this.imageUrl = imageUrl
  }

  isValid() {
    return true
  }

  /**
   * @returns {{id: string, title: string, artist: string, audioUrl: string, imageUrl: string}}
   */
  toObject() {
    return {
      id: this.id,
      title: this.title,
      artist: this.artist,
      audioUrl: this.audioUrl,
      imageUrl: this.imageUrl,
    }
  }
}
