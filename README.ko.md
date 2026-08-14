# sduck

[English README](README.md)

`sduck`는 코딩 에이전트와 개발자가 구현 전에 결정을 맞추도록 돕는 terminal-first decision briefing 도구입니다. 에이전트가 결정, 질문, 근거, 범위를 구조화해 제출하고, 사용자는 brief를 확정한 뒤 구현 결과를 trace로 남기며, 이후 작업에서 과거 결정을 검색해 재사용할 수 있습니다.

현재 기본 공개 workflow는 v2 `.decision` workflow입니다. legacy SDD(v1) 명령은 호환성을 위해 남아 있지만, 새 문서와 설치되는 agent rule은 v2 decision briefing을 기본으로 안내합니다.

## 0.7.0에서 달라진 점

- Auto Wiki는 confirmed `.decision` record를 `docs/wiki/` 아래의 안정적인 사람용 문서 5개로 투영합니다. Canonical source는 계속 `.decision`입니다.
- `sduck wiki build`, `status`, `sync`, `lint`가 원자적 생성, 결정론적 stale/conflict 탐지, source 검증, Team Notes와 generated marker 밖의 모든 바이트를 보존하는 section 단위 갱신을 제공합니다.
- 생성된 모든 주장은 typed evidence link를 가집니다. Decision intent, implementation claim, change tracking, validation report를 구분하며 CLI는 provenance와 구조를 검증할 뿐 semantic truth를 판정하지 않습니다.
- bundled `sd-build-wiki`, `sd-sync-wiki` skill이 활성 coding agent의 작성·선택적 갱신을 안내합니다. sduck는 daemon, background LLM, 자동 commit/push를 추가하지 않습니다.
- 새 workspace는 Wiki policy가 기본 활성화됩니다. 기존 workspace는 `sduck update`가 명시적으로 policy field를 추가할 때까지 기존 동작을 유지하며, migration만으로 Wiki page가 생성되지는 않습니다.
- `sduck close`는 Wiki freshness와 독립적으로 성공합니다. 관련 page가 dirty이면 닫힌 뒤 non-blocking sync 안내만 출력합니다.

Evidence model, compatibility, 명시적 제외 범위는 [0.7.0 release note](docs/release-0.7.0.md)를 참고하세요.

## 요구사항과 설치

- Node.js `>=22.13`
- npm
- `sduck trace`를 위한 Git work tree

v2 local cache가 Node 내장 `node:sqlite`를 사용하므로 Node `>=22.13`이 필요합니다. 실행 중 experimental warning이 보일 수 있습니다.

```bash
npm install -g @sduck/sduck-cli
sduck --help
```

checkout에서 실행할 때:

```bash
npm install
npm run build
npm run dev -- --help
```

## 문서 언어와 CLI locale

- 영어 README가 기본 문서입니다.
- 이 파일은 완전한 한국어 counterpart입니다.
- `sduck config locale en|ko`는 v2 terminal 표시 언어를 user-global로 저장합니다.
- `--locale` 옵션은 없습니다.
- locale은 tracked project file, `.decision/policy.json`, canonical Markdown export, JSON output, 설치되는 agent-rule template을 바꾸지 않습니다.
- 한국어 CLI는 v2/root/config surface에만 적용됩니다. v1/legacy SDD compatibility command는 영어로 유지됩니다.
- README 언어 선택과 CLI locale 설정은 서로 독립적입니다.

## 빠른 시작

```bash
# 1. v2 workspace와 canonical English agent rule을 초기화합니다.
sduck init

# 필요하면 특정 agent rule만 설치합니다.
sduck init --agents claude-code,codex,opencode

# 2. decision task를 시작합니다.
sduck work "add payment retry support"

# 3. agent에게 context pack을 제공합니다.
sduck context

# 4. agent가 context를 검토하고 대화한 뒤 guided grill을 완료합니다.
sduck grill complete --reason "Retry behavior and scope are clear"

# 5. agent가 작성한 decision/plan/question/evidence/scope draft를 제출합니다.
sduck submit --stdin < draft.json

# 6. 열린 질문을 해결합니다.
sduck ask
sduck answer QUESTION-1 --option 1
# 또는
sduck answer QUESTION-1 --text "Use exponential backoff with jitter."

# 7. brief를 검토하고 확정합니다.
sduck brief
sduck confirm

# 8. editor나 coding agent로 실제 구현 활동을 한 뒤 trace와 evaluation을 기록합니다.
sduck trace
sduck evaluate --check "tests=passed"

# 현재 task의 durable knowledge를 출처 기반 Capsule 하나로 정제합니다.
sduck memory status
sduck memory distill --stdin < memory.json

# 선택: local graph projection을 조회합니다.
sduck graph show TASK-20260507-payment-retry --depth 2

# 9. Capsule 우선 memory를 검색하고 작업을 닫습니다.
sduck remember
sduck recall "payment retry"
sduck close
```

여기서 “구현”은 `sduck confirm` 이후의 개발 활동을 뜻합니다. legacy `sduck implement` 명령을 실행하라는 의미가 아닙니다.

### Auto Wiki 빠른 시작

`sduck init` 후 coding agent에게 bundled `sd-build-wiki` skill을 사용해 달라고 요청하세요. Agent는 repository와 confirmed decision record를 확인하고, blocking question만 한 번에 하나씩 물은 뒤 evidence-backed page payload를 내부적으로 제출합니다.

```bash
# 일반적으로 활성 coding agent가 내부에서 실행합니다.
sduck wiki build --stdin < wiki.json
sduck wiki status
sduck wiki lint

# 이후 confirmed decision/trace/evaluation 또는 관련 code change가 생겼을 때:
sduck wiki status
sduck wiki sync --stdin < wiki-update.json
sduck wiki lint
```

최초 build는 정확히 `docs/wiki/README.md`, `glossary.md`, `capabilities.md`, `architecture-and-flows.md`, `decisions-and-recent-changes.md`와 tracked control manifest `docs/wiki/.sduck-wiki.json`을 만듭니다. Manifest 없이 fixed target 중 하나라도 이미 있으면 기존 team document를 교체하지 않고 build를 거부합니다. Sync는 이 중 하나 이상의 page를 받아 owned section만 갱신하고 `sduck:generated` marker 밖의 모든 내용을 byte-for-byte로 보존합니다. Clean page는 사용자가 `--force`를 명시적으로 허용하지 않으면 rewrite하지 않으며 agent는 이 option을 자동 적용하면 안 됩니다.

Auto Wiki bundled workflow는 Codex-first입니다. Managed `AGENTS.md`가 native skill 자동 설치를 가정하지 않고 repository skill file을 명시적으로 읽도록 Codex를 연결합니다. Claude Code에는 기존 installer가 skill file을 복사하며, 다른 agent는 best-effort managed-rule guidance를 받을 뿐 동일 동작을 보장하지 않습니다.

## 사용자 상호작용 모델

대부분의 사용자는 lifecycle command를 직접 실행하기보다 coding agent를 통해 sduck을 사용합니다. Agent는 `sduck work`, `context`, `grill complete`, `submit`, `brief`, `confirm`, `trace`, `evaluate`, `memory status/distill`, `remember`를 내부적으로 사용해 decision과 evidence를 기록하고, 사용자에게는 plain language로 요청을 다시 말하고, code와 prior decision을 확인하며, blocking question만 recommended answer와 rationale을 붙여 하나씩 묻고, 구현 전에는 변경/비변경 범위와 핵심 결정 및 검증 방법을 요약한 뒤 “이 방향으로 구현할까요?”라고 승인받고, 승인 후 구현하고 verification 결과를 보고합니다.

## Workflow contract와 gate

Canonical v2 순서:

```text
init → work → context/conversation → grill complete → submit → ask/answer → brief/confirm → implement → trace → evaluate → memory status/distill → graph show? → remember/recall → close
```

실제 contract는 다음과 같습니다.

1. `sduck init`은 `.decision/`, `.decision/policy.json`, compatibility `.sduck` asset, `.gitignore` 항목, managed agent rule을 생성합니다.
2. `sduck work "..."`는 현재 guided decision task를 시작하고 `GRILL_STARTED`를 자동 기록합니다.
3. `sduck context`는 관련 파일, 과거 decision/trace, grill-me protocol, draft schema를 출력합니다.
4. agent가 context를 검토하고 필요한 대화를 마친 뒤 `sduck grill complete --reason "..." [--carried DEC-...]`로 완료를 기록합니다.
5. `sduck submit --stdin`은 guided task에서 grill completion 이후에만 agent draft를 받습니다. Guided draft에는 non-empty `implementationPlan`과 `verificationPlan`이 필요합니다.
6. `sduck ask`와 `sduck answer`로 열린 질문을 해결합니다.
7. `sduck brief`는 localized terminal brief를 보여주고, `sduck confirm`은 canonical English confirmed brief와 Git baseline을 기록합니다.
8. 개발자나 agent가 sduck 밖에서 실제 구현 활동을 수행합니다.
9. `sduck trace`는 confirm 이후 변경된 구현 파일을 기록합니다.
10. `sduck evaluate --check "name=outcome"`는 최신 trace에 대한 근거를 기록합니다. shell command나 verification tool을 실행하지 않습니다.
11. 필요하면 `sduck graph show <TASK-*|DEC-*> [--depth N] [--json]`로 관계를 조회합니다.
12. `sduck memory status`는 confirmed/closed task의 Capsule 누락·최신·stale 상태를 보고합니다. `sduck memory distill --stdin`은 현재 task를 대상으로 하며, 과거 task backfill은 payload와 같은 ID의 `--task <TASK-ID>`를 명시해야 합니다.
13. `sduck remember`는 재사용 가능한 graph artifact를 만들고, `sduck recall`은 일치하는 Capsule을 먼저 검색한 뒤 Capsule이 실제로 인용하지 않은 bounded raw Decision/Trace 결과를 유지합니다.
14. Guided task는 최신 trace에 evaluation이 있어야 `sduck close`로 완료할 수 있습니다. 또는 `sduck abandon`으로 폐기합니다.

Wiki policy가 활성화된 경우 성공한 `close`가 Wiki status도 확인합니다. Dirty page가 있으면 `sd-sync-wiki` skill을 가리키는 advisory가 나오지만 task close를 막지는 않습니다.

`confirm`, `trace`, `close`, `abandon`은 잘못된 상태 전이를 canonical source 변경 없이 거부합니다. `confirm`은 열린 질문, active `OPEN` decision, active `CONFLICT` decision이 남아 있어도 실패합니다.

## Guided workflow와 compatibility

새 `sduck work` task는 guided task입니다. CLI가 grill start를 자동 기록하지만, guided `submit`과 `confirm`은 non-empty reason이 있는 grill completion을 요구합니다.

`sduck work`가 grill start를 자동 기록합니다. agent는 context를 검토하고 대화한 뒤 `sduck grill complete --reason "..."`를 기록합니다.

```bash
sduck context
# context를 검토하고 assumption을 논의하며 필요한 경우 prior decision을 carry합니다.
sduck grill complete --reason "Shared understanding reached" --carried DEC-0021
```

`sduck grill-me`는 compatibility command로 남아 있습니다. Grill prompt/protocol을 출력하고 필요하면 `GRILL_STARTED`를 idempotent하게 기록합니다. 새 guided task에서는 completion이 `submit`과 `confirm`을 허용하는 gate입니다.

Guided marker가 없는 historical task는 legacy/permissive behavior를 유지합니다. 사용자는 그런 task를 기존 방식으로 finish/resume하고, 새 작업에는 guided flow를 사용하면 됩니다.

Tracked `.decision/policy.json`에는 `workflowEnabled`도 포함됩니다. 기본값은 `true`입니다. `sduck workflow disable`은 새 `sduck work` 생성만 막으며, read-only command와 기존 history는 계속 접근할 수 있습니다. `sduck workflow enable`로 다시 켭니다. 이 mode를 변경하려면 active non-terminal decision task가 없어야 합니다.

### Disabled 상태의 자동 retrospective capture

Workflow 생성이 disabled이면 `sduck init`과 `sduck update`는 hook path가 없을 때만 advisory local post-commit hook을 설치합니다. 기존 hook은 `--force`를 사용해도 보존하며 overwrite하지 않습니다. Workflow 생성이 enabled이면 설치된 hook은 no-op합니다. Hook은 no-op 여부를 결정하기 위해 `.decision/policy.json`만 읽습니다. Source content는 inspect하지 않고 `sduck`, LLM, network를 실행하지 않습니다. Disabled 상태에서 commit 후에는 commit SHA와 first-parent SHA가 든 local Git marker를 씁니다.

Pending retrospective marker가 있으면 `sduck workflow enable`은 marker를 처리하거나 지울 때까지 거부합니다. 기존 hook 보존 때문에 hook 설치가 불가능해도 disabled mode는 safe/advisory 상태를 유지합니다. 이 경우 automatic marker는 쓰이지 않으며, agent는 명시적인 Git range가 주어졌을 때만 retrospective capture를 수행할 수 있습니다.

활성 coding agent는 자신이 commit한 뒤 또는 다음 응답 시작 시 marker를 확인합니다. `parent..commit` diff를 검토한 뒤 `sduck retrospective capture --stdin`으로 간결한 retrospective draft decision을 기록하고, 성공하면 marker를 지웁니다. 일반 `sduck work` 생성은 계속 disabled 상태입니다.

이는 commit 시점 LLM runtime이 아니라 best-effort 자동화입니다. Active agent session 밖에서 만든 commit은 다음 agent 응답까지 기다립니다. Capture에는 disabled workflow mode와 active decision task 부재가 필요하며, 근거가 부족한 rationale은 user-confirmed intent로 만들지 않고 `INFERRED` 또는 `OPEN`으로 남깁니다.

Grill은 절차를 늘리기 위한 것이 아니라 decision 품질을 확보하기 위한 gate입니다. 작은 작업도 grill completion이 필요하지만, agent는 간결한 decision 하나와 질문 0개로 끝낼 수 있습니다. 복잡한 작업에서는 먼저 codebase를 탐색하고, 필요한 경우 한 번에 하나의 질문만 하며, recommended answer와 rationale, expected/avoided scope, implementation/verification plan을 명확히 남겨야 합니다.

## Locale과 config

```bash
sduck config locale en
sduck config locale ko
```

설정은 user-global입니다. 탐색 순서는 다음과 같습니다.

1. `SDUCK_CONFIG_HOME/config.json`
2. `$XDG_CONFIG_HOME/sduck/config.json`
3. platform user config directory, 예: macOS `~/Library/Application Support/sduck/config.json`, Linux `~/.config/sduck/config.json`, Windows `%APPDATA%\\sduck\\config.json`, fallback `~/AppData/Roaming/sduck/config.json`

파일은 `schemaVersion`과 `locale`을 포함합니다. 설정이 없으면 영어가 기본입니다. malformed supported config는 v2/root/config route에서 warning을 출력하고 영어로 fallback하며, `sduck config locale en|ko`로 복구할 수 있습니다. 미래 schema는 오래된 CLI가 덮어쓰지 않습니다.

이 user-global config는 tracked `.decision/policy.json`과 별개입니다.

## Command reference

### Workspace와 config

| Command                                                     | 설명                                                                             |
| ----------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `sduck --help`                                              | root help 출력                                                                   |
| `sduck init [--agents <list>] [--force] [--no-agent-rules]` | `.decision`, compatibility asset, managed agent rule 초기화                      |
| `sduck config locale <en\|ko>`                              | user-global v2 표시 언어 설정                                                    |
| `sduck status [--json]`                                     | 현재 task와 진행 count 표시                                                      |
| `sduck workflow status [--json]`                            | 새 `sduck work` 생성 활성화 상태 표시                                            |
| `sduck workflow enable [--json]`                            | 새 decision workflow 생성 활성화                                                 |
| `sduck workflow disable [--json]`                           | 기존 record는 유지하고 새 decision workflow 생성 비활성화                        |
| `sduck retrospective capture --stdin`                       | workflow가 disabled일 때 pending post-commit marker를 retrospective draft로 기록 |
| `sduck doctor [--repair]`                                   | malformed source, DB-only cache, interrupted journal, stale cache 진단           |
| `sduck rebuild`                                             | canonical Markdown source에서 local SQLite cache 재빌드                          |

`--agents` 값은 `claude-code,codex,opencode,gemini-cli,cursor,antigravity`입니다. `--force`는 bundled asset과 managed block을 갱신합니다. `--no-agent-rules`는 managed agent instruction 설치를 건너뜁니다.

### Decision task flow

| Command                                                        | 설명                                                                     |
| -------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `sduck work <description...>`                                  | guided decision briefing task 시작, grill 자동 시작, context indexing    |
| `sduck resume <taskId>`                                        | 이전 non-terminal task 재개                                              |
| `sduck context [--json]`                                       | 현재 context pack 출력                                                   |
| `sduck context add <pathOrGlob>`                               | project-local context 추가                                               |
| `sduck grill-me [--json]`                                      | Compatibility command: grill start prompt/protocol 출력 및 기록          |
| `sduck grill complete --reason <text> [--carried <DEC-ID>...]` | Guided grill completion 기록                                             |
| `sduck submit --stdin`                                         | stdin에서 JSON 또는 Markdown draft 읽기                                  |
| `sduck ask`                                                    | 다음 열린 질문 표시                                                      |
| `sduck answer <questionId> --option <n>`                       | 1-based option 번호로 답변                                               |
| `sduck answer <questionId> --text <answer>`                    | free-text 답변                                                           |
| `sduck brief [--json]`                                         | implementation brief 렌더링                                              |
| `sduck confirm`                                                | 준비된 brief 확정 및 baseline 기록                                       |
| `sduck trace [--base <ref>] [--json]`                          | confirm 이후 변경된 구현 파일 기록                                       |
| `sduck evaluate --check "name=outcome"`                        | 최신 trace의 evaluation evidence 기록. 명령은 실행하지 않음              |
| `sduck memory status [--json]`                                 | eligible task의 Memory Capsule 누락·최신·stale 상태 보고                 |
| `sduck memory distill --stdin [--task <id>] [--json]`          | 현재 task의 Capsule을 검증·생성/갱신하고 과거 backfill에는 `--task` 요구 |
| `sduck graph show <TASK-*\|DEC-*> [--depth N] [--json]`        | 재빌드 가능한 local SQLite graph projection에서 bounded 관계 조회        |
| `sduck remember`                                               | 재사용을 위한 graph artifact export                                      |
| `sduck recall <query...>`                                      | Memory Capsule 우선, 이후 bounded confirmed decision/trace 검색          |
| `sduck close`                                                  | guided trace evaluation 이후 현재 task를 CLOSED로 표시                   |
| `sduck abandon`                                                | 현재 v2 task를 ABANDONED로 표시                                          |

### Bounded memory

Semantic memory는 활성 coding agent가 작성하며 sduck 내부에서 LLM을 호출하지 않습니다. `sduck-memory/v1` payload는 topic 20개, claim 20개로 제한되고 모든 claim은 같은 task의 canonical source ID를 가져야 합니다. 다시 정제하면 task의 stable `MEM-*` 문서를 갱신하며 payload와 source digest가 같으면 아무것도 바꾸지 않습니다. 기본값은 현재 task이며, confirmed/closed 과거 task를 의도적으로 backfill할 때만 `sduck memory distill --task <TASK-ID> --stdin`을 사용하고 option과 payload ID를 같게 유지합니다.

```json
{
  "schemaVersion": "sduck-memory/v1",
  "taskId": "TASK-20260507-payment-retry",
  "title": "Payment retry policy",
  "summary": "Provider의 transient failure를 service boundary에서 fixed cap으로 retry합니다.",
  "topics": ["payments", "retry"],
  "claims": [
    {
      "type": "DECISION",
      "text": "Transient failure는 최대 3회 retry합니다.",
      "sourceIds": ["DEC-retry-policy", "EVD-retry-helper"]
    },
    {
      "type": "VALIDATION",
      "text": "기록된 retry test suite가 통과했습니다.",
      "sourceIds": ["EVAL-0001"]
    }
  ]
}
```

Claim contract는 엄격합니다. `DECISION`은 confirmed Decision, `CONSTRAINT`는 Decision 또는 Evidence, `IMPLEMENTATION`은 Implementation Trace, `VALIDATION`은 Evaluation을 필수로 요구합니다. `memory status`는 참조가 없거나 잘못됐거나, 인용 내용이 바뀌거나, 더 최신 task source가 생기거나, 인용 decision이 confirmed 상태가 아니게 되면 stale로 표시합니다. 현재 public CLI에는 decision supersede 명령이 없으며 마지막 조건은 source-level migration/merge를 위한 방어 규칙입니다. Stale Capsule은 retrieval에서 제외되어 bounded raw history가 계속 노출됩니다. `sduck doctor`는 잘못된 Capsule 참조를 보고하고, 명시적인 `sduck doctor --repair`는 해당 Capsule만 `.decision/quarantine/memories/`로 옮긴 뒤 cache를 재빌드합니다.

Capsule은 destructive compaction이 아니라 compact retrieval layer입니다. 원본 Task, Decision, Evidence, Trace, Evaluation은 canonical로 보존됩니다. 일치하는 Capsule은 실제 인용한 raw Decision/Trace ID만 억제합니다. Automatic context는 현재 candidate set에서 다시 계산하고, 계속 매칭되는 source의 ID를 재사용하며, obsolete automatic entry를 제거한 뒤 task당 40개로 제한합니다. Explicit file context는 별도로 보존합니다. Canonical Markdown은 문서 마지막의 generated `sduck-source` fence를 읽고 commit 전에 round-trip을 검사하므로 prose에서 source format을 안전하게 설명할 수 있습니다. Cold archive, 삭제, incremental source/cache write는 이번 변경 범위 밖입니다.

### Auto Wiki

| 명령                                | 설명                                                                                                                       |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `sduck wiki build --stdin`          | 완전한 `sduck-wiki/v1` payload로 고정된 Wiki 5개와 manifest를 원자적으로 생성                                              |
| `sduck wiki status [--json]`        | 파일을 수정하지 않고 dirty, stale, conflict reason을 보고                                                                  |
| `sduck wiki sync --stdin [--force]` | 전달된 page만 원자적으로 갱신하고 human-owned byte를 보존하며, 편집된 generated region은 거부                              |
| `sduck wiki lint [--json]`          | 고정 schema, ownership marker, evidence ID, generated digest, link를 검증하고 의심스러운 대규모 rewrite는 warning으로 보고 |

Wiki payload는 고정된 page kind/slug/section ID와 typed Markdown block을 담습니다. 각 block에는 `type`, 비어 있지 않은 `markdown`, 기존 task/decision/evidence/implementation trace/evaluation을 가리키는 하나 이상의 `sourceIds`가 필요합니다. Unknown 또는 superseded ID는 거부됩니다. `decision-intent`, `change-tracking`, `validation-report` block은 각각 decision, trace, evaluation source를 추가로 요구합니다.

### Legacy compatibility command

아래 명령은 v1/SDD compatibility를 위해 유지되며 의도적으로 영어-only입니다.

```bash
sduck start <type> <slug>
sduck fast-track <type> <slug>
sduck spec approve [target]
sduck plan approve [target]
sduck step done <number> [target]
sduck review ready [target]
sduck done [target]
sduck use <target>
sduck implement [target]
sduck clean [target]
sduck reopen [target]
sduck archive
sduck update
sduck abandon <target>
```

Legacy gate는 `.sduck/sduck-state.yml`에 non-null `current_work_id`가 있을 때만 적용됩니다. `sduck abandon <target>`은 legacy route이고, bare `sduck abandon`은 v2 route입니다.

## Draft input

`sduck submit --stdin`은 raw JSON을 받습니다.

```json
{
  "schemaVersion": "v2alpha1",
  "taskId": "TASK-20260507-payment-retry",
  "expectedScope": ["Payment retry flow"],
  "avoidScope": ["Changing payment provider contracts"],
  "implementationPlan": ["Use existing retry helper for retryable payment failures."],
  "verificationPlan": ["Run payment retry unit tests and record outcomes with sduck evaluate."],
  "decisions": [
    {
      "id": "DEC-retry-policy",
      "title": "Retry policy",
      "kind": "INFERRED",
      "confidence": 0.8,
      "summary": "Use exponential backoff with jitter for retryable payment failures.",
      "rationale": ["Existing network retry utilities already use this pattern."],
      "appliesTo": ["src/payments/**"],
      "avoids": ["Retrying validation errors"],
      "sourceRefs": ["src/network/retry.ts"]
    }
  ],
  "questions": [
    {
      "id": "Q-retry-count",
      "text": "What is the maximum retry count?",
      "recommendedAnswer": "3 retries",
      "rationale": ["Keeps worst-case latency bounded."],
      "options": ["3 retries", "5 retries"]
    }
  ],
  "evidence": [
    {
      "id": "EVD-retry-helper",
      "sourceType": "CODE",
      "sourceRef": "src/network/retry.ts",
      "summary": "Existing retry helper supports backoff and jitter.",
      "confidence": 0.9
    }
  ]
}
```

또는 fenced `json sduck-draft` block이 있는 Markdown을 받습니다.

````markdown
# Draft

```json sduck-draft
{
  "schemaVersion": "v2alpha1",
  "decisions": [],
  "questions": [],
  "evidence": []
}
```
````

Decision kind는 `EXPLICIT`, `INFERRED`, `CARRIED`, `CONFLICT`, `OPEN`입니다. Confidence는 `0`에서 `1` 사이 숫자입니다. Portable explicit ID는 선택사항이며 생략하면 sduck이 생성합니다.

Guided task에서는 brief를 confirm하기 전에 `implementationPlan`과 `verificationPlan`이 모두 non-empty여야 합니다. `CARRIED` decision은 rationale과, abandoned되지 않은 다른 task의 confirmed decision을 가리키는 source ref가 필요합니다.

## Storage와 artifact

Tracked canonical source:

- `.decision/policy.json`
- `.decision/exports/markdown/tasks/*.md`
- `.decision/exports/markdown/decisions/*.md`
- `.decision/exports/markdown/implementations/*.md`
- `.decision/exports/markdown/memories/*.md`

Wiki policy가 활성화되고 Wiki를 build한 경우의 사람용 materialized view:

- `docs/wiki/{README,glossary,capabilities,architecture-and-flows,decisions-and-recent-changes}.md`
- `docs/wiki/.sduck-wiki.json` (schema, source/generated digest, sync baseline)

Local/generated file:

- `.decision/state.json`
- `.decision/db.sqlite*`
- `.decision/.commit-*.json`
- `.decision/workspace.lock/`
- `.decision/exports/graphify/`
- temporary staging/rollback directory

성공한 모든 mutation은 전체 bundle을 검증하고 canonical source를 원자적으로 쓰며 ignored SQLite cache를 갱신합니다. `.decision/.commit-*.json` 파일은 interrupted-write recovery를 위한 임시 transactional journal이며 ignore됩니다. `sduck rebuild`는 canonical Markdown에서 cache를 재생성합니다. `sduck doctor --repair`는 DB-only legacy data를 Markdown으로 migrate하거나 stale cache를 rebuild할 수 있습니다. `sduck graph show`는 local SQLite projection에서 bounded 관계를 읽습니다. 이 projection은 canonical authority가 아닙니다. `sduck remember`는 재사용 가능한 graph export를 씁니다. Canonical Markdown은 이미 각 workflow command 성공 시 갱신됩니다.

Terminal output은 locale에 따라 달라질 수 있습니다. JSON output과 canonical Markdown은 locale-neutral입니다.

## Concepts

- **Decision task**: briefing과 구현 alignment의 단위입니다.
- **Context pack**: agent에게 전달되는 관련 파일, 일치하는 Memory Capsule, bounded fallback decision/trace, prompt, draft schema입니다.
- **Guided grill**: `work`가 자동 시작하고 `grill complete`로 완료하는 clarification/interview 단계입니다.
- **Brief**: problem, decision, question, evidence, expected/avoided scope, implementation plan, verification plan을 묶은 구현 전 요약입니다.
- **Confirmation baseline**: `sduck confirm`이 `trace`를 위해 기록하는 Git baseline입니다.
- **Trace**: confirmed decision과 실제 구현 파일의 연결 기록입니다.
- **Evaluation**: 최신 trace에 대해 기록하는 근거입니다. 명령을 실행하지 않습니다.
- **Graph projection**: `graph show`로 조회하는 재빌드 가능한 local SQLite 관계입니다. Markdown이 canonical입니다.
- **Memory Capsule**: task당 하나인 bounded agent-authored summary이며 claim-level source ID와 deterministic source digest를 가집니다. `recall`과 context는 raw history보다 Capsule을 먼저 사용합니다.
- **Auto Wiki**: 사람을 위한 evidence-backed materialized view입니다. 활성 coding agent가 설명을 쓰고, sduck는 source ID, 고정 ownership boundary, freshness signal을 결정론적으로 강제합니다.

## Legacy compatibility

Legacy SDD workflow는 기존 팀과 오래된 workspace를 위해 계속 사용할 수 있습니다. 새 문서의 primary workflow는 아닙니다. Legacy help, parser error, command output은 `sduck config locale ko`가 설정되어도 영어로 유지됩니다.

설치되는 agent rule은 기본적으로 v2를 사용하고, `.sduck/sduck-state.yml`이 active legacy task를 가리킬 때만 legacy SDD gate를 적용하라고 안내합니다.

## 개발

```bash
npm install
npm run typecheck
npm run lint
npm run format:check
npm run test:unit
npm run test:e2e
npm run build
npm run package:check
```

대부분의 테스트는 repository 밖 임시 workspace에서 실행됩니다. CLI를 실행하는 테스트는 `SDUCK_CONFIG_HOME`으로 user-global config를 격리합니다.

## 제한사항

- v2는 terminal-driven agent workflow를 위한 도구이며 code review나 CI를 대체하지 않습니다.
- Agent hook은 advisory입니다. CLI는 workflow evidence를 기록하지만 built-in CI trace verifier는 제공하지 않습니다. Project check는 별도로 실행하고 결과를 `sduck evaluate`로 기록하세요.
- local SQLite cache는 Node experimental `node:sqlite` API에 의존합니다.
- Memory Capsule은 retrieval과 duplicate context growth를 개선하지만 canonical history를 삭제하거나 cold archive하지 않습니다. Full-bundle mutation 비용은 여전히 전체 canonical source 크기에 비례합니다.
- Legacy v1/SDD behavior는 compatibility-only이며 localize하지 않습니다.
- Auto Wiki는 intent를 추론하거나 implementation claim을 입증하거나 review를 대체하지 않습니다. Status/lint는 구체적인 source, digest, marker, link, Git-change signal만 탐지합니다.
- Auto Wiki에는 resident process나 built-in language model이 없습니다. 활성 agent 또는 사용자가 명령을 실행할 때만 갱신하며 sduck는 결과를 commit, tag, push, publish하지 않습니다.

## License

MIT. [LICENSE](LICENSE)를 참고하세요.
