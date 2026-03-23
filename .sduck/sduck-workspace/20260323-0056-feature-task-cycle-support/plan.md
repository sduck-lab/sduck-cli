# Plan

## Step 1. core reopen 모듈 작성

`src/core/reopen.ts` 신규 생성. 모든 reopen 비즈니스 로직을 이 파일에 둔다.

**함수 목록:**

- `getCurrentCycle(metaContent: string): number` — `cycle:` 필드 regex 파싱, 없으면 1 반환
- `buildReopenedMeta(metaContent: string, newCycle: number): string` — 문자열 치환으로 아래 결과 상태를 보장한다: status=PENDING_SPEC_APPROVAL, cycle=newCycle, spec.approved=false, spec.approved_at=null, plan.approved=false, plan.approved_at=null, steps.total=null, steps.completed=[], completed_at=null. cycle 필드가 없으면 `status:` 라인 위에 삽입
- `filterReopenCandidates(tasks: WorkspaceTaskSummary[]): WorkspaceTaskSummary[]` — `status === 'DONE'` 필터
- `resolveReopenTarget(tasks: WorkspaceTaskSummary[], target?: string): WorkspaceTaskSummary` — target 없으면 DONE 후보 중 단일이면 반환, 복수면 에러(후보 목록 `- {id} ({slug})` 포함). target 있으면 id exact → slug exact 순 매칭, 0개/복수 에러
- `snapshotHistoryFiles(taskDir: string, currentCycle: number): Promise<string[]>` — history 디렉토리 생성, 충돌 검사, spec.md/plan.md 존재 여부 확인 후 복사, 생성된 경로 목록 반환. 복사 중 실패 시 이번 호출에서 생성한 파일 삭제를 시도한 뒤 에러를 던진다 (snapshot 단계의 rollback 책임)
- `runReopenWorkflow(projectRoot: string, task: WorkspaceTaskSummary): Promise<ReopenResult>` — 전체 오케스트레이션: cycle 계산 → snapshot → meta 갱신. snapshotHistoryFiles는 snapshot 생성 단계의 rollback을 책임지고, runReopenWorkflow는 meta 갱신 실패 시 생성된 snapshot 파일 삭제를 시도한 후 에러를 반환한다.

**인터페이스:**

```ts
interface ReopenCommandInput {
  target?: string;
}
interface ReopenResult {
  taskId: string;
  previousCycle: number;
  newCycle: number;
  snapshots: string[];
}
```

**검증:** `npx vitest run tests/unit/reopen.test.ts` (Step 3에서 작성)

---

## Step 2. CLI 커맨드 레이어 작성

**`src/commands/reopen.ts` 신규 생성:**

- `runReopenCommand(input: ReopenCommandInput, projectRoot: string): Promise<CommandResult>` — core 호출 후 결과 포맷팅
- 성공 시: `Reopened {taskId} → cycle {newCycle} (PENDING_SPEC_APPROVAL)` 출력. snapshots가 있으면 목록 출력, 없으면 snapshot 관련 출력 생략
- 에러 시: exitCode 1 + stderr에 에러 메시지

**`src/cli.ts` 수정:**

- `import { runReopenCommand } from './commands/reopen.js';` 추가 (import 순서: archive와 done 사이)
- `program.command('reopen [target]').description('Reopen a completed task for a new cycle').action(...)` 등록 (done 다음, archive 앞)

**검증:** `npx tsc --noEmit` 타입 체크 통과

---

## Step 3. 단위 테스트 작성

`tests/unit/reopen.test.ts` 신규 생성.

**순수 함수 테스트:**

- `filterReopenCandidates`: DONE만 반환
- `resolveReopenTarget`: id exact match → 태스크 반환
- `resolveReopenTarget`: slug exact match → 태스크 반환
- `resolveReopenTarget`: no match → 에러 throw
- `resolveReopenTarget`: multiple match → 에러 throw (후보 목록 포함)
- `resolveReopenTarget`: target 미지정 + 단일 DONE → 자동 선택
- `resolveReopenTarget`: target 미지정 + 복수 DONE → 에러 throw
- `getCurrentCycle`: cycle 없음 → 1
- `getCurrentCycle`: cycle: 3 → 3
- `buildReopenedMeta`: cycle 없는 meta → cycle: 2, status/approval/steps/completed_at 초기화
- `buildReopenedMeta`: cycle: 2 → cycle: 3
- `buildReopenedMeta`: approval/steps/completed_at 초기화 검증

`buildReopenedMeta` 테스트는 문자열 완전 동일 비교가 아닌 필드 포함 검증(`toContain`) 중심으로 작성한다.

**snapshotHistoryFiles temp dir 기반 테스트:**

- history 디렉토리 없으면 생성
- 기존 history 파일 충돌 시 에러 throw
- spec.md만 존재 (plan.md 없음) → spec만 복사
- spec.md, plan.md 둘 다 없음 → snapshot 없이 정상 완료, 빈 배열 반환

**검증:** `npx vitest run tests/unit/reopen.test.ts` 전부 통과

---

## Step 4. E2E 테스트 작성

`tests/e2e/reopen.test.ts` 신규 생성. 기존 `archive.test.ts` 패턴을 따른다 (prepareProjectWorkspace + runCli + afterEach cleanup).

**헬퍼:** `createDoneTask(id, completedAt)` — meta.yml에 DONE status + completed_at 설정, spec.md/plan.md 생성

**테스트 시나리오:**

- DONE 태스크 reopen → meta 확인 (status=PENDING_SPEC_APPROVAL, cycle=2), history/1_spec.md와 1_plan.md 존재
- 2번째 reopen (cycle 2→3) → 1차 reopen 후 다시 DONE으로 만든 뒤 reopen, history/2_spec.md와 2_plan.md 추가, cycle=3
- 비DONE 태스크 reopen 시도 → exitCode !== 0, stderr에 에러
- reopen 대상 없을 때 → stderr에 에러
- target 미지정 + DONE 후보 여러 개 → ambiguity 에러, 후보 목록 출력
- history 충돌 후 meta 불변 → 미리 history/1_spec.md 생성해두고 reopen 시 에러, meta.yml 내용 reopen 전과 동일
- spec.md/plan.md 둘 다 없는 DONE 태스크 reopen → exitCode 0, cycle/status 갱신, history에 snapshot 파일 없음

**검증:** `npx vitest run tests/e2e/reopen.test.ts` 전부 통과

---

## Step 5. 전체 통합 검증

- `npx vitest run` 전체 테스트 스위트 통과 확인
- `npx tsc --noEmit` 타입 체크 통과
- 기존 테스트 회귀 없음 확인
