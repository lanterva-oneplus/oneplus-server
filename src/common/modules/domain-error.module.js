export default class DomainError extends Error {
  /**
   * @param {string} message
   * @param {string} error
   */
  constructor(message, error) {
    super(message)
    this.error = error
  }
}
