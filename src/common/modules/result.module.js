import HttpException from '../http_exceptions/http.exception.js'

/**
 * @template T
 * @template {HttpException | null} E
 */
export default class Result {
  /**
   * @param {boolean} success
   * @param {T | null} data
   * @param {E | null} error
   */
  constructor(success, data, error) {
    this.success = success
    this.data = data
    this.error = error
  }

  /**
   * @template T
   * @template {HttpException | null} E
   * @param {T} data
   * @returns {Result<T, E>}
   */
  static ok(data) {
    /** @type {Result<T, E>} */
    return new Result(true, data, null)
  }

  /**
   * @template {HttpException} E
   * @template T
   * @param {E} error
   * @returns {Result<T, E>}
   */
  static fail(error) {
    /** @type {Result<T, E>} */
    return new Result(false, null, error)
  }
}
