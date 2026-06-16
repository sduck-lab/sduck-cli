# Plan

## Step 1. `sduck init`을 legacy SDD init과 v2 decision init의 병합 진입점으로 전환

대상 파일:

- `src/cli.ts`
  - `src/commands/v2/index.js`에서 가져오는 `runInitCommand`를 제거하거나 `runDecisionInitCommand` 별칭으로 바꾼다.
  - `src/commands/init.js`의 legacy `runInitCommand`를 `runSddInitCommand` 별칭으로 import한다.
  - 기존 `program.command('init')` 블록을 async action으로 바꾼다.
  - 옵션을 추가한다.
    - `--agents <list>`: `claude-code,codex,opencode,gemini-cli,cursor,antigravity` 중 선택 설치
    - `--force`: legacy asset/managed block 갱신
    - `--no-agent-rules`: agent rule 설치를 명시적으로 생략하는 opt-out
  - action에서 `printResult(await runSddInitCommand(options, process.cwd()))`를 호출한다.

- `src/commands/init.ts`
  - `InitCliOptions`에 `agentRules?: boolean` 또는 동등한 opt-out flag를 추가한다.
  - `resolveSelectedAgents(options)`를 수정한다.
    - `options.agentRules === false`면 `[]` 반환
    - `--agents`가 있으면 기존 `parseAgentsOption` 결과 사용
    - interactive TTY이고 `--agents`가 없으면 기존 checkbox 선택 UX 유지
    - non-interactive이고 `--agents`가 없으면 `SUPPORTED_AGENTS` 전체를 기본 선택해 init이 agent rule 설치 no-op으로 끝나지 않게 한다.
  - `runInitCommand`에서 기존 legacy `initProject(...)` 호출 후 `src/core/v2/workspace.ts`의 `initDecisionWorkspace(projectRoot)`도 호출한다.
    - 목적: 기존 v2 사용자가 기대하는 `.decision/` 생성 동작을 유지한다.
  - output에는 legacy init table과 함께 `Decision workspace initialized.` 및 `.decision` 생성/기존 상태 요약을 포함한다.

- `src/core/init.ts`
  - `initProject(...)`의 기존 asset/agent-rule install 흐름은 유지한다.
  - `claude-code` 선택 시 `.claude/hooks/sdd-guard.sh`와 `.claude/settings.json` 설치가 계속 수행되는지 확인한다.

검증:

- `npm run typecheck`
- 새 temp workspace에서 `npm run dev -- init --agents claude-code` 실행 후 `.decision/state.json`, `.sduck/sduck-assets/eval/spec.yml`, `.sduck/sduck-assets/agent-rules/core.md`, `CLAUDE.md` 생성을 확인한다.

## Step 2. legacy SDD workflow 명령을 현재 CLI에 다시 노출

대상 파일:

- `src/cli.ts`
  - legacy command module import를 추가한다. v2와 이름이 겹치는 command는 별칭을 사용한다.
    - `src/commands/start.ts` → `runStartCommand`
    - `src/commands/fast-track.ts` → `runFastTrackCommand`
    - `src/commands/spec-approve.ts` → `runSpecApproveCommand`
    - `src/commands/plan-approve.ts` → `runPlanApproveCommand`
    - `src/commands/step.ts` → `runStepCommand`
    - `src/commands/review.ts` → `runReviewReadyCommand`
    - `src/commands/done.ts` → `runDoneCommand`
    - `src/commands/use.ts` → `runUseCommand`
    - `src/commands/implement.ts` → `runImplementCommand`
    - `src/commands/abandon.ts` → `runSddAbandonCommand`
    - `src/commands/clean.ts` → `runCleanCommand`
    - `src/commands/reopen.ts` → `runReopenCommand`
    - `src/commands/archive.ts` → `runArchiveCommand`
    - `src/commands/update.ts` → `runUpdateCommand`
  - command wiring을 추가한다.
    - `start <type> <slug>` with `--no-git`
    - `fast-track <type> <slug>` with `--no-git`
    - `spec approve [target]`
    - `plan approve [target]`
    - `step done <number> [target]`
    - `review ready [target]`
    - `done [target]`
    - `use <target>`
    - `implement [target]`
    - `clean [target] --force`
    - `reopen [target]`
    - `archive --keep <n>`
    - `update --dry-run`
  - `abandon` 충돌 정책을 구현한다.
    - target이 없으면 기존 v2 `runAbandonCommand(process.cwd())`를 호출한다.
    - target이 있으면 legacy `runSddAbandonCommand(target, process.cwd())`를 호출한다.
  - `step done <number>`와 `archive --keep <n>`는 숫자 변환/검증을 명시해 NaN이 core로 조용히 전달되지 않게 한다.

검증:

- `npm run dev -- --help`
- `npm run dev -- start --help`
- `npm run dev -- spec approve --help`
- `npm run dev -- plan approve --help`
- `npm run dev -- step done --help`
- `npm run dev -- review ready --help`
- `npm run dev -- done --help`

## Step 3. npm 배포 패키지에서 init asset을 찾을 수 있게 package contents를 보강

대상 파일:

- `package.json`
  - `files`에 `.sduck/sduck-assets`를 추가한다.
  - 기존 `dist`는 유지한다.

- `tsup.config.ts`
  - 기본적으로 별도 copy가 필요 없으면 유지한다.
  - `npm pack --dry-run`에서 dot-directory asset이 누락되면 tsup `onSuccess` 또는 package script 대신 `files` 구성을 보완하는 방향으로 조정한다.

- `src/core/assets.ts`
  - `getBundledAssetsRoot()`의 candidate path가 source 실행(`src/core`)과 dist 실행(`dist`) 모두에서 `.sduck/sduck-assets`를 찾는지 확인한다.
  - 필요한 경우 candidate에 package root 기준 경로를 명시적으로 보강한다.

- `src/core/agent-rules.ts`
  - `getAgentRulesAssetRoot()`의 candidate path가 npm package layout에서 `.sduck/sduck-assets/agent-rules`를 찾는지 확인한다.
  - 필요한 경우 `getBundledAssetsRoot()`를 재사용하거나 candidate를 보강해 중복된 경로 추론 실패를 줄인다.

검증:

- `npm run build`
- `npm pack --dry-run --json` 출력에 다음 파일들이 포함되는지 확인한다.
  - `package/.sduck/sduck-assets/eval/spec.yml`
  - `package/.sduck/sduck-assets/types/feature.md`
  - `package/.sduck/sduck-assets/agent-rules/core.md`
  - `package/.sduck/sduck-assets/agent-rules/claude-code.md`
  - `package/.sduck/sduck-assets/agent-rules/hooks/sdd-guard.sh`

## Step 4. regression test를 SDD 복구 요구사항에 맞게 갱신

대상 파일:

- `tests/e2e/sdd-cli-reachability.test.ts`
  - 기존 “legacy SDD commands가 노출되지 않아야 한다” assertion을 반대로 갱신한다.
  - `sduck --help`가 `start <type> <slug>`, `fast-track <type> <slug>`, `done [target]` 등을 포함하는지 확인한다.
  - nested help를 확인한다.
    - `sduck spec approve --help`
    - `sduck plan approve --help`
    - `sduck step done --help`
    - `sduck review ready --help`
  - 새 temp workspace에서 `sduck init --agents claude-code`를 실행하고 다음을 검증한다.
    - `.decision/state.json` 존재
    - `.sduck/sduck-assets/eval/spec.yml` 존재
    - `.sduck/sduck-assets/agent-rules/core.md` 존재
    - `CLAUDE.md`가 `<!-- sduck:begin -->`, `spec -> approval -> plan -> approval`, `sduck start` 또는 equivalent SDD command reference를 포함

- `tests/e2e/v2-cli.test.ts`
  - 기존 v2 flow test가 merged init output 변화에도 통과하도록 필요한 경우 assertion을 느슨하게 조정한다.
  - `work`, `context`, `submit`, `answer`, `brief`, `confirm`, `trace`, `remember`, `recall`, `close` 흐름은 그대로 유지한다.

- `tests/unit/sdd-core-regression.test.ts`
  - 필요 시 `initProject({ agents: ['claude-code'], force: false }, workspace)`가 `CLAUDE.md`와 hook files를 생성하는 unit assertion을 추가한다.
  - e2e에서 충분히 커버되면 core lifecycle test는 최소 수정만 한다.

검증:

- `npm run test:e2e`
- `npm run test:unit`

## Step 5. 문서와 최종 검증을 정리하고 SDD step 상태를 기록

대상 파일:

- `README.md`
  - `sduck init` 설명을 `.decision` only에서 `.decision + .sduck SDD assets + agent rule files`로 갱신한다.
  - `--agents`, `--force`, `--no-agent-rules` 옵션을 문서화한다.
  - agent에게 일을 시키기 전 init 후 생성되는 instruction 파일을 간단히 설명한다.
  - legacy SDD workflow 명령 목록 또는 quick example을 추가한다.

- `.sduck/sduck-workspace/20260616-0344-fix-restore-init-agent-rules/spec.md`
  - 구현 완료 후 완료 조건 checklist를 실제 검증 결과에 맞춰 체크한다.

검증:

- `npm run lint`
- `npm run typecheck`
- `npm run test:unit`
- `npm run test:e2e`
- `npm run build`
- `npm pack --dry-run --json`
- 모든 Step 완료 후 `.sduck/sduck-assets/eval/task.yml` 기준 task 평가를 수행한다.
- 각 Step 구현 완료 직후 `sduck step done <N>`에 해당하는 legacy command/core 경로로 step 완료를 기록한다.
- 모든 Step 완료 후 `sduck review ready`에 해당하는 legacy command/core 경로로 `REVIEW_READY`로 전환한다.

## Plan 자체 평가

`.sduck/sduck-assets/eval/plan.yml` 기준 자체 평가:

| 기준             | 점수 | 근거                                                                                |
| ---------------- | ---- | ----------------------------------------------------------------------------------- |
| semantic_clarity | 5    | init 병합, legacy command 노출, package asset, test/doc 변경을 분리해 의미가 분명함 |
| abstraction      | 4    | 파일/함수 단위까지 구체화하되 CLI conflict 정책은 구현 가능한 수준으로 유지함       |
| typing           | 4    | Commander option type, numeric parsing, command result async handling을 명시함      |
| security         | 4    | root instruction 파일 merge와 hook 설치를 legacy managed block 정책 안에서 다룸     |
| maintainability  | 4    | v2와 legacy import alias/충돌 정책을 명시해 공존 구조를 유지함                      |
| testability      | 5    | e2e/unit/build/pack 검증 명령과 assert 대상을 구체화함                              |

총평: 구현 승인 후 바로 실행 가능한 수준. 주요 리스크는 `init` 기본 agent 선택 정책과 `abandon` command 충돌이며, 본 plan은 non-interactive 기본 전체 agent 설치와 target 유무 기반 abandon dispatch로 해소한다.
