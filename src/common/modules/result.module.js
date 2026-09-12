export class Result {
  /** @type {boolean} */
  success

  /**
   * @typedef {object} dataResult
   * @property {string} message
   * @property {[key: string]: any}
   */

  /**  @type {dataResult} */
  data
  /** @type {any} */
  error

  /**
   * @param {boolean} success
   * @param {any} [data]
   * @param {any} [error]
   */
  constructor(success, data, error) {
    this.success = success
    this.data = data
    this.error = error
  }

  static success(data) {
    return new Result(true, data, null)
  }

  static fail(error) {
    return new Result(false, null, error)
  }
}
