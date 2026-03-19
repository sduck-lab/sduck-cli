# Plan

## Step 1. 승인 target 해석 로직을 exact-only로 통일

- `src/core/spec-approve.ts`의 `resolveTargetCandidates()`에서 `task.id.endsWith(trimmedTarget)` 경로를 제거한다.
- `src/core/plan-approve.ts`의 `resolvePlanApprovalCandidates()`에서도 같은 suffix 매칭을 제거한다.
- 필요하면 공통 helper로 뽑을 수 있는지 검토하되, 이번 변경 범위는 작게 유지한다.
- fast-track이 이후 일반 승인 명령으로 자연스럽게 이어지는 전제를 깨지 않도록 `id exact` 또는 `slug exact`만 허용한다.

## Step 2. 단위 테스트를 exact 정책 기준으로 보강

- `tests/unit/spec-approve.test.ts`에서 suffix 매칭 테스트를 exact-only 기대값으로 바꾼다.
- `tests/unit/plan-approve.test.ts`에 suffix 거부 케이스가 부족하면 추가한다.
- exact id / exact slug / no match 경로를 각각 확인한다.

## Step 3. E2E와 문서를 정책에 맞게 정리

- `tests/e2e/spec-approve.test.ts`, `tests/e2e/plan-approve.test.ts`에 partial target이 거부되는 시나리오를 추가하거나 기존 기대값을 조정한다.
- `README.md`에 target 지정은 exact id/slug만 허용된다는 점을 짧게 반영한다.
- 필요하면 fast-track 관련 설명에도 이후 승인 단계는 exact target 기준이라는 문구를 덧붙인다.

## Step 4. 품질 게이트와 완료 처리

- `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`를 실행한다.
- spec 완료 조건을 체크하고 task를 완료 처리한다.
