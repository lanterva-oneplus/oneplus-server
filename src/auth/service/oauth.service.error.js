import DomainError from '../../common/modules/domain-error.module.js'

export class TradeTokenError extends DomainError {
  constructor() {
    super('사용자 인증 중 문제가 발생했습니다.', 'token_error')
  }
}

export class UserInfoError extends DomainError {
  constructor() {
    super('사용자 정보 요청 중 문제가 발생했습니다.', 'userinfo_error')
  }
}