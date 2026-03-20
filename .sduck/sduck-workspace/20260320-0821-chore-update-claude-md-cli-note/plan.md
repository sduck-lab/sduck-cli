# Plan

## Step 1. rule source와 생성 경로에서 잘못된 CLI 부재 가정 위치 확인

- `CLAUDE.md`, `.sduck/sduck-assets/agent-rules/core.md`, `src/core/agent-rules.ts`, `src/core/init.ts`를 확인한다.
- 실제로 어떤 파일이 managed block 원문이 되는지 확인하고, 문구 변경 위치를 최소 범위로 특정한다.

## Step 2. 공통 문구와 생성 결과를 현재 상태에 맞게 수정

- `sduck CLI가 없으므로 ... 직접 파일을 생성` 문구를 제거하거나 현재 동작에 맞는 표현으로 바꾼다.
- 루트 `CLAUDE.md`와 rule source가 같은 의미를 유지하도록 맞춘다.
- 필요하면 init 재생성 결과가 동일해지도록 core 쪽 템플릿 결합 로직이나 source text를 함께 조정한다.

## Step 3. 테스트와 검증

- `tests/unit/agent-rules.test.ts`, `tests/e2e/init-agent-rules.test.ts`에서 기대 문자열을 조정하거나 케이스를 추가한다.
- `npm run lint`, `npm test`로 검증한 뒤 task를 완료 처리한다.
