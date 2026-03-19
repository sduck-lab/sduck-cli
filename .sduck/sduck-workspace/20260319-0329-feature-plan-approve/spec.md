# [feature] plan approve

> **작업 타입:** `feature` (Standard Feature)
> **작성자:** taehee
> **작성일:** 2026-03-19
> **연관 티켓:** -

---

## 1. 배경 및 목적

### 문제 / 요구사항

현재 `sduck spec approve`까지는 구현되어 있지만, 사용자가 `plan.md`를 승인한 뒤
작업을 실제 구현 단계로 넘기는 `sduck plan approve` 명령은 아직 없다.

이 명령이 없으면 `meta.yml`의 `status`, `plan.approved`, `plan.approved_at`, `steps.total`을
에이전트가 수동으로 수정해야 하므로 상태 전이 실수와 step 개수 파싱 불일치가 생길 수 있다.

이번 작업의 목표는 `sduck plan approve` 명령으로 플랜 승인 상태 전이를 자동화하고,
`plan.md`의 Step 수를 읽어 `IN_PROGRESS` 상태와 초기 step 진행 정보를 안전하게 설정하는 것이다.

### 기대 효과

- 사용자가 CLI로 plan 승인 상태를 일관되게 반영할 수 있다
- `meta.yml`의 `status`, `plan.approved`, `plan.approved_at`, `steps.total`이 규칙대로 갱신된다
- 승인 직후 구현 단계로 바로 넘어갈 수 있다
- Step 번호 기준 진행 추적이 CLI 상태와 동기화된다

---

## 2. 기능 명세

### 사용자 스토리

```text
As a developer,
I want to run `sduck plan approve`,
So that an approved plan moves the task into implementation with the correct step metadata.
```

### 수용 기준 (Acceptance Criteria)

> 모든 항목이 충족되어야 이 작업이 완료(Done)로 간주된다.

- [x] AC1: `sduck plan approve`는 현재 활성 작업 또는 지정된 작업의 `meta.yml`을 찾아 플랜 승인 상태로 갱신한다
- [x] AC2: 승인 시 `status`는 `IN_PROGRESS`로 바뀌고, `plan.approved`는 `true`, `plan.approved_at`은 UTC ISO 8601(`Z`)로 기록된다
- [x] AC3: `plan.md`의 `## Step N. 제목` 헤더 개수를 읽어 `steps.total`에 기록하고 `steps.completed`는 빈 배열로 초기화한다
- [x] AC4: `SPEC_APPROVED`가 아닌 작업, Step이 없는 `plan.md`, 존재하지 않는 작업에 대해 명확한 실패 메시지를 출력한다
- [x] AC5: 승인 성공 후 구현을 시작하라는 다음 액션 안내를 출력한다
- [x] AC6: 후보 작업이 여러 개일 때 최근 작업이 상단에 오는 목록 기반 다중 선택 UI를 제공할 수 있다
- [x] AC7: 다중 선택 승인에서 일부 task가 Step 파싱 실패하면 성공 가능한 task만 부분 성공으로 처리하고, 실패한 task는 별도로 안내한다
- [x] AC8: 실제 e2e 테스트로 정상 승인, 잘못된 상태, Step 파싱 실패, 다중 선택 승인, 부분 성공을 검증한다

### 기능 상세 설명

- 명령어 형식은 최소 아래 둘 중 하나를 지원한다
  - `sduck plan approve`
  - `sduck plan approve <task-id-or-slug>`
- 기본 동작에서는 plan 승인 대기 상태의 작업을 찾는다
- 승인 가능한 상태는 `SPEC_APPROVED`만 허용한다
- `plan.md`에서 `## Step N. 제목` 패턴만 유효한 Step 헤더로 간주한다
- 승인 성공 시 `steps.completed`는 항상 `[]`로 초기화한다
- 다중 승인 시 일부 task가 Step 파싱 또는 상태 검증에 실패하더라도, 성공 가능한 task는 승인하고 실패 항목은 별도 목록으로 출력한다

### 엣지 케이스

- `.sduck/sduck-workspace/`가 없거나 작업이 하나도 없는 경우
- 대상 작업의 `plan.md`가 없거나 비어 있는 경우
- `plan.md`에 Step 헤더가 하나도 없는 경우
- `plan.md`에 `## Step N.`만 있고 제목이 없는 경우
- 지정한 task id 또는 slug가 존재하지 않는 경우
- 대상 작업의 상태가 이미 `IN_PROGRESS` 또는 `DONE`인 경우
- 여러 후보가 매칭되는 경우

---

## 3. 기술 설계

### 변경 대상 컴포넌트

| 레이어   | 파일 / 모듈                    | 변경 내용 요약                       |
| -------- | ------------------------------ | ------------------------------------ |
| CLI      | `src/cli.ts`                   | `plan approve` 명령 등록             |
| Commands | `src/commands/plan-approve.ts` | 입력 해석, 결과 출력                 |
| Core     | `src/core/plan-approve.ts`     | meta 상태 전이와 Step 파싱 구현      |
| Core     | `src/core/workspace.ts`        | 작업 탐색/선택 보조 로직 재사용      |
| Tests    | `tests/unit/*`                 | Step 파싱, 상태 전이, 작업 선택 검증 |
| Tests    | `tests/e2e/*`                  | 실제 승인 흐름 검증                  |

### API 명세 (해당 시)

해당 없음.

### 데이터 모델 변경 (해당 시)

해당 없음.

### 시퀀스 다이어그램 (해당 시)

```text
User → CLI(plan approve)
        → target task resolution
        → plan step parsing
        → meta update
        → implementation guidance output
```

---

## 4. UI/UX 명세 (해당 시)

CLI 출력 기준으로 정의한다.

### 인터랙션 정의

- 성공 시 승인된 작업 id/path, 총 Step 수, 새 상태를 명확히 보여준다
- 성공 메시지에는 구현을 시작하라는 안내를 포함한다
- 실패 시에는 승인 불가 이유와 현재 상태 또는 Step 파싱 문제를 보여준다
- 부분 성공 시 성공한 작업과 실패한 작업을 분리해 보여준다
- 다중 승인 또는 부분 성공 결과는 사람이 빠르게 스캔할 수 있도록 표 형태로 출력한다

예시:

```text
+---------+--------------------------------------+---------------+-----------------------------+
| Result  | Task                                 | Steps         | Note                        |
+---------+--------------------------------------+---------------+-----------------------------+
| success | 20260319-1000-feature-login         | 2             | moved to IN_PROGRESS        |
| success | 20260319-1020-feature-profile       | 2             | moved to IN_PROGRESS        |
| failed  | 20260319-1010-feature-signup        | -             | missing valid Step headers  |
+---------+--------------------------------------+---------------+-----------------------------+
```

- 표의 최소 컬럼은 아래를 포함한다
  - `Result`: `success` / `failed`
  - `Task`: task id 또는 경로
  - `Steps`: 파싱된 총 Step 수 또는 `-`
  - `Note`: 성공/실패 이유 요약
- 단일 승인 성공일 때도 같은 표 형식을 재사용할 수 있어야 한다

예시:

```text
✅ 플랜 승인됨 (총 4단계)
   상태: IN_PROGRESS → 작업을 시작합니다.
```

---

## 5. 테스트 계획

### 단위 테스트 (Unit Test)

| 대상 함수 / 모듈    | 테스트 케이스                                | 예상 결과                                                    |
| ------------------- | -------------------------------------------- | ------------------------------------------------------------ |
| Step 파싱 로직      | `## Step 1. 제목` ~ `## Step N. 제목` 존재   | 정확한 개수 반환                                             |
| Step 파싱 로직      | `## Step 1.`처럼 제목 없는 헤더              | 실패                                                         |
| Step 파싱 로직      | Step 없음                                    | 실패                                                         |
| 대상 작업 선택 로직 | 활성/지정 task 존재                          | 정확한 작업 선택                                             |
| 상태 검증 로직      | `SPEC_APPROVED`                              | 승인 허용                                                    |
| 상태 검증 로직      | `PENDING_SPEC_APPROVAL`/`IN_PROGRESS`/`DONE` | 승인 거부                                                    |
| meta 갱신 로직      | 승인 처리                                    | `plan.approved`, `approved_at`, `steps.total`, `status` 갱신 |
| 다중 승인 정책      | 일부 성공 / 일부 실패                        | 부분 성공 결과와 실패 목록 분리                              |

### 통합 / E2E 테스트

| 시나리오       | 단계                                                        | 예상 결과                          |
| -------------- | ----------------------------------------------------------- | ---------------------------------- |
| 정상 승인      | `sduck start` → `sduck spec approve` → `sduck plan approve` | `IN_PROGRESS` 전이                 |
| 잘못된 상태    | `SPEC_APPROVED` 이전 상태에서 실행                          | 실패 코드와 메시지 출력            |
| Step 없음      | 비어 있는 plan으로 승인 시도                                | 실패                               |
| 대상 지정 승인 | 특정 task id/slug로 승인                                    | 정확한 task만 갱신                 |
| 후보 다중 선택 | 여러 후보 중 선택 후 승인                                   | 선택된 작업만 승인                 |
| 부분 성공      | 여러 task 중 일부는 Step 파싱 실패                          | 성공 task만 승인, 실패 task는 안내 |

---

## 6. 영향 범위 분석

### 변경 파일 목록 (예상)

```yaml
target_paths:
  - src/cli.ts
  - src/commands/plan-approve.ts
  - src/core/plan-approve.ts
  - src/core/workspace.ts
  - tests/unit/*
  - tests/e2e/*
  - docs/snippets.md
```

### 사이드 이펙트 검토

- 이후 `step done`은 `steps.total`, `steps.completed` 형식을 그대로 신뢰하게 된다
- Step 파싱 규칙이 바뀌면 기존 plan 문서와의 호환성에 영향이 생긴다

### 롤백 계획

- `plan approve` 명령과 관련 상태 전이 로직을 제거한다
- 잘못 갱신된 `meta.yml`은 Git 이력 또는 수동 수정으로 복구한다

---

## 7. 보안 / 성능 고려사항

- **인증·인가:** 해당 없음
- **입력값 검증:** task id/slug는 workspace 내부 탐색 기준으로만 해석한다
- **성능:** workspace 탐색과 `plan.md` 파싱 수준이므로 즉시 완료 가능한 수준이어야 한다
- **민감 데이터 처리:** 기존 `meta.yml`의 다른 필드는 불필요하게 훼손하지 않아야 한다

---

## 8. 비기능 요구사항

| 항목             | 요구사항                                   |
| ---------------- | ------------------------------------------ |
| 응답 시간        | 일반 로컬 환경에서 즉시 완료 가능한 수준   |
| 동시 사용자      | 고려 대상 아님                             |
| 데이터 보존 기간 | 변경된 `meta.yml`은 Git 추적 대상으로 유지 |

---

## 9. 의존성 및 선행 조건

- 이 작업 시작 전 완료되어야 하는 작업: `sduck spec approve` 기능 완료
- 외부 서비스 / API 연동 필요 여부: 없음
- 피처 플래그(Feature Flag) 사용 여부: 없음

---

## 10. 미결 사항 (Open Questions)

- [ ] Step 헤더 파싱은 `## Step N. 제목` 형식만 유효한 것으로 처리한다
- [ ] 다중 선택 승인 시 일부 task가 Step 파싱 실패하면 전체 실패로 막지 않고 부분 성공을 허용한다

---

## 11. 참고 자료

- `.sduck/sduck-workspace/20260319-0315-feature-spec-approve/spec.md`
- `AGENT.md`
- `CLAUDE.md`
