import { OAuthService } from '../oauth.service.js'

/**
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 */
const authEntry = async (req, res) => {
  const oAuthService = new OAuthService()

  const state = oAuthService.generateState()
  const { codeVerifier, codeChallenge } = oAuthService.generateCodeVerifierSet()
  const url = oAuthService.generateAuthURL(state, codeChallenge)

  console.log(url)

  res.redirect(url, {
    statusCode: 302,
    cache: false,
    maxAge: 0,
  })
}

export default authEntry
