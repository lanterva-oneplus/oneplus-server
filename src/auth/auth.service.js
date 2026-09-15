import pool from '../common/modules/postgresql.module.js'
import Result from '../common/modules/result.module.js'

export default class AuthService {
  /**
   * @typedef {object} userInfo
   * @property {string} sub
   * @property {string} name
   * @property {string} picture
   * @property {string} email
   *
   * @param {userInfo} userInfo
   * @returns {Promise<Result>}
   */
  async upsert(userInfo) {
    try {
      const userResult = await pool.query(
        `
        insert into users (sub, email, nickname, profile, status)
        values($1, $2, $3, $4, 'active')
        on conflict (sub)
        do update set
          sub = excluded.sub,
          email = excluded.email,
          nickname = excluded.nickname,
          profile = excluded.profile
        returning *;
        `,
        [userInfo.sub, userInfo.email, userInfo.name, userInfo.picture],
      )
      
      return Result.success({ message: '사용자 정보를 성공적으로 불러왔습니다.', user: userResult.rows[0] })
    } catch (e) {
      console.error(e)
      return Result.fail({ message: 'db upsert 에러', errorMessage: e.message })
    }
  }
}
