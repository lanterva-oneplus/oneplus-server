import crypto from 'crypto'
import Result from '../common/modules/result.module.js'

export class OAuthService {
  /** @type {string} */
  #clientId = process.env.GOOGLE_CLIENT
  /** @type {string} */
  #clientSecret = process.env.GOOGLE_SECRET
  /** @type {string} */
  #redirectURI = process.env.GOOGLE_REDIRECT_URI

  generateState() {
    return crypto.randomBytes(32).toString('base64url')
  }

  /**
   * @returns {{
   *   codeVerifier: string,
   *   codeChallenge: string
   * }}
   */
  generateCodeVerifierSet() {
    const codeVerifier = crypto.randomBytes(32).toString('base64url')
    const codeChallenge = crypto.createHash('sha256').update(codeVerifier).digest('base64url')
    return {
      codeVerifier: codeVerifier,
      codeChallenge: codeChallenge,
    }
  }

  generateAuthURL(state, codeChallenge) {
    const param = new URLSearchParams({
      client_id: this.#clientId,
      redirect_uri: this.#redirectURI,
      response_type: 'code',
      scope: 'openid profile email',
      state: state,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
    })

    return `https://accounts.google.com/o/oauth2/v2/auth?${param.toString()}`
  }

  /**
   * @param {string} realState
   * @param {string} callbackState
   * @param {string} code
   * @returns {Result}
   */
  async getUserInfo(code) {
    // 토큰교환
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      body: new URLSearchParams({
        code: code,
        client_id: this.#clientId,
        client_secret: this.#clientSecret,
        redirect_uri: this.#redirectURI,
        grant_type: 'authorization_code',
      }),
    })

    const tokenData = await tokenResponse.json()
    if (!tokenResponse.ok) {
      return Result.fail({
        message: '토큰 교환 실패',
        errorCode: tokenData.error,
        errorDescription: tokenData.error_description,
      })
    }

    // 액세스토큰으로 유저정보 요청
    try {
      // 에러처리
      const accessToken = tokenData['access_Token']
      if (!accessToken) return Result.fail({ message: '액세스 토큰 누락', accessToken: accessToken })

      const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      const userInfoData = await userInfoResponse.json()

      if (!userInfoResponse.ok) {
        return Result.fail({
          message: '유저 정보 요청 실패',
          errorCode: userInfoResponse.status,
          errorDescription: userInfoData.message,
        })
      }

      // 유저 정보 반환
      return Result.success({
        message: '사용자 정보를 성공적으로 반환',
        userInfo: userInfoData,
      })
    } catch (e) {
      return Result.fail({ message: 'json 얻는 중 문제 발생', err: tokenData.error })
    }
  }
}
