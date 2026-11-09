import InternalServerErrorException from '../../common/http_exceptions/internal-server-error.exception.js'
import NotFoundException from '../../common/http_exceptions/not-found.exception.js'
import Result from '../../common/modules/result.module.js'
import DeleteResponseDto from '../dto/delete.response.dto.js'
import StorageService from '../service/storage.service.js'

/**
 * @import {Usecase} from '../../common/modules/usecase.module.js'
 * @import { Pool } from 'pg'
 */

/**
 * @typedef {object} DeleteDependency
 * @property {Pool} pool
 * @property {StorageService} storageService
 *
 * @typedef {object} DeleteCommand
 * @property {number} id
 */
/**
 * @type {Usecase<DeleteDependency, DeleteCommand, DeleteResponseDto, InternalServerErrorException | NotFoundException>}
 */
const deleteUsecase = async (dependency, command) => {
  const { pool, storageService } = dependency

  const client = await pool.connect()
  let row
  try {
    await client.query('begin')
    row = (
      await client.query(
        'select track_path, image_path from tracks where id = $1 for update',
        [command.id],
      )
    ).rows[0]

    if (row) {
      await client.query('delete from track_infos where track_id = $1', [command.id])
      await client.query('delete from tracks where id = $1', [command.id])
    }
    await client.query(row ? 'commit' : 'rollback')
  } catch (err) {
    console.error(err)
    await client.query('rollback').catch(() => {})
    return Result.fail(
      new InternalServerErrorException('트랙 삭제 중 문제가 발생했습니다.', 'track_delete_error'),
    )
  } finally {
    client.release()
  }

  if (!row) {
    return Result.fail(new NotFoundException('트랙을 찾을 수 없습니다.', 'track_not_found'))
  }

  await storageService.remove('tracks', row.track_path)
  if (row.image_path) await storageService.remove('images', row.image_path)

  return Result.ok(new DeleteResponseDto(String(command.id)))
}

export default deleteUsecase
