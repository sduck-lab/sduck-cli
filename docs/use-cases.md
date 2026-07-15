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
3. 새 정책 task에서는 작은 작업이라도 에이전트/개발자가 `sduck grill-me`를 실행하고 출력된 질문 프로토콜을 따른다.
4. 에이전트가 코드베이스를 탐색한 뒤 구조화된 draft를 제출한다: `sduck submit --stdin < draft.json` (decision, question, evidence, expected/avoid scope 포함)
5. 개발자가 열린 질문을 확인하고 답한다: `sduck ask` → `sduck answer QUESTION-1 --option 1` 또는 `--text "..."`
6. 모든 질문이 답변되고 OPEN/CONFLICT decision이 해소되면 task가 `BRIEF_READY`로 승격된다.
7. 개발자가 brief를 검토하고 확정한다: `sduck brief` → `sduck confirm` — DRAFT decision이 CONFIRMED로 승격되고 Git baseline이 기록된다.
8. 에이전트가 구현하고, 완료 후 `sduck trace`로 confirm 이후 변경된 실제 구현 파일(커밋됨/스테이징/미스테이징/신규 모두)을 decision에 매핑한다.
9. `sduck remember`로 재사용 가능한 graph export를 남기고 `sduck close`로 종료한다.

**보장되는 결과**

- status를 명시하지 않은 기본값 DRAFT decision도 confirm 후 trace/recall에 유지된다.
- `sduck init`으로 생성된 새 `.decision` workspace의 task는 `sduck grill-me` 전에는 submit/confirm이 거부된다. 기존 policy 없는 workspace/task는 legacy/permissive로 유지된다.
- `sduck config locale en|ko`는 user-global v2 표시 설정이며 JSON output과 canonical Markdown artifact를 바꾸지 않는다. Legacy SDD command output은 영어로 유지된다.
- trace에는 `.decision/`, `.sduck/` 등 하네스 상태와 생성물이 섞이지 않는다.

**예외 흐름**

- 4a. 열린 질문이 남은 채 `sduck confirm` 실행 → 명확한 오류로 거부되고 **canonical source는 바이트 단위로 변경되지 않는다.**
- 5a. CONFLICT decision이 미해결 → task는 OPEN에 머물고 confirm이 거부된다.
- 3a. grill-me 없이 `submit` 또는 `confirm` 실행 → `sduck grill-me`를 실행하라는 명확한 오류로 거부된다.

---

## UC-2. 과거 결정을 재사용해 반복 작업을 줄인다

**행위자**: 개발자, 코딩 에이전트
**전제조건**: 같은 저장소에서 이전 task들이 confirm/close됨
**트리거**: 유사 영역의 새 작업 시작

**기본 흐름**

1. `sduck work "extend payment retry to refunds"`
2. `sduck recall "payment retry"` — confirmed decision과 구현 trace가 검색된다.
3. `sduck context` — 새 task의 컨텍스트 팩에 과거 결정이 포함되어 에이전트가 기존 결정을 위반하지 않는 draft를 만든다.

**보장되는 결과**

- recall/context는 **CONFIRMED decision만** 노출한다. DRAFT/REJECTED/SUPERSEDED와 ABANDONED task의 결정은 현재 결정처럼 보이지 않는다.
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

1. PR diff에서 `.decision/exports/markdown/{tasks,decisions,implementations}/`의 canonical 문서 변경만 확인한다.
2. decision별 파일 분리와 안정적 ID 덕분에 어떤 결정이 추가/승격/폐기됐는지 최소 churn diff로 읽는다.

**보장되는 결과**

- `sduck init`은 `.decision/exports/markdown/{tasks,decisions,implementations}/` 디렉터리를 만들지만 Git은 빈 디렉터리를 추적하지 않는다. `.decision/policy.json`은 init 직후 추적 대상이고, canonical 결정 문서는 generated content가 생긴 뒤 add/commit할 때 추적된다.
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

## 부록: pilot 평가와의 연결

위 유즈케이스는 `docs/pilot-evaluation.md`의 측정 항목과 다음처럼 대응한다. UC-1/UC-2는 brief 작성시간·decision 재사용률·재작업률의 측정 단위가 되고, UC-3/UC-4는 팀 동시 사용 시 신뢰성 전제조건이며, UC-8/UC-11은 리뷰·CI 프로세스에 sduck를 편입하는 기준이 된다. pilot 기간 중 각 작업은 시작 시 복잡도(small/medium/large)를 분류하고, medium 이상에서 절차 비용이 전체의 15% 이하, 반복 영역 decision 재사용률 30% 이상, decision 위반 재작업의 baseline 대비 감소를 Go 신호로 본다.
