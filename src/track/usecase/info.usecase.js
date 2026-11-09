import InternalServerErrorException from '../../common/http_exceptions/internal-server-error.exception.js'
import NotFoundException from '../../common/http_exceptions/not-found.exception.js'
import Result from '../../common/modules/result.module.js'
import InfoResponseDto from '../dto/info.response.dto.js'
import StorageService from '../service/storage.service.js'

/**
 * @import {Usecase} from '../../common/modules/usecase.module.js'
 * @import { Pool } from 'pg'
 */

const PAGE_SIZE = 20

/**
 * @typedef {object} InfoDependency
 * @property {Pool} pool
 * @property {StorageService} storageService
 *
 * @typedef {object} InfoCommand
 * @property {number | null} id
 * @property {number | null} cursor
 */

/**
 * @type {Usecase<InfoDependency, InfoCommand, InfoResponseDto, InternalServerErrorException | NotFoundException>}
 */
const infoUsecase = async (dependency, command) => {
  const pool = dependency.pool
  const storageService = dependency.storageService

  const select = `
    select t.id, t.track_name, t.artist, t.length_sec, t.track_path, t.image_path,
           t.added_date, i.difficulty, i.note_count
    from tracks t
    left join track_infos i on i.track_id = t.id and i.difficulty = 'normal'`

  let rows
  try {
    if (command.id !== null) {
      rows = (await pool.query(`${select} where t.id = $1`, [command.id])).rows
    } else {
      rows = (
        await pool.query(
          `${select} where ($1::bigint is null or t.id < $1) order by t.id desc limit $2`,
          [command.cursor, PAGE_SIZE + 1],
        )
      ).rows
    }
  } catch (err) {
    console.error(err)
    return Result.fail(
      new InternalServerErrorException(
        '트랙 조회 중 문제가 발생했습니다.',
        'track_select_error',
      ),
    )
  }

  if (command.id !== null && rows.length === 0) {
    return Result.fail(
      new NotFoundException('트랙을 찾을 수 없습니다.', 'track_not_found'),
    )
  }

  const hasNext = rows.length > PAGE_SIZE
  const items = rows.slice(0, PAGE_SIZE).map((row) => ({
    id: String(row.id),
    title: row.track_name,
    artist: row.artist,
    lengthSec: row.length_sec,
    noteCount: row.note_count,
    difficulty: row.difficulty,
    audioUrl: storageService.url('tracks', row.track_path),
    imageUrl: row.image_path ? storageService.url('images', row.image_path) : null,
    addedDate: row.added_date ? formatDate(row.added_date) : null,
  }))

  return Result.ok(new InfoResponseDto(items, hasNext))
}

/** @param {Date} date */
const formatDate = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

export default infoUsecase
