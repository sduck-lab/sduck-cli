# sduck 유즈케이스

sduck는 코딩 에이전트와 함께 일하는 팀을 위한 Git-native decision harness다. 이 문서는 팀이 실사용에서 마주치는 대표 시나리오를 유즈케이스로 정리한다. 각 유즈케이스는 실제 CLI 명령 시퀀스와 시스템이 보장하는 결과를 기준으로 작성했으며, 모두 현재 테스트 스위트가 커버하는 동작이다.

행위자 정의: **개발자**(작업을 시작하고 질문에 답하는 사람), **코딩 에이전트**(Claude Code, Codex, OpenCode, Gemini CLI, Cursor, Antigravity 등 `sduck context`를 읽고 draft를 제출하는 도구), **리뷰어**(PR에서 decision diff를 검토하는 사람), **팀 리드**(pilot 지표와 Go/No-Go를 판단하는 사람).

---

## UC-1. 신규 기능을 decision brief와 함께 개발한다

**행위자**: 개발자, 코딩 에이전트
**전제조건**: 저장소에 `sduck init` 완료, git work tree 존재
**트리거**: 중간 이상 복잡도의 기능 요청이 들어옴

**기본 흐름**

1. 개발자가 작업을 시작한다: `sduck work "add payment retry support"`
2. 에이전트가 컨텍스트를 읽는다: `sduck context` — 관련 파일, 과거 confirmed decision, 이전 구현 trace, draft 스키마가 출력된다.
3. 새 정책 task에서는 작은 작업이라도 에이전트가 출력된 질문 프로토콜을 따르고 `sduck grill complete --reason "..."`로 완료를 기록한다. `sduck grill-me`는 compatibility prompt/start command일 뿐 completion gate가 아니다.
4. 에이전트가 코드베이스를 탐색한 뒤 구조화된 draft를 제출한다: `sduck submit --stdin < draft.json` (decision, question, evidence, expected/avoid scope와 implementation/verification plan 포함)
5. 개발자가 열린 질문을 확인하고 답한다: `sduck ask` → `sduck answer QUESTION-1 --option 1` 또는 `--text "..."`
6. 모든 질문이 답변되고 OPEN/CONFLICT decision이 해소되면 task가 `BRIEF_READY`로 승격된다.
7. 개발자가 brief를 검토하고 확정한다: `sduck brief` → `sduck confirm` — DRAFT decision이 CONFIRMED로 승격되고 Git baseline이 기록된다.
8. 에이전트가 구현하고, 완료 후 `sduck trace`로 confirm 이후 변경된 실제 구현 파일(커밋됨/스테이징/미스테이징/신규 모두)을 decision에 매핑한다.
9. 실제 project check를 별도로 실행하고 `sduck evaluate --check "tests=passed"`로 결과를 최신 trace에 기록한다.
10. `sduck memory status`를 확인하고 현재 task가 missing/stale이면 agent가 `sduck memory distill --stdin`으로 source-backed Capsule을 갱신한다.
11. `sduck remember`로 재사용 가능한 graph export를 남기고 `sduck close`로 종료한다.

**보장되는 결과**

- status를 명시하지 않은 기본값 DRAFT decision도 confirm 후 trace/recall에 유지된다.
- `sduck init`으로 생성된 새 `.decision` workspace의 task는 `sduck grill complete` 전에는 submit/confirm이 거부된다. 기존 policy 없는 workspace/task는 legacy/permissive로 유지된다.
- `sduck config locale en|ko`는 user-global v2 표시 설정이며 JSON output과 canonical Markdown artifact를 바꾸지 않는다. Legacy SDD command output은 영어로 유지된다.
- trace에는 `.decision/`, `.sduck/` 등 하네스 상태와 생성물이 섞이지 않는다.

**예외 흐름**

- 4a. 열린 질문이 남은 채 `sduck confirm` 실행 → 명확한 오류로 거부되고 **canonical source는 바이트 단위로 변경되지 않는다.**
- 5a. CONFLICT decision이 미해결 → task는 OPEN에 머물고 confirm이 거부된다.
- 3a. grill completion 없이 `submit` 또는 `confirm` 실행 → `sduck grill complete --reason "..."`를 기록하라는 명확한 오류로 거부된다.

---

## UC-2. 과거 결정을 재사용해 반복 작업을 줄인다

**행위자**: 개발자, 코딩 에이전트
**전제조건**: 같은 저장소에서 이전 task들이 confirm/close됨
**트리거**: 유사 영역의 새 작업 시작

**기본 흐름**

1. `sduck work "extend payment retry to refunds"`
2. `sduck recall "payment retry"` — 일치하는 Memory Capsule이 먼저 검색되고, Capsule이 없는 task의 confirmed decision과 구현 trace가 fallback으로 검색된다.
3. `sduck context` — 새 task의 컨텍스트 팩에 일치하는 Capsule이 우선 포함되어 에이전트가 compact memory를 사용하고 기존 결정을 위반하지 않는 draft를 만든다.

**보장되는 결과**

- recall/context의 raw fallback은 **CONFIRMED decision만** 노출한다. DRAFT/REJECTED/SUPERSEDED와 ABANDONED task의 결정·Capsule은 현재 결정처럼 보이지 않는다.
- context 파일 탐색은 `.gitignore`를 존중한다 — `node_modules`, 빌드 산출물 등 Git이 무시하는 트리는 순회하지 않는다.

---

## UC-3. 여러 에이전트/개발자가 동시에 제출한다

**행위자**: 코딩 에이전트 여러 개 (또는 개발자 + 에이전트 병행)
**전제조건**: 하나의 `.decision` workspace
**트리거**: 병렬 세션에서 동시에 `sduck submit` 실행

**기본 흐름**

1. N개의 프로세스가 동시에 `sduck submit --stdin`을 실행한다.
2. workspace lock(mkdir 기반)이 writer를 직렬화한다. 각 제출은 staging에서 검증·cache rebuild 후 원자적으로 교체된다.

**보장되는 결과**

- 병렬 submit 20회에서 데이터 손실, ID 충돌, `SQLITE_BUSY`/`database is locked` 오류가 없다 (자동 ID는 전부 고유하게 발급).
- lock 획득 실패 시 10초 대기 후 workspace가 다른 process에 의해 잠겨 있음을 알리는 명확한 오류로 실패한다 — 조용한 덮어쓰기가 없다.
- 죽은 프로세스가 남긴 stale lock은 pid 생존 확인 후 자동 정리된다.

---

## UC-4. 잘못된 draft가 원본을 오염시키지 않는다

**행위자**: 코딩 에이전트
**전제조건**: 활성 task 존재
**트리거**: 에이전트가 깨진 참조나 중복 ID가 포함된 draft를 제출

**기본 흐름**

1. 존재하지 않는 decision을 참조하는 question, 또는 기존 `DEC-*`와 중복되는 명시적 ID로 `sduck submit --stdin` 실행.
2. 전체 번들 검증(enum, confidence 범위, 중첩 배열, ID 유일성, 참조 정합성)이 staging 단계에서 실패한다.

**보장되는 결과**

- 명령은 구체적인 필드 경로가 담긴 오류로 실패한다 (예: `question.decisionId: missing decision DEC-...`, `decisions.id: duplicate id DEC-...`).
- **source fingerprint가 제출 전과 동일**하다 — Markdown 원본도 SQLite cache도 변경되지 않아 후속 명령이 깨지지 않는다.

---

## UC-5. 중단된 작업을 재개하거나 정리한다

**행위자**: 개발자
**전제조건**: 비종결(OPEN/BRIEF_READY/CONFIRMED) task가 존재
**트리거**: 며칠 뒤 작업 복귀, 또는 방향 폐기

**기본 흐름**

1. `sduck status`로 현재 task와 질문/결정 수를 확인한다.
2. `sduck resume TASK-20260507-payment-retry`로 이전 task를 current로 선택하고 이어간다.
3. 방향을 접을 때는 `sduck abandon`, 완료 시 `sduck close`.

**보장되는 결과**

- CLOSED/ABANDONED task는 불변이다 — answer/submit/confirm 등 어떤 변경 명령도 상태 기반 guard(`TaskLifecycle`)가 거부한다.
- close/abandon 시 current task 포인터가 정리되어, 이전 task의 질문에 답하려면 명시적 `resume`이 필요하다.

---

## UC-6. 구버전(DB-only) 저장소를 마이그레이션한다

**행위자**: 개발자
**전제조건**: 예전 버전이 남긴, Markdown source 없이 SQLite cache만 있는 workspace
**트리거**: 신규 버전에서 `sduck remember` 또는 임의 명령 실행

**기본 흐름**

1. `sduck doctor` — `DB_ONLY` 진단과 복구 방법이 출력된다.
2. `sduck doctor --repair` 또는 `sduck remember` 실행.
3. legacy cache가 canonical Markdown source로 변환되고 이후 명령이 정상 동작한다.

**보장되는 결과**

- DB-only 상태에서 remember가 오류 없이 동작하며 기존 decision이 보존된다.

---

## UC-7. 손상된 canonical source를 진단·복구한다

**행위자**: 개발자
**전제조건**: 수동 편집·머지 충돌 등으로 `.decision/exports/markdown/**` 파일이 malformed
**트리거**: 이상 동작 감지 또는 정기 점검

**기본 흐름**

1. `sduck doctor` — exit code 1과 함께 문제 파일, 누락 필드(예: `broken.md … task.title`), 구체적 복구 경로가 출력된다.
2. malformed canonical source는 수동으로 수정한다. `sduck doctor --repair`는 malformed source를 자동 수정하지 않는다.
3. source를 수정한 뒤 stale cache라면 `sduck rebuild` 또는 `sduck doctor --repair`로 cache를 재빌드한다. DB-only migration은 UC-6 경로를 따른다.

**보장되는 결과**

- malformed source 진단은 문제 파일과 복구 방향을 알려주지만 source를 고치지 않는다.
- stale cache는 source가 유효할 때 `--repair`로 전체 rebuild 후 교체된다. 진단만으로는 아무것도 변경되지 않는다.

---

## UC-8. 리뷰어가 PR에서 결정 이력을 검토한다

**행위자**: 리뷰어
**전제조건**: `sduck init`된 저장소, decision 변경이 포함된 PR
**트리거**: 코드 리뷰

**기본 흐름**

1. PR diff에서 `.decision/exports/markdown/{tasks,decisions,implementations,memories}/`의 canonical 문서 변경만 확인한다.
2. decision별 파일 분리와 안정적 ID 덕분에 어떤 결정이 추가/승격/폐기됐는지 최소 churn diff로 읽는다.

**보장되는 결과**

- `sduck init`은 `.decision/exports/markdown/{tasks,decisions,implementations,memories}/` 디렉터리를 만들지만 Git은 빈 디렉터리를 추적하지 않는다. `.decision/policy.json`은 init 직후 추적 대상이고, canonical 결정 문서는 generated content가 생긴 뒤 add/commit할 때 추적된다.
- 변경 없는 파일은 commit 단계에서 교체되지 않으므로(내용 동일 시 skip) diff 노이즈가 없다.

---

## UC-9. 에이전트 규칙을 팀 표준으로 배포한다

**행위자**: 팀 리드, 코딩 에이전트
**전제조건**: 없음 (신규 저장소 가능)
**트리거**: 팀에 sduck 도입

**기본 흐름**

1. `sduck init --agents claude-code,codex,opencode` 실행.
2. Claude Code용 `CLAUDE.md`와 `.claude/hooks/sdd-guard.sh`, Codex/OpenCode 공용 `AGENTS.md`(표준 규약, 병합 방식)가 설치된다.
3. 기존 `AGENTS.md`에 사용자가 작성한 내용이 있으면 managed 블록만 갱신되고 사용자 내용은 보존된다 (`--force` 포함).

**보장되는 결과**

- Codex가 표준 `AGENTS.md`에서 규칙을 읽을 수 있다 (`AGENT.md`는 더 이상 생성되지 않음).
- Claude hook은 `current_work_id`의 task에만 개입하고, 완료 근거(evidence) 수정은 허용한다.
- 설치되는 rule/template은 항상 canonical English이며 사용자의 CLI locale에 따라 번역되지 않는다.

---

## UC-10. 레거시 SDD 게이트로 단계 승인을 강제한다

**행위자**: 개발자 (명시적 게이트를 원하는 팀)
**전제조건**: legacy SDD workflow 사용 (`sduck start <type> <slug>`)
**트리거**: spec/plan 승인 절차

**기본 흐름**

1. `sduck start feature payment-retry` → `sduck spec approve` → `sduck plan approve` → `sduck step done <n>` → `sduck review ready` → `sduck done`

**보장되는 결과**

- Step이 비연속(예: Step 1, 3)이거나 존재하지 않는 Step을 완료하려는 plan은 **메타데이터 변경 전에** 거부된다.
- review/evaluation이 placeholder뿐이면 done이 거부된다 — 증거 없는 pass 불가.
- 생성 spec의 작성자는 hardcoded 이름이 아니라 저장소 Git author를 사용한다.

---

## UC-11. CI가 동일한 품질 게이트를 재현한다

**행위자**: 팀 리드, CI
**전제조건**: GitHub Actions 활성화
**트리거**: main/dev push 또는 PR

**기본 흐름**

1. CI가 typecheck → format:check → lint → unit(coverage) → E2E → build → package dry-run → prod/full audit을 순서대로 실행한다.
2. 마지막 단계에서 `git status --porcelain`으로 **테스트가 checkout에 쓰레기를 남기지 않았는지** 검증한다.

**보장되는 결과**

- 신규 테스트는 OS tmp 디렉터리(`$TMPDIR/sduck-cli-tests`)에서 실행되고 종료 시 정리된다. 테스트 중단 시에도 저장소 트리에 새 잔여물이 생기지 않는다.

---

## UC-12. 결정 기록에서 사람용 Auto Wiki를 만든다

**행위자**: 개발자, 코딩 에이전트
**전제조건**: Wiki policy가 활성화된 v2 workspace와 confirmed decision/evidence
**트리거**: 팀원이 code와 `.decision` 파일을 직접 재분석하지 않고 제품 목적·용어·capability·architecture·최근 변경을 읽고 싶음

**기본 흐름**

1. 개발자가 agent에게 bundled `sd-build-wiki` skill 사용을 요청한다.
2. Agent는 code와 confirmed `.decision` source를 먼저 읽고, 부족한 intent가 blocking이면 recommended answer와 rationale을 붙여 한 번에 하나씩 질문한다.
3. Agent가 purpose/users/success/scope, glossary, capabilities/boundaries, architecture/flows, decisions/changes/validation을 fixed `sduck-wiki/v1` payload로 작성한다.
4. Agent가 `sduck wiki build --stdin`을 실행하고 `sduck wiki status`, `sduck wiki lint`로 검증한다.

**보장되는 결과**

- `docs/wiki/`에는 고정된 5개 page와 manifest만 생성되며 모든 page는 fixed frontmatter와 section ownership marker를 갖는다.
- 각 generated block은 existing task/decision/evidence/trace/evaluation source ID를 가진다. Unknown, superseded, marker-injection source는 전체 write 전에 거부된다.
- Decision intent, implementation claim, change tracking, validation report는 서로 다른 evidence class로 표시된다. CLI는 source 존재와 type contract만 검증하며 설명의 semantic truth를 주장하지 않는다.
- Build는 workspace writer lock, staging validation, rollback을 사용하므로 multi-page partial output을 남기지 않는다.

**제외 범위**

- sduck 내부 LLM, daemon, background refresh, semantic verification, source code 자동 수정, commit/tag/push/publish는 없다.
- Wiki는 `.decision`을 대체하지 않는다. 사람의 기본 읽기 surface일 뿐 canonical backend는 계속 `.decision`이다.

---

## UC-13. 관련된 Wiki page만 안전하게 갱신한다

**행위자**: 개발자, 코딩 에이전트
**전제조건**: Auto Wiki가 이미 build됨
**트리거**: 새 confirmed decision/trace/evaluation, source digest 변화, 관련 code 변화, 또는 generated region 충돌

**기본 흐름**

1. Agent가 `sd-sync-wiki` skill에 따라 `sduck wiki status`로 reason과 관련 page를 확인한다.
2. Agent가 dirty page에 필요한 source만 다시 읽고 해당 page payload만 만든다.
3. `sduck wiki sync --stdin`으로 owned section만 갱신한 뒤 status/lint를 다시 실행한다.
4. 사람이 generated region을 수정한 conflict라면 agent는 덮어쓰지 않고 보고한다. 사용자가 정확한 page overwrite를 명시적으로 허용한 경우에만 `--force`를 사용한다.

**보장되는 결과**

- Team Notes와 marker 밖의 content는 byte-for-byte 유지된다. Unrelated clean page는 mtime과 content가 바뀌지 않는다.
- Missing/superseded source, source digest, marker edit, new decision/trace, unmapped decision, `lastSyncedCommit..HEAD`의 관련 file change가 deterministic reason으로 보고된다.
- Clean page rewrite와 edited generated region overwrite에는 explicit `--force`가 필요하다. Agent는 이를 자동으로 선택하지 않는다.
- Sync는 atomic/idempotent이며 concurrent writer가 mixed output이나 SQLite lock error를 만들지 않는다.
- `sduck close`는 Wiki dirty 상태와 무관하게 성공한 후 advisory만 출력한다. Sync/lint 실패는 Wiki를 stale로 남기지만 decision task를 되돌리지 않는다.

---

## UC-14. 누적 history를 출처 기반 Memory Capsule로 정제한다

**행위자**: 코딩 에이전트, 리뷰어
**전제조건**: confirmed 또는 closed task와 최소 하나의 confirmed decision
**트리거**: task가 완료됐거나 `sduck memory status`가 missing/stale Capsule을 보고함

**기본 흐름**

1. Agent가 `sduck memory status --json`으로 eligible task의 상태와 stale reason을 확인한다.
2. Agent가 해당 task의 confirmed Decision/Evidence/Implementation Trace/Evaluation을 읽고 최대 20개의 durable claim으로 정제한다.
3. Agent가 각 claim에 같은 task의 source ID를 붙인 `sduck-memory/v1` payload를 만들고 현재 task에는 `sduck memory distill --stdin`으로 제출한다. 과거 task backfill은 payload와 같은 ID의 `--task <TASK-ID>`를 명시한다.
4. CLI가 source 존재, task ownership, decision 상태, claim/source type contract를 검증하고 source digest를 계산한다.
5. 이후 `sduck recall`과 새 task의 `sduck context`는 일치하는 Capsule을 raw history보다 먼저 사용한다.

**보장되는 결과**

- Task마다 stable `MEM-*` 문서가 최대 하나만 존재한다. 재정제는 같은 ID를 update하고 동일 payload/source digest는 no-op이다.
- `DECISION`/`CONSTRAINT`/`IMPLEMENTATION`/`VALIDATION` claim은 각각 허용된 source kind와 필수 primary source를 만족해야 한다. Unknown, cross-task, non-confirmed decision source는 전체 mutation 전에 거부된다.
- `.decision/exports/markdown/memories/*.md`가 Git-tracked canonical source이며 SQLite는 rebuild 가능한 projection이다. DB를 지운 뒤 `sduck rebuild`해도 status/recall 결과가 복구된다. Markdown prose 안의 예시 fence와 무관하게 마지막 canonical source block이 round-trip된다.
- 없는/잘못된 참조, 인용 source content 변화, Capsule보다 최신인 task source, confirmed가 아니게 된 인용 decision은 stale reason으로 보고된다. Stale Capsule은 retrieval에서 제외되고 doctor repair는 Capsule만 quarantine한다.
- 일치하는 Capsule은 인용한 Decision/Trace ID만 접고 같은 task의 인용하지 않은 raw source는 유지한다.
- Automatic context는 현재 candidate set을 `(taskId, sourceType, sourceRef)`로 idempotent하게 reconcile하고 task당 40개로 제한한다. 계속 매칭되는 source의 ID는 유지하고 미매칭 automatic entry는 제거한다. Explicit FILE context는 이 상한과 별도로 보존되며 같은 파일을 다시 add해도 중복 record/event가 생기지 않는다.
- 기존 Task/Decision/Evidence/Trace/Evaluation을 삭제하거나 cold archive하지 않는다. Full-bundle persistence를 incremental write로 바꾸지도 않는다.

---

## 부록: pilot 평가와의 연결

위 유즈케이스는 `docs/pilot-evaluation.md`의 측정 항목과 다음처럼 대응한다. UC-1/UC-2는 brief 작성시간·decision 재사용률·재작업률의 측정 단위가 되고, UC-3/UC-4는 팀 동시 사용 시 신뢰성 전제조건이며, UC-8/UC-11은 리뷰·CI 프로세스에 sduck를 편입하는 기준이 된다. UC-12/UC-13은 broken source, human-region 보존, selective sync, stale page, conflict rate와 returning user의 code 재분석 여부를 측정한다. UC-14는 Capsule coverage, stale backlog, recall fallback 감소, context/source growth를 측정한다. pilot 기간 중 각 작업은 시작 시 복잡도(small/medium/large)를 분류하고, medium 이상에서 절차 비용이 전체의 15% 이하, 반복 영역 decision 재사용률 30% 이상, decision 위반 재작업의 baseline 대비 감소를 Go 신호로 본다.
