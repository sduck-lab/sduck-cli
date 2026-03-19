# [feature] spec approve

> **작업 타입:** `feature` (Standard Feature)
> **작성자:** taehee
> **작성일:** 2026-03-19
> **연관 티켓:** -

---

## 1. 배경 및 목적

### 문제 / 요구사항

현재 `sduck start`와 `sduck init`은 구현되어 있지만, 사용자가 스펙을 승인한 뒤
`meta.yml` 상태를 CLI로 안전하게 전이시키는 `sduck spec approve` 명령은 아직 없다.

지금은 에이전트가 `AGENT.md` 또는 `CLAUDE.md` 규칙에 따라 `meta.yml`을 직접 수정해야 하므로,
승인 처리 방식이 수동이고 상태 전이 실수가 생길 여지가 있다.

이번 작업의 목표는 `sduck spec approve` 명령으로 스펙 승인 상태 전이를 자동화하고,
승인 직후 에이전트가 `plan.md`를 작성하도록 자연스럽게 다음 단계로 넘길 수 있게 만드는 것이다.

### 기대 효과

- 사용자가 CLI로 스펙 승인 상태를 일관되게 반영할 수 있다
- `meta.yml`의 `status`, `spec.approved`, `spec.approved_at` 값이 규칙대로 갱신된다
- 승인 후 다음 단계가 `plan.md` 작성이라는 점을 명확히 안내할 수 있다
- `plan create` 같은 별도 명령 없이도 워크플로우를 이어갈 수 있다

---

## 2. 기능 명세

### 사용자 스토리

```text
As a developer,
I want to run `sduck spec approve`,
So that the active task moves from spec review to plan writing in a safe and consistent way.
```

### 수용 기준 (Acceptance Criteria)

> 모든 항목이 충족되어야 이 작업이 완료(Done)로 간주된다.

- [x] AC1: `sduck spec approve`는 현재 활성 작업 또는 지정된 작업의 `meta.yml`을 찾아 스펙 승인 상태로 갱신한다
- [x] AC2: 승인 시 `status`는 `SPEC_APPROVED`로 바뀌고, `spec.approved`는 `true`, `spec.approved_at`은 UTC ISO 8601(`Z`)로 기록된다
- [x] AC3: 이미 승인된 작업, 존재하지 않는 작업, 잘못된 상태 작업에 대해 명확한 실패 메시지를 출력한다
- [x] AC4: 승인 성공 후 “플랜 작성을 시작합니다” 또는 동등한 다음 액션 안내를 출력한다
- [x] AC5: `plan.md`를 자동 생성하지 않고, 에이전트가 다음 단계로 plan을 작성하도록 워크플로우를 유지한다
- [x] AC6: 후보 작업이 여러 개일 때 최근 작업이 상단에 오는 목록 기반 선택 UI를 제공할 수 있다
- [x] AC7: 목록 선택에서는 여러 작업을 동시에 선택해 일괄 승인할 수 있다
- [x] AC8: 실제 e2e 테스트로 정상 승인, 잘못된 상태, 잘못된 대상 선택, 다중 선택 승인을 검증한다

### 기능 상세 설명

- 명령어 형식은 최소 아래 둘 중 하나를 지원한다
  - `sduck spec approve`
  - `sduck spec approve <task-id-or-slug>`
- 기본 동작에서는 활성 작업을 찾는다
- 활성 작업이 여러 개이거나 slug suffix가 여러 작업과 매칭되면, 최근 작업이 상단에 오는 목록을 보여주고 사용자가 대상을 선택할 수 있어야 한다
- 목록 선택 UI는 여러 작업을 동시에 선택할 수 있어야 한다
- 승인 가능한 상태는 `PENDING_SPEC_APPROVAL`만 허용한다
- 승인 성공 시 `plan.md`는 그대로 두고, 다음 단계 안내만 출력한다
- 여러 작업을 일괄 승인할 때도 각 작업의 `spec.approved_at`은 동일한 승인 시각 규칙으로 기록한다

### 엣지 케이스

- `.sduck/sduck-workspace/`가 없거나 작업이 하나도 없는 경우
- 활성 작업이 없는데 사용자가 대상도 지정하지 않은 경우
- 지정한 task id 또는 slug가 존재하지 않는 경우
- slug suffix가 여러 작업과 매칭되는 경우
- 목록에서 선택한 일부 작업이 승인 불가능 상태인 경우
- 대상 작업의 상태가 이미 `SPEC_APPROVED`, `IN_PROGRESS`, `DONE`인 경우
- `meta.yml`이 없거나 형식이 깨져 있는 경우

---

## 3. 기술 설계

### 변경 대상 컴포넌트

| 레이어   | 파일 / 모듈                    | 변경 내용 요약                   |
| -------- | ------------------------------ | -------------------------------- |
| CLI      | `src/cli.ts`                   | `spec approve` 명령 등록         |
| Commands | `src/commands/spec-approve.ts` | 입력 해석, 결과 출력             |
| Core     | `src/core/spec-approve.ts`     | meta 상태 전이 구현              |
| Core     | `src/core/workspace.ts`        | 작업 탐색/선택 보조 로직 확장    |
| Tests    | `tests/unit/*`                 | 상태 전이 및 작업 선택 로직 검증 |
| Tests    | `tests/e2e/*`                  | 실제 승인 흐름 검증              |

### API 명세 (해당 시)

해당 없음.

### 데이터 모델 변경 (해당 시)

해당 없음.

### 시퀀스 다이어그램 (해당 시)

```text
User → CLI(spec approve)
        → target task resolution
        → meta status validation
        → meta update
        → next-step guidance output
```

---

## 4. UI/UX 명세 (해당 시)

CLI 출력 기준으로 정의한다.

### 인터랙션 정의

- 성공 시 승인된 작업 id/path와 새 상태를 명확히 보여준다
- 성공 메시지에는 다음 단계가 plan 작성임을 안내한다
- 실패 시에는 왜 승인할 수 없는지와, 현재 상태가 무엇인지 보여준다
- 후보 작업 선택 목록이 필요하면 최근 작업이 상단에 오도록 정렬한다
- 목록 선택 UI에서는 여러 작업을 동시에 체크할 수 있어야 한다

예시:

```text
✅ 스펙 승인됨
   상태: SPEC_APPROVED → 플랜 작성을 시작합니다.
```

---

## 5. 테스트 계획

### 단위 테스트 (Unit Test)

| 대상 함수 / 모듈      | 테스트 케이스                        | 예상 결과                                     |
| --------------------- | ------------------------------------ | --------------------------------------------- |
| 대상 작업 선택 로직   | 활성 작업 존재                       | 해당 작업 선택                                |
| 대상 작업 선택 로직   | 지정 id/slug 존재                    | 정확한 작업 선택                              |
| 대상 작업 선택 로직   | slug suffix 중복                     | 최근 작업 우선 정렬 목록 반환                 |
| 상태 검증 로직        | `PENDING_SPEC_APPROVAL`              | 승인 허용                                     |
| 상태 검증 로직        | `SPEC_APPROVED`/`IN_PROGRESS`/`DONE` | 승인 거부                                     |
| meta 렌더링/갱신 로직 | 단일 승인 처리                       | `spec.approved`, `approved_at`, `status` 갱신 |
| meta 렌더링/갱신 로직 | 다중 승인 처리                       | 선택된 모든 작업 갱신                         |

### 통합 / E2E 테스트

| 시나리오       | 단계                                  | 예상 결과               |
| -------------- | ------------------------------------- | ----------------------- |
| 정상 승인      | `sduck start` 후 `sduck spec approve` | `SPEC_APPROVED` 전이    |
| 잘못된 상태    | 이미 승인된 작업에 재실행             | 실패 코드와 메시지 출력 |
| 대상 지정 승인 | 특정 task id/slug로 승인              | 정확한 task만 갱신      |
| 활성 작업 없음 | 작업 없이 실행                        | 명확한 실패 출력        |
| 후보 다중 선택 | 여러 후보 중 체크 선택 후 승인        | 선택된 작업만 일괄 갱신 |

---

## 6. 영향 범위 분석

### 변경 파일 목록 (예상)

```yaml
target_paths:
  - src/cli.ts
  - src/commands/spec-approve.ts
  - src/core/spec-approve.ts
  - src/core/workspace.ts
  - tests/unit/*
  - tests/e2e/*
  - docs/snippets.md
```

### 사이드 이펙트 검토

- 이후 `plan approve` 구현도 이 상태 전이 규칙을 기준으로 맞춰야 한다
- 작업 탐색 로직이 `start`, `status`, `spec approve`에서 함께 재사용될 수 있다

### 롤백 계획

- `spec approve` 명령과 관련 상태 전이 로직을 제거한다
- 잘못 갱신된 `meta.yml`은 Git 이력 또는 수동 수정으로 복구한다

---

## 7. 보안 / 성능 고려사항

- **인증·인가:** 해당 없음
- **입력값 검증:** task id/slug는 workspace 내부 탐색 기준으로만 해석한다
- **성능:** 단일 workspace 탐색과 YAML 파일 갱신 수준이므로 즉시 완료 가능한 수준이어야 한다
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

- 이 작업 시작 전 완료되어야 하는 작업: `sduck start` 기능 완료
- 외부 서비스 / API 연동 필요 여부: 없음
- 피처 플래그(Feature Flag) 사용 여부: 없음

---

## 10. 미결 사항 (Open Questions)

- [ ] 기본 동작에서 활성 작업이 여러 개이면 최근 작업이 상단에 오는 목록을 보여주고, 여러 작업을 동시에 선택해 승인할 수 있도록 한다
- [ ] `<task-id-or-slug>` 인자에서는 id 완전일치와 slug suffix 매칭을 모두 허용하되, 중복 매칭 시 같은 목록 선택 UI로 분기한다

---

## 11. 참고 자료

- `.sduck/sduck-workspace/20260319-0237-feature-sduck-start/spec.md`
- `AGENT.md`
- `CLAUDE.md`
