# Plan: init agent rails bootstrap (cycle 3)

## 구현 전제와 결정

- 코드 작업 위치: `/Users/taehee/Workspace/03_Temp/sdcuk-cli/.sduck-worktrees/20260605-0537-feature-file-aware-decision-provenance`
- 워크스페이스 문서 위치: `/Users/taehee/Workspace/03_Temp/sdcuk-cli/.sduck/sduck-workspace/20260605-0537-feature-file-aware-decision-provenance`
- 이 task는 `REVIEW_READY`에서 reopen된 cycle 3다. SDD meta는 기존 Step 1~7 완료 상태를 보존하므로, cycle 3 plan도 Step 1~7 형식을 유지한다.
- 사용자 승인 정책: 이 plan은 cycle 3 spec 승인 후 작성되었으며, **명시적 plan 승인 전에는 구현하지 않는다**.
- UX 목표: `sduck init` 한 번으로 `.decision` store와 agent-facing rails가 함께 설치되어, 사용자는 이후 LLM agent에게 자연어 작업 요청만 해도 agent가 `context → impact → submit/ask/confirm → trace/remember/close` 흐름을 발견할 수 있게 한다.
- 기본 설치 대상: repo-local `AGENTS.md`.
- idempotency 정책: `<!-- sduck:v2-agent-rails:begin -->` / `<!-- sduck:v2-agent-rails:end -->` marker 안쪽만 sduck가 관리한다.
- opt-out 정책: `sduck init --no-agent`를 추가해 `.decision`만 초기화하고 `AGENTS.md`는 건드리지 않는다.
- 검증 런타임: Node `>=22.13`, 로컬 검증은 `/Users/taehee/.nvm/versions/node/v22.22.0/bin`을 PATH 앞에 둔다.

## Step 1. Agent rails writer core 추가

### 대상 파일

- 신규 `src/core/v2/agent-rails.ts`
- `src/core/v2/paths.ts` 필요 시 참조
- `tests/unit/v2-core.test.ts`

### 수정 위치와 변경 의도

- 신규 `src/core/v2/agent-rails.ts`
  - export constants:
    - `AGENT_RAILS_FILE_NAME = 'AGENTS.md'`
    - `AGENT_RAILS_BEGIN_MARKER = '<!-- sduck:v2-agent-rails:begin -->'`
    - `AGENT_RAILS_END_MARKER = '<!-- sduck:v2-agent-rails:end -->'`
  - `renderAgentRailsBlock(): string` 추가.
    - block은 marker 포함 full block을 반환한다.
    - 내용은 vendor-neutral repo instruction 형식으로 작성한다.
    - 반드시 포함할 rails:
      - 작업 시작 시 `sduck status` 확인.
      - current task가 없으면 `sduck work "..."` 시작.
      - `sduck context --json`으로 context 확인.
      - target files known이면 구현 전 `sduck impact <file...> --json` 실행.
      - impact 결과는 자동 확정이 아니라 `CARRIED`/`CONFLICT` draft 근거로만 사용.
      - `sduck submit --stdin`으로 decision/question/evidence draft 제출.
      - open question이 있으면 사용자에게 묻고 `sduck answer`로 기록.
      - unresolved question이 있으면 `sduck confirm`/구현 진행 금지.
      - 구현 후 `sduck trace`, `sduck remember`, 완료 시 `sduck close`.
      - `CLOSED`/`ABANDONED` task mutation 금지.
  - `installAgentRails(projectRoot: string): AgentRailsInstallResult` 추가.
    - `AGENTS.md`가 없으면 생성하고 `{ action: 'created', path }` 반환.
    - marker block이 있으면 marker 안쪽을 교체하고 `{ action: 'updated', path }` 반환.
    - marker가 없고 기존 파일이 있으면 파일 끝에 block append하고 `{ action: 'appended', path }` 반환.
    - 기존 marker 밖 content는 byte-for-byte에 가깝게 보존한다.
    - repeated init에서 block count가 1개로 유지되게 한다.
  - marker begin/end가 불완전하면 안전하게 fail한다.
    - 예: begin만 있고 end가 없으면 `AGENTS.md contains an incomplete sduck agent rails block.` error.
    - 사용자 content 손상 방지 목적.
  - result type:
    - `interface AgentRailsInstallResult { action: 'created' | 'updated' | 'appended' | 'unchanged'; path: string }`
    - content가 이미 동일하면 `unchanged`를 반환할 수 있다.

### Unit 테스트

- fresh workspace에서 `installAgentRails()`가 `AGENTS.md`를 만들고 marker/rules를 포함한다.
- 기존 사용자 content가 있는 `AGENTS.md`에 block append 후 사용자 content가 보존된다.
- 이미 marker block이 있는 파일은 block 안쪽만 update되고 block 밖 content가 보존된다.
- repeated install 후 begin marker count가 1이다.
- incomplete marker는 error를 던지고 기존 파일을 변경하지 않는다.

### 검증

- `npx vitest run tests/unit/v2-core.test.ts`
- `npm run typecheck`

## Step 2. init workspace API와 command result 확장

### 대상 파일

- `src/core/v2/workspace.ts`
- `src/commands/v2/index.ts`
- `src/cli.ts`
- `tests/unit/v2-core.test.ts`
- `tests/e2e/v2-cli.test.ts`

### 수정 위치와 변경 의도

- `src/core/v2/workspace.ts`
  - `InitWorkspaceResult`에 optional/required `agentRails` field 추가.
    - `agentRails: AgentRailsInstallResult | null`
  - `initDecisionWorkspace(projectRoot, options?: { agentRails?: boolean })`로 시그니처 확장.
  - 기본값은 `{ agentRails: true }`.
  - `.decision` dirs/db/state 초기화 후, opt-out이 아니면 `installAgentRails(projectRoot)` 호출.
  - `agentRails === false`면 `agentRails: null` 반환하고 `AGENTS.md` 미변경.
- `src/commands/v2/index.ts`
  - `runInitCommand(projectRoot: string, options?: { agentRails?: boolean })`로 확장.
  - output에 agent rails 결과를 포함한다.
    - created/appended/updated/unchanged/null을 사람이 이해하기 쉽게 출력.
    - Next UX를 `Now ask your coding agent for work, or run: sduck work "..."`처럼 변경.
  - `runWorkCommand()`이 내부적으로 `initDecisionWorkspace(projectRoot)`를 호출하는 현재 behavior 검토.
    - `work`는 기존 UX를 유지하되, 이미 `sduck init --no-agent`한 사용자가 `work` 실행 시 agent rails가 생기는지 여부를 결정해야 한다.
    - Cycle 3 정책: `work`의 implicit init은 agent rails를 설치하지 않고 `.decision`만 보장한다. 명시적 bootstrap 책임은 `sduck init`에 둔다.
    - 따라서 `runWorkCommand()` 내부 호출은 `initDecisionWorkspace(projectRoot, { agentRails: false })`로 변경한다.
- `src/cli.ts`
  - `init` command에 `.option('--no-agent', 'Do not install or update AGENTS.md agent rails')` 추가.
  - action에서 `runInitCommand(process.cwd(), { agentRails: options.agent !== false })` 또는 Commander boolean convention에 맞춰 전달한다.

### 테스트

- unit: `initDecisionWorkspace(workspace)`는 `agentRails` result와 `AGENTS.md` 생성.
- unit: `initDecisionWorkspace(workspace, { agentRails: false })`는 `AGENTS.md` 미생성.
- e2e: `sduck init` stdout이 `Agent instructions`와 `AGENTS.md`를 언급.
- e2e: `sduck init --no-agent` stdout이 opt-out을 언급하고 `AGENTS.md` 미생성.

### 검증

- `npx vitest run tests/unit/v2-core.test.ts`
- `npx vitest run tests/e2e/v2-cli.test.ts`
- `npm run typecheck`

## Step 3. Agent rails content 품질과 existing guidance 통합

### 대상 파일

- `src/core/v2/agent-rails.ts`
- `src/core/v2/context.ts`
- `.sduck/sduck-assets/agent-rules/core.md`
- `README.md`
- `tests/unit/v2-core.test.ts`

### 수정 위치와 변경 의도

- `src/core/v2/agent-rails.ts`
  - rails block content를 `context.ts`의 `GRILL_ME_PROTOCOL`/`GRILL_ME_PROMPT`와 의미적으로 일치시킨다.
  - block 내용은 너무 길지 않게 유지하되, agent가 실제로 자동 실행할 command sequence를 충분히 구체화한다.
  - “user does not need to know the full CLI sequence”를 명시한다.
  - “Do not implement before unresolved questions are answered and brief is confirmed”를 명시한다.
  - “When modifying files, run impact before editing”을 MUST로 둔다.
- `src/core/v2/context.ts`
  - 이미 impact 안내가 있으므로, init-installed rails와 상충하지 않는지 확인한다.
  - 필요 시 prompt 문구를 “See AGENTS.md sduck rails” 정도로 연결하지만, 중복 과잉이면 변경하지 않는다.
- `.sduck/sduck-assets/agent-rules/core.md`
  - repo-internal SDD/agent rule asset에 v2 init agent rails UX를 짧게 추가할지 검토한다.
  - 이 파일은 현재 worktree에 수정 이력이 있으므로, 기존 SDD rule과 v2 public CLI rule이 충돌하지 않게 주의한다.
- `README.md`
  - 사용자 UX 섹션 추가:
    - `sduck init` installs `.decision` + `AGENTS.md` rails.
    - 이후 user asks coding agent naturally.
    - agent follows rails automatically.
    - `--no-agent` opt-out.
  - `AGENTS.md` managed block marker와 보존 정책 설명.

### 테스트

- unit: generated block contains key command names: `sduck status`, `sduck context --json`, `sduck impact`, `sduck submit --stdin`, `sduck ask`, `sduck answer`, `sduck confirm`, `sduck trace`, `sduck remember`, `sduck close`.
- unit: generated block contains no vendor-specific hard dependency.

### 검증

- `npx vitest run tests/unit/v2-core.test.ts`
- `npm run typecheck`

## Step 4. CLI e2e coverage for init UX

### 대상 파일

- `tests/e2e/v2-cli.test.ts`
- `tests/helpers/run-cli.ts` 필요 시
- `tests/e2e/sdd-cli-reachability.test.ts` 영향 확인

### 수정 위치와 변경 의도

- `tests/e2e/v2-cli.test.ts`
  - `sduck init installs agent rails by default`
    - temp workspace에서 `sduck init` 실행.
    - exit code 0.
    - stdout에 `Agent instructions` 또는 `AGENTS.md` 포함.
    - `AGENTS.md` 존재.
    - content에 marker와 key command 포함.
  - `sduck init is idempotent for agent rails`
    - `sduck init` 두 번 실행.
    - begin marker count가 1.
    - stdout은 unchanged/updated 중 허용하되 중복 없음 확인.
  - `sduck init preserves existing AGENTS.md content`
    - init 전 `AGENTS.md`에 사용자 content 작성.
    - init 후 사용자 content와 sduck block 모두 존재.
  - `sduck init --no-agent does not write AGENTS.md`
    - opt-out 실행 후 `AGENTS.md` 없음.
    - `.decision`은 생성됨.
- `tests/helpers/run-cli.ts`
  - 기존 helper로 충분하면 변경하지 않는다.
  - stdout/stderr capture는 이미 충분하다.
- `tests/e2e/sdd-cli-reachability.test.ts`
  - `init --help` output 변경으로 test가 깨지는지 확인한다.

### 검증

- `npx vitest run tests/e2e/v2-cli.test.ts`
- `npm run test:e2e`

## Step 5. Backward compatibility와 opt-out edge cases 정리

### 대상 파일

- `src/core/v2/agent-rails.ts`
- `src/core/v2/workspace.ts`
- `src/commands/v2/index.ts`
- `tests/unit/v2-core.test.ts`
- `tests/e2e/v2-cli.test.ts`

### 수정 위치와 변경 의도

- `src/core/v2/agent-rails.ts`
  - newline handling을 안정화한다.
    - 기존 파일이 newline 없이 끝나도 append 시 markdown이 깨지지 않게 blank line 삽입.
    - 생성 파일은 trailing newline 포함.
  - begin/end marker가 여러 개 있으면 안전한 error 또는 첫 block update + 중복 방지 중 선택.
    - plan 기본 구현: 여러 marker는 ambiguous하므로 error로 처리해 사용자 문서 손상 방지.
  - atomicity는 큰 범위가 아니므로 `writeFileSync`/`rename` 중 선택.
    - 문서 손상 리스크를 줄이기 위해 temp file write 후 rename을 검토한다.
- `src/core/v2/workspace.ts`
  - `.decision` init은 성공했는데 `AGENTS.md` update가 실패하는 경우 command 전체를 실패시킬지 결정.
    - 기본 구현: agent rails 설치 실패는 사용자가 알아야 하므로 command 실패로 반환한다.
    - `.decision` partial init rollback은 하지 않는다. 실패 메시지에 `--no-agent` opt-out 안내를 포함한다.
- `src/commands/v2/index.ts`
  - `--no-agent` opt-out output이 명확해야 한다.
  - errors include `Run sduck init --no-agent to skip agent instruction installation` if relevant.

### 테스트

- unit: incomplete marker error.
- unit: duplicate marker error.
- unit: no trailing newline existing content에도 append 결과가 readable.
- e2e: `--no-agent` path가 `.decision` init을 완료한다.

### 검증

- `npx vitest run tests/unit/v2-core.test.ts`
- `npx vitest run tests/e2e/v2-cli.test.ts`
- `npm run typecheck`

## Step 6. Documentation and help polish

### 대상 파일

- `README.md`
- `src/cli.ts`
- `src/commands/v2/index.ts`
- `tests/e2e/v2-cli.test.ts`

### 수정 위치와 변경 의도

- `README.md`
  - Quick start 수정:
    - `sduck init` → `.decision` + `AGENTS.md` 설치.
    - “Now ask your coding agent: 결제 retry 로직 추가해줘.” 예시.
    - agent가 자동으로 rails를 따르는 command sequence 설명.
  - Commands > Workspace and task:
    - `sduck init [--no-agent]`로 변경.
    - `--no-agent` 설명 추가.
  - Storage/generated artifacts:
    - `.decision/`은 source of truth, `AGENTS.md`는 repo-local instruction managed block 포함 가능하다고 설명.
  - Limitations:
    - agent가 AGENTS.md를 읽는 환경이어야 자동화 UX가 완성된다고 명시.
- `src/cli.ts`
  - `init` help에 `--no-agent`가 표시되게 한다.
- `src/commands/v2/index.ts`
  - init output이 README와 일관되게 한다.

### 테스트

- e2e: `sduck init --help`에 `--no-agent` 포함 여부를 검증할지 검토한다.
  - Commander help e2e가 과도하면 생략하고 full e2e/README로 충분히 검증한다.

### 검증

- `npm run lint`
- `npm run typecheck`
- `npm run test:e2e`

## Step 7. Full validation, AC checklist, task eval, review ready

### 대상 파일

- `.sduck/sduck-workspace/20260605-0537-feature-file-aware-decision-provenance/spec.md`
- `.sduck/sduck-workspace/20260605-0537-feature-file-aware-decision-provenance/review.md`
- `.sduck/sduck-assets/eval/task.yml`

### 수행 내용

- 구현 완료 후 spec AC24~AC31 체크리스트를 `[x]`로 갱신한다.
- 기존 AC13~AC23 release-hardening 회귀가 깨지지 않았는지 test 결과로 확인한다.
- 각 Step 구현 완료 직후 `sduck step done <N>`을 호출한다.
  - 현재 reopen cycle은 meta에 Step 1~7이 이미 completed로 보존되어 있으므로 `already completed`가 나올 수 있다.
- 전체 검증 명령:
  - `npm run lint`
  - `npm run typecheck`
  - `npm run test:unit`
  - `npm run test:e2e`
  - `npm run build`
  - `node dist/cli.js --help`
  - `node dist/cli.js --version`
- `.sduck/sduck-assets/eval/task.yml` 기준 task eval을 `review.md`에 기록한다.
- `sduck review ready 20260605-0537-feature-file-aware-decision-provenance` 또는 repo command wrapper equivalent로 `REVIEW_READY` 전환한다.

### 검증

- 위 전체 검증 명령이 통과해야 한다.
- `AGENTS.md` 생성/업데이트/idempotency/opt-out 테스트가 통과해야 한다.

## Plan 자체 평가

평가 기준: `.sduck/sduck-assets/eval/plan.yml`

| 기준             | 점수(1-5) | 근거                                                                                             |
| ---------------- | --------- | ------------------------------------------------------------------------------------------------ |
| semantic_clarity | 5         | init agent rails UX를 core writer, init API, CLI option, tests, docs, validation으로 분리했다.   |
| abstraction      | 5         | managed block rendering/install을 `agent-rails.ts`에 격리하고 workspace/CLI는 result만 연결한다. |
| typing           | 5         | install result/action/options 타입을 명시해 command output과 opt-out 처리를 안전하게 만든다.     |
| security         | 5         | 사용자 문서 보존, incomplete/duplicate marker error, opt-out, no external API를 계획했다.        |
| maintainability  | 5         | marker 기반 idempotent block으로 향후 rails 문구 업데이트가 쉽다.                                |
| testability      | 5         | fresh/existing/idempotent/opt-out/error/output/docs 관련 unit/e2e 검증을 구체화했다.             |

총평: Cycle 3 plan은 `sduck init`을 단순 DB bootstrap에서 agent workflow bootstrap으로 확장한다. 사용자 기대인 “init 후 agent에게 자연어로 요청하면 agent가 rails를 알아서 따른다”를 repo-local `AGENTS.md` managed block으로 구현하며, 기존 사용자 문서 보존과 opt-out을 함께 보장한다.
