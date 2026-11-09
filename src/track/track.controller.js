import BadRequestException from '../common/http_exceptions/bad-request.exception.js'
import { parseMultipart } from '../common/modules/multipart.module.js'
import pool from '../common/modules/postgresql.module.js'
import { Router } from '../common/server/router.js'
import UploadRequestDto from './dto/upload.request.dto.js'
import StorageService from './service/storage.service.js'
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
    { pool: pool, storageService: new StorageService() },
    uploadRequestDto.toObject(),
  )

  if (result.error) return res.sendError(result.error)

  return res.sendSuccess(result.data?.toObject(), '트랙 업로드에 성공했습니다.', 201)
})

trackRouter.get('/info', [], (req, res) => {})

trackRouter.get('/:id', [], (req, res) => {})

trackRouter.delete('/:id', [], (req, res) => {})

trackRouter.patch('/:id', [], (req, res) => {})

export default trackRouter
