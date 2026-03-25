# [feature] agentic parallel work

> **작업 타입:** `feature` (Standard Feature)
> **작성자:** taehee
> **작성일:** 2026-03-25
> **연관 티켓:** -

---

## 1. 배경 및 목적

### 문제 / 요구사항

기존 `worktree-parallel-work-support` 작업에서 병렬 work 생성과 worktree 연결은 구현되었으나, 실제 agentic workflow에서 두 가지 문제가 남아있다:

1. **Worktree 미사용 문제**: `sduck implement` 명령은 단순히 worktree 경로를 출력만 하고, 에이전트가 실제로 worktree 디렉토리에서 작업하도록 강제하지 않는다. 결과적으로 에이전트는 root에서 작업하게 된다.
2. **병렬 작업 상태 꼬임**: `current_work_id` 하나에 의존하는 구조라서 여러 work를 동시에 진행할 때 명령어가 정확한 work를 타겟하지 못한다. 일부 명령(`implement`, `step done`)은 target 인자를 받지 않아 병렬 작업에 취약하다.

### 기대 효과

- 모든 명령이 `[target]` optional을 받아 명시적 work 지정이 가능하다
- 에이전트용 context 파일(`agent-context.json`)이 각 workspace에 생성되어, 에이전트가 어느 디렉토리에서 작업해야 하는지 자동으로 인식한다
- `current_work_id` 의존성이 줄어들고, 명시적 타겟 사용이 권장된다
- 병렬 작업 시 각 work의 context가 독립적으로 관리된다

---

## 2. 기능 명세

### 사용자 스토리

```
As a developer running multiple parallel works with AI agents,
I want every CLI command to accept an explicit [target] and have context files
that tell agents where to work,
So that I can run multiple works simultaneously without state conflicts
and agents always work in the correct worktree directory.
```

### 수용 기준 (Acceptance Criteria)

> 모든 항목이 충족되어야 이 작업이 완료(Done)로 간주된다.

- [x] AC1: `sduck implement [target]` 명령이 `[target]` optional을 받는다. target 미지정 시 `current_work_id` 사용 (기존 호환)
- [x] AC2: `sduck step done <number> [target]` 명령이 `[target]` optional을 받는다. target 미지정 시 `current_work_id` 사용
- [x] AC3: 각 workspace에 `agent-context.json` 파일이 자동 생성된다. worktree 경로, branch, spec/plan 경로, status 등을 포함한다
- [x] AC4: `agent-context.json`은 `start`, `spec approve`, `plan approve`, `review ready`, `done`, `step done` 실행 시 자동으로 갱신된다
- [x] AC5: `agent-context.json` 내 `worktreeAbsolutePath` 필드가 절대 경로로 worktree 위치를 제공한다
- [x] AC6: `sduck implement` 출력에 `agent-context.json` 경로가 포함된다
- [x] AC7: `--no-git`으로 생성된 work의 `agent-context.json`은 `worktreePath: null`, `worktreeAbsolutePath: null`을 포함한다

### 기능 상세 설명

#### 2-1. Target-First API

모든 상태 변경 명령이 `[target]` optional을 받도록 통일한다:

| 명령            | 현재            | 변경 후                  |
| --------------- | --------------- | ------------------------ |
| `implement`     | target 없음     | `implement [target]`     |
| `step done <n>` | target 없음     | `step done <n> [target]` |
| `spec approve`  | `[target]` 있음 | 변경 없음                |
| `plan approve`  | `[target]` 있음 | 변경 없음                |
| `review ready`  | `[target]` 있음 | 변경 없음                |
| `done`          | `[target]` 있음 | 변경 없음                |

**target 해석 규칙 (공통):**

1. target 지정 시 → id exact match 우선, slug exact match 후순위
2. target 미지정 시 → `readCurrentWorkId()`로 current work 사용
3. current work가 null이면 에러: `"No current work set. Run \`sduck <command> <target>\` with explicit target."`

#### 2-2. Agent Context File

각 workspace 디렉토리에 `agent-context.json` 파일을 생성한다:

```json
{
  "id": "20260325-0122-feature-agentic-parallel-work",
  "type": "feature",
  "slug": "agentic-parallel-work",
  "status": "IN_PROGRESS",
  "branch": "work/feature/agentic-parallel-work",
  "baseBranch": "main",
  "worktreePath": ".sduck-worktrees/20260325-0122-feature-agentic-parallel-work",
  "worktreeAbsolutePath": "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.sduck-worktrees/20260325-0122-feature-agentic-parallel-work",
  "workspacePath": ".sduck/sduck-workspace/20260325-0122-feature-agentic-parallel-work",
  "workspaceAbsolutePath": "/Users/taehee/Workspace/03_Temp/sdcuk-cli/.sduck/sduck-workspace/20260325-0122-feature-agentic-parallel-work",
  "specPath": ".sduck/sduck-workspace/20260325-0122-feature-agentic-parallel-work/spec.md",
  "planPath": ".sduck/sduck-workspace/20260325-0122-feature-agentic-parallel-work/plan.md",
  "reviewPath": ".sduck/sduck-workspace/20260325-0122-feature-agentic-parallel-work/review.md",
  "steps": {
    "total": 5,
    "completed": [1, 2]
  },
  "specApproved": true,
  "planApproved": true,
  "createdAt": "2026-03-25T01:22:00Z",
  "updatedAt": "2026-03-25T02:30:00Z"
}
```

`--no-git`으로 생성된 work의 경우:

```json
{
  "branch": null,
  "baseBranch": null,
  "worktreePath": null,
  "worktreeAbsolutePath": null
}
```

**생성/갱신 시점:**

- `start` 실행 시 최초 생성
- `spec approve`, `plan approve`, `review ready`, `done`, `step done`, `reopen` 실행 시 갱신

#### 2-3. Context 파일 위치 및 에이전트 인식

**파일 위치:** `.sduck/sduck-workspace/<work-id>/agent-context.json`

**에이전트 인식 방식:**

1. 에이전트는 workspace 내 `agent-context.json`을 읽어 `worktreeAbsolutePath`를 확인
2. `worktreeAbsolutePath`가 존재하면 해당 디렉토리에서 코드 작업
3. `worktreeAbsolutePath`가 `null`이면 root 디렉토리에서 작업 (`--no-git` 케이스)

**CLAUDE.md 업데이트:**

세션 시작 시 `agent-context.json`을 확인하도록 CLAUDE.md 규칙을 업데이트한다:

```markdown
## 세션 시작 시 필수 확인

작업을 시작하기 전에 반드시 아래를 확인한다.

1. `.sduck/sduck-state.yml`에서 `current_work_id`를 확인한다
2. `.sduck/sduck-workspace/{current_work_id}/agent-context.json`을 읽는다
3. `worktreeAbsolutePath`가 있으면 해당 디렉토리에서 코드 작업을 수행한다
4. `worktreeAbsolutePath`가 `null`이면 프로젝트 root에서 작업한다
```

---

## 3. 기술 설계

### 변경 대상 컴포넌트

| 레이어   | 파일 / 모듈                 | 변경 내용 요약                                             |
| -------- | --------------------------- | ---------------------------------------------------------- |
| core     | `src/core/agent-context.ts` | 신규: `agent-context.json` 읽기/쓰기/갱신 로직             |
| core     | `src/core/start.ts`         | `agent-context.json` 초기 생성 추가                        |
| core     | `src/core/implement.ts`     | `[target]` 추가, context 파일 경로 출력                    |
| core     | `src/core/step.ts`          | `[target]` 추가                                            |
| core     | `src/core/spec-approve.ts`  | context 파일 갱신 추가                                     |
| core     | `src/core/plan-approve.ts`  | context 파일 갱신 추가                                     |
| core     | `src/core/review-ready.ts`  | context 파일 갱신 추가                                     |
| core     | `src/core/done.ts`          | context 파일 갱신 추가                                     |
| core     | `src/core/reopen.ts`        | context 파일 갱신 추가                                     |
| commands | `src/commands/implement.ts` | target 파라미터 추가                                       |
| commands | `src/commands/step.ts`      | target 파라미터 추가                                       |
| cli      | `src/cli.ts`                | `implement [target]`, `step done <n> [target]` 명령어 수정 |
| meta     | `CLAUDE.md`                 | `agent-context.json` 확인 규칙 추가                        |

### 데이터 모델

#### agent-context.json 스키마

```typescript
interface AgentContext {
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
  reviewPath: string | null;
  steps: {
    total: number | null;
    completed: number[];
  };
  specApproved: boolean;
  planApproved: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### 시퀀스 다이어그램

```
sduck start feature my-feature
  → create workspace directory
  → create worktree (or skip with --no-git)
  → write meta.yml
  → write spec.md, plan.md
  → write agent-context.json (NEW)
  → update sduck-state.yml

sduck implement [target]
  → resolve target (explicit or current_work_id)
  → read meta.yml
  → read agent-context.json (or generate if missing)
  → print context block including agent-context.json path

sduck step done 3 [target]
  → resolve target
  → update meta.yml steps.completed
  → update agent-context.json steps.completed (NEW)

sduck spec approve [target]
  → update meta.yml status, spec.approved
  → update agent-context.json status, specApproved (NEW)
```

---

## 4. UI/UX 명세

CLI 전용. 해당 없음.

---

## 5. 테스트 계획

### 단위 테스트 (Unit Test)

| 대상 함수 / 모듈            | 테스트 케이스                       | 예상 결과                 |
| --------------------------- | ----------------------------------- | ------------------------- |
| `renderAgentContext`        | 모든 필드 포함 여부                 | JSON 스키마 일치          |
| `renderAgentContext`        | `--no-git` work                     | worktreePath null         |
| `writeAgentContext`         | 파일 쓰기                           | 파일 생성, JSON 파싱 가능 |
| `resolveTargetForImplement` | target 지정 시                      | 해당 work 반환            |
| `resolveTargetForImplement` | target 미지정, current_work_id 있음 | current work 반환         |
| `resolveTargetForImplement` | target 미지정, current_work_id null | 에러 반환                 |
| `resolveTargetForStep`      | 동일 패턴                           | 동일 결과                 |

### 통합 / E2E 테스트

| 시나리오                 | 단계                                      | 예상 결과                            |
| ------------------------ | ----------------------------------------- | ------------------------------------ |
| implement with target    | work A, B 생성 → `sduck implement <A-id>` | A의 context 출력                     |
| implement without target | current work 설정 → `sduck implement`     | current work context 출력            |
| step done with target    | `sduck step done 1 <B-id>`                | B의 step 1 완료                      |
| agent-context 생성       | `sduck start ...`                         | agent-context.json 존재              |
| agent-context 갱신       | `sduck spec approve` 후                   | specApproved: true로 갱신            |
| agent-context 절대 경로  | start 후 agent-context.json 확인          | worktreeAbsolutePath 올바른 절대경로 |

---

## 6. 영향 범위 분석

### 변경 파일 목록 (예상)

```yaml
target_paths:
  - src/core/agent-context.ts # 신규
  - src/core/start.ts
  - src/core/implement.ts
  - src/core/step.ts
  - src/core/spec-approve.ts
  - src/core/plan-approve.ts
  - src/core/review-ready.ts
  - src/core/done.ts
  - src/core/reopen.ts
  - src/commands/implement.ts
  - src/commands/step.ts
  - src/cli.ts
  - CLAUDE.md
  - tests/unit/agent-context.test.ts
  - tests/unit/implement.test.ts
  - tests/unit/step.test.ts
```

### 사이드 이펙트 검토

- **기존 워크플로우 호환성**: target 미지정 시 기존처럼 `current_work_id` 사용하므로 호환성 유지
- **agent-context.json 미존재**: 구버전으로 생성된 workspace에는 파일이 없음. `implement` 실행 시 on-demand로 생성
- **CLAUDE.md 업데이트**: 기존 프로젝트에는 자동 반영되지 않음. `sduck init --force`로 재생성 필요

### 롤백 계획

- `agent-context.json` 생성 실패는 non-fatal. 경고 출력 후 work 생성 계속
- CLI 명령어 변경은 additive only. 기존 사용 패턴 유지

---

## 7. 보안 / 성능 고려사항

- **절대 경로 노출**: `worktreeAbsolutePath`, `workspaceAbsolutePath`는 개발자 로컬 경로. 민감 정보 아님
- **JSON 파일 크기**: ~500B 수준으로 성능 이슈 없음
- **동시 쓰기**: 각 workspace의 context 파일은 독립적이므로 병렬 작업 시 충돌 없음

---

## 8. 비기능 요구사항

| 항목              | 요구사항                        |
| ----------------- | ------------------------------- |
| 기존 호환성       | target 미지정 시 기존 동작 유지 |
| context 파일 크기 | 1KB 미만                        |
| 생성 실패 처리    | non-fatal, 경고만 출력          |

---

## 9. 의존성 및 선행 조건

- 기존 `worktree-parallel-work-support` 작업 완료 상태
- 외부 패키지 추가 없음

---

## 10. 미결 사항 (Open Questions)

- [x] context 파일 포맷: JSON vs YAML → **JSON 선택 (에이전트 파싱 용이)**
- [x] 절대 경로 포함 여부 → **포함 (`worktreeAbsolutePath`)**
- [x] context 파일 생성 실패 시 처리 → **non-fatal warning**

---

## 11. 참고 자료

- 기존 작업: `worktree-parallel-work-support` (20260324-0154)
- `src/core/implement.ts` 현재 구현
