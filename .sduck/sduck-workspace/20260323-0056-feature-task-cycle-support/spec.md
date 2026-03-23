# [feature] task-cycle-support

> **작업 타입:** `feature`
> **작성자:** taehee
> **작성일:** 2026-03-23
> **연관 티켓:** -

---

## 1. 배경 및 목적

### 문제 / 요구사항

현재 SDD 워크플로우는 태스크당 단일 사이클(spec → plan → 구현 → DONE)만 지원한다.
구현 완료 후 문제가 발견되면 새 태스크를 생성해야 하는데, 같은 목표에 대한 보완/수정임에도 별도 태스크가 늘어나 관리 부담이 커진다.

### 기대 효과

- 하나의 태스크 안에서 여러 사이클을 돌 수 있어 관련 작업이 한 곳에 모인다
- 이전 사이클의 spec/plan이 history에 보존되어 의사결정 이력 추적 가능
- 태스크 수 감소로 workspace 관리 부담 경감

---

## 2. 기능 명세

### 사용자 스토리

```
As a 개발자,
I want to DONE 상태의 태스크를 reopen해서 새 사이클을 시작하고 싶다,
So that 같은 목표에 대한 후속 작업을 별도 태스크 없이 이어갈 수 있다.
```

### 수용 기준 (Acceptance Criteria)

- [x] AC1: `sduck reopen [target]` 명령으로 DONE 태스크를 PENDING_SPEC_APPROVAL로 전이할 수 있다
- [x] AC2: reopen 시 meta.yml의 cycle 값이 증가하고, 현재 spec.md/plan.md의 snapshot이 history/ 디렉토리에 저장된다. snapshot 대상은 존재하는 파일에 한한다.
- [x] AC3: history 디렉토리에 `{cycle}_spec.md`, `{cycle}_plan.md` 형식으로 이전 문서가 보존된다 (cycle은 reopen 직전의 현재 cycle 번호)
- [x] AC4: reopen은 DONE 상태의 태스크에서만 가능하다
- [x] AC5: 새 사이클에서도 기존 SDD 워크플로우(spec → approve → plan → approve → 구현)가 동일하게 적용된다
- [x] AC6: history snapshot 충돌 시 에러로 중단하고 meta는 변경하지 않는다
- [x] AC7: snapshot 생성 중 실패 시 이번 reopen에서 생성한 snapshot 파일을 삭제 시도하고, meta는 변경하지 않는다
- [x] AC8: 단위 테스트와 E2E 테스트가 존재한다

### 기능 상세 설명

**reopen 흐름:**

1. `sduck reopen [target]` 실행 (target은 id 또는 slug, exact match)
2. 대상 태스크가 DONE 상태인지 검증
3. 현재 cycle 번호를 계산 (meta.cycle 없으면 1로 간주)
4. history 디렉토리 준비 및 snapshot 충돌 검사
5. 현재 spec.md, plan.md를 `history/{currentCycle}_spec.md`, `history/{currentCycle}_plan.md`로 복사한다. 존재하지 않는 파일은 snapshot 대상에서 제외한다.
6. meta.yml 갱신:
   - `cycle` = currentCycle + 1
   - `status` = `PENDING_SPEC_APPROVAL`
   - `spec.approved` → false, `spec.approved_at` → null
   - `plan.approved` → false, `plan.approved_at` → null
   - `steps.total` → null, `steps.completed` → []
   - `completed_at` → null
7. spec.md, plan.md 원본은 유지한다

snapshot 대상 파일이 하나도 없어도 reopen은 허용되며, 이 경우 history 파일은 생성되지 않고 meta만 새 cycle 상태로 갱신된다.

**설계 의도 — working copy 유지:**
새 사이클은 완전한 재작성보다 "기존 spec/plan을 기반으로 보완"하는 경우가 많으므로 working copy는 유지한다. approval 상태만 초기화하여 재검토를 강제한다.

**불변 조건:**

- reopen은 DONE 상태의 태스크에만 허용된다
- reopen은 현재 cycle의 working documents를 history snapshot으로 보존한 뒤 새 cycle을 연다
- reopen은 기존 문서 내용을 삭제하지 않는다

**history naming rule:**
history 파일명은 reopen 직전 cycle 번호를 사용한다. (cycle=1 상태에서 reopen → `1_spec.md` 생성, cycle은 2로)

**충돌 정책:**
history snapshot 파일이 이미 존재하면 에러로 중단한다. meta는 변경하지 않는다. 사용자에게 `history snapshot already exists: {path}` 메시지를 제공한다.

**failure atomicity:**
작업 순서를 다음과 같이 보장한다:

1. current cycle 계산
2. history dir 준비
3. snapshot 충돌 검사 (충돌 시 여기서 중단)
4. snapshot 파일 생성
5. meta.yml 갱신
6. 성공 시 종료

meta 갱신은 마지막에 수행하므로, snapshot 생성 실패 시 meta는 건드리지 않는다.

**snapshot 생성 중간 실패 시 rollback:**
snapshot 파일 생성 도중 실패하면(예: spec 복사 성공 후 plan 복사 실패), 이번 reopen에서 생성한 snapshot 파일을 삭제 시도한다. rollback 실패 시 에러 메시지에 일부 snapshot이 남았음을 알린다. meta는 변경하지 않는다.

**active task 규칙:**
reopen된 태스크는 PENDING_SPEC_APPROVAL 상태이므로 active task로 간주된다. 따라서 기존 `sduck start`의 active task 제약에 그대로 포함되어, reopen된 태스크가 진행 중이면 새 태스크를 생성할 수 없다.

**target 해석 정책:**

- target이 없으면: DONE 상태 태스크 전체가 후보. 후보가 1개면 자동 선택, 여러 개면 에러
- target이 있으면: id exact match 우선, slug exact match 차순. 매칭 결과가 0개면 에러, 1개면 선택, 여러 개면 에러
- 모호성이 발생하면 에러 메시지에 후보 목록을 `- {id} ({slug})` 형식으로 표시한다

**cycle 초기값 정책:**

- 기존 태스크: cycle 필드 없으면 1로 간주 (하위호환)
- 신규 태스크 생성 시 cycle: 1을 명시 저장하는 것은 이 기능 범위에 포함하지 않는다 (별도 개선 사항)

**meta.yml 변경 예시:**

```yaml
cycle: 2 # reopen 전 1(또는 미존재) → 2

status: PENDING_SPEC_APPROVAL

spec:
  approved: false
  approved_at: null

plan:
  approved: false
  approved_at: null

steps:
  total: null
  completed: []

completed_at: null
```

**history 디렉토리 구조:**

```text
.sduck/sduck-workspace/{task-id}/
├── meta.yml
├── spec.md          # 현재 사이클 working copy
├── plan.md          # 현재 사이클 working copy
└── history/
    ├── 1_spec.md    # 사이클 1의 spec snapshot
    ├── 1_plan.md    # 사이클 1의 plan snapshot
    ├── 2_spec.md    # 사이클 2의 spec snapshot (2번째 reopen 이후)
    └── 2_plan.md
```

---

## 3. 기술 설계

### 변경 대상 컴포넌트

| 레이어  | 파일 / 모듈                 | 변경 내용 요약                                                                |
| ------- | --------------------------- | ----------------------------------------------------------------------------- |
| Core    | `src/core/reopen.ts`        | reopen 비즈니스 로직 (새 파일). 후보 필터/해석, snapshot, meta 갱신 모두 포함 |
| Command | `src/commands/reopen.ts`    | CLI 커맨드 레이어 (새 파일)                                                   |
| CLI     | `src/cli.ts`                | reopen 명령 등록                                                              |
| Test    | `tests/unit/reopen.test.ts` | 단위 테스트                                                                   |
| Test    | `tests/e2e/reopen.test.ts`  | E2E 테스트                                                                    |

### 함수 책임

기존 코드베이스는 meta.yml을 regex 기반 문자열로 파싱/갱신하므로 동일 패턴을 따른다:

- `getCurrentCycle(metaContent: string): number` — cycle 필드 파싱, 없으면 1
- `buildReopenedMeta(metaContent: string, newCycle: number): string` — 문자열 치환으로 meta 갱신. 현재 meta.yml 포맷이 `sduck start`가 생성한 표준 형식임을 전제한다 (필드 누락 시 삽입은 하지 않음)
- `filterReopenCandidates(tasks)` — DONE 태스크 필터 (reopen.ts 내부, reopen 전용)
- `resolveReopenTarget(tasks, target?)` — target 해석. no match/multiple match 시 에러 throw, exact one match 시 단일 태스크 반환
- `snapshotHistoryFiles(taskDir, currentCycle): string[]` — 충돌 검사 + 복사 + rollback. 생성된 snapshot 경로 목록을 반환한다 (rollback 대상 및 테스트 검증에 활용)

---

## 4. 테스트 계획

### 단위 테스트

| 대상 함수                | 테스트 케이스                      | 예상 결과                                      |
| ------------------------ | ---------------------------------- | ---------------------------------------------- |
| `filterReopenCandidates` | DONE 태스크만 필터링               | DONE만 반환                                    |
| `resolveReopenTarget`    | id exact match                     | 정확한 태스크 반환                             |
| `resolveReopenTarget`    | slug exact match                   | 정확한 태스크 반환                             |
| `resolveReopenTarget`    | no match                           | 에러 throw                                     |
| `resolveReopenTarget`    | multiple match                     | 에러 throw (후보 목록 포함)                    |
| `getCurrentCycle`        | cycle 필드 없음                    | 1 반환                                         |
| `getCurrentCycle`        | cycle: 3                           | 3 반환                                         |
| `buildReopenedMeta`      | cycle 없는 meta → cycle: 2         | status/approval/steps/completed_at 초기화 확인 |
| `buildReopenedMeta`      | cycle: 2 → cycle: 3                | cycle 값 정확히 증가                           |
| `buildReopenedMeta`      | approval/steps/completed_at 초기화 | 모든 필드가 초기 상태                          |
| `snapshotHistoryFiles`   | history 디렉토리 없으면 생성       | 디렉토리 생성됨                                |
| `snapshotHistoryFiles`   | 기존 history 파일 충돌 시 에러     | Error throw                                    |
| `snapshotHistoryFiles`   | spec.md만 존재 (plan.md 없음)      | spec만 복사                                    |
| `snapshotHistoryFiles`   | spec.md, plan.md 둘 다 없음        | snapshot 없이 정상 완료                        |

### E2E 테스트

| 시나리오                          | 예상 결과                                           |
| --------------------------------- | --------------------------------------------------- |
| DONE 태스크 reopen                | status=PENDING_SPEC_APPROVAL, cycle=2, history 생성 |
| 2번째 reopen (cycle 2→3)          | history에 2_spec.md/2_plan.md 추가, cycle=3         |
| 비DONE 태스크 reopen 시도         | 에러 메시지 출력                                    |
| reopen 대상 없을 때               | 적절한 메시지 출력                                  |
| target 미지정 + DONE 후보 여러 개 | ambiguity 에러, 후보 목록 출력                      |
| history 충돌 후 meta 불변 확인    | meta.yml 내용이 reopen 전과 동일                    |

---

## 5. 영향 범위 분석

### 변경 파일 목록 (예상)

```
target_paths:
  - src/core/reopen.ts (신규)
  - src/commands/reopen.ts (신규)
  - src/cli.ts
  - tests/unit/reopen.test.ts (신규)
  - tests/e2e/reopen.test.ts (신규)
```

### 사이드 이펙트 검토

- **archive 명령**: DONE 태스크를 대상으로 하므로 reopen된 태스크는 자연스럽게 archive 대상에서 제외됨 (status가 DONE이 아니므로)
- **done 명령**: cycle 필드 존재 여부와 무관하게 동작해야 함 (기존 로직 변경 불필요)
- **start 명령**: active task 체크에 의해 reopen된 태스크가 있으면 새 태스크 생성 차단 (의도된 동작)
- **SDD guard hook**: 기존 상태 기반 접근 제어가 그대로 적용됨
