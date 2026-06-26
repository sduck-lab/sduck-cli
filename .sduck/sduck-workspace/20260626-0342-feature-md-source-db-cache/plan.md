# Plan: md source db cache

> **Task:** `20260626-0342-feature-md-source-db-cache`
> **Status:** spec approved, plan pending approval
> **Worktree for implementation:** `.sduck-worktrees/20260626-0342-feature-md-source-db-cache`

이 plan은 승인 전 구현하지 않는다. 승인 후 각 Step 완료 시 `sduck step done <N> 20260626-0342-feature-md-source-db-cache`로 진행 상태를 기록한다.

---

## Step 1. Canonical source 경로와 round-trip 파일 포맷 확정

### 목표

DB가 아닌 마크다운/텍스트 파일을 유일한 source of truth로 다루기 위한 경로, 타입, 직렬화/역직렬화 기반을 만든다.

### 대상 파일

- `src/core/v2/paths.ts`
  - 기존 `decisionRoot`, `dbPath`, `markdownTasksDir`, `markdownDecisionsDir`, `markdownImplementationsDir`, `graphifyExportDir` 주변
  - canonical source path helper 추가 또는 기존 markdown export path를 source path로 명확히 별칭화
- `src/core/v2/source-store.ts` 신규 예상
  - source entity 타입, frontmatter parser/renderer, atomic write helper
- `src/core/v2/source-types.ts` 신규 예상 또는 `types.ts` 확장
  - task/decision/question/evidence/context/brief/trace/event source shape 정의
- `src/core/v2/remember.ts`
  - 기존 markdown render format을 source-store와 공유 가능한 형태로 분리할 준비

### 변경 의도

- 현재 `.decision/exports/markdown/{tasks,decisions,implementations}` 위치를 이번 작업의 canonical markdown source로 사용할지, 또는 source helper가 그 위치를 감싸도록 정리한다. 중복 source 경로는 만들지 않는다.
- “한 decision당 한 markdown 파일” 단위를 유지한다.
- task markdown은 task 자체뿐 아니라 DB 복원에 필요한 question/evidence/context/event/brief snapshot 정보를 round-trip 가능한 구조화 섹션 또는 frontmatter로 담을 수 있게 정의한다.
- implementation trace markdown은 `implements`, `files_changed`, decision-to-code map, timestamps를 모두 복원 가능하게 보강한다.
- YAML/frontmatter 파싱은 기존 dependency `js-yaml`을 사용하고, multiline body는 명확한 section delimiter로 처리한다.
- 원본 파일 쓰기는 임시 파일 후 rename 방식의 atomic write를 우선 적용한다.

### 검증

- `npm run typecheck`
- source format helper 단위 테스트를 추가하는 경우 `npx vitest run tests/unit/v2-core.test.ts`

---

## Step 2. DB 캐시 reset/rebuild 기반 추가

### 목표

마크다운 source를 읽어 `.decision/db.sqlite` 캐시를 안전하게 재생성할 수 있는 core pipeline을 만든다.

### 대상 파일

- `src/core/v2/store.ts`
  - `openDatabase(projectRoot)` 주변
  - `ensureSchema(db)` 주변
  - cache reset/drop-and-recreate helper 추가 예상
- `src/core/v2/rebuild.ts` 신규 예상
  - `rebuildDecisionCache(projectRoot, options?)`
  - source scan, validation, DB reset, row insert, result summary
- `src/core/v2/ids.ts`
  - `nextEntityId(db, table, prefix)`의 DB row count 의존 보완
  - source 기준 다음 ID 계산 helper 추가 예상
- `src/core/v2/events.ts`
  - rebuild 중 source event를 DB에 적재할 때 새 event를 생성하지 않도록 분리

### 변경 의도

- DB reset은 기존 schema와 query 호환성을 유지하되, rebuild 중 기존 캐시 데이터가 남지 않게 한다.
- rebuild는 source 파일을 validation한 뒤 DB transaction 내에서 적재한다.
- rebuild 자체가 DB-only event를 추가해 source와 DB를 다르게 만들지 않게 한다.
- ID 생성은 source 파일에 존재하는 최대 ID 또는 stable source state를 기준으로 계산해, DB 삭제 후에도 중복 ID를 만들지 않는다.
- parser 오류는 파일 경로, entity id, 필드명을 포함한 typed error로 반환한다.

### 검증

- `npx vitest run tests/unit/v2-core.test.ts`
- `npm run typecheck`

---

## Step 3. remember 산출물의 완전한 역파싱 지원

### 목표

기존 DB→markdown export인 `remember` 산출물이 rebuild 입력으로 충분하도록 포맷을 보강하고, 역파싱을 구현한다.

### 대상 파일

- `src/core/v2/remember.ts`
  - `remember(projectRoot)`
  - task markdown render section
  - decision markdown render section
  - implementation trace markdown render section
  - `DECISION_REPORT.md`, `decision-graph.json` 생성 흐름
- `src/core/v2/rebuild.ts`
  - `loadSourceBundle`, `parseTaskSource`, `parseDecisionSource`, `parseTraceSource` 등 예상 함수
- `src/core/v2/brief.ts`
  - `renderBriefMarkdown(view)`와 task source에 저장할 brief representation 조정
- `tests/unit/v2-core.test.ts`
  - remember output → DB 삭제 → rebuild → 기존 query 결과 비교 케이스 추가 시작

### 변경 의도

- 현재 remember export에서 빠진 질문, 답변, 근거, context item, event, brief snapshot, `updated_at`, trace map을 source 포맷에 추가한다.
- `decision-graph.json`은 source에서 재생성 가능한 파생물로 유지하거나, rebuild 입력에 사용할 경우에도 DB보다 권위 있는 source 보조 파일임을 코드 구조로 분리한다.
- remember는 더 이상 “DB만의 내용을 임시 export”하는 기능이 아니라, canonical source files와 report/graph를 최신화하는 command로 동작하게 한다.

### 검증

- `npx vitest run tests/unit/v2-core.test.ts`
- remember 산출 파일 snapshot 성격의 assertion은 brittle하지 않게 주요 frontmatter/section 존재 여부 중심으로 검증

---

## Step 4. 명시적 `sduck rebuild` CLI 추가

### 목표

사용자가 직접 DB 캐시를 재생성할 수 있는 `sduck rebuild` 명령을 추가한다.

### 대상 파일

- `src/commands/v2/index.ts`
  - 신규 `runRebuildCommand(projectRoot: string): CommandResult` 추가
- `src/cli.ts`
  - v2 command 목록의 `remember`/`recall` 근처에 `.command('rebuild')` 등록
- `src/core/v2/rebuild.ts`
  - rebuild result summary 타입과 stdout용 formatter
- `tests/e2e/v2-cli.test.ts`
  - CLI `rebuild` 명령 round-trip 테스트 추가

### 변경 의도

- `sduck rebuild`는 source scan → DB reset → DB insert → summary 출력 순서로 동작한다.
- 성공 stdout에는 복원된 tasks/decisions/questions/evidence/traces/context/events 수를 간결히 표시한다.
- 실패 시 stderr는 source 파일 경로와 필드 원인을 포함하고 non-zero exit code를 반환한다.
- CLI registration은 기존 command 이름과 충돌하지 않게 한다.

### 검증

- `npx vitest run tests/e2e/v2-cli.test.ts`
- `npm run typecheck`

---

## Step 5. DB 기반 read/query 진입점에 자동 rebuild gate 추가

### 목표

DB가 없거나 stale할 때 query command가 source에서 자동 rebuild한 뒤 기존 DB query를 수행하게 한다.

### 대상 파일

- `src/core/v2/cache.ts` 신규 예상
  - `ensureReadableCache(projectRoot)` 또는 `ensureCacheFresh(projectRoot)`
  - source fingerprint/mtime와 cache metadata 비교
- `src/core/v2/store.ts`
  - cache metadata 저장 위치와 DB open 정책 정리
- `src/core/v2/status.ts`
  - `buildStatusView(projectRoot)` 진입 전 또는 내부 read 전 gate
  - `maybeMarkBriefReady(projectRoot)`가 DB 원본화를 만들지 않게 주의
- `src/core/v2/recall.ts`
  - `recall(projectRoot, query)` read 전 gate
- `src/core/v2/context.ts`
  - `getContextPack(projectRoot)` 및 memory item 조회 경로 read 전 gate
- `src/core/v2/brief.ts`
  - `buildBriefView(projectRoot)` read 전 gate
- `src/commands/v2/index.ts`
  - `runAskCommand`, `runStatusCommand`, `runContextCommand`, `runBriefCommand`, `runRecallCommand`에서 필요한 gate 호출 위치 조정

### 변경 의도

- missing DB: query 전 자동 rebuild.
- stale DB: source fingerprint 또는 source mtime 기반으로 자동 rebuild.
- 자동 rebuild가 기존 stdout JSON 모드(`--json`)를 깨지 않도록 메시지 출력 위치를 조심한다. JSON mode에서는 rebuild notice를 stdout에 섞지 않는다.
- DB read API는 유지하되, DB가 권위 있는 상태 저장소처럼 갱신되는 경로는 제거한다.

### 검증

- DB 파일 삭제 후 `status`, `recall`, `brief`, `context`, `ask` 관련 unit/e2e 호출이 성공하는 테스트
- `npx vitest run tests/unit/v2-core.test.ts tests/e2e/v2-cli.test.ts`

---

## Step 6. write path를 source-first로 전환

### 목표

task/decision/question/evidence/context/brief/trace/event 생성·갱신 흐름이 DB가 아니라 source file을 먼저 갱신하도록 전환한다.

### 대상 파일

- `src/core/v2/task.ts`
  - `createTask(projectRoot, description)`
  - `updateTaskStatus(db, taskId, status)`
  - `updateTaskScopes(db, taskId, scopes)`
  - `setTerminalStatus(projectRoot, status)`
- `src/core/v2/draft.ts`
  - `submitDraft(projectRoot, content)`
- `src/core/v2/decision.ts`
  - `insertDecision(db, taskId, draft)`
  - `updateDecisionFromAnswer(db, question, answer)`
- `src/core/v2/question.ts`
  - `insertQuestion(db, taskId, draft)`
  - `answerQuestion(db, questionId, answer, options?)`
- `src/core/v2/evidence.ts`
  - `insertEvidence(db, taskId, draft)`
- `src/core/v2/context.ts`
  - `insertContextItem(db, item)`
  - `buildContextIndex(projectRoot, task)`
  - `addContextPath(projectRoot, pathOrGlob)`
- `src/core/v2/brief.ts`
  - `confirmBrief(projectRoot)`
- `src/core/v2/trace.ts`
  - `createImplementationTrace(projectRoot, options)`
- `src/core/v2/events.ts`
  - `appendEvent(db, taskId, type, payload)`를 source-first 또는 source event append로 재구성
- `src/commands/v2/index.ts`
  - `runWorkCommand`, `runSubmitCommand`, `runAnswerCommand`, `runConfirmCommand`, `runTraceCommand`, `runCloseCommand`, `runAbandonCommand` 결과 유지 확인

### 변경 의도

- public/core function signature를 가능한 유지해 변경 범위를 줄인다.
- 내부에서 DB를 직접 원본처럼 갱신하는 대신:
  1. source bundle 로드
  2. source entity 생성/수정
  3. source 파일 atomic write
  4. DB cache 갱신 또는 source에서 rebuild
  5. 기존 반환 타입 구성
- `submitDraft`는 draft의 decisions/questions/evidence를 source에 기록하고, task scopes도 source task에 반영한다.
- `answerQuestion`은 question answer, evidence, linked decision status/summary/rationale 변경을 source에 반영한다.
- `trace`는 implementation trace markdown을 source로 쓰고 DB 캐시는 파생 갱신한다.
- write command 중 실패하면 DB cache가 source보다 앞서간 상태로 남지 않게 한다.

### 검증

- 기존 unit workflow 전체 실행
- 각 write command 후 DB 삭제 → rebuild → 동일 status/recall/brief/context 결과 비교 테스트
- `npx vitest run tests/unit/v2-core.test.ts`

---

## Step 7. `.gitignore`, init/reachability, 기존 DB-only workspace 안전장치 정리

### 목표

DB 캐시가 Git 추적 대상에서 제외되고, init/reachability 및 기존 workspace 호환성이 깨지지 않게 한다.

### 대상 파일

- `.gitignore`
  - `.decision/db.sqlite`, `.decision/*.db`, SQLite sidecar(`*.db-wal`, `*.db-shm`) ignore 추가 예상
  - markdown source/report/graph까지 ignore하지 않도록 패턴 주의
- `src/core/v2/workspace.ts`
  - `initDecisionWorkspace(projectRoot)`가 source dirs와 cache dirs를 올바르게 생성
- `src/core/v2/paths.ts`
  - DB ignore 대상 경로와 source 경로 분리 확인
- `tests/e2e/sdd-cli-reachability.test.ts`
  - `.decision/state.json` 및 DB cache 기대 assertion 영향 확인
- `tests/e2e/v2-cli.test.ts`
  - git ignore 동작 또는 ignore pattern 존재 검증 추가

### 변경 의도

- `.decision/` 전체를 ignore하지 않고 DB 캐시 파일만 ignore한다.
- 기존 DB-only workspace에서 source가 없고 DB만 있는 경우, 즉시 데이터 유실하지 않도록 `remember` 실행 안내 또는 one-time source export fallback을 제공한다.
- init은 빈 source 디렉터리와 state를 만들되, DB는 cache로만 생성한다.

### 검증

- `npx vitest run tests/e2e/sdd-cli-reachability.test.ts tests/e2e/v2-cli.test.ts`
- 수동 확인이 필요하면 `git status --short --ignored`는 최종 검증 전 한 번만 사용

---

## Step 8. round-trip 회귀 테스트 완성

### 목표

spec의 완료 조건을 자동 테스트로 고정한다.

### 대상 파일

- `tests/unit/v2-core.test.ts`
  - core round-trip: init/work/context/submit/answer/brief/confirm/trace/remember → DB 삭제 → rebuild → query 비교
  - auto rebuild: DB 삭제 후 `buildStatusView`, `recall`, `buildBriefView`, `getContextPack` 호출
  - parse validation: 필수 source field 누락 시 파일/필드 포함 오류
- `tests/e2e/v2-cli.test.ts`
  - CLI round-trip: `sduck rebuild`
  - automatic rebuild through `status`/`recall`
  - existing command output regression
- 필요 시 `tests/e2e/sdd-cli-reachability.test.ts`
  - DB cache ignore/source path 변화에 맞춘 assertion 조정

### 변경 의도

- “DB 삭제 → rebuild → 동일 결과”를 핵심 회귀 테스트로 둔다.
- 동일 결과 비교는 DB row byte-for-byte가 아니라 CLI/query 의미 결과(status counts, recall hit, brief content, trace mapping 등) 중심으로 한다.
- JSON output이 있는 command는 JSON parse 가능한 상태를 보존한다.

### 검증

```bash
npx vitest run tests/unit/v2-core.test.ts tests/e2e/v2-cli.test.ts
npm run typecheck
```

---

## Step 9. 전체 검증, task 평가, review ready 전환 준비

### 목표

구현 완료 후 SDD 완료 조건과 task 평가 기준을 확인하고 review 단계로 넘길 수 있게 한다.

### 대상 파일

- `.sduck/sduck-workspace/20260626-0342-feature-md-source-db-cache/spec.md`
  - 완료 조건 체크 여부 확인용으로만 참조; 승인된 요구사항 임의 변경 금지
- `.sduck/sduck-assets/eval/task.yml`
  - 구현 후 task 평가 기준 읽기
- 변경된 모든 v2 source/test files

### 변경 의도

- 모든 Step 완료 후 spec의 AC를 하나씩 확인한다.
- `.sduck/sduck-assets/eval/task.yml` 기준 task 자체 평가를 수행하고 결과를 사용자에게 보여준다.
- 그 뒤에만 `sduck review ready 20260626-0342-feature-md-source-db-cache` 전환을 진행한다.
- `DONE` 처리는 `REVIEW_READY` 이후 사용자 흐름에 따른다.

### 최종 검증 명령

```bash
npx vitest run tests/unit/v2-core.test.ts tests/e2e/v2-cli.test.ts
npm run typecheck
```

---

## 자체 평가 (plan.yml 기준)

| 기준             | 점수(1-5) | 근거                                                                                                                                                |
| ---------------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| semantic_clarity | 5         | source of truth, DB cache, rebuild, auto rebuild, write path 전환을 단계별로 분리했다.                                                              |
| abstraction      | 4         | source-store/rebuild/cache 레이어를 분리해 추상화하되, 기존 v2 함수 시그니처 유지로 변경 범위를 제한했다. 세부 source format은 Step 1에서 확정한다. |
| typing           | 5         | source entity 타입, typed parser error, rebuild result summary, ID helper를 명시했다.                                                               |
| security         | 4         | 로컬 CLI라 인증 변경은 없지만 parser validation, atomic write, JSON stdout 보존, DB/source 권위 분리를 고려했다.                                    |
| maintainability  | 5         | paths/source-store/rebuild/cache/write-path/test를 역할별로 나누고 DB schema query 호환성을 유지한다.                                               |
| testability      | 5         | unit/e2e round-trip, auto rebuild, parse validation, gitignore 검증과 필수 명령을 구체화했다.                                                       |

**평균:** 4.7 / 5

**승인 대기:** 이 plan은 아직 승인되지 않았다. 사용자 명시 승인 전에는 구현을 진행하지 않는다.
