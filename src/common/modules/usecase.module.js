import HttpException from '../http_exceptions/http.exception.js';
import Result from './result.module.js'

/**
 * @template D - 의존성
 * @template C - 커맨드
 * @template T - 성공 반환값
 * @template {HttpException | null} E - 실패 반환
 * @typedef {(dependency: D, command: C) => Promise<Result<T, E>>} Usecase
 */

export {}
