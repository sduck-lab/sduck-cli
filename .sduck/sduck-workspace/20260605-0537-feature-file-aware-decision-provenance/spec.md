# [feature] file aware decision provenance

> **작업 타입:** `feature` (Standard Feature)
> **작성자:** taehee
> **작성일:** 2026-06-05
> **연관 티켓:** -

---

## 1. 배경 및 목적

### 문제 / 요구사항

이전 작업 `decision-driven-sdd-gates`에서 `.decision` v2는 task, decision, question, evidence, brief, implementation plan, trace, remember graph, FTS search를 구조화해 저장할 수 있게 되었다.

하지만 agent가 실제로 코드를 수정하기 전 “내가 수정하려는 파일과 관련된 과거 의사결정/계획/trace가 무엇인지”를 안정적으로 가져오는 UX는 아직 약하다.

현재 가능한 접근은 다음처럼 여러 명령을 조합하는 방식이다.

```text
sduck context --json
sduck search "query" --json
sduck brief --json
sduck plan --json
```

이 방식은 텍스트 검색에는 유용하지만, 파일 수정 전에 필요한 질문에는 덜 직접적이다.

```text
src/core/v2/trace.ts를 수정하려고 한다.
→ 이 파일에 적용되는 prior decision은 무엇인가?
→ 이 파일을 피하라고 한 avoid decision은 있는가?
→ 이 파일을 바꾼 과거 trace와 그 decision_to_code_map은 무엇인가?
→ 이번 draft에 CARRIED/CONFLICT decision으로 제안해야 할 것은 무엇인가?
```

목표는 FTS 검색을 대체하는 것이 아니라, 저장된 provenance를 기준으로 **file-aware decision recall**을 제공하는 것이다.

### 기대 효과

- agent가 파일을 수정하기 전에 관련 decision, plan, trace를 자동 확인할 수 있다.
- 같은 의사결정 질문을 반복하지 않고 `CARRIED` draft로 제안할 수 있다.
- 수정 예정 파일이 과거 `avoids` 대상이면 사전에 warning을 받을 수 있다.
- 과거 trace의 `decisionToCodeMap`을 근거로 “이 파일은 어떤 decision과 연결된 적 있는가”를 확인할 수 있다.
- FTS fallback 결과와 explicit provenance 결과를 구분해 false confidence를 줄인다.

---

## 2. 기능 명세

### 사용자 스토리

```text
As a coding agent,
I want to retrieve decisions, plans, and traces related to the files I am about to edit,
So that I can preserve prior architectural intent and avoid contradicting stored decisions.
```

### 수용 기준 (Acceptance Criteria)

> 모든 항목이 충족되어야 이 작업이 완료(Done)로 간주된다.

- [x] AC1: `sduck impact <file...>` 명령이 추가되어 하나 이상의 파일 경로에 대한 file-aware provenance를 출력한다.
- [x] AC2: `sduck impact <file...> --json`은 agent가 소비하기 쉬운 structured JSON을 반환한다.
- [x] AC3: impact 결과는 `decisions.appliesTo` exact/prefix match를 direct decision으로 반환한다.
- [x] AC4: impact 결과는 `decisions.avoids` exact/prefix match를 avoid warning으로 반환한다.
- [x] AC5: impact 결과는 `implementation_plans.targetFiles`와 `implementation_plans.steps[].targetFiles` match를 related plan으로 반환한다.
- [x] AC6: impact 결과는 `implementation_traces.filesChanged`와 `implementation_traces.decisionToCodeMap[].files` match를 related trace/provenance로 반환한다.
- [x] AC7: 각 결과 item은 `matchSource`, `confidence`, `explanation`을 포함해 explicit provenance와 fallback search를 구분한다.
- [x] AC8: structured match가 부족하면 FTS search fallback을 수행하되, fallback 결과는 낮은 confidence와 `fts_fallback` source로 표시한다.
- [x] AC9: `context` 또는 agent rule은 “수정 예정 파일이 명확하면 `sduck impact <file...> --json`을 먼저 실행하라”는 안내를 포함한다.
- [x] AC10: 과거 decision은 자동 확정하지 않고 impact 결과를 draft의 `retrievedPriorDecisions` 또는 `CARRIED` proposal 근거로만 사용한다.
- [x] AC11: line-level causality(`why file:line`)와 embedding/vector search는 이번 범위에서 제외한다.
- [x] AC12: unit/e2e 테스트가 exact match, avoid warning, trace decision-to-code map, plan targetFiles, FTS fallback, JSON output을 검증한다.

### Cycle 2 release-hardening 수용 기준

Review 결과, v2 release 전에 아래 안정성 문제가 추가 완료 조건으로 확인되었다. 이 cycle은 기존 file-aware provenance 기능을 폐기하지 않고, 그 기능이 안전한 v2 workflow 위에서 동작하도록 hardening한다.

- [x] AC13: `close`와 `abandon`은 terminal status로 전환하면서 current task를 clear하여 이후 current-task 기반 mutation이 닫힌 task에 적용되지 않는다.
- [x] AC14: `submit`, `context add`, `answer`, `trace`, `remember`, `confirm` 등 task mutation command는 공통 mutable-current-task guard를 거치며, `CLOSED`/`ABANDONED` task에는 실패한다.
- [x] AC15: terminal task mutation 방지는 unit/e2e 테스트로 검증한다. 최소한 close 이후 submit 불가, close 이후 trace 불가, abandon 이후 mutation 불가, close/abandon 이후 status/current-task 동작을 포함한다.
- [x] AC16: user-supplied `decision.id`, `question.id`, `evidence.id` 저장은 기존 row를 overwrite하지 않는다. `INSERT OR REPLACE`류 upsert를 제거하고 duplicate id는 명시적 conflict error로 처리한다.
- [x] AC17: duplicate id 방지는 같은 task와 다른 task 시나리오 모두에서 기대 동작이 명확하며, 기존 row가 보존됨을 decision/question/evidence 테스트로 검증한다. MVP 정책은 global duplicate id reject다.
- [x] AC18: v2 CLI command execution은 project-root/worktree aware하다. repo 하위 디렉터리 또는 git worktree 안에서 실행해도 동일한 project `.decision` store를 사용하며, `init`의 root 정책은 문서/테스트로 명확하다.
- [x] AC19: path target matcher 정책은 exact path, directory prefix, glob `**` 지원 여부가 명확하고 `impact`와 `trace`가 동일한 shared matcher를 사용한다. 이번 cycle의 권장 정책은 glob `src/foo/**` 공식 지원이다.
- [x] AC20: path matcher는 exact, directory prefix, glob, broad target 방어, path traversal 방어를 테스트한다.
- [x] AC21: `BRIEF_READY` workflow 정책을 확정한다. 유지하는 경우 submit/answer 이후 readiness 갱신 call site를 연결하고, unresolved question이 있으면 confirm을 금지한다. 제거/축소하는 경우 타입/문서/테스트 불일치를 없앤다.
- [x] AC22: release runtime 정책은 Node `>=22.13` 기준으로 명확하다. 가능하면 unsupported Node에서 친절한 error를 제공하거나, 최소한 README/CI/test command가 Node 22.13+ 실행을 명시한다.
- [x] AC23: 검증은 Node 22.13+에서 `npm run lint`, `npm run typecheck`, `npm run test:unit`, `npm run test:e2e`, `npm run build`로 수행하며 v2 테스트가 runtime 때문에 skip되지 않는지 확인한다.

### Cycle 3 init agent-rails 수용 기준

사용자 기대 UX는 “repo에서 `sduck init` 한 번 실행하면 LLM agent가 이후 작업 요청을 받을 때 `.decision` workflow를 알아서 따른다”이다. Cycle 3는 이 기대를 명시적 설치물과 테스트 가능한 init 동작으로 강화한다.

- [x] AC24: `sduck init`은 `.decision` store뿐 아니라 agent-facing instruction을 설치하거나 업데이트한다. 최소 설치 대상은 repo-local `AGENTS.md` 또는 동등한 agent instruction file이다.
- [x] AC25: 설치되는 instruction에는 agent가 사용자 작업 요청을 받았을 때 따라야 하는 v2 rails가 포함된다: `sduck status/context`, target files known이면 `sduck impact <file...> --json`, draft submit, open question ask/answer gate, brief/confirm gate, implementation, trace, remember, close.
- [x] AC26: instruction은 idempotent해야 한다. `sduck init`을 여러 번 실행해도 중복 block을 만들지 않고 sduck-managed block만 갱신한다.
- [x] AC27: 기존 사용자 문서가 있으면 보존한다. sduck-managed block 밖의 내용을 삭제하거나 재정렬하지 않는다.
- [x] AC28: agent instruction 설치를 원치 않는 project를 위해 opt-out 또는 no-agent 옵션을 제공한다. 기본 UX는 설치 enabled다.
- [x] AC29: `runInitCommand` human output은 agent rails 설치/업데이트 결과와 다음 UX를 명확히 보여준다. 예: “Agent instructions installed/updated. Now ask your coding agent for work.”
- [x] AC30: tests는 fresh init, existing `AGENTS.md` update, idempotent repeated init, opt-out init, CLI output을 검증한다.
- [x] AC31: README는 `sduck init` 이후 사용자가 직접 CLI 세부 흐름을 몰라도 agent가 rails를 따른다는 UX를 설명하고, 설치되는 instruction file과 opt-out 정책을 문서화한다.

### 기능 상세 설명

#### 핵심 개념

이 기능은 “자동 추론”이 아니라 “저장된 provenance 기반 recall”이다.

가능한 match source 예:

```text
decision.appliesTo
decision.avoids
implementation_plan.targetFiles
implementation_plan.step.targetFiles
implementation_trace.filesChanged
implementation_trace.decisionToCodeMap
fts_fallback
```

각 결과는 다음 정보를 포함한다.

```text
file
entityType
entityId
taskId
title/summary
matchSource
confidence
explanation
```

#### 추천 CLI

```bash
sduck impact src/core/v2/trace.ts
sduck impact src/core/v2/trace.ts src/core/v2/store.ts --json
```

#### Cycle 3 init UX

권장 사용자 경험은 다음과 같다.

```bash
sduck init
```

이후 사용자는 agent에게 자연어로 요청한다.

```text
결제 retry 로직 추가해줘.
```

agent는 `sduck init`이 설치한 repo-local instruction을 읽고 다음 rails를 따른다.

```text
status/context → impact when files known → submit draft → ask/answer unresolved questions → brief/confirm → implement → trace/remember → close
```

사용자가 매번 CLI sequence를 기억하는 것이 목표가 아니다. CLI는 agent가 안전하게 decision/provenance/trace를 다루는 rails다.

#### JSON 반환 예시

```json
{
  "files": ["src/core/v2/trace.ts"],
  "directDecisions": [
    {
      "file": "src/core/v2/trace.ts",
      "decisionId": "DEC-trace-gate",
      "taskId": "TASK-id",
      "matchSource": "decision.appliesTo",
      "confidence": 0.9,
      "explanation": "Decision appliesTo matched this file path."
    }
  ],
  "avoidWarnings": [],
  "plans": [],
  "traces": [],
  "provenance": [
    {
      "file": "src/core/v2/trace.ts",
      "decisionId": "DEC-no-fake-trace",
      "traceId": "IMPL-1",
      "matchSource": "implementation_trace.decisionToCodeMap",
      "confidence": 1,
      "explanation": "Past trace explicitly mapped this decision to this file."
    }
  ],
  "fallbackSearch": []
}
```

#### 범위 제외

- line-level `sduck why <file:line>` 구현
- code diff hunk/span 저장 테이블
- embedding/vector search
- graph query language 또는 graph traversal engine
- prior decision 자동 승인
- LLM 기반 causality inference 내장

---

## 3. 기술 설계

### 변경 대상 컴포넌트

| 레이어          | 파일 / 모듈                               | 변경 내용 요약                                               |
| --------------- | ----------------------------------------- | ------------------------------------------------------------ |
| CLI entry       | `src/cli.ts`                              | `impact <file...> [--json]` 명령 추가                        |
| Command wrapper | `src/commands/v2/index.ts`                | `runImpactCommand(projectRoot, files, asJson)` 추가          |
| Core            | 신규 `src/core/v2/impact.ts`              | file-aware provenance 조회, ranking, fallback search 구현    |
| Search          | `src/core/v2/search.ts`                   | impact fallback에서 재사용 가능한 search helper 확인/보강    |
| Plan            | `src/core/v2/plan.ts`                     | plan row list/map helper가 impact에서 사용 가능해야 함       |
| Trace           | `src/core/v2/trace.ts`                    | trace list/map helper가 impact에서 사용 가능해야 함          |
| Render          | `src/ui/v2/render.ts`                     | `renderImpact()` human output 추가                           |
| Types           | `src/types/index.ts`                      | `ImpactResult`, `ImpactItem`, `ImpactMatchSource` 타입 추가  |
| Context         | `src/core/v2/context.ts`                  | draft schema/prompt에 impact 사용 안내 추가 가능             |
| Agent rules     | `.sduck/sduck-assets/agent-rules/core.md` | 수정 예정 파일이 명확하면 impact를 먼저 실행하라는 rule 추가 |
| Tests           | `tests/unit/v2-core.test.ts`              | impact core match/ranking 테스트 추가                        |
| Tests           | `tests/e2e/v2-cli.test.ts`                | `sduck impact --json` CLI 테스트 추가                        |

### 데이터 모델 변경

MVP는 schema 변경 없이 기존 structured JSON fields를 사용한다.

사용할 기존 데이터:

```text
decisions.applies_to_json
decisions.avoids_json
implementation_plans.target_files_json
implementation_plans.steps_json[].targetFiles
implementation_traces.files_changed_json
implementation_traces.decision_to_code_map_json[].files
decision_search_index
```

향후 line-level causality가 필요해지면 별도 작업에서 다음 테이블을 검토한다.

```text
code_change_spans
  id
  trace_id
  task_id
  decision_id
  plan_id
  file_path
  old_start
  old_lines
  new_start
  new_lines
  change_summary
  match_source
  confidence
  created_at
```

### Match / ranking 정책

1. Exact file match
   - `target === file`
   - confidence: `1.0` for trace decisionToCodeMap, `0.9` for appliesTo/plan, `0.95` for avoids warning
2. Prefix/module match
   - `file.startsWith(targetDir)` 또는 `target.startsWith(fileDir)`
   - confidence: `0.6 ~ 0.75`
3. Glob match
   - `src/foo/**`는 `src/foo/` 아래 파일 전체에 match한다.
   - glob syntax는 shared matcher에서 `impact`와 `trace`가 동일하게 해석한다.
   - broad target(`**`, `src/**` 등)과 traversal(`../`, absolute path)은 안전하게 reject하거나 낮은 신뢰도로 제한한다.
4. Historical trace match
   - filesChanged match는 “이 파일이 과거 같이 바뀜”으로 표시하고 decision cause로 단정하지 않는다.
5. FTS fallback
   - path tokens로 `searchMemoryWithDb()` 수행
   - confidence: `0.25 ~ 0.4`

### Cycle 2 release-hardening 설계 정책

#### Terminal task mutability

- `CLOSED`와 `ABANDONED`는 terminal status다.
- `close`/`abandon` 이후 current task id는 clear되어야 한다.
- current task가 없으면 mutation command는 새 task 생성을 요구하거나 명확한 error를 반환한다.
- terminal task id를 명시 target으로 받는 command가 있다면 동일하게 mutation을 거부한다.

#### User-supplied id collision

- v2 DB의 `decisions`, `questions`, `evidence`는 기존 row를 history로 간주한다.
- user-supplied id가 이미 존재하면 overwrite하지 않고 conflict error를 반환한다.
- 이번 cycle에서는 schema churn을 줄이기 위해 `(task_id, id)` 복합키 변경보다 global duplicate id reject를 우선한다.

#### Project root/worktree policy

- `init`은 명시적으로 현재 디렉터리에 `.decision`을 생성하는 bootstrap command로 유지할 수 있다.
- `status`, `context`, `submit`, `trace`, `remember`, `impact`, `recall` 등 기존 project state를 읽거나 쓰는 command는 repo root 또는 worktree root를 resolve한 뒤 `.decision` store를 사용한다.
- nested directory에서 실행해도 repo root의 `.decision`을 사용해야 하며 별도 `.decision`을 암묵 생성하면 안 된다.

#### Brief readiness policy

- `BRIEF_READY`를 유지한다면 open question이 없는 경우에만 brief confirmation으로 넘어갈 수 있다.
- unresolved question이 남아 있으면 `confirm`은 실패해야 한다.
- submit/answer 후 readiness 갱신이 필요한 경우 call site를 명시적으로 연결한다.

#### Cycle 3 init agent-rails policy

- `sduck init`은 기본적으로 repo-local `AGENTS.md`에 sduck-managed block을 설치한다.
- managed block은 marker로 감싼다.

```markdown
<!-- sduck:v2-agent-rails:begin -->

...

<!-- sduck:v2-agent-rails:end -->
```

- file이 없으면 생성한다.
- file이 있으면 marker 안쪽만 교체하고 marker 밖 사용자 내용을 보존한다.
- marker가 없으면 기존 파일 끝에 block을 append한다.
- `--no-agent` 또는 동등한 opt-out 옵션은 `.decision` init만 수행하고 agent instruction file은 건드리지 않는다.
- 설치 block은 특정 agent vendor에 과도하게 묶이지 않는 repo-local instruction이어야 한다. Claude/ChatGPT/Codex 등 대부분의 coding agent가 읽을 수 있는 `AGENTS.md`를 우선한다.
- block에는 다음 MUST rule을 포함한다.
  - 작업 전 `sduck status`와 `sduck context --json`을 확인한다.
  - 수정 예정 파일이 명확하면 구현 전 `sduck impact <file...> --json`을 실행한다.
  - impact 결과는 prior decision 자동 확정이 아니라 `CARRIED`/`CONFLICT` proposal 근거로 사용한다.
  - draft는 `sduck submit --stdin`으로 제출한다.
  - open question이 있으면 구현/confirm 전에 사용자에게 묻고 `sduck answer`로 기록한다.
  - `sduck confirm` 전 unresolved question이 없어야 한다.
  - 구현 후 `sduck trace`, `sduck remember`, 완료 시 `sduck close`를 실행한다.
  - `CLOSED`/`ABANDONED` task에는 mutation하지 않는다.

### 시퀀스 다이어그램

```text
Agent → sduck impact src/core/v2/trace.ts --json
CLI → impact core
impact core → decisions appliesTo/avoids structured match
impact core → plans targetFiles structured match
impact core → traces filesChanged/decisionToCodeMap structured match
impact core → FTS fallback if useful
CLI → ImpactResult JSON
Agent → draft retrievedPriorDecisions / CARRIED decisions / blocking conflicts
```

---

## 4. UI/UX 명세

CLI 전용 UX다.

### Human output

```text
Impact for src/core/v2/trace.ts

Direct decisions:
  - DEC-trace-gate [decision.appliesTo, 0.90] trace requires confirmed brief

Avoid warnings:
  - none

Related plans:
  - PLAN-trace [implementation_plan.targetFiles, 0.90]

Historical traces:
  - IMPL-1 [implementation_trace.filesChanged, 0.70]

Provenance:
  - DEC-no-fake-trace via IMPL-1 [implementation_trace.decisionToCodeMap, 1.00]

Fallback search:
  - none
```

### JSON output

`--json`은 agent가 그대로 draft 생성에 사용할 수 있게 stable key를 제공한다.

---

## 5. 테스트 계획

### 단위 테스트 (Unit Test)

| 대상 함수 / 모듈     | 테스트 케이스                            | 예상 결과                                     |
| -------------------- | ---------------------------------------- | --------------------------------------------- |
| `impact` core        | decision appliesTo exact file            | direct decision 반환                          |
| `impact` core        | decision avoids exact file               | avoid warning 반환                            |
| `impact` core        | plan targetFiles exact file              | related plan 반환                             |
| `impact` core        | plan step targetFiles exact file         | related plan item 반환                        |
| `impact` core        | trace filesChanged exact file            | historical trace 반환                         |
| `impact` core        | decisionToCodeMap exact file             | provenance item 반환, confidence 1            |
| `impact` core        | structured match 없음                    | FTS fallback item 반환                        |
| `impact` core        | duplicate source                         | stable dedupe 및 source 유지                  |
| v2 task guard        | close/abandon 이후 mutable command       | 명확한 실패, 기존 terminal task 미변경        |
| v2 draft persistence | duplicate decision/question/evidence id  | conflict error, 기존 row 보존                 |
| v2 root resolver     | nested directory 실행                    | repo root `.decision` 사용                    |
| shared path matcher  | exact/prefix/glob/traversal/broad target | 일관된 match 또는 안전한 reject               |
| brief workflow       | unresolved question 상태의 confirm       | confirm 실패                                  |
| init agent rails     | fresh init                               | `AGENTS.md` 생성 및 managed block 포함        |
| init agent rails     | existing `AGENTS.md`                     | 사용자 내용 보존, managed block append/update |
| init agent rails     | repeated init                            | managed block 중복 없음                       |
| init agent rails     | opt-out init                             | agent instruction file 미생성/미변경          |

### 통합 / E2E 테스트

| 시나리오        | 단계                                                            | 예상 결과                               |
| --------------- | --------------------------------------------------------------- | --------------------------------------- |
| impact CLI JSON | init/work/submit/confirm/trace/remember 후 `impact file --json` | JSON parse 가능, direct/provenance 포함 |
| impact human    | `impact file`                                                   | Direct decisions/Provenance 섹션 출력   |
| avoid warning   | avoids 대상 파일 impact                                         | Avoid warnings 출력                     |
| terminal task   | close 이후 submit/trace                                         | 실패하고 current task 없음              |
| abandoned task  | abandon 이후 mutation                                           | 실패하고 status/current-task 동작 명확  |
| nested cwd      | repo 하위 디렉터리에서 status/context/submit                    | repo root `.decision` 사용              |
| packaged CLI    | `dist/cli.js` 기준 help/basic flow                              | Node 22.13+에서 동작                    |
| init UX         | `sduck init` fresh/existing/opt-out                             | agent rails 설치 결과와 output 검증     |

### 검증 명령

```text
npm run typecheck
npm run lint
npm run test:unit
npm run test:e2e
npm run build
```

---

## 6. 영향 범위 분석

### 변경 파일 목록 (예상)

```text
target_paths:
  - src/cli.ts
  - src/commands/v2/index.ts
  - src/core/v2/impact.ts
  - src/core/v2/search.ts
  - src/core/v2/plan.ts
  - src/core/v2/trace.ts
  - src/core/v2/task.ts
  - src/core/v2/state.ts
  - src/core/v2/draft.ts
  - src/core/v2/decision.ts
  - src/core/v2/question.ts
  - src/core/v2/evidence.ts
  - src/core/v2/path-matcher.ts
  - src/core/v2/agent-rails.ts
  - src/core/v2/workspace.ts
  - src/core/project-paths.ts
  - src/ui/v2/render.ts
  - src/types/index.ts
  - src/core/v2/context.ts
  - src/core/v2/brief.ts
  - .sduck/sduck-assets/agent-rules/core.md
  - README.md
  - .github/workflows/ci.yml
  - tests/unit/v2-core.test.ts
  - tests/e2e/v2-cli.test.ts
```

### 사이드 이펙트 검토

- 영향 가능성 있는 모듈:
  - v2 CLI command routing
  - v2 current task lifecycle and terminal statuses
  - v2 draft persistence and sqlite constraints
  - project root resolution in worktrees/nested cwd
  - search fallback
  - plan/trace list helper
  - agent rule auto-generation
  - init-created repo-local agent instruction file
- 회귀 테스트 필요 영역:
  - 기존 `search`/`recall` 결과
  - `remember` graph export
  - existing v2 CLI full flow

### 롤백 계획

- schema 변경 없이 새 command/core만 추가하므로 rollback은 `impact` 관련 파일/route 제거로 가능하다.
- FTS fallback은 existing search helper를 재사용하므로 search 자체를 변경하지 않는 방향으로 구현한다.

---

## 7. 보안 / 성능 고려사항

- **입력값 검증:** file path는 project-relative path로 normalize하고, 절대 경로나 `..` traversal은 표시용 문자열로만 다루거나 안전하게 정규화한다.
- **Mutation safety:** terminal task는 immutable이어야 하며, current task가 terminal에 남아 mutation되는 상태를 방지한다.
- **History integrity:** user-supplied id collision은 기존 decision/question/evidence history overwrite로 이어지면 안 된다.
- **성능:** MVP는 SQLite JSON field scan으로 충분하다. 데이터가 커지면 generated index 또는 normalized relation table을 후속 검토한다.
- **정확성:** FTS fallback은 낮은 confidence로 표시하고 explicit provenance와 섞어 단정하지 않는다.
- **민감 데이터:** 로컬 `.decision` DB만 조회하며 외부 전송 없음.
- **문서 보존:** init은 기존 agent/user 문서의 sduck-managed block 밖 내용을 보존해야 한다.

---

## 8. 비기능 요구사항

| 항목                     | 요구사항                                                          |
| ------------------------ | ----------------------------------------------------------------- |
| Agent usability          | `--json` output은 stable key와 matchSource/confidence를 포함한다. |
| Explainability           | 모든 match는 explanation을 포함한다.                              |
| Backward compatibility   | 기존 v2 명령어 의미를 변경하지 않는다.                            |
| No false approval        | impact 결과는 decision을 자동 confirm하지 않는다.                 |
| Immutable terminal tasks | CLOSED/ABANDONED task에 mutation을 허용하지 않는다.               |
| No history overwrite     | duplicate user id는 기존 row overwrite 대신 conflict 처리한다.    |
| Agent bootstrap          | `sduck init` 이후 agent가 workflow rails를 발견할 수 있어야 한다. |
| Minimal scope            | line-level why/embedding/graph query는 제외한다.                  |

---

## 9. 의존성 및 선행 조건

- 선행 작업: `20260604-0559-feature-decision-driven-sdd-gates`의 `.decision` v2 gate/search/plan/trace 기반이 필요하다.
- 현재 새 worktree는 `sduck-verison-2`에서 생성되었으므로, 구현 시점에는 선행 작업 변경이 base branch에 반영되어 있거나 이 작업을 선행 작업 branch 위에 stack해야 한다.
- 외부 서비스/API 연동 없음.
- Node `>=22.13` 필요.
- Cycle 2 검증은 Node 22.13+ 런타임에서 수행한다.
- Cycle 3 init agent-rails 설치는 외부 API 없이 local file write만 수행한다.

---

## 10. 미결 사항 (Open Questions)

- [x] 명령 이름은 plan 단계에서 `impact`로 확정했다. `search --file` 옵션은 이번 범위에서 제외한다.
- [x] context pack 자동 포함은 별도 입력 UX가 필요하므로 이번 범위에서는 agent rule 안내와 explicit `impact` command로 처리했다.

---

## 11. 참고 자료

- 이전 작업: `20260604-0559-feature-decision-driven-sdd-gates`
- oracle assessment: “structured file-aware recall over existing decision/plan/trace data”로 좁히면 high value / manageable complexity
- 관련 저장 필드:
  - `decisions.applies_to_json`
  - `decisions.avoids_json`
  - `implementation_plans.target_files_json`
  - `implementation_plans.steps_json`
  - `implementation_traces.files_changed_json`
  - `implementation_traces.decision_to_code_map_json`

---

## 12. Spec 자체 평가

평가 기준: `.sduck/sduck-assets/eval/spec.yml`

| 기준                | 점수(1-5) | 근거                                                                             |
| ------------------- | --------- | -------------------------------------------------------------------------------- |
| problem_clarity     | 5         | 수정 예정 파일과 prior decision/provenance retrieval 문제를 명확히 정의했다.     |
| scope_definition    | 5         | impact command 중심 MVP와 line-level/embedding/graph query 제외 범위를 명시했다. |
| completion_criteria | 5         | AC1-AC12가 command, match source, output, test 기준으로 검증 가능하다.           |
| feasibility         | 4         | 기존 저장 필드로 구현 가능하나 선행 작업 변경이 base에 반영되어야 한다.          |
| risk_coverage       | 5         | false confidence, path match, FTS fallback, 자동 승인 금지를 다뤘다.             |
| testability         | 5         | unit/e2e 테스트 케이스와 검증 명령이 구체적이다.                                 |

총평: 이 spec은 파일 기준 provenance-aware recall을 좁은 범위로 정의하며, 선행 `.decision` v2 구조 위에서 구현 가능한 후속 작업이다.

### Cycle 2 spec 자체 평가

평가 기준: `.sduck/sduck-assets/eval/spec.yml`

| 기준                | 점수(1-5) | 근거                                                                                                                                                                |
| ------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| problem_clarity     | 5         | review에서 발견된 release-hardening 결함을 terminal mutability, id collision, root resolution, matcher inconsistency, brief workflow, runtime readiness로 분리했다. |
| scope_definition    | 4         | P0/P1/P2 범위와 제외 원칙은 명확하지만, root/worktree policy와 BRIEF_READY 유지 여부는 plan에서 최종 선택이 필요하다.                                               |
| completion_criteria | 5         | AC13-AC23이 command behavior, persistence safety, matcher semantics, runtime verification으로 검증 가능하다.                                                        |
| feasibility         | 4         | 대부분 기존 v2 core/CLI/test 구조에서 처리 가능하지만, SDD CLI와 v2 CLI가 같은 package에 공존하는 현재 상태는 작업 운영 리스크가 있다.                              |
| risk_coverage       | 5         | data overwrite, terminal mutation, cwd/worktree confusion, path traversal/broad target, Node runtime mismatch를 포함했다.                                           |
| testability         | 5         | unit/e2e 및 Node 22 검증 명령을 구체화했다.                                                                                                                         |

총평: Cycle 2 spec은 기존 file-aware provenance 기능의 release-blocking 안정성 문제를 명확한 완료 조건으로 전환한다. 구현 전 plan에서 상태 guard, SQLite duplicate policy, root resolver, path matcher 세부 설계를 확정해야 한다.

### Cycle 3 spec 자체 평가

평가 기준: `.sduck/sduck-assets/eval/spec.yml`

| 기준                | 점수(1-5) | 근거                                                                                                          |
| ------------------- | --------- | ------------------------------------------------------------------------------------------------------------- |
| problem_clarity     | 5         | 사용자가 기대한 “init하면 agent가 알아서 rails를 따른다” UX gap을 명확히 정의했다.                            |
| scope_definition    | 5         | 기본 설치 대상(`AGENTS.md`), managed block/idempotency/opt-out/README/tests 범위를 명시했다.                  |
| completion_criteria | 5         | AC24~AC31이 fresh/existing/idempotent/opt-out/output/docs 테스트로 검증 가능하다.                             |
| feasibility         | 5         | 현재 `initDecisionWorkspace`와 `runInitCommand`에 agent instruction writer를 추가하는 작은 확장으로 가능하다. |
| risk_coverage       | 5         | 사용자 문서 보존, 중복 block 방지, vendor lock-in 최소화, opt-out 요구를 포함했다.                            |
| testability         | 5         | unit/e2e 검증 시나리오가 명확하다.                                                                            |

총평: Cycle 3 spec은 CLI 자체보다 agent bootstrap UX를 강화한다. `sduck init`이 `.decision` 저장소와 함께 repo-local instruction rails를 설치해, 사용자가 CLI sequence를 외우지 않아도 agent가 안전한 workflow를 발견하도록 만든다.
