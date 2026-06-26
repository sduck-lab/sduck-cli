# Plan: opencode agent rule file

## Context

- 승인된 spec: `.sduck/sduck-workspace/20260626-0241-fix-opencode-agent-rule-file/spec.md`
- 작업 코드 위치: `.sduck-worktrees/20260626-0241-fix-opencode-agent-rule-file`
- 현재 상태: `SPEC_APPROVED`
- 구현 전제: plan 승인 후에만 코드 수정한다.

## 목표

`sduck init --agents opencode`가 OpenCode 공식 project rules 파일인 `AGENTS.md`를 생성/갱신하도록 수정한다. `codex`는 기존처럼 `AGENT.md`를 사용하고, `codex,opencode` 조합에서는 두 파일이 각각 생성되어야 한다.

## Step 1. OpenCode target 파일 매핑 수정

### 대상 파일

- `.sduck-worktrees/20260626-0241-fix-opencode-agent-rule-file/src/core/agent-rules.ts`
  - `AGENT_RULE_TARGETS` 근처 lines 54-69
  - `listAgentRuleTargets()` 근처 lines 106-113
  - `renderAgentRuleContent()` 근처 lines 175-204

### 변경 내용

1. `AGENT_RULE_TARGETS`에서 OpenCode target을 아래처럼 변경한다.
   - 현재: `{ agentId: 'opencode', outputPath: 'AGENT.md', kind: 'root-file' }`
   - 변경: `{ agentId: 'opencode', outputPath: 'AGENTS.md', kind: 'root-file' }`
2. `codex` target은 `AGENT.md` 그대로 유지한다.
3. target dedupe 로직(`listAgentRuleTargets`)은 output path 기준 dedupe를 유지한다.
   - OpenCode와 Codex가 서로 다른 output path를 갖게 되므로 `codex,opencode` 조합에서 두 target이 모두 남아야 한다.
4. `renderAgentRuleContent()`의 related agent 계산은 기존 output path 기반 그룹핑을 유지한다.
   - `AGENT.md`에는 Codex template + core만 포함된다.
   - `AGENTS.md`에는 OpenCode template + core만 포함된다.

### 주의점

- OpenCode template asset 파일명(`opencode.md`)은 변경하지 않는다.
- root-file managed block 형식(`<!-- sduck:begin/end -->`)은 변경하지 않는다.
- 기존 `CLAUDE.md`, `GEMINI.md`, Cursor, Antigravity target은 변경하지 않는다.

### 검증

- TypeScript compile/typecheck에서 `SupportedAgentId`, `AgentRuleTarget` 관련 타입 에러가 없어야 한다.
- Step 2 테스트가 이 변경을 검증한다.

## Step 2. init agent rule 파일 동작 테스트 추가/수정

### 대상 파일

- `.sduck-worktrees/20260626-0241-fix-opencode-agent-rule-file/tests/unit/sdd-core-regression.test.ts`
  - import section lines 1-15
  - 기존 `initProject()` regression tests 뒤 또는 update test 전후 lines 148-171 근처
- `.sduck-worktrees/20260626-0241-fix-opencode-agent-rule-file/tests/e2e/v2-cli.test.ts`
  - default init assertion lines 41-46

### 변경 내용

1. `tests/unit/sdd-core-regression.test.ts`에 OpenCode mapping 전용 regression test를 추가한다.
   - temp workspace 생성
   - `await initProject({ agents: ['opencode'], force: false }, workspace)` 실행
   - `AGENTS.md`가 존재하고 managed block 및 `Selected agents: OpenCode`를 포함하는지 확인
   - `AGENT.md`는 존재하지 않아야 함을 확인
     - `access(join(workspace, 'AGENT.md'))`가 reject되는 방식 사용
2. 같은 파일에 Codex + OpenCode 조합 regression test를 추가한다.
   - temp workspace 생성
   - `await initProject({ agents: ['codex', 'opencode'], force: false }, workspace)` 실행
   - `AGENT.md` 존재, managed block 및 `Selected agents: Codex` 포함 확인
   - `AGENTS.md` 존재, managed block 및 `Selected agents: OpenCode` 포함 확인
   - `AGENT.md`에 `OpenCode Instructions`가 포함되지 않고, `AGENTS.md`에 `Codex Instructions`가 포함되지 않음을 확인하여 분리 설치를 검증
3. 기존 `refreshes existing generated agent rules during update` 테스트는 Claude Code 전용이라 변경하지 않는다.
4. `tests/e2e/v2-cli.test.ts` default `init` 테스트를 갱신한다.
   - 기존 default init은 non-TTY에서 모든 supported agents를 설치한다.
   - `CLAUDE.md`, `AGENT.md`, `GEMINI.md` 기존 assertion 유지
   - `AGENTS.md` managed block assertion 추가
   - 필요하면 `AGENT.md`와 `AGENTS.md` 각각의 selected agent/content 분리도 간단히 확인한다.

### 주의점

- `tests/unit/sdd-core-regression.test.ts`는 이미 `access`, `readFile`, `writeFile`을 import하므로 파일 존재/부재 검증에 재사용한다.
- test name은 동작을 명확히 표현한다.
  - 예: `writes OpenCode rules to AGENTS.md instead of AGENT.md`
  - 예: `separates Codex and OpenCode root rule files`
- 부재 검증은 platform-independent하게 promise rejection으로 처리한다.

### 검증

- 우선 관련 단일 unit test 실행:
  - `npx vitest run tests/unit/sdd-core-regression.test.ts`
- 관련 e2e test 실행:
  - `npx vitest run tests/e2e/v2-cli.test.ts`

## Step 3. 전체 검증과 SDD 진행 상태 기록

### 대상 파일/명령

- `.sduck-worktrees/20260626-0241-fix-opencode-agent-rule-file/src/core/agent-rules.ts`
- `.sduck-worktrees/20260626-0241-fix-opencode-agent-rule-file/tests/unit/sdd-core-regression.test.ts`
- `.sduck-worktrees/20260626-0241-fix-opencode-agent-rule-file/tests/e2e/v2-cli.test.ts`
- `.sduck/sduck-workspace/20260626-0241-fix-opencode-agent-rule-file/spec.md`
- `.sduck/sduck-workspace/20260626-0241-fix-opencode-agent-rule-file/review.md`

### 변경/진행 내용

1. Step 1 구현 후 `npx sduck step done 1` 실행한다.
2. Step 2 구현 및 관련 단일 테스트 통과 후 `npx sduck step done 2` 실행한다.
3. 전체 검증을 수행한다.
   - `npm run typecheck`
   - `npm run test:unit`
   - 필요한 경우 `npm run test:e2e` 또는 관련 e2e 단일 test
4. 승인된 spec의 완료 조건을 실제 결과와 대조한다.
5. `.sduck/sduck-assets/eval/task.yml`을 읽고 task 평가를 수행한다.
6. 모든 검증이 통과하면 `npx sduck step done 3` 실행한다.
7. `npx sduck review ready`로 `REVIEW_READY` 상태로 전환한다.

### 주의점

- `IN_PROGRESS` 상태에서만 구현 파일과 spec 체크리스트를 수정한다.
- `spec.md` 완료 조건 체크는 구현 완료 후에만 반영한다.
- 실패한 테스트가 있으면 `review ready`로 전환하지 않고 수정한다.
- `done` 처리는 사용자가 별도로 요청하거나 모든 completion criteria가 만족된 후에만 진행한다.

### 검증

- `npm run typecheck`
- `npm run test:unit`
- `npx vitest run tests/e2e/v2-cli.test.ts`
- 필요 시 `npm run test:e2e`

## 리스크와 대응

- 리스크: 기존 default init test가 모든 agent 설치 파일 목록을 암묵적으로 가정한다.
  - 대응: `AGENTS.md` assertion을 추가하고 기존 `AGENT.md` assertion은 Codex 보장을 위해 유지한다.
- 리스크: `--force` 보존 정책이 `AGENTS.md` 사용자 content를 덮어쓸 수 있다.
  - 대응: 이번 구현은 기존 root-file managed block merge 로직을 재사용하므로 보존 정책을 변경하지 않는다.
- 리스크: 기존 repo에 이미 `AGENT.md` OpenCode managed block이 있는 경우 자동 migration이 없다.
  - 대응: 이번 spec 범위는 향후 init target의 정확성이다. 자동 migration은 별도 task로 분리한다.

## Plan 자체 평가

`.sduck/sduck-assets/eval/plan.yml` 기준 자체 평가:

| 기준             | 점수(1-5) | 근거                                                                              |
| ---------------- | --------- | --------------------------------------------------------------------------------- |
| semantic_clarity | 5         | 변경 대상, 이유, 기대 결과가 단계별로 명확하다.                                   |
| abstraction      | 5         | agent target mapping, test coverage, workflow 검증으로 적절히 분리했다.           |
| typing           | 4         | 타입 변경은 작지만 `SupportedAgentId`/target mapping 영향과 typecheck를 명시했다. |
| security         | 5         | 파일 생성 경로만 변경하며 외부 입력/권한 확대가 없다.                             |
| maintainability  | 5         | 공식 파일명에 맞춰 mapping을 단순화하고 regression tests를 추가한다.              |
| testability      | 5         | unit/e2e 단일 테스트와 전체 검증 명령을 구체적으로 지정했다.                      |

평균: 4.8 / 5
