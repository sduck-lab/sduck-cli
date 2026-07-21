# sduck

[English README](README.md)

`sduck`는 코딩 에이전트와 개발자가 구현 전에 결정을 맞추도록 돕는 terminal-first decision briefing 도구입니다. 에이전트가 결정, 질문, 근거, 범위를 구조화해 제출하고, 사용자는 brief를 확정한 뒤 구현 결과를 trace로 남기며, 이후 작업에서 과거 결정을 검색해 재사용할 수 있습니다.

현재 기본 공개 workflow는 v2 `.decision` workflow입니다. legacy SDD(v1) 명령은 호환성을 위해 남아 있지만, 새 문서와 설치되는 agent rule은 v2 decision briefing을 기본으로 안내합니다.

## 0.6.0에서 달라진 점

- CLI-first guided workflow: 새 `sduck work` task는 생성 시점부터 guided task입니다.
- `sduck work`가 grill start를 자동 기록합니다. agent는 context를 검토하고 대화한 뒤 `sduck grill complete --reason "..."`를 기록합니다.
- 하나의 Brief가 문제, decision, evidence, scope, `implementationPlan`, `verificationPlan`을 함께 담습니다.
- guided task를 닫기 전에 `sduck evaluate`가 최신 trace에 대한 근거를 기록합니다. 명령이나 검증 도구를 실행하지 않습니다.
- `sduck graph show <TASK-*|DEC-*>`로 local SQLite graph projection을 조회할 수 있습니다. Markdown이 canonical source이며 SQLite는 재빌드 가능한 local cache입니다.
- bundled agent rule과 문서는 CLI-only v2 lane에 맞춰 `grill complete`, `brief`/`confirm`, `trace`, `evaluate`, `remember`, `close`를 안내합니다.
- Repository-only Phase 0 fixture는 future brief-digest/source-envelope contract만 문서화합니다. MCP runtime, MCP control-plane command, built-in CI trace verification은 0.6.0에서 deferred/absent입니다.

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

# 선택: local graph projection을 조회합니다.
sduck graph show TASK-20260507-payment-retry --depth 2

# 9. 과거 결정을 검색하고 작업을 닫습니다.
sduck remember
sduck recall "payment retry"
sduck close
```

여기서 “구현”은 `sduck confirm` 이후의 개발 활동을 뜻합니다. legacy `sduck implement` 명령을 실행하라는 의미가 아닙니다.

## Workflow contract와 gate

Canonical v2 순서:

```text
init → work → context/conversation → grill complete → submit → ask/answer → brief/confirm → implement → trace → evaluate → graph show? → remember/recall → close
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
12. `sduck remember`는 재사용 가능한 graph artifact를 만들고, `sduck recall`은 기억된 decision/trace를 검색합니다.
13. Guided task는 최신 trace에 evaluation이 있어야 `sduck close`로 완료할 수 있습니다. 또는 `sduck abandon`으로 폐기합니다.

`confirm`, `trace`, `close`, `abandon`은 잘못된 상태 전이를 canonical source 변경 없이 거부합니다. `confirm`은 열린 질문, active `OPEN` decision, active `CONFLICT` decision이 남아 있어도 실패합니다.

## Guided workflow와 compatibility

새 `sduck work` task는 guided task입니다. CLI가 grill start를 자동 기록하지만, guided `submit`과 `confirm`은 non-empty reason이 있는 grill completion을 요구합니다.

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

| Command                                                        | 설명                                                                  |
| -------------------------------------------------------------- | --------------------------------------------------------------------- |
| `sduck work <description...>`                                  | guided decision briefing task 시작, grill 자동 시작, context indexing |
| `sduck resume <taskId>`                                        | 이전 non-terminal task 재개                                           |
| `sduck context [--json]`                                       | 현재 context pack 출력                                                |
| `sduck context add <pathOrGlob>`                               | project-local context 추가                                            |
| `sduck grill-me [--json]`                                      | Compatibility command: grill start prompt/protocol 출력 및 기록       |
| `sduck grill complete --reason <text> [--carried <DEC-ID>...]` | Guided grill completion 기록                                          |
| `sduck submit --stdin`                                         | stdin에서 JSON 또는 Markdown draft 읽기                               |
| `sduck ask`                                                    | 다음 열린 질문 표시                                                   |
| `sduck answer <questionId> --option <n>`                       | 1-based option 번호로 답변                                            |
| `sduck answer <questionId> --text <answer>`                    | free-text 답변                                                        |
| `sduck brief [--json]`                                         | implementation brief 렌더링                                           |
| `sduck confirm`                                                | 준비된 brief 확정 및 baseline 기록                                    |
| `sduck trace [--base <ref>] [--json]`                          | confirm 이후 변경된 구현 파일 기록                                    |
| `sduck evaluate --check "name=outcome"`                        | 최신 trace의 evaluation evidence 기록. 명령은 실행하지 않음           |
| `sduck graph show <TASK-*\|DEC-*> [--depth N] [--json]`        | 재빌드 가능한 local SQLite graph projection에서 bounded 관계 조회     |
| `sduck remember`                                               | 재사용을 위한 graph artifact export                                   |
| `sduck recall <query...>`                                      | 과거 confirmed decision/trace 검색                                    |
| `sduck close`                                                  | guided trace evaluation 이후 현재 task를 CLOSED로 표시                |
| `sduck abandon`                                                | 현재 v2 task를 ABANDONED로 표시                                       |

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
- **Context pack**: agent에게 전달되는 관련 파일, 과거 결정, trace, prompt, draft schema입니다.
- **Guided grill**: `work`가 자동 시작하고 `grill complete`로 완료하는 clarification/interview 단계입니다.
- **Brief**: problem, decision, question, evidence, expected/avoided scope, implementation plan, verification plan을 묶은 구현 전 요약입니다.
- **Confirmation baseline**: `sduck confirm`이 `trace`를 위해 기록하는 Git baseline입니다.
- **Trace**: confirmed decision과 실제 구현 파일의 연결 기록입니다.
- **Evaluation**: 최신 trace에 대해 기록하는 근거입니다. 명령을 실행하지 않습니다.
- **Graph projection**: `graph show`로 조회하는 재빌드 가능한 local SQLite 관계입니다. Markdown이 canonical입니다.
- **Memory**: `remember`로 export되고 `recall`로 검색되는 과거 confirmed decision/trace입니다.

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
- Legacy v1/SDD behavior는 compatibility-only이며 localize하지 않습니다.

## License

MIT. [LICENSE](LICENSE)를 참고하세요.
