# [feature] sduck update command

## 목표

새 버전의 sduck CLI 설치 후, 프로젝트의 에셋과 에이전트 룰 파일을 최신 버전으로 갱신하는 `sduck update` 명령어를 추가한다.

## 배경

현재 sduck은 버전 업데이트 시 `sduck init --force`를 수동으로 실행해야 에셋이 갱신된다. 이는 사용자가 업데이트를 잊거나, 어느 버전의 에셋을 사용 중인지 알 수 없는 문제가 있다. 버전 추적과 자동 감지 기능이 필요하다.

## 범위

### 포함

- `sduck update` 명령어 구현
- 프로젝트 에셋 버전 파일 (`.sduck/sduck-assets/.sduck-version`) 관리
- 에셋 템플릿 파일 (eval/_.yml, types/_.md) 갱신
- 에이전트 룰 파일 (CLAUDE.md, AGENT.md 등) managed block 교체
- 관리 파일 (.cursor/rules/, .agents/rules/) 덮어쓰기
- Claude Code 훅 (.claude/hooks/sdd-guard.sh, .claude/settings.json) 갱신
- `--dry-run` 옵션 (계획만 출력, 실제 변경 없음)
- 누락된 파일이 있으면 init과 동일하게 생성
- `sduck init` 실행 시 `.sduck-version` 파일 생성

### 제외

- 마이그레이션 스크립트 (버전 간 스키마 변환)
- `--from <version>` 옵션 (복구용 수동 버전 지정)
- postinstall 훅 (npm install 시 자동 실행)
- `--json` 출력 옵션
- 해시 기반 변경 감지 (버전 비교만 사용)

## 완료 조건

- [ ] `sduck update`가 정상 실행되고 에셋/룰/훅을 갱신한다
- [ ] `sduck update --dry-run`이 변경 계획만 출력하고 파일을 수정하지 않는다
- [ ] 버전이 같으면 "already up to date" 메시지를 출력하고 아무 작업도 수행하지 않는다
- [ ] `.sduck/`가 없으면 에러 메시지와 함께 `sduck init`을 안내한다
- [ ] `sduck init` 실행 후 `.sduck/sduck-assets/.sduck-version`이 CLI 버전으로 생성된다
- [ ] 에이전트 룰 파일의 managed block 외부 사용자 커스텀 내용이 보존된다
- [ ] 단위 테스트가 통과한다
- [ ] E2E 테스트가 통과한다
- [ ] `npm run lint`, `npm run typecheck`, `npm run build`가 통과한다
