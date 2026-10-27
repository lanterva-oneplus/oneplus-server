import crypto from 'crypto'
import { TradeTokenError, UserInfoError } from './oauth.service.error.js'

export default class OAuthService {
  /** @type {string} */
  //@ts-ignore
  #clientId = process.env.GOOGLE_CLIENT

  /** @type {string} */
  //@ts-ignore
  #clientSecret = process.env.GOOGLE_SECRET

  /** @type {string} */
  //@ts-ignore
  #redirectURI = process.env.GOOGLE_REDIRECT_URI

  generateState() {
    return crypto.randomBytes(32).toString('base64url')
  }

  generateCodeSet() {
    const codeVerifier = crypto.randomBytes(32).toString('base64url')
    const codeChallenge = crypto
      .createHash('sha256')
      .update(codeVerifier)
      .digest('base64url')
    return {
      codeVerifier: codeVerifier,
      codeChallenge: codeChallenge,
    }
  }

  /**
   * @param {string} state
   * @param {string} codeChallenge
   * @returns {string}
   */
  generateAuthURL(state, codeChallenge) {
    const param = new URLSearchParams({
      client_id: this.#clientId,
      redirect_uri: this.#redirectURI,
      response_type: 'code',
      scope: 'profile email',
      state: state,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
    })

    return `https://accounts.google.com/o/oauth2/v2/auth?${param.toString()}`
  }

  /**
   * @param {string} code
   * @param {string} codeVerifier
   * @returns {Promise<string>}
   */
  async tradeToken(code, codeVerifier) {
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      body: new URLSearchParams({
        code: code,
        client_id: this.#clientId,
        client_secret: this.#clientSecret,
        redirect_uri: this.#redirectURI,
        grant_type: 'authorization_code',
        code_verifier: codeVerifier,
      }),
    })

    const tokenData = await tokenResponse.json()

    if (!tokenResponse.ok) {
      console.error(tokenData)
      throw new TradeTokenError()
    }

    return tokenData.access_token
  }

  /**
   * @typedef {object} UserInfo
   * @property {string} sub
   * @property {string} name
   * @property {string} email
   * @property {boolean} email_verified
   * @property {string} picture
   * 
   * @param {string} accessToken
   * @returns {Promise<UserInfo>}
   */
  async getUserInfo(accessToken) {
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    const userData = await userResponse.json()

    if (!userResponse.ok) {
      console.error(userData)
      throw new UserInfoError()
    }

    return userData
  }
}
