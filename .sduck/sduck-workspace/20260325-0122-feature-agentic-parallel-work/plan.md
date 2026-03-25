# Plan: agentic parallel work

## 공통 정책

### target 해석 정책

이미 구현된 명령들(`use`, `done`, `reopen`, `spec approve`, `plan approve`, `review ready`, `clean`)과 동일한 규칙을 따른다:

1. target 지정 시 → id exact match 우선, slug exact match 후순위
2. target 미지정 시 → `readCurrentWorkId()`로 current work 사용
3. current work가 null이면 에러: `throwNoCurrentWorkError(command)`

### agent-context.json 정책

- 파일 위치: `.sduck/sduck-workspace/<work-id>/agent-context.json`
- 생성/갱신 실패는 non-fatal (catch 후 `console.warn`)
- 항상 최신 meta.yml을 읽어서 렌더링한다 (파일 기준이 아닌 live 상태 기준)
- `updatedAt`은 meta.yml의 `updated_at`과 동기화

---

## Step 1. `src/core/agent-context.ts` 신규 생성

**대상 파일:** `src/core/agent-context.ts` (신규)

**변경 의도:**

### 1-1. AgentContext 인터페이스

```typescript
export interface AgentContext {
  id: string;
  type: string;
  slug: string;
  status: string;
  branch: string | null;
  baseBranch: string | null;
  worktreePath: string | null;
  worktreeAbsolutePath: string | null;
  workspacePath: string;
  workspaceAbsolutePath: string;
  specPath: string;
  planPath: string;
  reviewPath: string;
  steps: { total: number | null; completed: number[] };
  specApproved: boolean;
  planApproved: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### 1-2. `src/core/workspace.ts` — ParsedMeta에 `type` 필드 추가

- `ParsedMeta` 인터페이스에 `type?: string` 필드 추가
- `parseMetaText()`에 `^type:[ \t]+(.+)$` regex 파싱 추가
- `WorkspaceTaskSummary`에 `type?: string` 필드 추가 (필요시)
- `readTaskFromEntry()`에서 `type` 매핑 추가 (필요시)

### 1-3. renderAgentContext 함수

- `renderAgentContext(meta: ParsedMeta, projectRoot: string): AgentContext`
- `parseMetaText`로 파싱된 `ParsedMeta`와 `projectRoot`를 받아 `AgentContext` 객체 생성
- `ParsedMeta`에서 `id`, `type`, `slug`, `status`, `branch`, `baseBranch`, `worktreePath`, `createdAt`, `updatedAt` 가져오기
- `steps.total`, `steps.completed`는 metaContent에서 직접 파싱 (regex: `^ {2}total: (.+)$`, `^ {2}completed: \[(.+)\]$`)
- `specApproved`는 `^  approved: (true|false)$` 블록에서 spec 섹션 확인
- `planApproved`는 동일 블록에서 plan 섹션 확인
- `reviewPath`는 상태에 관계없이 항상 `workspacePath/review.md`로 설정 (파일 존재 여부와 무관)
- 절대경로 필드: `worktreeAbsolutePath = worktreePath ? join(projectRoot, worktreePath) : null`, `workspaceAbsolutePath = join(projectRoot, workspacePath)`

### 1-4. writeAgentContext 함수

- `writeAgentContext(projectRoot: string, workId: string, date?: Date): Promise<void>`
- `getProjectRelativeSduckWorkspacePath(workId)`로 workspacePath 구성
- `meta.yml` 읽기 → `parseMetaText` → `renderAgentContext` 호출
- `agent-context.json`에 `JSON.stringify(context, null, 2)`로 쓰기
- 에러 발생 시 `console.warn` 출력 후 swallow (non-fatal)

### 1-5. readAgentContext 함수

- `readAgentContext(projectRoot: string, workId: string): Promise<AgentContext | null>`
- `agent-context.json` 파일 읽기 → `JSON.parse` → `AgentContext`로 반환
- 파일 없거나 파싱 실패 시 `null` 반환

**검증:** `npm run typecheck` 통과

---

## Step 2. `src/core/implement.ts` — `[target]` 지원 및 agent-context.json 출력

**대상 파일:** `src/core/implement.ts` (기존, ~75줄)

**변경 의도:**

### 2-1. resolveImplementContext에 target 파라미터 추가

- `resolveImplementContext(projectRoot: string, target?: string): Promise<ImplementContext>`
- target 분기 로직:
  - `target`이 `undefined`가 아닌 경우 → `resolveUseTarget(projectRoot, target)`으로 work 조회 → `work.id` 사용
  - `target`이 `undefined`인 경우 → `readCurrentWorkId()` → null이면 `throwNoCurrentWorkError('implement')` → 값 사용
- work id 확보 후 기존 로직 (workspace 존재 확인, meta.yml 읽기) 동일

### 2-2. ImplementContext 확장

- `ImplementContext`에 `workspacePath: string` 필드 추가 (agent-context.json 경로 출력용)

### 2-3. formatImplementOutput에 agent-context.json 경로 추가

- 기존 출력 블록 뒤에 `Context File: <workspacePath>/agent-context.json` 줄 추가
- worktree 안내 문구와 context 파일 안내 사이에 빈 줄 삽입

### 2-4. on-demand agent-context.json 생성

- `resolveImplementContext()` 내, meta.yml 읽기 성공 직후 `agent-context.json` 존재 여부 확인
- 파일이 없으면 `writeAgentContext(projectRoot, workId)` 호출하여 on-demand 생성 (구버전 workspace 호환)
- try-catch로 감싸서 실패 시 `console.warn` 후 계속 진행 (non-fatal)

**검증:** `npm run typecheck` 통과

---

## Step 3. `src/core/step.ts` — `[target]` 지원 및 agent-context.json 갱신

**대상 파일:** `src/core/step.ts` (기존, ~137줄)

**변경 의도:**

### 3-1. markStepCompleted에 target 파라미터 추가

- `markStepCompleted(projectRoot: string, stepNumber: number, target?: string, date?: Date): Promise<StepResult>`
- target 분기 로직:
  - `target`이 `undefined`가 아닌 경우 → `resolveUseTarget(projectRoot, target)`으로 work 조회 → `work.id` 사용
  - `target`이 `undefined`인 경우 → `readCurrentWorkId()` → null이면 `throwNoCurrentWorkError('step done')` → 값 사용
- 나머지 로직 (workspace 확인, meta.yml 읽기, status 검증, step 범위 검증, 업데이트) 동일

### 3-2. agent-context.json 갱신

- `markStepCompleted()` 함수 내, meta.yml 업데이트 직후 `writeAgentContext(projectRoot, currentWorkId, date)` 호출
- try-catch로 감싸서 실패 시 `console.warn` 후 계속 진행 (non-fatal)
- `currentWorkId` 변수는 이미 함수 내에서 target 또는 readCurrentWorkId로 해석된 값

**검증:** `npm run typecheck` 통과

---

## Step 4. `src/commands/implement.ts` — target 파라미터 전달

**대상 파일:** `src/commands/implement.ts` (기존, ~24줄)

**변경 의도:**

- `runImplementCommand(projectRoot: string, target?: string): Promise<ImplementCommandResult>`
- `resolveImplementContext(projectRoot, target)` 호출

**검증:** `npm run typecheck` 통과

---

## Step 5. `src/commands/step.ts` — target 파라미터 전달

**대상 파일:** `src/commands/step.ts` (기존, ~36줄)

**변경 의도:**

- `runStepCommand(stepNumber: number, projectRoot: string, target?: string): Promise<StepCommandResult>`
- `markStepCompleted(projectRoot, stepNumber, target)` 호출

**검증:** `npm run typecheck` 통과

---

## Step 6. `src/cli.ts` — `implement [target]`, `step done <n> [target]` 명령어 수정

**대상 파일:** `src/cli.ts` (기존, ~348줄)

**변경 의도:**

### 6-1. implement 명령어

- `program.command('implement')` → `program.command('implement [target]')` 변경
- action 콜백에 `target?: string` 파라미터 추가
- `runImplementCommand(process.cwd(), target)` 호출

### 6-2. step done 명령어

- `stepCmd.command('done <number>')` → `stepCmd.command('done <number> [target]')` 변경
- action 콜백에 `target?: string` 파라미터 추가
- `runStepCommand(stepNumber, process.cwd(), target)` 호출

**검증:** `npm run typecheck` 통과, `sduck implement --help`, `sduck step done --help` 수동 확인

---

## Step 7. `src/core/start.ts` — agent-context.json 초기 생성

**대상 파일:** `src/core/start.ts` (기존, ~265줄)

**변경 의도:**

- `startTask()` 함수 내, `writeCurrentWorkId` 호출 직후에 `writeAgentContext(projectRoot, workspaceId, currentDate)` 호출
- try-catch로 감싸서 실패 시 `console.warn` 후 계속 진행 (non-fatal)

**검증:** `npm run typecheck` 통과

---

## Step 8. `src/core/spec-approve.ts` — agent-context.json 갱신

**대상 파일:** `src/core/spec-approve.ts` (기존, ~93줄)

**변경 의도:**

- `approveSpecs()` 함수 내 `for (const task of tasks)` loop 안, `await writeFile(metaPath, updatedContent, 'utf8')` 직후에 `writeAgentContext(projectRoot, task.id)` 호출
- try-catch로 감싸서 실패 시 `console.warn` 후 continue (non-fatal, 다른 task 처리에 영향 없음)

**검증:** `npm run typecheck` 통과

---

## Step 9. `src/core/plan-approve.ts` — agent-context.json 갱신

**대상 파일:** `src/core/plan-approve.ts` (기존, ~154줄)

**변경 의도:**

- `approvePlans()` 함수 내 `for (const task of tasks)` loop 안, `await writeFile(metaPath, updatedMeta, 'utf8')` 직후에 `writeAgentContext(projectRoot, task.id)` 호출
- try-catch로 감싸서 실패 시 `console.warn` 후 continue (non-fatal, 다른 task 처리에 영향 없음)

**검증:** `npm run typecheck` 통과

---

## Step 10. `src/core/review-ready.ts` — agent-context.json 갱신

**대상 파일:** `src/core/review-ready.ts` (기존, ~130줄)

**변경 의도:**

- `runReviewReadyWorkflow()` 함수 내, meta.yml 업데이트 직후 `writeAgentContext(projectRoot, work.id, date)` 호출
- try-catch로 감싸서 실패 시 `console.warn` 후 계속 진행 (non-fatal)

**검증:** `npm run typecheck` 통과

---

## Step 11. `src/core/done.ts` — agent-context.json 갱신

**대상 파일:** `src/core/done.ts` (기존, ~251줄)

**변경 의도:**

- `completeTask()` 함수 내, `await writeFile(metaPath, updateDoneBlock(metaContent, completedAt), 'utf8')` 직후, `const currentWorkId = await readCurrentWorkId(projectRoot)` 직전에 `writeAgentContext(projectRoot, task.id)` 호출
- try-catch로 감싸서 실패 시 `console.warn` 후 계속 진행 (non-fatal)
- `writeCurrentWorkId(projectRoot, null)` 호출은 agent-context.json 갱신 후에 유지 (순서 무관)

**검증:** `npm run typecheck` 통과

---

## Step 12. `src/core/reopen.ts` — agent-context.json 갱신

**대상 파일:** `src/core/reopen.ts` (기존, ~234줄)

**변경 의도:**

- `runReopenWorkflow()` 함수 내, meta.yml 업데이트 성공 직후 `writeAgentContext(projectRoot, task.id)` 호출
- try-catch로 감싸서 실패 시 `console.warn` 후 계속 진행 (non-fatal)
- agent-context.json 실패는 meta 업데이트에 영향을 주지 않으므로 meta write 이후에 호출

**검증:** `npm run typecheck` 통과

---

## Step 13. 단위 테스트 작성

**대상 파일:** `tests/unit/` 디렉토리

**테스트 케이스:**

### 13-1. `tests/unit/agent-context.test.ts`

- `renderAgentContext`: 모든 필드 포함, `--no-git` work 시 worktreePath/worktreeAbsolutePath null, steps 파싱, specApproved/planApproved 파싱
- `writeAgentContext`: 파일 생성, JSON 파싱 가능
- `readAgentContext`: 파일 존재 시 반환, 파일 없을 시 null

### 13-2. `tests/unit/implement.test.ts` (기존 테스트 수정)

- `resolveImplementContext`: target 지정 시 해당 work 반환, target 미지정 + current_work_id 있음, target 미지정 + current_work_id null 시 에러
- `formatImplementOutput`: agent-context.json 경로 포함 확인

### 13-3. `tests/unit/step.test.ts` (기존 테스트 수정)

- `markStepCompleted`: target 지정 시 해당 work의 step 완료, target 미지정 + current_work_id null 시 에러

**검증:** `npm run test:unit` 전체 통과

---

## Step 14. E2E 테스트 작성

**대상 파일:** `tests/e2e/` 디렉토리

**시나리오:**

### 14-1. `tests/e2e/implement-target.test.ts`

- work A, B 생성 → `sduck implement <A-id>` → A의 context 출력 (worktree, agent-context.json 경로 포함)
- current work 설정 → `sduck implement` (target 없음) → current work context 출력

### 14-2. `tests/e2e/step-target.test.ts`

- work A, B 생성 → plan approve → `sduck step done 1 <B-id>` → B의 step 1 완료

### 14-3. `tests/e2e/agent-context.test.ts`

- `sduck start` 후 `agent-context.json` 존재 확인, 필드 검증
- `sduck spec approve` 후 `specApproved: true` 확인
- `sduck plan approve` 후 `planApproved: true`, `status: IN_PROGRESS` 확인
- `sduck step done 1` 후 `steps.completed: [1]` 확인
- `--no-git` work 생성 후 `worktreePath: null`, `worktreeAbsolutePath: null` 확인

> E2E는 `--no-git` 플래그로 worktree 생성을 격리한다.

**검증:** `npm run test:e2e` 전체 통과

---

## Step 15. CLAUDE.md 업데이트

**대상 파일:** `CLAUDE.md`

**변경 의도:**

"세션 시작 시 필수 확인" 섹션에 `agent-context.json` 확인 규칙 추가:

```markdown
## 세션 시작 시 필수 확인

작업을 시작하기 전에 반드시 아래를 확인한다.

1. `.sduck/sduck-state.yml`에서 `current_work_id`를 확인한다
2. `.sduck/sduck-workspace/{current_work_id}/agent-context.json`을 읽는다
3. `worktreeAbsolutePath`가 있으면 해당 디렉토리에서 코드 작업을 수행한다
4. `worktreeAbsolutePath`가 `null`이면 프로젝트 root에서 작업한다
```

기존 항목 2 (`.sduck/sduck-workspace/` 디렉토리 확인)를 agent-context.json 읽기로 대체한다.

**검증:** CLAUDE.md 내용 확인

---

## Step 16. 빌드 검증 및 최종 확인

**자동 검증 명령:**

```bash
npm run typecheck
npm run lint
npm run test:unit
npm run test:e2e
npm run build
```

**수동 smoke test:**

- `sduck start feature test-a && sduck start feature test-b` → 각 workspace에 `agent-context.json` 생성 확인
- `sduck implement <A-id>` → A의 context + agent-context.json 경로 출력 확인
- `sduck step done 1 <B-id>` → B의 step 1 완료
- current work 설정 후 `sduck implement` (target 없음) → current work context 출력
- `sduck start feature test-c --no-git` → `worktreePath: null` 확인

모든 검증 통과 후 완료.
