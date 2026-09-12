export default class Result {
  /** @type {boolean} */
  success

  /**
   * @typedef {object} SuccessResult
   * @property {string} message
   * @property {[key: string]: any}
   */

  /**  @type {dataResult} */
  data

  /**
   * @typedef {object} FailResult
   * @property {string} message
   * @property {string} errorCode
   * @property {[key: string]: any}
   */

  /** @type {FailResult} */
  error

  /**
   * @param {boolean} success
   * @param {SuccessResult} [data]
   * @param {FailResult} [error]
   */
  constructor(success, data, error) {
    this.success = success
    this.data = data
    this.error = error
  }

  /**
   * @param {SuccessResult} data
   * @returns {Result.success}
   */
  static success(data) {
    return new Result(true, { message: data.message }, null)
  }

  /**
   * 
   * @param {FailResult} error 
   * @returns {Result.fail}
   */
  static fail(error) {
    return new Result(false, null, { message: error.message, errorCode: error.errorCode })
  }
}
