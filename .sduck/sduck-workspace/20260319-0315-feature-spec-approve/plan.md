# Plan

## Step 1. `spec approve` 명령 입력 계약과 타입 모델 정의

- `src/cli.ts`에 `spec approve` 서브커맨드를 등록한다.
- `src/commands/spec-approve.ts`와 `src/core/spec-approve.ts`를 위한 입력/출력 타입을 고정한다.
- 최소 아래 타입을 정의한다.
  - `SpecApproveCommandInput`: `{ target?: string }`
  - `SpecApproveTarget`: `{ id: string; path: string; status: string; createdAt: string }`
  - `SpecApproveResult`: `{ approvedTaskIds: string[]; approvedAt: string; nextStatus: 'SPEC_APPROVED' }`

## Step 2. 작업 탐색과 최근순 정렬 로직 구현

- `.sduck/sduck-workspace/` 아래 작업 목록을 읽고 승인 후보를 수집한다.
- 후보는 최근 작업이 상단에 오도록 정렬한다.
- 최소 아래 시그니처를 고정한다.
  - `listWorkspaceTasks(projectRoot: string): Promise<SpecApproveTarget[]>`
  - `sortTasksByRecency(tasks: SpecApproveTarget[]): SpecApproveTarget[]`

## Step 3. target 인자 해석과 suffix 매칭 정책 구현

- `<task-id-or-slug>` 인자가 없으면 활성 또는 승인 대기 작업 목록을 대상으로 한다.
- 인자가 있으면 아래 규칙을 적용한다.
  - id 완전일치 허용
  - slug suffix 매칭 허용
  - 중복 매칭이면 선택 UI로 분기
- 잘못된 대상이면 명확한 에러를 반환한다.

## Step 4. 다중 선택 UI 구현

- 후보가 여러 개일 때 체크박스형 선택 UI를 제공한다.
- 선택 목록은 최근 작업이 상단에 오도록 표시한다.
- 여러 작업을 동시에 선택할 수 있어야 한다.
- non-interactive 환경에서는 애매한 후보가 여러 개면 선택 불가 에러로 종료한다.

## Step 5. 승인 가능 상태 검증 로직 구현

- 승인 가능한 상태는 `PENDING_SPEC_APPROVAL`만 허용한다.
- 선택된 작업 중 일부라도 승인 불가 상태면 실패 정책을 명확히 정한다.
- 추천 정책은 “승인 불가 작업이 하나라도 있으면 전체 실패”로 고정한다.
- 최소 아래 시그니처를 고정한다.
  - `validateSpecApprovalTargets(tasks: SpecApproveTarget[]): void`

## Step 6. `meta.yml` 상태 전이 구현

- 선택된 각 작업의 `meta.yml`에서 아래만 갱신한다.
  - `status: SPEC_APPROVED`
  - `spec.approved: true`
  - `spec.approved_at: <UTC ISO 8601>`
- 나머지 필드는 보존한다.
- 여러 작업을 일괄 승인할 때 동일한 승인 시각을 사용한다.

## Step 7. 성공/실패 출력 형식 구현

- 단일 승인과 다중 승인 모두에 대해 결과를 읽기 쉽게 출력한다.
- 성공 시 아래를 포함한다.
  - 승인된 작업 id/path
  - 새 상태 `SPEC_APPROVED`
  - 다음 단계가 plan 작성이라는 안내
- 실패 시 아래를 구분한다.
  - 작업 없음
  - 애매한 후보
  - 잘못된 상태
  - 잘못된 target 인자

## Step 8. 단위 테스트로 선택/검증/상태 전이 로직 검증

- 최소 아래 케이스를 검증한다.
  - 최근순 정렬
  - id 완전일치
  - slug suffix 매칭
  - 다중 후보 분기
  - 승인 가능 상태 검증
  - meta 상태 전이 렌더링

## Step 9. E2E 테스트로 실제 승인 흐름 검증

- temp workspace에서 실제 `sduck start` 후 `sduck spec approve`를 실행한다.
- 최소 아래 시나리오를 검증한다.
  - 단일 정상 승인
  - 대상 지정 승인
  - 잘못된 상태 재승인 실패
  - 후보 없음 실패
  - 후보 다중 선택 승인

## Step 10. 문서 갱신과 전체 품질 게이트 검증

- `AGENT.md`, `CLAUDE.md`에서 `spec approve` 이후에는 에이전트가 `plan.md`를 작성하도록 흐름을 명확히 유지한다.
- `docs/snippets.md`에 `sduck spec approve` 예시를 추가한다.
- `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build`를 실행한다.
- spec의 acceptance criteria를 대조하고 완료 처리한다.
