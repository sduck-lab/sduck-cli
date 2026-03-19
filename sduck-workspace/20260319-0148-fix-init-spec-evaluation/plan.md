# Plan

## Step 1. init 기본 asset 목록에 `spec-evaluation.yml` 추가

- `src/core/init.ts`의 `AssetTemplateKey`, `ASSET_TEMPLATE_DEFINITIONS`, 관련 타입 맵에 `spec-evaluation` 항목을 추가한다.
- 생성 순서와 summary 출력에서 새 asset이 일관되게 포함되도록 한다.

## Step 2. 단위 테스트 기대값 갱신

- `tests/unit/init.test.ts`에서 기본 asset 개수와 action 분류 기대값을 `spec-evaluation.yml` 포함 기준으로 수정한다.
- safe/force 모드 모두 새 asset이 계획 계산에 포함되는지 검증한다.

## Step 3. E2E 테스트 시나리오 보강

- `tests/e2e/init.test.ts`에서 신규 초기화 시 `sduck-assets/spec-evaluation.yml` 생성 여부를 확인한다.
- 부분 손상 복구 또는 `--force` 재생성 시에도 `spec-evaluation.yml`이 정상적으로 복구/재생성되는지 검증한다.

## Step 4. 전체 검증과 완료 조건 확인

- `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build`를 실행한다.
- `spec.md`의 재현/수정 검증 항목과 실제 결과를 대조한 뒤 완료 처리한다.
