## ONEPLUS Server
원플러스 서버입니다.</br>
**pure js**만 사용하여 모든 서버 기능을 구현합니다. `(DB제외)`

## 서버 구조
### Server 클래스
http 요청 처리는 안하고, **Router**클래스에 있는 라우팅들 모아서 `http.createServer()` 요청 받고 처리.
<br/>
단, 미들웨어는 가장 먼저 실행되도록 server 클래스에서만 사용하도록 강제함.

### Router 클래스
http 라우팅 처리(controller 계층임)
<br/>
get, post, put, patch, delete 요청 처리 가능.

### 기본 미들웨어
- HttpExceptionHandler(만드는중) : http 예외 발생 시, 불편하게 여러 줄의 코드 대신 내가 만들어둔 http 예외 목록 사용 시, 에러 캐치해서 안전하게 반환.

### Cookie, Jwt, etc..
**`#` Cookie 클래스**
<br/>
쿠키 생성, 조회, 삭제

**`#` Jwt 클래스**
<br/>
jwt 생성, 해독, 검증


## 목표
- express보다 느리더라도 제대로 돌아가는 서버 구동
- 실무 스타일 깃허브 활용하기