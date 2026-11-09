import InternalServerErrorException from '../../common/http_exceptions/internal-server-error.exception.js'
import Result from '../../common/modules/result.module.js'
import UploadResponseDto from '../dto/upload.response.dto.js'
import StorageService from '../service/storage.service.js'

/**
 * @import {Usecase} from '../../common/modules/usecase.module.js'
 * @import { Pool } from 'pg'
 */

/**
 * @typedef {object} UploadDependency
 * @property {Pool} pool
 * @property {StorageService} storageService
 *
 * @typedef {object} UploadCommand
 * @property {string} title
 * @property {string} artist
 * @property {File} audio
 * @property {File} image
 */
/**
 * 파일 저장 -> DB 등록
 * @type {Usecase<UploadDependency, UploadCommand, UploadResponseDto, InternalServerErrorException>}
 */
const uploadUsecase = async (dependency, command) => {
  const pool = dependency.pool
  const storageService = dependency.storageService

  // 파일 저장
  let audioName = ''
  let imageName = ''

  try {
    audioName = await storageService.save('tracks', command.audio)
    imageName = await storageService.save('images', command.image)
  } catch (err) {
    console.error(err)
    if (audioName) await storageService.remove('tracks', audioName)
    return Result.fail(
      new InternalServerErrorException(
        '파일 저장 중 문제가 발생했습니다.',
        'file_save_error',
      ),
    )
  }

  // 트랙 등록
  const track = await pool
    .query(
      'insert into tracks (track_name, artist, track_path, image_path) values ($1, $2, $3, $4) returning id',
      [command.title, command.artist, audioName, imageName],
    )
    .then((result) => result.rows[0])
    .catch((err) => {
      console.error(err)
      return null
    })

  if (!track) {
    await storageService.remove('tracks', audioName)
    await storageService.remove('images', imageName)
    return Result.fail(
      new InternalServerErrorException(
        '트랙 등록 중 문제가 발생했습니다.',
        'track_insert_error',
      ),
    )
  }

  return Result.ok(
    new UploadResponseDto(
      String(track.id),
      command.title,
      command.artist,
      storageService.url('tracks', audioName),
      storageService.url('images', imageName),
    ),
  )
}

export default uploadUsecase
