# 가이드
### .nvmrc 사용법
**-# mac, linux**
```
1. brew install nvm
2. 프로젝트 디렉토리에서 nvm i
```

**-# windows**
```
1. winget install Schniz.fnm
2. 프로젝트 디렉토리에서 fnm env --use-on-cd
3. fnm i
```
`만약, windows arm이면 nvm-windows로 사용할 것.`
<br><br><br>
# 실행 방법
편의성을 위해 package.json에 기본적인 설정이 모두 포함됩니다.
```
https 테스트를 위해 mkcert 설치가 필요합니다.
1. https://github.com/FiloSottile/mkcert/releasesd 에서 mkcert-v1.4.4-windows-amd64.exe 설치
2. mkcert를 보관할 폴더를 환경변수로 지정하세요

설치 후, 
1. mkcert -version
2. mkcert -install
3. 이 디렉토리에서 mkcert localhost 127.0.0.1 ::1
```
```
npm i : 의존성 설치입니다. db, 노트분석 api가 포함됩니다.
npm run db:up : docker compose 실행 상태에서 이미지 띄워야 합니다.
npm run start : 서버 시작입니다.
```

### 참고 사항
- CORS 설정은 로컬에서 LiveServer에서 요청하는 모든 트래픽을 받을 수 있도록 풀어놨습니다.
- Google OAuth 클라이언트와 시크릿 키는 따로 문서에 제공됩니다. (2주 후 삭제 예정)
- 테스팅 계정은 문서 내용의 계정으로 로그인하십시요. (새로운 아무 계정입니다. 테스트 후 사용되지 않을 예정입니다.)
<br><br>
- Schema.sql은 도커 이미지에서 작동하기 떄문에 없습니다.
- docker compose 다운로드 상태여야 합니다.
- npm 설치되어야 합니다.
- nvm에서 지정된 버전과 동일해야 합니다. windows에서는 nvm이 제대로 지원되지 않을 수 있습니다. nodejs lts 버전(v24.17.0)으로 진행하세요.
- 테스트 음원은 직접 추가하셔야 합니다. 가이드 문서를 참고해 주세요.

<br><br><br>
# 테스트 가이드
- 서버에서 따로 api 날려서 체크할 건 없습니다. 클라이언트 README.md를 참고해 주세요.