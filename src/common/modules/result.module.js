import HttpException from "../http_exceptions/http.exception.js";

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
   * @param {T} data
   * @returns {Result<T, null>}
   */
  static ok(data) {
    return new Result(true, data, null)
  }

  /**
   * @template {HttpException} E
   * @param {E} error
   * @returns {Result<null, E>}
   */
  static fail(error) {
    return new Result(false, null, error)
  }
}
