import InternalServerErrorException from '../../common/http_exceptions/internal-server-error.exception.js'
import NotFoundException from '../../common/http_exceptions/not-found.exception.js'
import Result from '../../common/modules/result.module.js'
import UploadResponseDto from '../dto/upload.response.dto.js'
import StorageService from '../service/storage.service.js'

/**
 * @import {Usecase} from '../../common/modules/usecase.module.js'
 * @import { Pool } from 'pg'
 */

/**
 * @typedef {object} UpdateDependency
 * @property {Pool} pool
 * @property {StorageService} storageService
 *
 * @typedef {object} UpdateCommand
 * @property {number} id
 * @property {string | null} title
 * @property {File | null} image
 */

/**
 * 새 이미지 저장 -> DB update -> 옛 이미지 삭제
 * @type {Usecase<UpdateDependency, UpdateCommand, UploadResponseDto, InternalServerErrorException | NotFoundException>}
 */
const updateUsecase = async (dependency, command) => {
  const { pool, storageService } = dependency

  let current
  try {
    current = (
      await pool.query('select image_path from tracks where id = $1', [command.id])
    ).rows[0]
  } catch (err) {
    console.error(err)
    return Result.fail(
      new InternalServerErrorException('트랙 수정 중 문제가 발생했습니다.', 'track_update_error'),
    )
  }
  if (!current) {
    return Result.fail(new NotFoundException('트랙을 찾을 수 없습니다.', 'track_not_found'))
  }

  let newImageName = ''
  if (command.image) {
    try {
      newImageName = await storageService.save('images', command.image)
    } catch (err) {
      console.error(err)
      return Result.fail(
        new InternalServerErrorException('파일 저장 중 문제가 발생했습니다.', 'file_save_error'),
      )
    }
  }

  // 바뀌는 컬럼만 SET (컬럼명은 코드 고정, 값은 바인딩)
  /** @type {string[]} */
  const sets = []
  /** @type {unknown[]} */
  const values = []
  if (command.title !== null) {
    values.push(command.title)
    sets.push(`track_name = $${values.length}`)
  }
  if (newImageName) {
    values.push(newImageName)
    sets.push(`image_path = $${values.length}`)
  }
  values.push(command.id)

  let row
  try {
    row = (
      await pool.query(
        `update tracks set ${sets.join(', ')} where id = $${values.length}
         returning id, track_name, artist, track_path, image_path`,
        values,
      )
    ).rows[0]
  } catch (err) {
    console.error(err)
    if (newImageName) await storageService.remove('images', newImageName)
    return Result.fail(
      new InternalServerErrorException('트랙 수정 중 문제가 발생했습니다.', 'track_update_error'),
    )
  }

  if (!row) {
    // select 이후 삭제된 경우
    if (newImageName) await storageService.remove('images', newImageName)
    return Result.fail(new NotFoundException('트랙을 찾을 수 없습니다.', 'track_not_found'))
  }

  // 옛 이미지 삭제 (실패해도 성공 처리, remove가 로그만 남김)
  if (newImageName && current.image_path) {
    await storageService.remove('images', current.image_path)
  }

  return Result.ok(
    new UploadResponseDto(
      String(row.id),
      row.track_name,
      row.artist,
      storageService.url('tracks', row.track_path),
      row.image_path ? storageService.url('images', row.image_path) : /** @type {any} */ (null),
    ),
  )
}

export default updateUsecase
