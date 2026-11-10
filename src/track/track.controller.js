import { adminAuthMiddleware } from '../common/middleware/auth.middleware.js'
import BadRequestException from '../common/http_exceptions/bad-request.exception.js'
import { parseMultipart } from '../common/modules/multipart.module.js'
import pool from '../common/modules/postgresql.module.js'
import { Router } from '../common/server/router.js'
import NotFoundException from '../common/http_exceptions/not-found.exception.js'
import DeleteRequestDto from './dto/delete.request.dto.js'
import InfoRequestDto from './dto/info.request.dto.js'
import LoadRequestDto from './dto/load.request.dto.js'
import UpdateRequestDto from './dto/update.request.dto.js'
import UploadRequestDto from './dto/upload.request.dto.js'
import NoteService from './service/note.service.js'
import StorageService from './service/storage.service.js'
import deleteUsecase from './usecase/delete.usecase.js'
import infoUsecase from './usecase/info.usecase.js'
import loadUsecase from './usecase/load.usecase.js'
import updateUsecase from './usecase/update.usecase.js'
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

trackRouter.get('/:id', [], async (req, res) => {
  const loadRequestDto = new LoadRequestDto(req.params.id)
  if (!loadRequestDto.isValid()) {
    return res.sendError(
      new NotFoundException('트랙을 찾을 수 없습니다.', 'track_not_found'),
    )
  }

  const result = await loadUsecase(
    { pool: pool, storageService: new StorageService() },
    loadRequestDto.toObject(),
  )

  if (result.error) return res.sendError(result.error)

  return res.sendSuccess(result.data?.toObject(), '트랙 로드에 성공했습니다.', 200)
})

trackRouter.delete('/:id', [], async (req, res) => {
  const deleteRequestDto = new DeleteRequestDto(req.params.id)
  if (!deleteRequestDto.isValid()) {
    return res.sendError(
      new NotFoundException('트랙을 찾을 수 없습니다.', 'track_not_found'),
    )
  }

  const result = await deleteUsecase(
    { pool: pool, storageService: new StorageService() },
    deleteRequestDto.toObject(),
  )

  if (result.error) return res.sendError(result.error)

  return res.sendSuccess(result.data?.toObject(), '트랙 삭제에 성공했습니다.', 200)
})

// multipart/form-data: title, image 중 최소 하나
trackRouter.patch('/:id', [], async (req, res) => {
  // body는 첫 await 전에 소비해야 하므로 파싱을 먼저 시작
  const formPromise = parseMultipart(req)

  const loadRequestDto = new LoadRequestDto(req.params.id)

  /** @type {FormData} */
  let form
  try {
    form = await formPromise
  } catch (err) {
    console.error(err)
    return res.sendError(new BadRequestException('요청값이 올바르지 않습니다.'))
  }

  if (!loadRequestDto.isValid()) {
    return res.sendError(
      new NotFoundException('트랙을 찾을 수 없습니다.', 'track_not_found'),
    )
  }

  const updateRequestDto = new UpdateRequestDto(form.get('title'), form.get('image'))
  if (!updateRequestDto.isValid()) {
    return res.sendError(new BadRequestException('요청값이 올바르지 않습니다.'))
  }

  const result = await updateUsecase(
    { pool: pool, storageService: new StorageService() },
    { ...loadRequestDto.toObject(), ...updateRequestDto.toObject() },
  )

  if (result.error) return res.sendError(result.error)

  return res.sendSuccess(result.data?.toObject(), '트랙 수정에 성공했습니다.', 200)
})

export default trackRouter
