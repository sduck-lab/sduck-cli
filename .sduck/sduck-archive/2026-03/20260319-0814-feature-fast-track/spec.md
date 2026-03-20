# [feature] fast track

> **작업 타입:** `feature` (Standard Feature)
> **작성자:** Claude
> **작성일:** 2026-03-19
> **연관 티켓:** -

---

## 1. 배경 및 목적

### 문제 / 요구사항

현재 `sduck` 워크플로우는 `start -> spec approve -> plan approve -> done`의 기본 경로를 지원하지만,
반복적이거나 범위가 명확한 작업에 대해 더 짧은 입력과 더 가벼운 문서 부담으로 진행할 수 있는 `fast track` 기능은 없다.

사용자는 일부 작업에서 표준 흐름 전체를 그대로 수동으로 밟기보다,
안전한 조건 안에서 더 적은 입력과 더 짧은 경로로 다음 단계로 이동할 수 있는 기능을 원한다.

이번 작업의 목표는 `spec.md`를 아예 생략하지는 않되, 최소 스펙(minimal spec)을 유지하면서 바로 plan 작성과 이후 승인 흐름으로 자연스럽게 이어질 수 있는 fast track 경로를 제공하는 것이다.

### 기대 효과

- 사용자가 반복 작업이나 명확한 작업을 더 빠르게 진행할 수 있다
- fast track에서도 `spec.md` 파일은 유지되어 기존 승인 규칙과 `done` 검증 규칙을 그대로 재사용할 수 있다
- 빠른 경로에서도 필수 검증과 상태 일관성은 유지된다
- `fast track` 적용 가능 조건과 불가 조건이 CLI와 문서에 명확히 드러난다
- 기존 `start`, `spec approve`, `plan approve`, `done` 흐름과 충돌 없이 공존한다

---

## 2. 기능 명세

### 사용자 스토리

```text
As a developer,
I want a fast-track workflow option for eligible tasks,
So that I can move through repetitive SDD steps more quickly without losing safety.
```

### 수용 기준 (Acceptance Criteria)

> 모든 항목이 충족되어야 이 작업이 완료(Done)로 간주된다.

- [x] AC1: `fast track`의 진입 명령, 대상 상태, 결과 상태가 명확히 정의된다
- [x] AC2: fast track은 허용된 조건을 만족하는 작업에만 적용되고, 불가 조건에서는 이유를 설명하며 거부된다
- [x] AC3: fast track은 `spec.md`를 생략하지 않고, 최소 스펙을 생성하거나 최소 스펙 기준을 강제하는 방식으로 동작한다
- [x] AC4: fast track이 자동으로 수행하는 검증과 생략할 수 없는 검증이 명확히 구분된다
- [x] AC4: 기존 workspace `meta.yml` 상태와 정합성을 유지한다
- [x] AC5: 성공/실패 경로에 대한 단위 테스트와 e2e 테스트가 추가된다
- [x] AC6: README 및 워크플로우 문서에 fast track 사용법과 제한 사항이 반영된다

### 기능 상세 설명

- fast track은 새 명령(`sduck fast-track ...`) 또는 기존 명령 확장 형태일 수 있다
- 정확한 UX는 구현 전 결정해야 하지만, 최소 아래 항목은 필요하다
  - 어떤 작업을 대상으로 하는지 (`id` 또는 `slug`)
  - 어떤 단계를 자동 진행하는지
  - 어떤 상태에서만 허용되는지
  - 어떤 검증 실패 시 중단되는지
- fast track은 사용자 승인 자체를 우회하면 안 된다
- 따라서 spec 승인 전 코드 작성 금지, plan 승인 전 구현 금지 같은 핵심 규칙은 계속 보장되어야 한다
- fast track은 `spec.md`를 생략하지 않는다
- 대신 아래 두 방향 중 하나로 설계한다
  - fast track 전용 최소 스펙 템플릿을 생성한다
  - 일반 스펙 템플릿보다 더 짧은 필수 항목만 채우는 minimal spec 모드를 제공한다
- 이 최소 스펙은 이후 `spec approve`, `plan approve`, `done`이 그대로 동작할 수 있을 만큼의 완료 조건과 범위를 포함해야 한다
- fast track이 허용 가능한 예시는 아래처럼 생각할 수 있다
  - 새 작업 생성 시 minimal spec을 빠르게 준비하고 plan 작성 단계로 넘어가기 쉽게 만든다
  - 이미 구조가 명확한 작업에서 문서 부담을 줄이되 승인 절차는 유지한다
- fast track이 허용되면 안 되는 예시는 아래와 같다
  - `spec.md` 파일 자체를 만들지 않고 plan만 생성하는 흐름
  - spec 승인 없이 plan 단계 진입
  - plan 승인 없이 구현 시작
  - 완료 조건 미충족 상태에서 `DONE` 처리

### 엣지 케이스

- 적용 가능한 작업이 없을 때
- 대상 작업이 둘 이상 매칭될 때
- 현재 상태가 fast track 허용 범위 밖일 때
- minimal spec 필수 항목이 비어 있을 때
- 자동 수행 단계 중 하나가 실패했을 때 일부 상태만 반영되는 문제
- 기존 명령과 중복되는 기능이 생겨 사용자에게 혼란을 줄 때

---

## 3. 기술 설계

### 변경 대상 컴포넌트

| 레이어   | 파일 / 모듈      | 변경 내용 요약                                    |
| -------- | ---------------- | ------------------------------------------------- |
| CLI      | `src/cli.ts`     | fast track 명령 또는 옵션 등록                    |
| Commands | `src/commands/*` | fast track 진입/출력 로직 추가                    |
| Core     | `src/core/*`     | 상태 전이, minimal spec 검증, 대상 선택 로직 추가 |
| Tests    | `tests/unit/*`   | fast track 허용 조건 및 실패 조건 검증            |
| Tests    | `tests/e2e/*`    | 실제 CLI 흐름 검증                                |
| Docs     | `README.md`      | 사용법 및 제약 반영                               |

### API 명세 (해당 시)

해당 없음.

### 데이터 모델 변경 (해당 시)

- 기존 `meta.yml` 상태 모델을 최대한 재사용한다
- 새 상태를 추가하기보다 기존 상태 조합과 최소 스펙 생성 전략으로 해결하는 방향을 우선 검토한다

### 시퀀스 다이어그램 (해당 시)

```text
User → CLI(fast track)
        → target resolution
        → eligibility validation
        → guarded state transitions
        → success or actionable failure output
```

---

## 4. UI/UX 명세 (해당 시)

CLI 출력 기준으로 정의한다.

### 인터랙션 정의

- 성공 시 어떤 단계가 자동으로 처리됐는지 명확히 보여준다
- minimal spec이 생성되거나 요구될 경우 그 사실을 출력에 명확히 표시한다
- 실패 시 fast track이 거부된 이유와 사용자가 대신 실행할 수 있는 일반 명령을 안내한다
- 자동 처리 범위가 넓더라도 사용자가 현재 task 상태를 추적할 수 있어야 한다

---

## 5. 테스트 계획

### 단위 테스트 (Unit Test)

| 대상 함수 / 모듈       | 테스트 케이스       | 예상 결과                        |
| ---------------------- | ------------------- | -------------------------------- |
| 대상 선택 로직         | 0개/1개/다중 매칭   | 성공 또는 명확한 실패            |
| 상태 검증 로직         | 허용/비허용 상태    | fast track 허용 여부 정확히 판정 |
| minimal spec 검증 로직 | 필수 항목 누락/충족 | fast track 허용 또는 거부        |
| 상태 전이 로직         | 자동 진행 성공/중단 | 일관된 meta 갱신                 |
| 출력 포맷 로직         | 성공/실패 메시지    | 다음 액션이 이해 가능            |

### 통합 / E2E 테스트

| 시나리오               | 단계                        | 예상 결과                                         |
| ---------------------- | --------------------------- | ------------------------------------------------- |
| 허용된 작업 fast track | 명령 실행                   | minimal spec과 기대한 단계가 함께 준비되거나 진행 |
| 비허용 상태 차단       | 잘못된 상태에서 실행        | 실패 코드와 이유 출력                             |
| 다중 후보 차단         | 모호한 target 상태에서 실행 | 명시적 target 요구                                |
| spec 생략 시도 차단    | spec 없는 흐름 시도         | 거부 또는 minimal spec 생성 강제                  |
| 중간 실패 처리         | 자동 단계 중 하나 실패      | 상태 일관성 유지                                  |

---

## 6. 영향 범위 분석

### 변경 파일 목록 (예상)

```text
target_paths:
  - src/cli.ts
  - src/commands/*
  - src/core/*
  - tests/unit/*
  - tests/e2e/*
  - README.md
```

### 사이드 이펙트 검토

- fast track 정의가 모호하면 기존 SDD 원칙을 훼손할 수 있다
- minimal spec 기준이 너무 약하면 `done` 단계의 검증 가치가 떨어질 수 있다
- 상태 전이를 여러 단계 한 번에 수행하면 부분 실패 복구 전략이 중요해진다
- 기존 명령과 책임이 겹치면 유지보수성이 떨어질 수 있다

- 영향 가능성 있는 모듈: 상태 전이 로직, task 선택 로직, CLI 메시지, 문서
- 회귀 테스트 필요 영역: `spec approve`, `plan approve`, `done`, workspace 상태 관리

### 롤백 계획

- fast track 명령과 관련 로직을 제거한다
- 문서에서 fast track 안내를 제거하고 표준 수동 흐름만 유지한다

---

## 7. 보안 / 성능 고려사항

- **인증·인가:** 해당 없음
- **입력값 검증:** 잘못된 target이나 허용되지 않은 상태 전이는 반드시 차단해야 한다
- **입력값 검증:** minimal spec 필수 필드가 비어 있으면 빠른 경로를 중단해야 한다
- **성능:** 여러 단계를 묶더라도 로컬 파일 처리 수준에서 충분히 가벼워야 한다
- **민감 데이터 처리:** `meta.yml` 갱신 중 사용자 작성 내용이나 상태 정보가 손상되지 않아야 한다

---

## 8. 비기능 요구사항

| 항목   | 요구사항                                                  |
| ------ | --------------------------------------------------------- |
| 안정성 | 부분 성공보다 보수적 실패를 우선한다                      |
| 일관성 | 기존 SDD 규칙과 충돌하지 않아야 한다                      |
| 사용성 | 표준 명령 대비 왜 빠른지와 언제 써야 하는지 명확해야 한다 |

---

## 9. 의존성 및 선행 조건

- 이 작업 시작 전 완료되어야 하는 작업: `sduck start`, `sduck spec approve`, `sduck plan approve`, `sduck done`
- 외부 서비스 / API 연동 필요 여부: 없음
- 피처 플래그(Feature Flag) 사용 여부: 없음

---

## 10. 미결 사항 (Open Questions)

- [x] fast track이 구체적으로 어떤 단계를 묶는지 최종 UX 확정 필요
- [x] 별도 새 상태를 도입할지, 기존 상태만 조합할지 확정 필요

---

## 11. 참고 자료

- `README.md`
- `.sduck/sduck-workspace/20260319-0744-feature-sduck-done/spec.md`
- `.sduck/sduck-assets/eval/spec.yml`
