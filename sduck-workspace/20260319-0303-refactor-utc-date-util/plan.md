# Plan

## Step 1. 공용 UTC 날짜 유틸 모듈 추가

- `src/utils/utc-date.ts`를 생성한다.
- 최소 아래 함수를 공용 유틸로 고정한다.
  - `formatUtcTimestamp(date: Date): string`
  - 필요 시 `formatUtcDate(date: Date): string`
- 반환 포맷은 기존 동작과 동일한 `YYYY-MM-DDTHH:mm:ssZ` 형식을 유지한다.

## Step 2. `start` 날짜 포맷 로직을 공용 유틸로 치환

- `src/core/start.ts`의 기존 UTC 포맷 함수를 제거하거나 내부 구현을 공용 유틸 호출로 바꾼다.
- `createWorkspaceId()`와 `meta.yml` 생성 흐름에서 기존 포맷 결과가 바뀌지 않도록 유지한다.

## Step 3. 테스트를 공용 유틸 기준으로 정리

- `tests/unit/start.test.ts`를 갱신해 `start`가 공용 유틸을 통해도 동일 동작함을 검증한다.
- 필요하면 `tests/unit/utc-date.test.ts`를 추가해 유틸 자체 포맷을 독립 검증한다.

## Step 4. 재사용 지점 정리와 문서 반영

- 향후 approval/done 명령에서 재사용 가능하도록 유틸 위치와 이름을 명확히 유지한다.
- 필요 시 `docs/snippets.md` 또는 관련 문서에 공용 UTC 유틸 사용 예시를 짧게 반영한다.

## Step 5. 전체 검증과 완료 조건 확인

- `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build`를 실행한다.
- spec의 완료 정의를 대조하고 외부 동작 변경이 없는지 확인한 뒤 완료 처리한다.
