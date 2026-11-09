import BadRequestException from '../common/http_exceptions/bad-request.exception.js'
import { parseMultipart } from '../common/modules/multipart.module.js'
import pool from '../common/modules/postgresql.module.js'
import { Router } from '../common/server/router.js'
import NotFoundException from '../common/http_exceptions/not-found.exception.js'
import InfoRequestDto from './dto/info.request.dto.js'
import UploadRequestDto from './dto/upload.request.dto.js'
import NoteService from './service/note.service.js'
import StorageService from './service/storage.service.js'
import infoUsecase from './usecase/info.usecase.js'
import uploadUsecase from './usecase/upload.usecase.js'

const trackRouter = new Router()

// multipart/form-data
trackRouter.post('', [], async (req, res) => {
  /** @type {FormData} */
  let form
  try {
    form = await parseMultipart(req)
  } catch (err) {
    console.error(err)
    return res.sendError(new BadRequestException('요청값이 올바르지 않습니다.'))
  }

  const uploadRequestDto = new UploadRequestDto(
    form.get('title'),
    form.get('artist'),
    form.get('audio'),
    form.get('image'),
  )
  if (!uploadRequestDto.isValid()) {
    return res.sendError(new BadRequestException('요청값이 올바르지 않습니다.'))
  }

  const result = await uploadUsecase(
    { pool: pool, storageService: new StorageService(), noteService: new NoteService() },
    uploadRequestDto.toObject(),
  )

  if (result.error) return res.sendError(result.error)

  return res.sendSuccess(result.data?.toObject(), '트랙 업로드에 성공했습니다.', 201)
})

// ?id=<number>: 특정 트랙 / ?cursor=<number>: 이 id 이전부터 20개 (없으면 최신 20개)
trackRouter.get('/info', [], async (req, res) => {
  const infoRequestDto = new InfoRequestDto(req.query.id, req.query.cursor)
  // 형식이 잘못된 id는 존재하지 않는 트랙으로 취급
  if (!infoRequestDto.isValid()) {
    return res.sendError(
      new NotFoundException('트랙을 찾을 수 없습니다.', 'track_not_found'),
    )
  }

  const result = await infoUsecase(
    { pool: pool, storageService: new StorageService() },
    infoRequestDto.toObject(),
  )

  if (result.error) return res.sendError(result.error)

  return res.sendSuccess(result.data?.toObject(), '트랙 정보 조회에 성공했습니다.', 200)
})

trackRouter.get('/:id', [], (req, res) => {})

trackRouter.delete('/:id', [], (req, res) => {})

trackRouter.patch('/:id', [], (req, res) => {})

export default trackRouter
