# Plan

## Step 1. `done` 코어 상태 전이 로직 추가

- `src/core/done.ts`를 새로 만든다.
- `src/core/plan-approve.ts`와 `src/core/spec-approve.ts`의 구조를 참고해 `DoneCommandInput`, `DoneTarget`, `DoneResult` 타입을 정의한다.
- `src/core/workspace.ts`의 `listWorkspaceTasks()` 결과를 사용해 완료 후보를 로드하는 함수를 추가한다.
- `target` 매칭은 exact only로 제한한다.
  - `task.id === target`
  - `task.slug === target`
- `status === IN_PROGRESS`인 작업만 완료 후보로 취급하고, `DONE`, `SPEC_APPROVED`, `PENDING_*` 상태는 사유를 포함한 실패로 처리한다.
- `meta.yml`에서 아래 필드를 읽고 검증하는 유틸을 `src/core/done.ts` 내부에 둔다.
  - `status`
  - `steps.total`
  - `steps.completed`
  - `completed_at`
- `steps.total`이 `null`이거나, `completed` 길이가 부족하거나, 번호가 중복되거나 범위를 벗어나면 완료를 막는다.
- 완료 시 `meta.yml`의 `status: DONE`, `completed_at: <UTC>`만 갱신하고 다른 필드는 보존한다.

## Step 2. spec 체크리스트와 task eval 자동 검증 추가

- `src/core/done.ts`에 `spec.md`와 `.sduck/sduck-assets/eval/task.yml`을 읽는 로직을 추가한다.
- `spec.md`에서는 acceptance criteria 체크박스(`- [x]`, `- [ ]`)를 파싱해 미완료 항목이 하나라도 있으면 완료를 막는다.
- `.sduck/sduck-assets/eval/task.yml`은 기존 YAML 파서 사용 방식을 찾아 동일하게 읽고, criteria 목록이 비어 있지 않은지 검증한다.
- 이번 단계에서는 task eval 점수를 자동 추론하지 않고, 완료 직전 사용자에게 보여줄 기본 평가 항목 목록과 검증 통과 여부를 구성한다.
- 출력용 데이터 구조에는 아래를 포함한다.
  - 완료된 task id
  - 완료 시각
  - 미완료 spec 항목 목록
  - task eval criteria label 목록
  - 실패 사유 또는 성공 note
- task eval asset이 없거나 구조가 깨졌으면 완료를 막고 자산 경로를 포함한 에러를 반환한다.

## Step 3. CLI 명령과 사용자 출력 연결

- `src/commands/done.ts`를 새로 만든다.
- `src/commands/plan-approve.ts`의 결과 테이블 스타일을 참고해 성공/실패 결과를 문자열로 포맷한다.
- 성공 출력에는 최소 아래 내용을 포함한다.
  - 완료된 작업 id
  - `상태: DONE`
  - task eval criteria 목록 또는 평가 기준 확인 안내
- 실패 출력에는 아래 상황별 메시지를 분기한다.
  - 완료 가능한 작업 없음
  - 여러 `IN_PROGRESS` 작업이 있어 target 지정 필요
  - target 불일치
  - spec 체크리스트 미완료
  - step 미완료
  - 이미 `DONE` 또는 승인 전 상태
- `src/cli.ts`에 `done [target]` 명령을 추가하고 `runDoneCommand()`를 연결한다.
- `src/core/command-metadata.ts`의 placeholder와 설명은 유지하되, help 텍스트가 기존 명령들과 톤이 맞는지 정리한다.

## Step 4. workspace 선택 정책과 exact 매칭 정리

- `src/core/workspace.ts`를 확장해 현재 작업 목록 조회를 `done`에서도 재사용하기 쉽게 만든다.
- 필요하면 공통 선택 유틸을 추가해 `spec approve`, `plan approve`, `done`이 상태 필터만 다르고 동일한 exact target 규칙을 사용할 수 있게 정리한다.
- 최소 변경 범위로 가되, `id.endsWith(target)` 같은 suffix/prefix 매칭이 `done` 경로에 남지 않도록 보장한다.
- 이 단계에서 `spec approve`/`plan approve` 공통화까지 과도하게 넓히지 말고, `done` 구현에 필요한 범위까지만 손본다.

## Step 5. 단위 테스트 추가

- `tests/unit/done.test.ts`를 새로 만든다.
- 아래 순수 로직을 직접 검증한다.
  - 후보 필터링: `IN_PROGRESS`만 선택
  - target exact 매칭: id exact, slug exact만 허용
  - step 검증: `total: null`, 일부 완료, 중복 step, 범위 초과 step, 전체 완료
  - spec 체크리스트 파싱: 미완료 항목 추출, 전부 완료 시 통과
  - UTC 완료 시각 생성
- 필요하면 `tests/unit/plan-approve.test.ts`와 비슷한 `createTask()` helper를 파일 내부에 둔다.
- 테스트 이름은 기존 패턴처럼 함수 단위 `describe()` 블록으로 나눈다.

## Step 6. E2E, 문서, 품질 게이트 정리

- `tests/e2e/done.test.ts`를 새로 만든다.
- `tests/helpers/run-cli.ts`와 `tests/helpers/temp-workspace.ts`를 사용해 실제 CLI 흐름을 검증한다.
- 최소 아래 시나리오를 포함한다.
  - `start -> spec approve -> plan approve -> meta steps 완료 처리 -> done` 성공
  - 두 개의 `IN_PROGRESS` 작업이 있을 때 `done` 실패 후 `done <slug>` 성공
  - `steps.completed` 부족 시 실패
  - spec 체크박스 미완료 시 실패
  - `DONE` 작업 재실행 시 실패
- `README.md`의 주요 명령어 섹션에 `sduck done [target]`을 추가하고, 완료 전 자동 검증 흐름을 짧게 반영한다.
- 마지막으로 `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build`를 실행해 품질 게이트를 통과시킨다.
