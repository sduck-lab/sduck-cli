# Plan

## Step 1. `plan approve` 명령 입력 계약과 타입 모델 정의

- `src/cli.ts`에 `plan approve [target]` 서브커맨드를 등록한다.
- `src/commands/plan-approve.ts`와 `src/core/plan-approve.ts`를 위한 입력/출력 타입을 고정한다.
- 최소 아래 타입을 정의한다.
  - `PlanApproveCommandInput`: `{ target?: string }`
  - `PlanApproveTarget`: `{ id: string; path: string; status: string; createdAt?: string; slug?: string }`
  - `PlanApproveSuccessRow`: `{ taskId: string; steps: number; note: string }`
  - `PlanApproveFailureRow`: `{ taskId: string; note: string }`
  - `PlanApproveResult`: `{ approvedAt: string; succeeded: PlanApproveSuccessRow[]; failed: PlanApproveFailureRow[] }`

## Step 2. 승인 후보 탐색과 최근순 정렬 재사용

- `src/core/workspace.ts`의 작업 목록 조회/정렬 로직을 재사용한다.
- plan 승인 후보는 `SPEC_APPROVED` 상태만 대상으로 한다.
- `<task-id-or-slug>`가 없으면 승인 대기 후보 전체를 찾고, 여러 후보면 선택 UI로 넘긴다.
- `<task-id-or-slug>`가 있으면 id 완전일치 + slug suffix 매칭을 적용한다.

## Step 3. 다중 선택 UI와 non-interactive 분기 구현

- 후보가 여러 개면 최근 작업이 상단에 오는 체크박스 선택 UI를 제공한다.
- 여러 작업을 동시에 선택할 수 있어야 한다.
- non-interactive 환경에서 후보가 여러 개면 애매한 선택 불가 에러를 반환한다.

## Step 4. Step 헤더 파싱 규칙 구현

- `plan.md`에서 `## Step N. 제목` 형식만 유효한 Step 헤더로 인정한다.
- `## Step 1.`처럼 제목이 비어 있는 경우는 유효하지 않은 plan으로 처리한다.
- 최소 아래 시그니처를 고정한다.
  - `countPlanSteps(planContent: string): number`
  - `validatePlanHasSteps(planContent: string): void`

## Step 5. 승인 가능 상태와 부분 성공 정책 구현

- 승인 가능한 상태는 `SPEC_APPROVED`만 허용한다.
- 선택된 작업 중 일부가 상태 검증 실패 또는 Step 파싱 실패를 일으켜도 전체를 롤백하지 않는다.
- 성공 가능한 작업만 승인하고, 실패한 작업은 그대로 유지한다.
- 단, 단일 선택에서 실패하면 명확한 실패 코드와 메시지를 반환한다.

## Step 6. `meta.yml` 상태 전이 구현

- 성공 대상 작업의 `meta.yml`에서 아래만 갱신한다.
  - `status: IN_PROGRESS`
  - `plan.approved: true`
  - `plan.approved_at: <UTC ISO 8601>`
  - `steps.total: <파싱된 step 수>`
  - `steps.completed: []`
- 다중 승인에서 성공한 작업은 동일한 승인 시각을 사용한다.
- 실패한 작업의 `meta.yml`은 변경하지 않는다.

## Step 7. 결과 표 출력 형식 구현

- 단일 승인, 다중 승인, 부분 성공 모두 ASCII 표로 출력한다.
- 최소 컬럼은 아래를 포함한다.
  - `Result`
  - `Task`
  - `Steps`
  - `Note`
- 성공한 작업과 실패한 작업을 한 표 안에서 구분하고, 성공 시 구현 시작 안내를 뒤에 추가한다.

## Step 8. 단위 테스트로 파싱/검증/상태 전이 로직 검증

- 최소 아래 케이스를 검증한다.
  - `SPEC_APPROVED` 후보 필터링
  - id 완전일치 / slug suffix 매칭
  - 최근순 정렬
  - `## Step N. 제목` 파싱 성공
  - 제목 없는 Step 헤더 실패
  - 부분 성공 결과 조합
  - `meta.yml` 갱신 내용 확인

## Step 9. E2E 테스트로 실제 plan 승인 흐름 검증

- temp workspace에서 실제 `sduck start` → `sduck spec approve` → `sduck plan approve` 흐름을 검증한다.
- 최소 아래 시나리오를 포함한다.
  - 단일 정상 승인
  - Step 헤더 없는 plan 실패
  - 대상 지정 승인
  - 다중 선택 승인
  - 일부 성공 / 일부 실패가 함께 발생하는 부분 성공

## Step 10. 문서 갱신과 전체 품질 게이트 검증

- `docs/snippets.md`에 `sduck plan approve` 예시를 추가한다.
- 필요 시 `AGENT.md`, `CLAUDE.md`에서 `plan approve` 이후 구현 시작 흐름을 더 명확히 반영한다.
- `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build`를 실행한다.
- spec의 acceptance criteria를 대조하고 완료 처리한다.
