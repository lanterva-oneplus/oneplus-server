import DomainError from "./domain-error.module.js";

export class RedisError extends DomainError {
  constructor() {
    super('임시 데이터 처리 중 문제가 발생했습니다.', 'im_database_error')
  }
}

