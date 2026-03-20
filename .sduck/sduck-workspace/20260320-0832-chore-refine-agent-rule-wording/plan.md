# Plan

## Step 1. 현재 wording과 역할 분담 기준 정리

- `CLAUDE.md`, `AGENT.md`, `.sduck/sduck-assets/agent-rules/claude-code.md`, `.sduck/sduck-assets/agent-rules/codex.md`, `.sduck/sduck-assets/agent-rules/opencode.md`, `.sduck/sduck-assets/agent-rules/gemini-cli.md`를 기준으로 현재 문구를 확인한다.
- 공통 표현을 아래 기준으로 정리한다.
  - task 생성과 상태 전이는 `sduck` CLI가 담당
  - 에이전트는 `spec.md`, `plan.md` 본문 작성/수정과 구현을 담당

## Step 2. root rule과 source rule wording 정리

- root rule 파일과 agent rule source 파일의 첫 문단을 같은 의미로 맞춘다.
- 문구는 짧지만 역할 분담이 분명하게 드러나도록 다듬는다.
- 승인/구현 제한 규칙과 충돌하지 않게 유지한다.

## Step 3. 테스트 기대값 갱신과 검증

- `tests/unit/agent-rules.test.ts`, `tests/e2e/init-agent-rules.test.ts`의 기대 문자열을 갱신한다.
- `npm run lint`, `npm test`로 검증하고 task를 완료 처리한다.
