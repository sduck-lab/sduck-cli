# [feature] worktree parallel work support

> **작업 타입:** `feature` (Standard Feature)
> **작성자:** taehee
> **작성일:** 2026-03-24
> **연관 티켓:** -

---

## 1. 배경 및 목적

### 문제 / 요구사항

현재 sduck CLI는 단일 활성 work만 허용한다. 내부적으로 `findActiveTask()`가 `IN_PROGRESS`, `PENDING_SPEC_APPROVAL`, `PENDING_PLAN_APPROVAL` 상태의 work를 하나라도 발견하면 새 work 시작을 차단한다. 이로 인해 실제 개발 현장에서 여러 기능 브랜치를 동시에 작업하는 패턴을 지원하지 못한다.

또한 각 work의 Git 작업 공간(worktree)과 문서 작업 공간(workspace)이 연결되지 않아, Claude 같은 코딩 에이전트에게 "어느 코드 디렉토리에서 작업해야 하는지"를 명확히 전달할 수 없다.

아울러 current work 같은 전역 상태, status 전이 모델, done/clean/archive 책임 분리, review 단계 등이 미정의 상태이며, 용어 혼선(workspace/task/worktree)이 존재한다.

### 기대 효과

- 여러 work를 동시에 진행할 수 있어 병렬 개발 패턴을 지원한다
- 각 work에 Git worktree가 연결되어 코딩 에이전트가 올바른 코드 공간에서 작업한다
- `implement` 명령이 에이전트에게 필요한 컨텍스트(work id, branch, worktree path, spec/plan 경로)를 출력한다
- 전역 상태 파일 1개(`.sduck/sduck-state.yml`)로 current work를 관리한다
- 명확한 status 모델(`PENDING_SPEC_APPROVAL → PENDING_PLAN_APPROVAL → IN_PROGRESS → REVIEW_READY → DONE`)이 확립된다
- done / archive / clean 책임이 분리되어 merge 전 worktree 삭제 사고를 방지한다

---

## 2. 기능 명세

### 사용자 스토리

```
As a developer using sduck,
I want to start multiple works in parallel, each linked to its own git worktree,
So that I can switch between features without losing context and let coding agents
work in isolated code directories.
```

### 수용 기준 (Acceptance Criteria)

> 모든 항목이 충족되어야 이 작업이 완료(Done)로 간주된다.

- [x] AC1: 활성 work가 있어도 새 work를 `start`할 수 있다 (단일 활성 제한 제거)
- [x] AC2: `start` 시 Git worktree를 `.sduck-worktrees/<work-id>/`에 생성하고 `meta.yml`에 `branch`, `base_branch`, `worktree_path`를 기록한다. `--no-git` 플래그 사용 시 worktree 생성을 건너뛰고 해당 필드는 `null`로 기록한다.
- [x] AC3: `.sduck/sduck-state.yml`이 생성되며 `current_work_id`를 저장한다
- [x] AC4: `sduck use <id|slug>` 명령으로 current work를 전환할 수 있다. id exact match를 우선하고, slug match 결과가 복수이면 에러와 함께 후보 목록을 출력한다.
- [x] AC5: `sduck implement` 명령이 current work의 컨텍스트(id, branch, worktree_path, spec/plan 경로, 안내 문구)를 stdout에 출력한다
- [x] AC6: `sduck done`이 work를 논리적으로 완료 처리한다 (status → `DONE`, `completed_at` 기록). worktree와 workspace 이동은 건드리지 않는다.
- [x] AC7: `sduck clean` 명령이 `DONE` 또는 `ABANDONED` 상태 work의 worktree를 제거하고 브랜치를 정리한다. merge 판단은 `git branch --merged <base_branch>` 기준이며, merge되지 않은 브랜치는 `--force` 없이 삭제하지 않는다.
- [x] AC8: `sduck abandon <id|slug>` 명령이 work를 `ABANDONED` 상태로 전환한다
- [x] AC9: work id 충돌 시 suffix(`-2`, `-3`)를 자동 부여한다
- [x] AC10: `init` 또는 첫 `start` 시 `.gitignore`에 `.sduck-worktrees/`와 `.sduck/sduck-state.yml`을 추가한다 (이미 있으면 건너뜀)
- [x] AC11: meta.yml에 `id`, `type`, `slug`, `status`, `branch`, `base_branch`, `worktree_path`, `created_at`, `updated_at` 필드가 포함된다
- [x] AC12: `sduck review ready [target]` 명령이 `IN_PROGRESS` 상태 work에 대해 `review.md`를 생성하고 status를 `REVIEW_READY`로 전환한다
- [x] AC13: `sduck archive` 명령이 `DONE` 상태 work를 `sduck-archive/YYYY-MM/`으로 이동하며 worktree는 건드리지 않는다
- [x] AC14: `sduck archive --keep N` 명령이 최신 N개의 `DONE` work를 제외한 나머지만 archive한다

### 기능 상세 설명

#### 2-1. 병렬 work 지원 (기존 단일 제한 제거)

`src/core/start.ts`의 `findActiveTask()` 호출 블록을 제거한다. 대신 동일 id 충돌 방지 로직(suffix)만 유지한다.

#### 2-2. workspace ↔ worktree 연결 모델

- **workspace** = `sduck-workspace/<work-id>/` — SDD 문서 공간 (spec, plan, meta). **기존 경로 구조 유지.**
- **worktree** = `.sduck-worktrees/<work-id>/` — Git 코드 작업 공간 (신규)

`start` 실행 시:

1. workspace 디렉토리 생성 (기존 로직, 경로 불변)
2. `base_branch` 결정: `git rev-parse --abbrev-ref HEAD`로 현재 checkout된 브랜치를 사용. detached HEAD이면 에러를 반환하며 `--no-git` 플래그를 안내한다.
3. branch 이름 결정: `work/<type>/<slug>` (예: `work/feature/my-feature`)
4. `git worktree add .sduck-worktrees/<work-id> -b <branch> <base_branch>` 실행 (base_branch 명시적 지정)
5. `meta.yml`에 `branch`, `base_branch`, `worktree_path` 기록

`git` 명령은 Node.js 내장 `child_process.execFile` (인자 배열 방식)로 실행. 실패 시 workspace 디렉토리를 롤백한다.

`--no-git` 플래그 사용 시 2~4번을 건너뛰고 git 관련 필드를 `null`로 기록한다:

```yaml
branch: null
base_branch: null
worktree_path: null
```

새 work의 **초기 status는 `PENDING_SPEC_APPROVAL`**이다. start 완료 직후 meta.yml에 `status: PENDING_SPEC_APPROVAL`로 기록한다.

#### 2-3. 전역 상태 파일 (`sduck-state.yml`)

위치: `.sduck/sduck-state.yml`

```yaml
current_work_id: 20260324-0154-feature-my-feature
updated_at: 2026-03-24T01:54:00Z
```

- `start` 시 자동으로 `current_work_id`를 새 work로 설정
- `sduck use <id|slug>` 로 수동 전환
- current work가 `DONE` 또는 `ABANDONED`로 전환되면 `current_work_id`는 자동으로 `null`이 된다. **다른 active work로 자동 전환하지 않는다.**

`workspace.ts`는 workspace 탐색/해결만 담당한다. state 파일 읽기/쓰기는 신규 `state.ts`에서만 처리한다.

**`.sduck/` 디렉토리 생성 책임:**

- `init` 또는 첫 `start` 시 `.sduck/` 디렉토리가 존재하지 않으면 생성한다.
- `.sduck/` 생성 보장 후 `sduck-state.yml`을 생성/업데이트한다.

#### 2-4. `implement` 명령 (v1 컨텍스트 출력)

v1에서 agent subprocess를 실행하지 않는다. **`implement`는 target 인자를 받지 않는다.** current work가 설정되지 않으면 에러를 반환한다.

- `implement`는 반드시 `current_work_id`가 가리키는 active work만 대상으로 한다.
- archive된 work나 current가 아닌 work는 v1에서 직접 지정할 수 없다.

current work의 컨텍스트를 출력한다:

```
Work ID:      20260324-0154-feature-my-feature
Branch:       work/feature/my-feature
Worktree:     .sduck-worktrees/20260324-0154-feature-my-feature
Spec:         sduck-workspace/20260324-0154-feature-my-feature/spec.md
Plan:         sduck-workspace/20260324-0154-feature-my-feature/plan.md

다음 명령으로 코딩 에이전트를 시작하세요:
  cd .sduck-worktrees/20260324-0154-feature-my-feature
  claude  # 또는 opencode / codex
```

`--no-git`으로 생성된 work의 경우 `Branch` / `Worktree` 줄은 `(none)`으로 출력한다.

#### 2-5. done / archive / clean 책임 분리

세 명령의 책임은 완전히 분리된다:

| 명령      | 책임                                                      | worktree      | workspace 이동 |
| --------- | --------------------------------------------------------- | ------------- | -------------- |
| `done`    | 논리 완료 (status → `DONE`, `completed_at` 기록)          | 건드리지 않음 | 하지 않음      |
| `archive` | 문서 이동 (`sduck-workspace/` → `sduck-archive/YYYY-MM/`) | 건드리지 않음 | 이동           |
| `clean`   | 물리 정리 (worktree 제거, 브랜치 삭제)                    | 제거          | 건드리지 않음  |

**`archive` 인터페이스 (v1):**

- `sduck archive` — `DONE` 상태의 work 전체를 archive
- `sduck archive --keep N` — 최신 N개의 `DONE` work는 workspace에 남기고, 나머지를 archive. "최신" 기준은 `completed_at` 내림차순이며, `completed_at`이 없는 work는 `updated_at`으로 fallback한다.
- v1에서는 `sduck archive <target>` 미지원

대상: `DONE` 상태 work만. `ABANDONED`는 archive 대상 아님. v1에서는 `ABANDONED` work의 archive는 지원하지 않으며, 필요 시 별도 후속 work로 확장한다.

**`clean` 대상 탐색 범위:**

- target 지정 시: `sduck-workspace/` + `sduck-archive/` 모두 탐색
- target 미지정 시: `sduck-workspace/` 내 `DONE`/`ABANDONED` work만 대상

`clean`의 실행 순서 및 브랜치 삭제 기준:

1. `git branch --merged <base_branch>` 로 merge 여부 먼저 판단 (`base_branch`는 meta.yml에서 읽음)
2. worktree 제거: `git worktree remove <path>`
3. 브랜치 삭제: merge된 경우 `git branch -d <branch>`, `--force` 시 `git branch -D <branch>`

**순서 의도:** merge 판단을 먼저 수행하고, worktree 제거는 merge 여부와 무관하게 항상 시도한다. 즉 브랜치가 merge되지 않았더라도 worktree 제거는 허용한다. 브랜치 삭제만 merge 여부 + `--force` 플래그로 제어된다.

- merge되지 않은 브랜치: worktree는 제거하되, 브랜치는 `--force` 없이 skip (경고 출력). `--force` 시 `git branch -D <branch>`

**`clean`의 `git worktree remove` 실패 처리:**

- `worktree_path`가 `null`인 work(--no-git으로 생성)는 worktree 제거 단계를 건너뛴다.
- worktree 경로가 파일시스템에 존재하지 않으면 경고를 출력하고 브랜치 삭제 단계로 진행한다.
- `git worktree remove <path>` 실패 시 기본은 에러를 반환하고 해당 work의 clean을 중단한다.
- `--force` 플래그는 **브랜치 삭제 강제(`git branch -D`)만** 의미하며, `git worktree remove` 강제(`--force` 옵션 전달)는 포함하지 않는다.

remote 브랜치는 v1에서 건드리지 않음.

#### 2-6. status 모델

모든 상태 문자열은 대문자로 통일한다.

```
PENDING_SPEC_APPROVAL
      ↓ (sduck spec approve)
PENDING_PLAN_APPROVAL
      ↓ (sduck plan approve)
IN_PROGRESS
      ↓ (sduck review ready)
REVIEW_READY
      ↓ (sduck done)
DONE
```

`ABANDONED`는 어느 활성 상태에서든 `sduck abandon`으로 전환 가능. 자동 전환 없음.

기존 상태 유지 (코드 변경 없음):

- `PENDING_SPEC_APPROVAL`, `PENDING_PLAN_APPROVAL`, `IN_PROGRESS`, `DONE`

신규 추가:

- `REVIEW_READY`: 구현 완료 후 review 단계 진입
- `ABANDONED`: 명시적으로 포기한 work

**상태 전이 허용/금지 표:**

| 명령           | 허용 시작 상태                                                                  | 금지 상태                                                                             |
| -------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `spec approve` | `PENDING_SPEC_APPROVAL`                                                         | 그 외 전체                                                                            |
| `plan approve` | `PENDING_PLAN_APPROVAL`                                                         | 그 외 전체                                                                            |
| `review ready` | `IN_PROGRESS`                                                                   | `PENDING_SPEC_APPROVAL`, `PENDING_PLAN_APPROVAL`, `DONE`, `ABANDONED`, `REVIEW_READY` |
| `done`         | `REVIEW_READY`                                                                  | `PENDING_SPEC_APPROVAL`, `PENDING_PLAN_APPROVAL`, `IN_PROGRESS`, `ABANDONED`, `DONE`  |
| `abandon`      | `PENDING_SPEC_APPROVAL`, `PENDING_PLAN_APPROVAL`, `IN_PROGRESS`, `REVIEW_READY` | `DONE`, `ABANDONED`                                                                   |

#### 2-7. work id 충돌 방지

같은 분(`YYYYMMDD-HHmm`)에 같은 type+slug로 생성 시 suffix 자동 부여:

- 첫 번째: `20260324-0154-feature-my-feature`
- 두 번째: `20260324-0154-feature-my-feature-2`
- 세 번째: `20260324-0154-feature-my-feature-3`

#### 2-8. .gitignore 자동 추가

`init` 또는 첫 `start` 시 `.gitignore`에 다음 항목을 추가 (이미 있으면 건너뜀):

```
.sduck-worktrees/
.sduck/sduck-state.yml
```

**실패 정책:** `.gitignore` 업데이트 실패는 non-fatal. 경고를 출력하고 work 생성은 계속 진행한다. 경고 메시지에 사용자가 수동으로 추가해야 할 내용을 안내한다.

#### 2-9. review 단계 (lazy 생성)

- `review.md`는 `start` 시 생성하지 않는다
- `sduck review ready [target]` 실행 시:
  1. `sduck-workspace/<id>/review.md`를 template으로 생성
  2. status → `REVIEW_READY`로 전환
- `done` 전 `review.md` 존재 여부 확인: 없거나 비어있으면 경고 출력, 차단하지 않음
  - **"비어있음" 판단 기준:** `review.md` 파일이 없거나, 파일 내용을 `trim()` 한 뒤 길이가 0이면 "비어있음"으로 간주한다.

**`review ready [target]` 대상 해석 규칙:**

- `target` 있으면: id exact match 우선 → slug exact match
- `target` 없으면: current work 사용
- current work가 설정되어 있지 않으면 에러 반환

#### 2-10. `use` 대상 해석 규칙

`sduck use <target>`:

1. `target`이 work id와 exact match → 해당 work로 전환 (우선)
2. id 일치 없으면 slug로 exact match 탐색 (workspace 내 active work만)
3. slug 일치가 복수이면 에러 + 후보 목록 출력 (`sduck use <id>`로 재시도 안내)
4. 일치 없으면 에러

탐색 범위: `sduck-workspace/` 내 work만 (archive는 탐색하지 않음. current work는 active work만 가능)

#### 2-11. 용어 확정

| 용어        | 의미                                               |
| ----------- | -------------------------------------------------- |
| `work`      | 사용자-facing 작업 단위 (이전 `task`)              |
| `workspace` | SDD 문서 공간 (`sduck-workspace/<work-id>/`)       |
| `worktree`  | Git 코드 작업 공간 (`.sduck-worktrees/<work-id>/`) |
| `task`      | 도메인 핵심 용어로 사용하지 않음                   |

**내부 함수 rename 범위 (v1 제한):**

v1에서는 **신규 코드, 사용자-facing 메시지, 신규 명령 이름에만** `work` 용어를 사용한다. 기존 내부 함수명 전면 리네임은 별도 refactor work로 분리한다.

---

## 3. 기술 설계

### 변경 대상 컴포넌트

| 레이어   | 파일 / 모듈                       | 변경 내용 요약                                                                                        |
| -------- | --------------------------------- | ----------------------------------------------------------------------------------------------------- |
| core     | `src/core/project-paths.ts`       | `SDUCK_STATE_FILE`, `SDUCK_WORKTREES_DIR` 상수 추가, 관련 path helper 추가                            |
| core     | `src/core/workspace.ts`           | `findActiveTask()` 단일 제한 제거. state 파일 읽기는 담당하지 않음.                                   |
| core     | `src/core/state.ts` (신규)        | `.sduck/sduck-state.yml` 읽기/쓰기, `current_work_id` 관리                                            |
| core     | `src/core/start.ts`               | 단일 활성 제한 블록 제거, worktree 생성 로직, meta.yml 신규 필드, id 충돌 suffix, .gitignore 업데이트 |
| core     | `src/core/done.ts`                | status → `DONE`, `completed_at` 기록만 담당. archive 이동 로직 없음 (기존에도 없었음).                |
| core     | `src/core/archive.ts`             | 변경 없음 (기존 유지)                                                                                 |
| core     | `src/core/clean.ts` (신규)        | worktree 제거 (`git worktree remove`), 브랜치 삭제 (`git branch --merged <base_branch>` 기준)         |
| core     | `src/core/use.ts` (신규)          | `current_work_id` 변경, 대상 해석 규칙 적용                                                           |
| core     | `src/core/implement.ts` (신규)    | current work 컨텍스트 읽어서 출력 블록 구성                                                           |
| core     | `src/core/abandon.ts` (신규)      | status → `ABANDONED` 전환, state.yml `current_work_id` null 처리                                      |
| core     | `src/core/review-ready.ts` (신규) | `review.md` 생성 (template), status → `REVIEW_READY` 전환                                             |
| commands | `src/commands/*.ts`               | 신규 명령 래퍼: `use`, `implement`, `clean`, `abandon`, `review`                                      |
| cli      | `src/cli.ts`                      | 신규 명령 등록                                                                                        |
| meta     | `renderInitialMeta` 함수          | `branch`, `base_branch`, `worktree_path`, `updated_at` 필드 추가                                      |

### 데이터 모델

#### meta.yml (확장)

```yaml
id: 20260324-0154-feature-my-feature
type: feature
slug: my-feature
status: IN_PROGRESS
branch: work/feature/my-feature
base_branch: main # example only; actual value is current checked-out branch at start time
worktree_path: .sduck-worktrees/20260324-0154-feature-my-feature
created_at: 2026-03-24T01:54:00Z
updated_at: 2026-03-24T02:30:00Z

spec:
  approved: true
  approved_at: 2026-03-24T02:00:00Z

plan:
  approved: true
  approved_at: 2026-03-24T02:10:00Z

steps:
  total: null
  completed: []

completed_at: null
```

`--no-git` 모드 시:

```yaml
branch: null
base_branch: null
worktree_path: null
```

#### .sduck/sduck-state.yml (신규)

```yaml
current_work_id: 20260324-0154-feature-my-feature
updated_at: 2026-03-24T01:54:00Z
```

### 시퀀스 다이어그램

```
sduck start feature my-feature
  → slug normalize & validate
  → id = createWorkspaceId() + suffix if conflict
  → ensure .sduck/ directory exists
  → mkdir sduck-workspace/<id>/
  → git worktree add .sduck-worktrees/<id> -b work/feature/my-feature <base_branch>
    (--no-git 시 건너뜀, branch/base_branch/worktree_path = null)
  → write meta.yml (status: PENDING_SPEC_APPROVAL, with branch, worktree_path)
  → write spec.md (template)
  → write plan.md (empty)
  → update .sduck/sduck-state.yml (current_work_id = id)
  → update .gitignore (.sduck-worktrees/, .sduck/sduck-state.yml)
    (실패 시 non-fatal warning, 수동 추가 안내 출력)

sduck implement
  → read .sduck/sduck-state.yml → current_work_id (없으면 에러)
  → read sduck-workspace/<id>/meta.yml
  → print context block

sduck done [target]
  → validate steps, checklist
  → check review.md: 없거나 trim() 후 길이 0이면 경고 출력 (차단 안 함)
  → meta.yml: status → DONE, completed_at set
  → .sduck/sduck-state.yml: current_work_id → null (if was current)
  (worktree NOT touched, workspace NOT moved)

sduck archive [--keep N]
  → find DONE works in sduck-workspace/
  → (--keep N 지정 시 최신 N개 제외)
  → mv sduck-workspace/<id>/ → sduck-archive/YYYY-MM/<id>/
  (worktree NOT touched)

sduck clean [target] [--force]
  → if target given:
      search sduck-workspace/ + sduck-archive/
    else:
      search sduck-workspace/ only
  → resolve DONE/ABANDONED work with worktree_path != null
  → for each candidate:
      git branch --merged <base_branch> → check merge status (판단 먼저)
      if worktree_path is null: skip worktree removal
      if worktree path does not exist on filesystem: warn, proceed to branch step
      git worktree remove <path>  (merge 여부 무관하게 시도)
        → on failure: return error, abort this work's clean
      if merged: git branch -d <branch>
      if not merged + no --force: skip branch deletion (warn; worktree was already removed)
      if not merged + --force: git branch -D <branch>
      (--force affects branch deletion only, not git worktree remove)

sduck review ready [target]
  → validate: status must be IN_PROGRESS (else error)
  → write sduck-workspace/<id>/review.md (from template)
  → meta.yml: status → REVIEW_READY, updated_at set
```

---

## 4. UI/UX 명세

CLI 전용. 해당 없음.

---

## 5. 테스트 계획

### 단위 테스트 (Unit Test)

| 대상 함수 / 모듈                  | 테스트 케이스                 | 예상 결과                              |
| --------------------------------- | ----------------------------- | -------------------------------------- |
| `createWorkspaceId` + suffix 로직 | 동일 분/type/slug 충돌        | suffix `-2` 부여                       |
| `parseMetaText`                   | branch/worktree_path 파싱     | 정상 반환                              |
| `readState` / `writeState`        | current_work_id 읽기/쓰기     | 파일 없으면 `null` 반환                |
| `renderInitialMeta`               | 신규 필드 포함 여부           | branch, worktree_path, updated_at 포함 |
| `filterCleanCandidates`           | DONE/ABANDONED만 필터         | IN_PROGRESS 제외                       |
| `resolveUseTarget`                | id 우선 / slug 중복 시 에러   | 중복 slug 시 후보 목록 포함 에러 반환  |
| `resolveImplementContext`         | `--no-git` work 컨텍스트 구성 | worktree_path null 시 `(none)` 출력    |
| 상태 전이 유효성 검사             | 허용되지 않는 상태에서 명령   | 적절한 에러 메시지 반환                |

### 통합 / E2E 테스트

| 시나리오             | 단계                                     | 예상 결과                                 |
| -------------------- | ---------------------------------------- | ----------------------------------------- |
| 병렬 work 시작       | work A 시작 → work B 시작                | 두 workspace 디렉토리 모두 존재           |
| current work 전환    | `sduck use <B-id>`                       | state.yml `current_work_id` = B           |
| implement 출력       | `sduck implement`                        | B의 컨텍스트 블록 출력                    |
| done + worktree 유지 | `sduck done`                             | worktree 디렉토리 유지됨                  |
| archive              | `sduck archive`                          | workspace → `sduck-archive/YYYY-MM/` 이동 |
| clean (merged)       | `sduck clean`                            | worktree 삭제됨                           |
| clean --force        | `sduck clean --force` (unmerged branch)  | worktree + 브랜치 강제 삭제               |
| clean worktree 없음  | worktree 경로 수동 삭제 후 `sduck clean` | 경고 출력 후 브랜치 삭제 진행             |

> E2E는 `--no-git` 플래그 또는 git mock으로 worktree 생성을 격리한다.

---

## 6. 영향 범위 분석

### 변경 파일 목록 (예상)

```
target_paths:
  - src/core/project-paths.ts       # 상수 추가
  - src/core/workspace.ts           # 단일 제한 제거
  - src/core/start.ts               # worktree 생성, suffix, .gitignore
  - src/core/done.ts                # status DONE + completed_at만 (기존과 동일)
  - src/core/archive.ts             # 변경 없음
  - src/core/state.ts               # 신규
  - src/core/clean.ts               # 신규
  - src/core/use.ts                 # 신규
  - src/core/implement.ts           # 신규
  - src/core/abandon.ts             # 신규
  - src/core/review-ready.ts        # 신규
  - src/commands/clean.ts           # 신규
  - src/commands/use.ts             # 신규
  - src/commands/implement.ts       # 신규
  - src/commands/abandon.ts         # 신규
  - src/commands/review.ts          # 신규
  - src/cli.ts
  - tests/unit/...
  - tests/e2e/...
```

### 사이드 이펙트 검토

- **기존 spec/plan approve 흐름**: `findActiveTask()` 제거로 target 없이 호출 시 `current_work_id` 기반 폴백 필요. `current_work_id`가 null이면 명시적 target 요구.
- **기존 done**: done은 기존에도 archive 이동 로직이 없었음. 사용자는 `sduck archive`를 별도로 실행해야 한다.
- **기존 reopen**: archive된 work의 reopen은 이번 스코프 밖. `sduck-workspace/`에 있는 DONE work만 reopen 대상으로 유지.
- **status 문자열**: 변경 없음. 기존 workspace 호환성 문제 없음.

### 롤백 계획

- git worktree 생성 실패 시 workspace 디렉토리 삭제 후 에러 반환. **start의 fatal rollback 범위는 새 workspace 디렉토리 제거까지로 제한한다.** `.sduck/` 생성 및 `.gitignore` 업데이트는 best-effort이며 완전 롤백 대상이 아니다.
- `.sduck/sduck-state.yml` write 실패는 non-fatal (경고만 출력)
- `.gitignore` 업데이트 실패는 non-fatal (경고 + 수동 추가 안내 출력)
- git 명령 실패 시 상세 stderr 메시지 포함해서 에러 반환

---

## 7. 보안 / 성능 고려사항

- **git 명령 실행**: `child_process.execFile` (인자 배열)로 실행해 shell injection 방지
- **worktree 경로**: `.sduck-worktrees/` 아래로만 생성. 경로 traversal 방지.
- **브랜치 이름**: `work/<type>/<slug>` 형식으로만 생성. slug는 이미 kebab-case로 정규화됨.

---

## 8. 비기능 요구사항

| 항목                | 요구사항                                                              |
| ------------------- | --------------------------------------------------------------------- |
| git 없는 환경       | `--no-git` 플래그로 worktree 없이 workspace만 생성 가능               |
| 기존 workspace 호환 | 기존 status 문자열(`PENDING_*`, `IN_PROGRESS`, `DONE`) 읽기 지원 유지 |
| `.sduck/` 오염 방지 | `sduck-state.yml`은 `.gitignore`에 자동 추가                          |

---

## 9. 의존성 및 선행 조건

- git CLI가 프로젝트 루트에서 사용 가능해야 함 (`--no-git` 없이 사용 시)
- 외부 npm 패키지 추가 없이 Node.js 내장 `child_process` 사용

---

## 10. 미결 사항 (Open Questions)

- [x] status 문자열을 소문자로 마이그레이션할지 → **대문자 유지, 신규 상태도 대문자 추가**
- [x] `done` 시 archive 자동 실행할지 → **별도 명령 유지 (done / archive / clean 책임 분리)**
- [x] `--no-git` 플래그 지원할지 → **추가. 해당 meta 필드는 `null`로 기록.**
- [x] review.md 비어있을 때 `done` 차단할지 → **경고만 출력, 차단 안 함**
- [x] review.md 생성 시점 → **lazy 생성 (`sduck review ready` 실행 시 생성)**
- [x] state 파일 위치 → **`.sduck/sduck-state.yml`**
- [x] clean `--force` 범위 → **브랜치 삭제 강제만. `git worktree remove` 강제 미포함.**
- [x] `.sduck/` 디렉토리 생성 책임 → **`init` 또는 첫 `start` 시 자동 생성**
- [x] `done`의 current work 해제 후 자동 전환 여부 → **자동 전환 없음. `current_work_id`는 null로만 설정.**

---

## 11. 참고 자료

- Git worktree 공식 문서: https://git-scm.com/docs/git-worktree
- 현재 코드베이스: `src/core/start.ts`, `src/core/workspace.ts`, `src/core/project-paths.ts`, `src/core/done.ts`
