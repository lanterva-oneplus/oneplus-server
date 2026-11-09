import InternalServerErrorException from '../../common/http_exceptions/internal-server-error.exception.js'
import NotFoundException from '../../common/http_exceptions/not-found.exception.js'
import Result from '../../common/modules/result.module.js'
import LoadResponseDto from '../dto/load.response.dto.js'
import StorageService from '../service/storage.service.js'

/**
 * @import {Usecase} from '../../common/modules/usecase.module.js'
 * @import { Pool } from 'pg'
 */

/**
 * @typedef {object} LoadDependency
 * @property {Pool} pool
 * @property {StorageService} storageService
 *
 * @typedef {object} LoadCommand
 * @property {number} id
 */

/**
 * @type {Usecase<LoadDependency, LoadCommand, LoadResponseDto, InternalServerErrorException | NotFoundException>}
 */
const loadUsecase = async (dependency, command) => {
  const { pool, storageService } = dependency

  let rows
  try {
    rows = (
      await pool.query(
        `select t.id, t.track_name, t.artist, t.length_sec, t.track_path, t.image_path,
                i.difficulty, i.note_count, i.note
         from tracks t
         join track_infos i on i.track_id = t.id and i.difficulty = 'normal'
         where t.id = $1`,
        [command.id],
      )
    ).rows
  } catch (err) {
    console.error(err)
    return Result.fail(
      new InternalServerErrorException('트랙 조회 중 문제가 발생했습니다.', 'track_select_error'),
    )
  }

  const row = rows[0]
  if (!row) {
    return Result.fail(new NotFoundException('트랙을 찾을 수 없습니다.', 'track_not_found'))
  }

  return Result.ok(
    new LoadResponseDto({
      id: String(row.id),
      title: row.track_name,
      artist: row.artist,
      lengthSec: row.length_sec,
      difficulty: row.difficulty,
      noteCount: row.note_count,
      notes: row.note,
      audioUrl: storageService.url('tracks', row.track_path),
      imageUrl: row.image_path ? storageService.url('images', row.image_path) : null,
    }),
  )
}

export default loadUsecase
