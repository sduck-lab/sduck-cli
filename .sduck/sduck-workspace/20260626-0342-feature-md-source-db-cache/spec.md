# [feature] md source db cache

> **작업 타입:** `feature` (Standard Feature)
> **작성자:** taehee
> **작성일:** 2026-06-26
> **연관 티켓:** -

---

## 1. 배경 및 목적

### 문제 / 요구사항

sduck v2 decision-driven 저장 레이어는 현재 `.decision/db.sqlite` SQLite 파일을 사실상 원본(source of truth)으로 사용한다. 이 구조는 다음 문제를 만든다.

- SQLite 파일은 바이너리라 Git diff로 변경 내용을 검토하기 어렵다.
- 두 사용자가 각자 DB를 커밋하면 Git 자동 머지가 불가능해 한쪽 작업이 통째로 사라질 수 있다.
- `remember`는 이미 DB 내용을 마크다운 결정/태스크/trace 및 `decision-graph.json`으로 내보내지만, 역방향 import/rebuild가 없어 마크다운을 원본으로 사용할 수 없다.
- 결과적으로 decision-driven 데이터가 사람이 리뷰하고 병합할 수 있는 형태가 아니라, 로컬 DB 상태에 강하게 결합되어 있다.

이 작업의 목적은 v2 저장 레이어의 진실의 원본을 **마크다운/엔티티 텍스트 파일**로 전환하고, SQLite DB는 그 파일들로부터 언제든 재생성 가능한 **로컬 인덱스/캐시**로 강등하는 것이다.

### 확정된 제품/아키텍처 결정

- 원본(source of truth)은 마크다운/엔티티 텍스트 파일이다.
- DB는 순수 파생물이며, 마크다운에서 언제든 재생성 가능해야 한다.
- “마크다운과 DB가 둘 다 원본”인 구조는 금지한다.
- DB는 `.gitignore` 대상이며 커밋하지 않는다.
- 읽기/쿼리 경로(`recall`, `status`, `context`의 `findMemoryItems`, `brief`, `ask`)는 계속 DB를 사용한다.
- 변경되는 것은 쓰기 경로와 캐시 재생성 경로다.

### 기대 효과

- 결정/질문/근거/trace/task 변경이 Git diff에 사람이 읽을 수 있는 형태로 드러난다.
- 여러 사용자가 같은 저장소에서 작업해도 텍스트 기반 merge가 가능해진다.
- DB 삭제, 손상, 미존재 상태에서도 마크다운 원본만 있으면 동일한 v2 상태를 복원할 수 있다.
- 기존 query 성능과 API 표면은 DB 캐시를 유지해 보존한다.

---

## 2. 기능 명세

### 사용자 스토리

```text
As a sduck v2 사용자/에이전트,
I want decision-driven 데이터의 원본을 Git-friendly 마크다운 파일로 보관하고 DB는 자동 재생성 캐시로 사용하기를 원한다,
So that 결정 이력은 리뷰/머지 가능하고, 로컬 DB가 없어도 동일한 상태를 재현할 수 있다.
```

### 수용 기준 (Acceptance Criteria)

> 모든 항목이 충족되어야 이 작업이 완료(Done)로 간주된다.

- [x] AC1: 마크다운/엔티티 텍스트 원본을 스캔해 `.decision` DB 캐시를 재생성하는 `sduck rebuild` 명령이 동작한다.
- [x] AC2: `remember`가 산출하는 결정/태스크/trace/graph 관련 파일만으로 DB에 필요한 전체 v2 상태가 복원된다. 현재 산출물이 복원에 부족한 필드/엔티티가 있다면 원본 포맷을 확장해 round-trip 가능하게 만든다.
- [x] AC3: `submit`, `answer`, `trace`, `work` 계열 생성/갱신 작업은 DB를 원본으로 쓰지 않고, 먼저 마크다운/엔티티 텍스트 원본에 기록한다. DB 쓰기는 캐시 갱신 또는 rebuild 결과여야 한다.
- [x] AC4: DB 파일이 삭제된 상태에서 `status`, `recall`, `brief`, `context`, `ask` 등 DB 기반 query 명령을 실행하면 자동 rebuild 후 기존과 같은 의미의 결과를 반환한다.
- [x] AC5: DB가 stale한 상태에서는 query 실행 전 자동 rebuild 또는 안전한 캐시 갱신이 수행되어 마크다운 원본과 DB 결과가 어긋나지 않는다.
- [x] AC6: `.decision` DB 파일은 `.gitignore`에 포함되어 Git status에 잡히지 않는다. 단, 마크다운/엔티티 원본 파일은 Git 추적 가능해야 한다.
- [x] AC7: 기존 `recall`, `status`, `context(findMemoryItems)`, `brief`, `ask` 쿼리 동작은 회귀하지 않는다.
- [x] AC8: `tests/unit/v2-core.test.ts`와 `tests/e2e/v2-cli.test.ts`에 “DB 삭제 → rebuild/자동 rebuild → 동일 결과” round-trip 테스트가 추가된다.
- [x] AC9: 검증 명령 `npx vitest run tests/unit/v2-core.test.ts tests/e2e/v2-cli.test.ts`와 `npm run typecheck`가 통과한다.

### 기능 상세 설명

#### 저장 모델

- 마크다운/엔티티 텍스트 파일이 유일한 영속 원본이다.
- DB 캐시는 원본 파일에서 생성된 읽기 최적화 인덱스다.
- DB에만 존재하는 비즈니스 상태가 있어서는 안 된다.
- 원본 파일에는 DB 재생성에 필요한 안정적 ID, 타입, 상태, 생성/수정 시각, 관계, 본문, 구조화 필드를 포함해야 한다.
- 추후 엔티티당 JSON 분리로 확장할 수 있도록, 결정은 “한 결정당 한 파일” 단위를 유지한다.
- 이번 작업에서는 엔티티당 JSON 파일 전환은 하지 않는다.

#### 쓰기 경로

다음 종류의 생성/갱신은 원본 파일에 먼저 반영되어야 한다.

- task 생성/상태/스코프 갱신
- decision 생성/갱신/answer에 의한 confirmed/explicit 상태 반영
- question 생성/answer 저장
- evidence 생성
- implementation trace 생성
- brief confirmation 결과 또는 brief snapshot 중 재현에 필요한 상태
- context item 중 query와 context pack 재현에 필요한 상태
- 이벤트 로그 중 상태 재현 또는 status 표시를 위해 필요한 항목

DB 업데이트가 필요한 경우에도 이는 원본 파일 반영 이후 캐시 동기화로만 취급한다.

#### rebuild 명령

- `sduck rebuild`는 현재 프로젝트의 마크다운/엔티티 원본을 스캔한다.
- 기존 DB 캐시는 삭제 후 재생성하거나, 동일 결과를 보장하는 방식으로 초기화한다.
- rebuild 결과는 기존 query 경로가 기대하는 schema/table에 적재된다.
- rebuild는 여러 번 실행해도 동일한 원본에서 동일한 DB 상태를 만드는 idempotent 동작이어야 한다.
- 원본 파싱 오류가 있으면 어떤 파일/필드가 문제인지 사람이 수정 가능한 에러를 반환한다.

#### 자동 rebuild / stale 처리

- DB가 없으면 DB 기반 query 명령 실행 전에 자동 rebuild한다.
- DB가 원본보다 오래되었거나 stale하다고 판단되면 query 실행 전에 자동 rebuild하거나 안전하게 캐시를 갱신한다.
- stale 판단은 DB가 원본보다 권위 있다고 가정하지 않아야 한다.

#### remember와 원본 포맷

- 현재 `remember`는 DB → markdown/graph export 역할을 한다.
- 전환 후에는 remember 산출물 또는 그와 호환되는 canonical markdown 원본이 DB rebuild의 입력이 되어야 한다.
- 현재 export가 복원에 부족한 엔티티(질문, 답변, 근거, context item, events, brief snapshot, `updated_at`, trace map 등)는 round-trip 가능한 포맷으로 보강해야 한다.
- `decision-graph.json`은 원본에서 재생성 가능한 파생물인지, rebuild 입력에 포함되는 원본 보조 파일인지 구현 단계에서 명확히 구분한다. 단, DB를 원본으로 되돌리면 안 된다.

---

## 3. 기술 설계

### 변경 대상 컴포넌트

| 레이어          | 파일 / 모듈                                              | 변경 내용 요약                                                            |
| --------------- | -------------------------------------------------------- | ------------------------------------------------------------------------- |
| path/storage    | `src/core/v2/paths.ts`                                   | `.decision` 내 DB 캐시 경로, markdown/source 경로, rebuild 입력 경로 정리 |
| DB schema/cache | `src/core/v2/store.ts`                                   | cache 재생성에 안전한 schema 초기화, drop/recreate 또는 reset 지원        |
| workspace       | `src/core/v2/workspace.ts`                               | init 시 원본 디렉터리와 DB 캐시 생성 정책 정리                            |
| task write      | `src/core/v2/task.ts`                                    | task 생성/갱신을 원본 파일 우선으로 전환                                  |
| draft/submit    | `src/core/v2/draft.ts`, `src/commands/v2/index.ts`       | submit 흐름의 decision/question/evidence 원본 기록 우선화                 |
| decision write  | `src/core/v2/decision.ts`                                | decision insert/update 원본 기록 및 캐시 갱신화                           |
| question write  | `src/core/v2/question.ts`                                | question/answer/evidence/decision 갱신의 원본 기록 우선화                 |
| evidence write  | `src/core/v2/evidence.ts`                                | evidence 원본 기록 및 rebuild 파싱 대상화                                 |
| context         | `src/core/v2/context.ts`                                 | context item 저장과 DB 기반 query 유지, 자동 rebuild 연동                 |
| brief           | `src/core/v2/brief.ts`                                   | brief read는 DB 유지, confirm 결과는 원본 우선 기록                       |
| trace           | `src/core/v2/trace.ts`                                   | implementation trace 원본 기록 및 rebuild 파싱 대상화                     |
| remember/import | `src/core/v2/remember.ts` 및 신규 import/rebuild 모듈    | 기존 markdown 직렬화 포맷의 역파싱, round-trip 가능하도록 포맷 보강       |
| CLI             | `src/cli.ts`, `src/commands/v2/index.ts`                 | `sduck rebuild` 명령 등록 및 command handler 추가                         |
| Git ignore      | `.gitignore`                                             | `.decision` DB 캐시 파일 ignore 추가                                      |
| tests           | `tests/unit/v2-core.test.ts`, `tests/e2e/v2-cli.test.ts` | rebuild 및 자동 rebuild round-trip 회귀 테스트 추가                       |

### API/CLI 명세

```text
Command: sduck rebuild

Behavior:
- 현재 프로젝트의 markdown/entity 원본을 읽는다.
- .decision DB 캐시를 안전하게 초기화한다.
- query 명령이 사용하는 v2 schema로 데이터를 적재한다.
- 성공 시 rebuild 완료 요약을 stdout에 출력한다.
- 파싱/검증 실패 시 실패 파일과 필드를 stderr에 출력하고 non-zero exit code를 반환한다.
```

자동 rebuild는 별도 사용자 명령 없이 다음 DB 기반 command 진입 시 수행된다.

- `sduck status`
- `sduck recall ...`
- `sduck brief`
- `sduck ask` / answer 대상 조회 흐름
- `sduck context` 및 `findMemoryItems`를 사용하는 흐름
- 기타 v2 DB read가 필요한 command

### 데이터 모델 변경

- DB schema 자체는 query 호환성을 위해 가능한 유지한다.
- 필요 시 cache rebuild를 위해 schema reset/drop-and-recreate 함수를 추가한다.
- 원본 파일 frontmatter/body에는 최소한 다음 범주의 정보를 round-trip 가능하게 담는다.
  - `tasks`: `id`, `type`, `status`, `title/summary`, `scopes`, `created_at`, `updated_at`, brief/confirmation에 필요한 필드
  - `decisions`: `id`, `task_id`, `kind`, `status`, `confidence`, `title`, `summary`, `rationale`, `source_refs`, `applies_to`, `avoids`, timestamps
  - `questions`: `id`, `task_id`, `status`, `prompt`, `answer`, `linked_decision_id`, timestamps
  - `evidence`: `id`, `task_id`, `decision_id/question_id`, `kind/source/content`, timestamps
  - `implementation_traces`: `id`, `task_id`, `implements`, `files_changed`, `summary`, decision-to-code map, timestamps
  - `context_items`: context pack/query 재현에 필요한 file/symbol/content/metadata
  - `events`: status 표시와 이력 재현에 필요한 event type/payload/timestamp

### 시퀀스 다이어그램

```text
Write command (submit/answer/trace/work)
  → parse user input
  → write canonical markdown/entity source
  → update/rebuild DB cache from source
  → return existing command output

Query command (status/recall/brief/context/ask)
  → check DB cache exists/fresh
  → if missing/stale: rebuild from markdown/entity source
  → query SQLite cache
  → return existing command output

sduck rebuild
  → scan markdown/entity source
  → validate/parse entities
  → reset DB cache
  → insert parsed entities into schema
  → report success/failure
```

---

## 4. UI/UX 명세 (해당 시)

CLI 기능 변경이며 별도 UI는 없다.

### CLI 출력 원칙

- `sduck rebuild` 성공 출력은 간결한 요약이어야 한다.
- 자동 rebuild는 사용자가 이해할 수 있는 최소 메시지를 출력하되, 기존 명령 출력 파싱을 불필요하게 깨지 않도록 한다.
- 파싱 실패는 파일 경로, 엔티티 ID, 필드명, 원인을 포함해야 한다.

---

## 5. 테스트 계획

### 단위 테스트 (Unit Test)

| 대상 함수 / 모듈             | 테스트 케이스                                     | 예상 결과                          |
| ---------------------------- | ------------------------------------------------- | ---------------------------------- |
| markdown import/rebuild 모듈 | remember 산출물/원본 파일 파싱                    | DB row가 원본 필드와 동일하게 복원 |
| rebuild DB reset             | 기존 DB 삭제 또는 기존 DB 존재 상태에서 rebuild   | 동일 원본 기준 idempotent 결과     |
| write path                   | submit/answer/trace/work 후 DB 삭제 및 rebuild    | query 결과가 삭제 전과 동일        |
| auto rebuild                 | DB 없는 상태에서 status/recall/brief/context 호출 | 자동 rebuild 후 정상 결과 반환     |
| parse validation             | 필수 frontmatter 누락/잘못된 타입                 | 파일/필드가 포함된 오류 반환       |

### 통합 / E2E 테스트

| 시나리오       | 단계                                                                                                   | 예상 결과                                      |
| -------------- | ------------------------------------------------------------------------------------------------------ | ---------------------------------------------- |
| CLI round-trip | `init/work/submit/answer/trace/remember` 실행 → DB 삭제 → `sduck rebuild` → `recall/status/brief` 실행 | rebuild 후 결과가 DB 삭제 전과 의미상 동일     |
| 자동 rebuild   | DB 삭제 → `sduck recall <query>` 또는 `sduck status` 실행                                              | 명령이 실패하지 않고 자동 rebuild 후 결과 반환 |
| Git ignore     | DB 생성 후 Git status 확인 또는 ignore matcher 검증                                                    | DB 파일은 추적 대상으로 잡히지 않음            |

### 필수 검증 명령

```bash
npx vitest run tests/unit/v2-core.test.ts tests/e2e/v2-cli.test.ts
npm run typecheck
```

---

## 6. 영향 범위 분석

### 변경 파일 목록 (예상)

```yaml
target_paths:
  - src/core/v2/paths.ts
  - src/core/v2/store.ts
  - src/core/v2/workspace.ts
  - src/core/v2/task.ts
  - src/core/v2/draft.ts
  - src/core/v2/decision.ts
  - src/core/v2/question.ts
  - src/core/v2/evidence.ts
  - src/core/v2/context.ts
  - src/core/v2/brief.ts
  - src/core/v2/trace.ts
  - src/core/v2/remember.ts
  - src/core/v2/rebuild.ts # 예상 신규 모듈
  - src/core/v2/source-store.ts # 예상 신규 모듈
  - src/commands/v2/index.ts
  - src/cli.ts
  - .gitignore
  - tests/unit/v2-core.test.ts
  - tests/e2e/v2-cli.test.ts
  - tests/e2e/sdd-cli-reachability.test.ts # init reachability assertion 영향 가능
```

### 사이드 이펙트 검토

- 영향 가능성 있는 모듈:
  - DB open/schema lifecycle
  - v2 command 출력과 exit code
  - remember export/report/graph generation
  - context pack 생성과 prior decision/trace 조회
  - ID 생성 로직
  - 기존 DB-only workspace 호환성
- 회귀 테스트 필요 영역:
  - submit markdown-fenced JSON parsing
  - answer가 question/evidence/decision 상태를 함께 갱신하는 흐름
  - trace 생성 후 recall 검색
  - status counts/events 표시
  - brief confirm 후 task 상태 변경

### 주요 리스크와 요구사항

- 현재 remember markdown export는 DB 전체 복원에 부족할 수 있다. 복원 불가능한 필드는 원본 포맷에 추가해야 한다.
- ID 생성이 DB row count에 의존하면 rebuild 후 중복/역행 위험이 있다. 원본 기준으로 다음 ID를 결정하거나 안정적인 ID 생성 정책이 필요하다.
- YAML/frontmatter의 배열, 문자열, multiline escaping이 깨지면 round-trip이 실패한다. 파서/직렬화 규칙을 명확히 해야 한다.
- DB stale 판단이 부정확하면 query 결과가 원본과 어긋날 수 있다. “DB는 원본이 아니다”는 원칙을 강제해야 한다.
- 기존 사용자의 DB-only 데이터는 전환 시 유실 위험이 있다. 구현은 가능하면 기존 DB가 있고 원본이 부족한 경우 `remember`/migration 안내 또는 안전한 export 경로를 제공해야 한다.
- `decision-graph.json`이 원본인지 파생물인지 불명확하면 이중 원본 문제가 생긴다. 구현에서 역할을 분리해야 한다.

### 롤백 계획

- 구현 중 문제가 있으면 SDD task branch/worktree 변경을 되돌린다.
- 기능 플래그 없이 전면 전환하되, plan 단계에서 작은 단위로 분리해 기존 DB read/query 동작을 유지한 채 write/rebuild 경로를 검증한다.
- 릴리스 전 회귀가 발견되면 마크다운 원본 쓰기 및 rebuild 변경을 revert하고 기존 DB 원본 동작으로 복귀한다.

---

## 7. 보안 / 성능 고려사항

- **인증·인가:** 로컬 CLI 저장 레이어 변경으로 별도 인증/인가 변경은 없다.
- **입력값 검증:** rebuild parser는 frontmatter/body 필수 필드, 타입, ID 중복, 관계 참조 무결성을 검증해야 한다.
- **성능:** query는 계속 SQLite DB를 사용한다. 자동 rebuild는 missing/stale 상황에서만 실행되어야 하며, 일반 query마다 불필요하게 전체 rebuild하지 않아야 한다.
- **원자성:** 원본 파일 쓰기 중 실패하면 DB 캐시가 원본보다 앞서가면 안 된다. 가능하면 임시 파일 후 rename 등 원자적 파일 쓰기를 사용한다.
- **민감 데이터 처리:** 기존 v2 decision data와 동일한 민감도다. DB ignore 이후에도 마크다운 원본은 Git 추적 가능하므로, 사용자가 기록하는 내용은 리뷰 가능한 텍스트로 남는다는 점을 유지한다.

---

## 8. 비기능 요구사항

| 항목       | 요구사항                                                                               |
| ---------- | -------------------------------------------------------------------------------------- |
| 재현성     | 동일한 마크다운/엔티티 원본에서 rebuild를 반복해도 동일한 DB query 결과가 나와야 한다. |
| Git 친화성 | 원본 변경은 사람이 읽을 수 있는 텍스트 diff로 표현되어야 한다.                         |
| 호환성     | 기존 v2 CLI command 이름과 주요 출력 의미는 유지한다.                                  |
| 신뢰성     | DB 삭제/손상 시에도 원본 파일이 있으면 정상 복구되어야 한다.                           |
| 성능       | 평상시 query는 DB 캐시를 사용하며, 자동 rebuild는 필요 시에만 수행한다.                |

---

## 9. 의존성 및 선행 조건

- 이 작업은 사용자 명시 승인 전 plan 작성 및 구현을 진행하지 않는다.
- 외부 서비스/API 연동은 없다.
- 피처 플래그 사용 여부는 plan 단계에서 결정할 수 있으나, 최종 요구사항은 마크다운 원본 + DB 캐시 구조다.
- 현재 v2 관련 주요 파일은 `src/core/v2/*`, CLI 등록은 `src/cli.ts`, command wrapper는 `src/commands/v2/index.ts`에 있다.

---

## 10. 범위 제외 (Out of Scope)

- 엔티티당 파일 분리(`.decision/decisions/DEC-xxx.json`)로의 전환은 이번 작업에서 하지 않는다.
- `recall` 검색 품질 개선(`LIKE` → full-text search 등)은 별도 task로 분리한다.
- trace의 decision→code 매핑 휴리스틱 개선은 별도 task로 분리한다.
- UI/UX 화면 변경은 없다.

---

## 11. 미결 사항 (Open Questions)

- 현재 확정된 방향 기준으로 spec 승인을 막는 미결 사항은 없다.
- canonical source directory 이름과 세부 파일명은 plan 단계에서 구체화한다. 단, 어떤 선택을 하더라도 DB는 원본이 될 수 없고, remember 산출물만으로 rebuild 가능해야 한다.

---

## 12. 참고 자료

- 사용자 요청: `feature: storage-md-source-db-cache`
- 현 코드 recon: `src/core/v2/paths.ts`, `store.ts`, `task.ts`, `draft.ts`, `decision.ts`, `question.ts`, `evidence.ts`, `context.ts`, `brief.ts`, `trace.ts`, `remember.ts`, `recall.ts`, `status.ts`, `src/commands/v2/index.ts`, `src/cli.ts`
- 테스트 후보: `tests/unit/v2-core.test.ts`, `tests/e2e/v2-cli.test.ts`, `tests/e2e/sdd-cli-reachability.test.ts`
- 평가 기준: `.sduck/sduck-assets/eval/spec.yml`

---

## 13. 자체 평가 (spec.yml 기준)

| 기준                | 점수(1-5) | 근거                                                                                                  |
| ------------------- | --------- | ----------------------------------------------------------------------------------------------------- |
| problem_clarity     | 5         | DB 원본 구조의 Git diff/merge 문제와 markdown source 전환 목표가 명확하다.                            |
| scope_definition    | 5         | 쓰기 경로, rebuild, auto rebuild, `.gitignore`, 테스트 범위와 제외 범위를 구분했다.                   |
| completion_criteria | 5         | DB 삭제/rebuild/자동 rebuild/회귀 테스트/typecheck 등 검증 가능한 AC로 정리했다.                      |
| feasibility         | 4         | 현재 v2 모듈과 remember export 구조 기준으로 실행 가능하나, 기존 export의 손실 필드 보강이 필요하다.  |
| risk_coverage       | 5         | lossy export, ID 생성, stale cache, YAML round-trip, DB-only migration, graph 역할 리스크를 명시했다. |
| testability         | 5         | unit/e2e round-trip 및 필수 검증 명령을 구체화했다.                                                   |

**평균:** 4.8 / 5

**승인 대기:** 이 spec은 아직 승인되지 않았다. 사용자 명시 승인 전에는 plan 작성과 구현을 진행하지 않는다.
