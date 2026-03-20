# Plan

## Step 1. 현재 CLI 동작 기준으로 README 보강 포인트 정리

- `README.md`, `src/cli.ts`, `src/commands/fast-track.ts`, `src/core/spec-approve.ts`, `src/core/plan-approve.ts`, `src/core/done.ts`를 기준으로 문서화할 현재 동작을 정리한다.
- 아래 항목이 README에 충분히 드러나는지 점검한다.
  - `fast-track`의 목적과 제약
  - interactive / 비대화형 차이
  - exact target 정책
  - `.sduck` 기반 디렉토리 구조
  - 일반 흐름과 fast-track 흐름의 차이

## Step 2. README 본문 업데이트

- `README.md`에 현재 구현 기준 사용 흐름과 예시를 추가한다.
- 필요하면 `주요 명령어`, `워크플로우`, `디렉토리 구조` 섹션을 다듬는다.
- 문서는 과장 없이 실제 구현된 동작만 설명한다.

## Step 3. 검증과 완료 처리

- Markdown 변경이므로 우선 `npm run lint`와 `npm test`로 회귀를 확인한다.
- spec 체크리스트를 완료 처리하고 task를 마감한다.
