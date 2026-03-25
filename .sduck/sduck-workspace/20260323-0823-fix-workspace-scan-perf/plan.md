# Plan

## Step 1. workspace.ts 병렬화 및 조기 종료 구현

`src/core/workspace.ts` 수정:

- `listWorkspaceTasks`: readdir 후 디렉토리 목록에 대해 `Promise.allSettled`로 meta.yml 읽기 병렬화. fulfilled 결과만 수집
- `findActiveTask`: `listWorkspaceTasks`를 호출하지 않고, readdir 후 각 디렉토리의 meta.yml에서 status만 파싱. active 상태 발견 시 즉시 반환
- 상단 `readdir` import 정리 (동적 import 제거)

**검증:** `npx vitest run` 전체 통과, `npx tsc --noEmit` 통과

## Step 2. 검증과 마무리

- 전체 테스트 스위트 회귀 확인
- 타입 체크 통과
