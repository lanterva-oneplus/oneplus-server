export default class HttpException extends Error {
  /**
   * 
   * @param {number} statusCode 
   * @param {string} message 
   * @param {string} error 
   */
  constructor(statusCode, message, error) {
    super(message)
    this.statusCode = statusCode
    this.error = error
  }
}
