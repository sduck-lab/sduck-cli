# [feature] sduck done

> **작업 타입:** `feature` (Standard Feature)
> **작성자:** Claude
> **작성일:** 2026-03-19
> **연관 티켓:** -

---

## 1. 배경 및 목적

### 문제 / 요구사항

현재 CLI는 `start`, `spec approve`, `plan approve`까지의 상태 전이는 지원하지만,
구현이 끝난 작업을 공식적으로 종료하는 `sduck done` 명령은 아직 없다.

이 때문에 사용자는 `meta.yml`의 `status: DONE`과 `completed_at`을 수동으로 수정해야 하고,
어떤 작업이 실제 완료되었는지 일관된 방식으로 마감하기 어렵다.

`done` 명령은 승인된 spec/plan을 거쳐 `IN_PROGRESS`에 도달한 작업을 안전하게 완료 처리하고,
남은 완료 조건이나 잘못된 상태를 명확히 안내하는 마지막 워크플로우 명령이어야 한다.

### 기대 효과

- 사용자가 `sduck done` 또는 특정 작업 지정으로 완료 처리를 일관되게 수행할 수 있다
- 활성 작업의 최종 상태 전이가 `IN_PROGRESS -> DONE`으로 표준화된다
- `completed_at`이 UTC ISO 8601(`Z`) 형식으로 자동 기록된다
- 이미 완료된 작업, 승인 전 작업, 다중 후보 작업 등에서 명확한 에러와 안내를 제공한다
- 이후 AI 에이전트가 수동 편집 없이도 SDD 종료 단계를 정확히 밟을 수 있다

---

## 2. 기능 명세

### 사용자 스토리

```text
As a developer,
I want to run `sduck done` for the active task,
So that the task is safely marked complete with the correct final metadata.
```

### 수용 기준 (Acceptance Criteria)

> 모든 항목이 충족되어야 이 작업이 완료(Done)로 간주된다.

- [x] AC1: `sduck done`은 현재 활성 작업이 하나일 때 그 작업을 찾아 `DONE` 상태로 전이한다
- [x] AC2: `sduck done [target]`은 작업 slug 또는 id를 받아 해당 작업을 완료 처리할 수 있다
- [x] AC3: 완료 처리 시 `meta.yml.status`는 `DONE`, `completed_at`은 UTC ISO 8601(`Z`) 형식으로 기록된다
- [x] AC4: `SPEC_APPROVED`, `PENDING_*`, 이미 `DONE`인 작업은 완료 처리되지 않고 이유를 설명하는 에러를 반환한다
- [x] AC5: 활성 후보가 없거나 여러 개인 경우 사용자가 어떤 작업을 지정해야 하는지 명확히 안내한다
- [x] AC6: `steps.total`과 `steps.completed`가 불일치하는 작업은 완료 처리하지 않고 부족한 Step 정보를 보여준다
- [x] AC7: 단위 테스트와 e2e 테스트가 성공/실패 경로 모두를 검증한다

### 기능 상세 설명

- 명령어 형식은 기본적으로 `sduck done [target]`을 사용한다
- `target`이 없으면 현재 workspace에서 완료 가능한 활성 작업을 자동 탐색한다
- 완료 가능한 작업은 기본적으로 `status: IN_PROGRESS`이며, 승인된 spec/plan을 가진 단일 작업이어야 한다
- 완료 시 아래 항목을 갱신한다
  - `status: DONE`
  - `completed_at: <UTC timestamp>`
- `steps.total`이 `null`이거나 `steps.completed` 길이와 맞지 않으면 완료를 막아야 한다
- step 번호가 중복되거나 범위를 벗어나는 비정상 meta도 방어적으로 실패 처리하는 것이 바람직하다
- `sduck done`은 완료 처리 전에 spec 체크리스트 충족 여부와 task 평가 수행 단계를 자동으로 실행한 뒤, 검증이 통과한 경우에만 완료 처리해야 한다
- `target` 매칭은 `id` exact 우선, 그다음 `slug` exact까지만 허용하고 prefix 매칭은 허용하지 않는다

### 엣지 케이스

- `IN_PROGRESS` 작업이 전혀 없고 `target`도 없는 경우
- `IN_PROGRESS` 작업이 둘 이상이라 자동 선택이 불가능한 경우
- `target`이 slug와 id 중 무엇으로도 매칭되지 않는 경우
- `target`이 여러 작업과 모호하게 매칭되는 경우
- 이미 `DONE`인 작업을 다시 완료 처리하려는 경우
- `steps.total`은 있지만 `steps.completed`가 비어 있거나 일부 Step만 완료된 경우
- `meta.yml` 구조가 깨져 있어 필수 필드를 읽을 수 없는 경우

---

## 3. 기술 설계

### 변경 대상 컴포넌트

| 레이어   | 파일 / 모듈             | 변경 내용 요약                                   |
| -------- | ----------------------- | ------------------------------------------------ |
| CLI      | `src/cli.ts`            | `done [target]` 명령 등록                        |
| Commands | `src/commands/done.ts`  | 입력 해석, 출력 메시지, 종료 코드 처리           |
| Core     | `src/core/done.ts`      | 대상 작업 선택, 상태 검증, meta 갱신             |
| Core     | `src/core/workspace.ts` | 작업 조회/선택 유틸 재사용 또는 확장             |
| Tests    | `tests/unit/*`          | 완료 가능 상태, step 검증, target 선택 로직 검증 |
| Tests    | `tests/e2e/*`           | 실제 meta 상태 전이와 에러 출력 검증             |

### API 명세 (해당 시)

해당 없음.

### 데이터 모델 변경 (해당 시)

기존 `meta.yml` 스키마를 사용하며 새 필드는 추가하지 않는다.

### 시퀀스 다이어그램 (해당 시)

```text
User → CLI(done)
        → target resolution
        → meta validation
        → step completion check
        → status/completed_at update
        → success or actionable error output
```

---

## 4. UI/UX 명세 (해당 시)

CLI 출력 기준으로 정의한다.

### 화면 목록

해당 없음.

### 디자인 레퍼런스

해당 없음.

### 인터랙션 정의

- 성공 시 완료된 작업 경로 또는 식별자와 최종 상태를 출력한다
- 성공 메시지는 `DONE` 전이를 즉시 이해할 수 있어야 한다
- 실패 시 단순히 실패만 말하지 않고, 지정 가능한 작업 목록 또는 부족한 Step 정보를 함께 안내한다
- 자동 선택 불가 상황에서는 `sduck done <slug>` 같은 다음 액션 예시를 제공한다

---

## 5. 테스트 계획

### 단위 테스트 (Unit Test)

| 대상 함수 / 모듈 | 테스트 케이스                    | 예상 결과                         |
| ---------------- | -------------------------------- | --------------------------------- |
| target 선택 로직 | 활성 작업 0개/1개/2개            | 자동 선택 또는 명확한 실패        |
| 상태 검증 로직   | `IN_PROGRESS` 외 상태            | 완료 거부 및 이유 반환            |
| step 검증 로직   | total 미설정/일부 완료/전부 완료 | 실패 또는 성공 정확히 구분        |
| meta 갱신 로직   | 완료 처리                        | `DONE` 및 UTC `completed_at` 기록 |

### 통합 / E2E 테스트

| 시나리오         | 단계                                                       | 예상 결과                    |
| ---------------- | ---------------------------------------------------------- | ---------------------------- |
| 활성 작업 완료   | `start` -> `spec approve` -> `plan approve` 후 `done` 실행 | 상태가 `DONE`으로 변경       |
| target 지정 완료 | 둘 이상의 작업 존재 시 `done <slug>` 실행                  | 지정 작업만 완료             |
| 미완료 step 차단 | `steps.completed`가 부족한 meta로 `done` 실행              | 실패 코드와 안내 메시지 출력 |
| 잘못된 상태 차단 | `SPEC_APPROVED` 또는 `DONE` 작업에 `done` 실행             | 상태 오류 출력               |
| 대상 없음        | 활성 작업 없이 `done` 실행                                 | 작업 지정 안내 출력          |

---

## 6. 영향 범위 분석

### 변경 파일 목록 (예상)

```text
target_paths:
  - src/cli.ts
  - src/commands/done.ts
  - src/core/done.ts
  - src/core/workspace.ts
  - tests/unit/*
  - tests/e2e/*
  - README.md
```

### 사이드 이펙트 검토

- 완료 상태 판정 규칙이 느슨하면 미완료 작업이 `DONE`으로 잘못 전이될 수 있다
- 반대로 규칙이 지나치게 엄격하면 정상 작업도 완료 처리하지 못할 수 있다
- 기존 `workspace` 탐색 로직을 재사용할 경우 `spec approve`, `plan approve`의 선택 정책과 일관성을 맞춰야 한다
- README 명령어 목록과 실제 CLI 동작이 어긋나지 않도록 문서 갱신이 필요할 수 있다

- 영향 가능성 있는 모듈: workspace selection, meta parsing/writing, CLI help text, e2e fixtures
- 회귀 테스트 필요 영역: `spec approve`, `plan approve`, 작업 선택 관련 공통 로직

### 롤백 계획

- `done` 명령 등록과 관련 코어 로직을 제거한다
- 문서에서 완료 명령 안내를 제거하고, 임시로 수동 `meta.yml` 편집 절차를 다시 안내한다

---

## 7. 보안 / 성능 고려사항

- **인증·인가:** 해당 없음
- **입력값 검증:** `target` 해석 시 의도하지 않은 다른 작업을 완료하지 않도록 정확한 매칭 규칙 필요
- **성능:** workspace 스캔은 로컬 파일 기준으로 충분히 가볍지만, 다수 작업에서도 불필요한 반복 파싱을 줄인다
- **민감 데이터 처리:** `meta.yml` 갱신은 필요한 필드만 변경하고 다른 사용자 메모/내용을 보존해야 한다

---

## 8. 비기능 요구사항

| 항목      | 요구사항                                            |
| --------- | --------------------------------------------------- |
| 응답 시간 | 일반적인 로컬 workspace 수십 개 기준 즉시 완료될 것 |
| 안정성    | 잘못된 상태 전이를 방지하는 보수적 검증 우선        |
| 호환성    | 기존 `.sduck/sduck-workspace` 구조와 호환될 것      |

---

## 9. 의존성 및 선행 조건

- 이 작업 시작 전 완료되어야 하는 작업: `sduck start`, `sduck spec approve`, `sduck plan approve`
- 외부 서비스 / API 연동 필요 여부: 없음
- 피처 플래그(Feature Flag) 사용 여부: 없음

---

## 10. 미결 사항 (Open Questions)

- [x] 없음

---

## 11. 참고 자료

- `README.md`
- `.sduck/sduck-assets/eval/task.yml`
- `.sduck/sduck-workspace/20260319-0237-feature-sduck-start/spec.md`
