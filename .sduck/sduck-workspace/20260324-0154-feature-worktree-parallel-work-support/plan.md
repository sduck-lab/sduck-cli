# Plan: worktree parallel work support

## 공통 정책

### target 해석 정책

target이 선택(optional)인 명령(`spec approve`, `plan approve`, `review ready`, `done`)은 공통적으로 다음 규칙을 따른다:

1. target 지정 시 → id exact match 우선, slug exact match 후순위
2. target 미지정 시 → `readCurrentWorkId()`로 current work를 사용
3. current work가 null이면 에러 반환 (명시적 target 요구)

`abandon`은 v1에서 target 필수(`<id|slug>`)로 유지한다. current fallback을 두지 않는다.

### 용어 정책

플랜 설명 문장에서는 `work`를 우선 사용한다. 내부 코드 심볼명(`startTask`, `WorkspaceTaskSummary` 등)은 v1에서 기존 이름을 유지하며, 별도 refactor work로 분리한다.

---

## Step 1. 경로 상수 및 헬퍼 추가 (`project-paths.ts`)

**대상 파일:** `src/core/project-paths.ts` (기존, ~40줄)

**변경 의도:**

- `SDUCK_STATE_FILE = 'sduck-state.yml'` 상수 추가
- `SDUCK_WORKTREES_DIR = '.sduck-worktrees'` 상수 추가
- `getProjectSduckStatePath(projectRoot)` → `.sduck/sduck-state.yml` 절대경로 반환
- `getProjectWorktreesPath(projectRoot)` → `.sduck-worktrees` 절대경로 반환
- `getProjectWorktreePath(projectRoot, workId)` → `.sduck-worktrees/<workId>` 절대경로 반환

**검증:** `npm run typecheck` 통과

---

## Step 2. 전역 상태 파일 모듈 신규 생성 (`state.ts`)

**대상 파일:** `src/core/state.ts` (신규)

**변경 의도:**

- `readCurrentWorkId(projectRoot): Promise<string | null>` — `.sduck/sduck-state.yml` 읽어서 `current_work_id` 반환. 파일 없으면 `null`. 값이 `null` 문자열이면 `null` 반환
- `writeCurrentWorkId(projectRoot, workId: string | null): Promise<void>` — `current_work_id`와 `updated_at` 기록. `workId`가 `null`이면 `current_work_id: null`로 기록
- YAML 파싱은 기존 패턴대로 regex 사용 (`^current_work_id:\s+(.+)$`)
- `current_work_id` 값은 trim 후 사용하며, `null` 정확 일치 시만 null로 해석한다
- YAML 쓰기는 template literal로 `current_work_id: {value}\nupdated_at: {timestamp}\n` 형식

**검증:** `npm run typecheck` 통과

---

## Step 3. git 유틸리티 모듈 신규 생성 (`git.ts`)

**대상 파일:** `src/core/git.ts` (신규)

**변경 의도:**

- `execGit(args: string[], cwd: string): Promise<string>` — `child_process.execFile('git', args, { cwd })` Promise 래핑. stdout을 trim해서 반환. 실패 시 stderr 포함 에러
- `getCurrentBranch(cwd: string): Promise<string>` — `git rev-parse --abbrev-ref HEAD` 실행. 반환값이 `'HEAD'`(detached)이면 에러 throw + `--no-git` 플래그 안내
- `addWorktree(worktreePath: string, branch: string, baseBranch: string, cwd: string): Promise<void>` — `git worktree add <path> -b <branch> <baseBranch>`
- `removeWorktree(worktreePath: string, cwd: string): Promise<void>` — `git worktree remove <path>`
- `isBranchMerged(branch: string, baseBranch: string, cwd: string): Promise<boolean>` — `git branch --merged <baseBranch>` 출력에서 branch 존재 확인
- `deleteBranch(branch: string, force: boolean, cwd: string): Promise<void>` — force면 `-D`, 아니면 `-d`
- 모든 git 명령은 `execFile` (인자 배열)로 실행해 shell injection 방지

**검증:** `npm run typecheck` 통과

---

## Step 4. .gitignore 업데이트 공용 모듈 (`gitignore.ts`)

**대상 파일:** `src/core/gitignore.ts` (신규)

**변경 의도:**

- `ensureGitignoreEntries(projectRoot: string, entries: string[]): Promise<{ added: string[]; skipped: string[]; warning?: string }>`
  - `.gitignore` 파일 읽기 (없으면 빈 문자열)
  - 각 entry가 이미 존재하는지 라인 단위 검사
  - 없는 entry만 파일 끝에 추가
  - 실패 시 에러를 throw하지 않고 warning 문자열 반환 (non-fatal)
  - warning에는 사용자가 수동으로 추가해야 할 내용 안내
- `start.ts`와 `init.ts` 모두에서 재사용 가능
- 추가 대상 entry: `.sduck-worktrees/`, `.sduck/sduck-state.yml`

**검증:** `npm run typecheck` 통과

---

## Step 5. `workspace.ts` — `ACTIVE_STATUSES` 확장 및 `parseMetaText` 필드 추가

**대상 파일:** `src/core/workspace.ts` (기존, ~164줄)

**변경 의도:**

### 5-1. ACTIVE_STATUSES 확장

- `REVIEW_READY` 추가 (기존: `IN_PROGRESS`, `PENDING_SPEC_APPROVAL`, `PENDING_PLAN_APPROVAL`)
- `SPEC_APPROVED`는 추가하지 않음 (스펙 상태 모델에 명시되지 않은 상태)
- 최종: `{ 'PENDING_SPEC_APPROVAL', 'PENDING_PLAN_APPROVAL', 'IN_PROGRESS', 'REVIEW_READY' }`

### 5-2. parseMetaText 필드 확장

- `ParsedMeta` 인터페이스에 `branch?: string`, `baseBranch?: string`, `worktreePath?: string`, `updatedAt?: string` 추가
- `parseMetaText()`에 `^branch:`, `^base_branch:`, `^worktree_path:`, `^updated_at:` regex 파싱 추가 (값이 `null`이면 필드를 설정하지 않음)
- `WorkspaceTaskSummary` 인터페이스에 동일 필드 추가
- `readTaskFromEntry()`에서 새 필드를 work 객체에 매핑

### 5-3. findActiveTask() 처리

- `findActiveTask()` 함수는 deprecated 처리. 함수 본문은 유지하되, 워크플로우 핵심 로직에서는 더 이상 사용하지 않음
- `start.ts`에서의 호출은 Step 6에서 제거
- 새로운 work 탐색은 `readCurrentWorkId()` + `listWorkspaceTasks()` 조합으로 대체

**검증:** `npm run typecheck` 통과

---

## Step 6. `start.ts` — 단일 활성 제한 제거, worktree 생성, id 충돌 suffix, state 연동

**대상 파일:** `src/core/start.ts` (기존, ~170줄)

**변경 의도:**

### 6-1. 단일 활성 제한 제거

- `startTask()` 내 `findActiveTask()` 호출 블록(L125-131) 제거
- `findActiveTask` import 제거

### 6-2. id 충돌 suffix 로직

- 새 함수 `resolveUniqueWorkspaceId(projectRoot: string, baseId: string): Promise<string>` — `baseId`가 프로젝트 전체(`sduck-workspace/` + `sduck-archive/`)에서 유일하면 그대로 반환하고, 충돌 시 가장 작은 사용 가능한 suffix(`-2`, `-3`, …)를 붙여 반환한다
- `createWorkspaceId()` 호출 후 `sduck-workspace/`와 `sduck-archive/`를 모두 검사. work id는 프로젝트 전체에서 유일해야 한다
- `getFsEntryKind()`으로 존재 여부 확인. archive는 `sduck-archive/` 하위 월별 디렉토리를 순회
- v1에서는 단순 구현을 우선하여 `sduck-archive/` 전체를 순회해 id 충돌을 확인한다. 성능 최적화(인덱스/캐시)는 후속 work 범위로 둔다

### 6-3. renderInitialMeta 확장

- `renderInitialMeta()` 입력에 `branch: string | null`, `baseBranch: string | null`, `worktreePath: string | null`, `updatedAt: string` 추가
- 출력 YAML에 `branch:`, `base_branch:`, `worktree_path:`, `updated_at:` 필드 추가
- status 초기값은 `PENDING_SPEC_APPROVAL` 유지
- 기존 `parseMetaText()` 정규식과 호환되는 라인 기반 YAML 포맷을 유지

### 6-4. worktree 생성 로직

- `startTask()`에 `options?: { noGit?: boolean }` 파라미터 추가
- `--no-git`이 아닌 경우:
  1. `getCurrentBranch(projectRoot)`로 `baseBranch` 결정 (detached HEAD이면 에러 + `--no-git` 안내)
  2. branch 이름: `work/<type>/<slug>`
  3. `addWorktree('.sduck-worktrees/<workId>', branch, baseBranch, projectRoot)` 실행
  4. 실패 시 workspace 디렉토리 삭제 후 에러 throw. **rollback 범위는 workspace 디렉토리 제거까지. `.sduck/` 생성과 `.gitignore` 업데이트는 best-effort이며 롤백 대상 아님**
- `--no-git`이면 `branch`, `baseBranch`, `worktreePath` 모두 `null`

### 6-5. .gitignore 업데이트

- `ensureGitignoreEntries(projectRoot, ['.sduck-worktrees/', '.sduck/sduck-state.yml'])` 호출
- 결과의 `warning`이 있으면 콘솔 경고 출력 (non-fatal)

### 6-6. state.yml 업데이트

- `.sduck/` 디렉토리 존재 보장 (`ensureDirectory`)
- `startTask()` 마지막에 `writeCurrentWorkId(projectRoot, workspaceId)` 호출

**검증:** `npm run typecheck` 통과

---

## Step 7. `done.ts` — `REVIEW_READY` 허용, review 경고, current work 폴백, state 연동

**대상 파일:** `src/core/done.ts` (기존, ~294줄)

**변경 의도:**

### 7-1. 상태 허용 조건 변경

- `filterDoneCandidates()`: `status === 'IN_PROGRESS'` → `status === 'REVIEW_READY'`로 변경 (스펙 상태 전이표 기준)
- `validateDoneTarget()`: `task.status !== 'IN_PROGRESS'` → `task.status !== 'REVIEW_READY'`로 변경
- 기존 step/checklist 검증 로직(`validateDoneMetaContent`, `extractUncheckedChecklistItems`)은 그대로 유지한다. 이번 work에서는 해당 로직의 의미나 기준을 변경하지 않는다

### 7-2. review.md 경고 로직

- `completeTask()` 내에서 done 처리 전 `review.md` 확인
- 파일이 없거나 `trim().length === 0`이면 경고 문자열 반환 (차단 안 함)
- 경고는 `DoneSuccessRow`에 `reviewWarning?: string` 필드로 전달

### 7-3. target 미지정 시 current work 폴백

- `loadDoneTargets()`: target 미지정 시 `readCurrentWorkId()` → 해당 work만 후보로 반환
- `current_work_id`가 null이면 에러. 에러 메시지는 공통 형식: `"No current work set. Run \`sduck <command> <target>\` with explicit target."`(command 부분은 각 명령에 맞게 치환). 공통 헬퍼 함수`throwNoCurrentWorkError(command: string): never`로 메시지 생성을 통일한다. 이 헬퍼는 `done`, `review ready`, `spec approve`, `plan approve`, `implement`에서 공통 사용한다

### 7-4. current work 해제

- `completeTask()` 완료 후 `readCurrentWorkId()`로 현재 work 확인
- 완료된 work가 current work이면 `writeCurrentWorkId(projectRoot, null)` 호출
- 다른 active work로 자동 전환하지 않음

**검증:** `npm run typecheck` 통과, 기존 done 테스트 수정 필요

---

## Step 8. 신규 core 모듈 5개 생성

### 8-1. `src/core/use.ts` (신규)

- `resolveUseTarget(projectRoot: string, target: string): Promise<WorkspaceTaskSummary>`
  - `listWorkspaceTasks()`로 workspace 내 work 목록 조회 (archive 제외)
  - id exact match 우선 → slug exact match
  - slug 복수 매치 시 에러 + 후보 목록 출력 + `sduck use <id>` 재시도 안내
  - 일치 없으면 에러
- `runUseWorkflow(projectRoot: string, target: string): Promise<{ workId: string }>`
  - `resolveUseTarget()` 호출 후 `writeCurrentWorkId(projectRoot, work.id)` 호출

### 8-2. `src/core/implement.ts` (신규)

- `resolveImplementContext(projectRoot: string): Promise<ImplementContext>`
  - `readCurrentWorkId()` → null이면 에러
  - `current_work_id`가 가리키는 work가 `sduck-workspace/`에 존재하지 않으면 에러를 반환한다. archive 디렉토리는 탐색하지 않는다
  - meta.yml에서 `id`, `branch`, `base_branch`, `worktree_path`, `status` 읽기
  - spec.md, plan.md 경로 구성
- status는 출력 정보용으로 읽되, v1에서는 구현 차단 조건으로 사용하지 않는다. 어떤 상태의 work든 current work면 컨텍스트 조회 가능
- `formatImplementOutput(context: ImplementContext): string`
  - `Work ID:`, `Branch:`, `Worktree:`, `Spec:`, `Plan:` 포맷 블록 출력
  - `worktree_path`가 null이면 `Branch`, `Worktree` 줄에 `(none)` 출력
  - 안내 문구 (`cd .sduck-worktrees/... && claude`) 출력

### 8-3. `src/core/abandon.ts` (신규)

- v1에서 `abandon`은 target 필수. current fallback 없음
- abandon은 `sduck-workspace/` 내 work만 대상으로 하며, archive된 work는 지원하지 않는다
- `resolveAbandonTarget(projectRoot: string, target: string): Promise<WorkspaceTaskSummary>`
  - id exact match → slug exact match (workspace 내 탐색)
  - 허용 시작 상태: `PENDING_SPEC_APPROVAL`, `PENDING_PLAN_APPROVAL`, `IN_PROGRESS`, `REVIEW_READY`
  - `DONE`, `ABANDONED`이면 에러
- `runAbandonWorkflow(projectRoot: string, target: string): Promise<{ workId: string }>`
  - meta.yml: `status → ABANDONED`, `updated_at` 갱신
  - current work이면 `writeCurrentWorkId(projectRoot, null)` 호출

### 8-4. `src/core/review-ready.ts` (신규)

- `resolveReviewTarget(projectRoot: string, target?: string): Promise<WorkspaceTaskSummary>`
  - target 있으면 id exact → slug exact
  - target 없으면 `readCurrentWorkId()` (공통 정책)
  - current work 미설정이면 에러
  - status가 `IN_PROGRESS`가 아니면 에러
- `runReviewReadyWorkflow(projectRoot: string, target?: string): Promise<{ workId: string }>`
  - `review.md`가 이미 존재하면 덮어쓰지 않고 그대로 둔다. 존재하지 않을 때만 template으로 생성
  - `review.md` 생성 또는 존재 확인이 성공한 뒤에만 status를 `REVIEW_READY`로 갱신한다. 파일 생성 실패 시 status는 변경하지 않는다
  - meta.yml: `status → REVIEW_READY`, `updated_at` 갱신

### 8-5. `src/core/clean.ts` (신규)

- `resolveCleanCandidates(projectRoot: string, target?: string): Promise<CleanCandidate[]>`
  - target 지정 시: `sduck-workspace/` + `sduck-archive/` 모두 탐색. id exact match 우선 → slug exact match. slug exact match는 workspace와 archive를 합친 전체 후보에서 판정한다. 둘 이상 매치 시 에러 + 후보 목록 출력. 동일 id가 workspace와 archive 양쪽에 있을 경우 id 기준으로 단일 해석
  - target 미지정 시: `sduck-workspace/` 내 `DONE`/`ABANDONED` work만
  - `DONE`/`ABANDONED` 상태만 clean 대상
- `runCleanWorkflow(projectRoot: string, target?: string, force?: boolean): Promise<CleanResult>`
  - v1 clean은 worktree 제거와 branch 삭제를 분리해서 수행한다
  - merge 여부와 무관하게 worktree 제거는 시도할 수 있다 (스펙 의도: merge 판단을 먼저 수행하되, worktree 제거 자체는 merge 여부에 구애받지 않음)
  - 브랜치 삭제만 merge 여부에 따라 제한한다
  - 각 candidate 처리 순서 (우선순위 고정):
    1. `branch` 또는 `baseBranch`가 null → git 관련 단계(merge 판단, worktree 제거, 브랜치 삭제) 전체 skip. `--no-git`으로 생성된 work는 "정리할 git 자원 없음"으로 처리
    2. `isBranchMerged(branch, baseBranch, cwd)` — merge 여부 선 판단
    3. `worktree_path`가 null → worktree 제거만 skip하고 브랜치 삭제 단계로 진행 (branch는 있지만 worktree_path만 null인 비정상 메타 대응)
    4. worktree 경로가 파일시스템에 미존재 → 경고 출력, 브랜치 삭제 단계로 진행
    5. `removeWorktree(path, cwd)` — 실패 시 에러, 해당 work의 clean 중단. 이후 candidate도 실행하지 않고 전체 clean 명령을 실패 처리한다 (v1은 fail-fast 정책)
    6. merged → `deleteBranch(branch, false, cwd)`, unmerged + `--force` → `deleteBranch(branch, true, cwd)`, unmerged + no force → skip + 경고
  - `--force`는 브랜치 삭제 강제만 의미. `git worktree remove` 강제 옵션은 포함하지 않음

**검증:** `npm run typecheck` 통과

---

## Step 9. 신규 command 래퍼 5개, CLI 등록, archive 수정

### 9-1. command 래퍼 파일 생성

각 파일은 기존 `src/commands/done.ts` 패턴을 따름 (core 호출 → `{ stdout, stderr, exitCode }` 반환)

- `src/commands/use.ts` — `runUseCommand(target: string, projectRoot: string)`
- `src/commands/implement.ts` — `runImplementCommand(projectRoot: string)`
- `src/commands/abandon.ts` — `runAbandonCommand(target: string, projectRoot: string)`
- `src/commands/review.ts` — `runReviewReadyCommand(target: string | undefined, projectRoot: string)`
- `src/commands/clean.ts` — `runCleanCommand(options: { target?: string; force?: boolean }, projectRoot: string)`

### 9-2. `src/cli.ts` 수정 (기존, ~210줄)

신규 명령 등록:

- `program.command('use <target>')` — `runUseCommand` 호출
- `program.command('implement')` — `runImplementCommand` 호출
- `program.command('abandon <target>')` — `runAbandonCommand` 호출
- `program.command('review').command('ready [target]')` — `runReviewReadyCommand` 호출
- `program.command('clean [target]').option('--force')` — `runCleanCommand` 호출
- 기존 `start` 명령에 `.option('--no-git', 'Skip git worktree creation')` 추가 → `startTask()`에 `{ noGit: true }` 전달

### 9-3. archive 기존 명령 검증

- `src/core/archive.ts`와 `src/commands/archive.ts`의 기존 `--keep N` 지원 여부를 먼저 검증한다
- `loadArchiveTargets()`의 `keep` 파라미터와 `cli.ts`의 `--keep <n>` 옵션이 AC13, AC14를 충족하는지 확인
- 충족하면 변경 없음으로 유지한다
- 미충족 시 `src/core/archive.ts`, `src/commands/archive.ts`, `src/cli.ts`를 수정 대상으로 추가한다. 수정 범위는 DONE만 archive 대상인지, `--keep N` 정렬 기준(`completed_at` 내림차순, `completed_at`이 없으면 `updated_at` 내림차순으로 fallback)이 스펙과 일치하는지 확인 후 최소 변경으로 맞춘다
- archive 관련 코드 변경이 없더라도 AC13, AC14 충족 여부는 Step 12의 `archive-keep.test.ts`로 최종 보장한다

**검증:** `npm run typecheck` 통과, `npm run dev -- use --help` 등 수동 확인

---

## Step 10. 기존 명령 target 해석 — current work 폴백 적용 (`spec-approve.ts`, `plan-approve.ts`)

**대상 파일:**

- `src/core/spec-approve.ts` (~105줄)
- `src/core/plan-approve.ts`

**변경 의도:**

- done.ts의 current work 폴백은 Step 7에서 이미 처리 완료
- `loadSpecApprovalCandidates()`: target 미지정 시 `readCurrentWorkId()` → 해당 work만 후보로 반환. `current_work_id`가 null이면 에러
- `resolvePlanApprovalCandidates()`: 동일 패턴 적용
- current work 폴백은 후보 선택 방식만 바꾸며, 각 approve 명령의 기존 상태 검증 책임(`PENDING_SPEC_APPROVAL`, `PENDING_PLAN_APPROVAL` 등)은 그대로 유지한다

**검증:** `npm run typecheck` 통과, 기존 테스트 수정

---

## Step 11. 단위 테스트 작성

**대상 파일:** `tests/unit/` 디렉토리

**테스트 케이스:**

1. `state.test.ts` — `readCurrentWorkId` (파일 없을 때 null, 값이 `null` 문자열일 때 null), `writeCurrentWorkId` (쓰기/읽기 왕복)
2. `start.test.ts` — `resolveUniqueWorkspaceId` suffix 로직 (`-2`, `-3`), `sduck-workspace/`에 없는 id가 `sduck-archive/YYYY-MM/`에 존재할 때도 `-2` suffix가 붙는지 검증, `renderInitialMeta` 신규 필드(`branch`, `base_branch`, `worktree_path`, `updated_at`) 포함 확인
3. `use.test.ts` — `resolveUseTarget` (id 우선 매치, slug 중복 시 에러 + 후보 목록, 불일치 에러)
4. `implement.test.ts` — `formatImplementOutput` (`--no-git` work 시 `(none)` 출력, 정상 work 시 경로 출력), `resolveImplementContext` (`current_work_id`는 존재하지만 해당 workspace 디렉토리가 없는 경우 에러 반환)
5. `clean.test.ts` — `resolveCleanCandidates` (DONE/ABANDONED만 필터, IN_PROGRESS 제외), `branch`/`baseBranch`/`worktree_path`가 모두 null인 work에 대해 git 관련 단계가 모두 skip되는지 검증, `branch`와 `baseBranch`는 존재하지만 `worktree_path`만 null인 경우 worktree 제거는 skip하고 branch 삭제 경로로 진행되는지 검증
6. `review-ready.test.ts` — status `IN_PROGRESS` 외 에러, current work 폴백, 기존 `review.md`가 존재할 때 템플릿으로 덮어쓰지 않고 상태만 전환되는지 검증
7. `abandon.test.ts` — 허용 상태(`PENDING_SPEC_APPROVAL`, `IN_PROGRESS` 등) 성공, 금지 상태(`DONE`, `ABANDONED`) 에러
8. `done.test.ts` 수정 — `REVIEW_READY` 상태에서만 done 허용, `IN_PROGRESS`에서 done 시도 시 에러, `REVIEW_READY` 상태에서 `review.md`가 없거나 trim 후 빈 경우에도 done은 성공하지만 `reviewWarning`이 설정되는지 검증
9. `gitignore.test.ts` — `ensureGitignoreEntries` 정상 추가, 이미 존재 시 건너뜀, 파일 쓰기 실패 시 warning 반환 (non-fatal)

**검증:** `npm run test:unit` 전체 통과

---

## Step 12. E2E 테스트 작성

**대상 파일:** `tests/e2e/` 디렉토리

**시나리오:**

1. `parallel-work.test.ts` — work A 시작 → work B 시작 → 두 workspace 디렉토리 모두 존재 확인
2. `use-implement.test.ts` — `sduck use <B-id>` → `sduck implement` → B 컨텍스트 블록 출력 확인
3. `review-done.test.ts` — work 생성 → spec approve → plan approve → `review ready` 전 `done` 시도 실패 → `review ready` 후 `done` 성공 (상태머신 전체 경로 검증)
4. `done-clean.test.ts` — `review ready` → `done`까지 거쳐 DONE 상태를 만든 뒤, worktree 디렉토리 유지 확인 → `sduck clean` → worktree 삭제 확인
5. `clean-force.test.ts` — DONE 또는 ABANDONED 상태를 명시적으로 만든 뒤, unmerged 브랜치에 대해 `sduck clean` → 브랜치 유지 경고 → `sduck clean --force` → 브랜치 강제 삭제
6. `no-git.test.ts` — `--no-git` 플래그로 생성 → meta.yml의 `branch`, `base_branch`, `worktree_path` 필드 null 확인
7. `archive-keep.test.ts` — DONE work 3개 생성 → `sduck archive --keep 1` → 최신 1개는 `sduck-workspace/` 유지, 나머지 2개는 `sduck-archive/YYYY-MM/` 이동. "최신" 기준은 `completed_at` 내림차순, `completed_at`이 없으면 `updated_at` 내림차순으로 fallback

> E2E는 `--no-git` 플래그 또는 임시 git repo로 worktree 생성을 격리한다.
> `.gitignore` 갱신 실패 non-fatal 정책은 파일 IO mock 기반 단위 테스트(`gitignore.test.ts`)로 검증하고, E2E 범위에서는 제외한다.

**검증:** `npm run test:e2e` 전체 통과

---

## Step 13. 빌드 검증 및 최종 확인

**자동 검증 명령:**

```bash
npm run typecheck
npm run lint
npm run test:unit
npm run test:e2e
npm run build
```

**수동 smoke test:**

- `sduck start feature test-a && sduck start feature test-b` — 병렬 work 시작 확인
- current work가 설정된 상태에서 `sduck review ready && sduck done` — REVIEW_READY → DONE 경로 확인. 가능하면 `review ready` 전 `done` 실패도 확인
- `sduck archive --keep 1` — 최신 1개 제외 archive 확인
- `sduck clean --force` — worktree + 브랜치 강제 정리 확인
- current work 해제 후 `sduck implement` 실행 → 명확한 에러 메시지 확인

모든 검증 통과 후 완료.
