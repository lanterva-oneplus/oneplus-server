import crypto from 'crypto'
import { TradeTokenError } from '../auth.error.js';

export default class OauthService {
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

    if(!tokenResponse.ok) throw new TradeTokenError()

    const tokenData = await tokenResponse.json()
    
  }
}
