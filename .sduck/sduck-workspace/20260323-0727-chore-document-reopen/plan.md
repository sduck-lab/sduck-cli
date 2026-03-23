# Plan

## Step 1. 현재 reopen 동작과 문서 반영 범위 확인

- `README.md`, `CLAUDE.md`, `AGENT.md`, `.sduck/sduck-assets/agent-rules/core.md`, `src/cli.ts`를 확인한다.
- 현재 구현 기준으로 `reopen`의 의미, 상태 전이, 사용 제한을 문서화할 최소 사실만 정리한다.
- 기존 `done`, `fast-track`, 승인 규칙과 충돌하지 않는 표현으로 범위를 제한한다.

## Step 2. README와 agent rule 문구 보강

- `README.md`에 `reopen` 명령 설명, 상태 전이, reopen vs 새 task 기준을 추가한다.
- `CLAUDE.md`, `AGENT.md`, `.sduck/sduck-assets/agent-rules/core.md`에는 reopen 이후 어떤 상태에서 어떤 작업이 가능한지 짧게 반영한다.
- 문서는 실제 구현된 동작만 설명하고, 아직 없는 기능은 쓰지 않는다.

## Step 3. 검증과 완료 처리

- `npm run lint`, `npm test`로 문서 변경 회귀를 확인한다.
- spec 체크리스트를 완료 처리하고 task를 마감한다.
