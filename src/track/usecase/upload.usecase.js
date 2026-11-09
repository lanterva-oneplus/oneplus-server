import InternalServerErrorException from '../../common/http_exceptions/internal-server-error.exception.js'
import Result from '../../common/modules/result.module.js'
import UploadResponseDto from '../dto/upload.response.dto.js'
import NoteService from '../service/note.service.js'
import StorageService from '../service/storage.service.js'

/**
 * @import {Usecase} from '../../common/modules/usecase.module.js'
 * @import { Pool } from 'pg'
 */

/**
 * @typedef {object} UploadDependency
 * @property {Pool} pool
 * @property {StorageService} storageService
 * @property {NoteService} noteService
 *
 * @typedef {object} UploadCommand
 * @property {string} title
 * @property {string} artist
 * @property {File} audio
 * @property {File} image
 */
/**
 * 파일 저장 -> 노트 생성 -> DB 등록(tracks, track_infos 트랜잭션)
 * @type {Usecase<UploadDependency, UploadCommand, UploadResponseDto, InternalServerErrorException>}
 */
const uploadUsecase = async (dependency, command) => {
  const pool = dependency.pool
  const storageService = dependency.storageService
  const noteService = dependency.noteService

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

  // 노트 생성
  let generated
  try {
    generated = await noteService.generate(await command.audio.arrayBuffer())
  } catch (err) {
    console.error(err)
    await storageService.remove('tracks', audioName)
    await storageService.remove('images', imageName)
    return Result.fail(
      new InternalServerErrorException(
        '노트 생성 중 문제가 발생했습니다.',
        'note_generate_error',
      ),
    )
  }

  // 트랙 등록 (tracks + track_infos)
  const client = await pool.connect()
  let track = null
  try {
    await client.query('begin')
    const inserted = await client.query(
      'insert into tracks (track_name, artist, track_path, image_path, length_sec) values ($1, $2, $3, $4, $5) returning id',
      [command.title, command.artist, audioName, imageName, generated.lengthSec],
    )
    track = inserted.rows[0]
    await client.query(
      'insert into track_infos (track_id, difficulty, note_count, note) values ($1, $2, $3, $4)',
      [track.id, 'normal', generated.notes.length, JSON.stringify(generated.notes)],
    )
    await client.query('commit')
  } catch (err) {
    console.error(err)
    track = null
    await client.query('rollback').catch(() => {})
  } finally {
    client.release()
  }

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
