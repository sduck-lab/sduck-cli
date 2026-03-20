# [feature] move sduck state into hidden home directory

> **작업 타입:** `feature` (Standard Feature)
> **작성자:** Claude
> **작성일:** 2026-03-19
> **연관 티켓:**

---

## 1. 배경 및 목적

### 문제 / 요구사항

현재 `sduck`는 프로젝트 루트에 `.sduck/sduck-assets/`와 `.sduck/sduck-workspace/`를 직접 생성해 관리한다. 사용자는 이 상태 데이터를 루트에 흩어놓기보다 숨김 디렉토리인 `.sduck/` 아래로 모아, `.sduck/sduck-assets/`와 `.sduck/sduck-workspace/` 구조로 관리하길 원한다.

### 기대 효과

- 프로젝트 루트가 더 깔끔해지고 `sduck` 전용 상태가 한 디렉토리에 모인다.
- `sduck-assets`와 `sduck-workspace`의 위치가 일관되게 숨김 경로 아래로 정리된다.
- 향후 추가될 `sduck` 메타데이터도 `.sduck/` 아래에 확장하기 쉬워진다.

---

## 2. 기능 명세

### 사용자 스토리

```text
As a CLI user,
I want sduck-managed assets and workspace files to live under .sduck,
So that my project root stays cleaner and sduck state is grouped in one place.
```

### 수용 기준 (Acceptance Criteria)

> 모든 항목이 충족되어야 이 작업이 완료(Done)로 간주된다.

- [ ] AC1: `init` 실행 시 `.sduck/sduck-assets/`와 `.sduck/sduck-workspace/` 대신 `.sduck/sduck-assets/`와 `.sduck/sduck-workspace/`가 생성된다.
- [ ] AC2: `start`, `spec approve`, `plan approve` 등 기존 workflow 명령이 새 경로를 기준으로 정상 동작한다.
- [ ] AC3: 관련 agent rule, docs, 출력 메시지, 테스트가 새 경로를 기준으로 갱신된다.
- [ ] AC4: 실제 파일 생성과 상태 전이를 검증하는 unit/e2e 테스트가 새 구조 기준으로 통과한다.

### 기능 상세 설명

- `.sduck/`는 프로젝트 루트 기준의 숨김 홈 디렉토리 역할을 한다.
- 기존 자산 경로를 직접 문자열로 참조하는 모든 로직은 공용 경로 함수 또는 상수로 정리할 필요가 있다.
- CLI 출력과 문서도 사용자가 새 위치를 쉽게 이해할 수 있도록 갱신되어야 한다.
- 현재 기준으로 기존 루트 경로와의 호환 또는 자동 마이그레이션은 우선 고려하지 않고, 새 구조를 기준으로 정리한다.

---

## 3. 기술 설계

### 변경 대상 컴포넌트

| 레이어     | 파일 / 모듈                                                  | 변경 내용 요약                                                      |
| ---------- | ------------------------------------------------------------ | ------------------------------------------------------------------- |
| path/core  | `src/core/*`                                                 | `sduck-assets`, `sduck-workspace` 경로를 `.sduck/...` 기준으로 정리 |
| commands   | `src/commands/*`                                             | 새 경로를 기준으로 명령 동작/출력 갱신                              |
| docs/rules | `CLAUDE.md`, `AGENT.md`, `.sduck/sduck-assets/agent-rules/*` | 문서와 규칙 문구 갱신                                               |
| tests      | `tests/unit/*`, `tests/e2e/*`                                | 새 경로 기준 검증으로 수정                                          |

### API 명세 (해당 시)

해당 없음.

### 데이터 모델 변경 (해당 시)

해당 없음.

### 시퀀스 다이어그램 (해당 시)

```text
User → sduck command → resolve .sduck home paths → read/write .sduck/sduck-assets and .sduck/sduck-workspace
```

---

## 4. UI/UX 명세 (해당 시)

### 화면 목록

해당 없음.

### 디자인 레퍼런스

해당 없음.

### 인터랙션 정의

- 사용자는 여전히 동일한 `sduck` 명령을 사용한다.
- CLI는 생성/검사/에러 메시지에서 `.sduck/...` 경로를 일관되게 보여준다.

---

## 5. 테스트 계획

### 단위 테스트 (Unit Test)

| 대상 함수 / 모듈          | 테스트 케이스      | 예상 결과                       |
| ------------------------- | ------------------ | ------------------------------- |
| path helper               | `.sduck` 경로 계산 | 모든 하위 경로가 새 기준에 맞음 |
| init/start 관련 core 로직 | 기본 경로 처리     | `.sduck/...`로 생성/조회        |

### 통합 / E2E 테스트

| 시나리오        | 단계                                | 예상 결과                                            |
| --------------- | ----------------------------------- | ---------------------------------------------------- |
| init            | `sduck init` 실행                   | `.sduck/sduck-assets`, `.sduck/sduck-workspace` 생성 |
| start flow      | `init` 후 `start` 실행              | `.sduck/sduck-workspace/...` 아래 task 생성          |
| approval flow   | `spec approve`, `plan approve` 실행 | `.sduck/sduck-workspace` 기준 상태 전이              |
| agent rule flow | `init --agents ...` 실행            | 새 구조와 함께 rule file 생성 유지                   |

---

## 6. 영향 범위 분석

### 변경 파일 목록 (예상)

```text
target_paths:
  - src/core/...
  - src/commands/...
  - tests/unit/...
  - tests/e2e/...
  - CLAUDE.md
  - AGENT.md
  - .sduck/sduck-assets/agent-rules/...
```

### 사이드 이펙트 검토

- 기존 루트 경로를 가정한 로직이 많으면 수정 범위가 넓을 수 있다.
- 기존 프로젝트에 이미 생성된 루트 `.sduck/sduck-assets/`, `.sduck/sduck-workspace/`를 자동 마이그레이션하는 요구는 현재 우선순위에 포함하지 않는다.
- 경로 변경은 테스트, 문서, 안내 메시지 전반에 연쇄 영향을 준다.

- 영향 가능성 있는 모듈: init/start/approve 흐름, path helper, tests, docs, rule generation
- 회귀 테스트 필요 영역: 모든 주요 CLI 명령과 파일 생성 경로

### 롤백 계획

- `.sduck/` 경로 전략을 되돌리고 기존 루트 경로 방식으로 복귀한다.

---

## 7. 보안 / 성능 고려사항

- **인증·인가:** 해당 없음
- **입력값 검증:** 경로 계산은 프로젝트 루트 내부 `.sduck/` 하위로 제한
- **성능:** 경로 계산 오버헤드는 미미하나 반복 문자열 조합은 공용 helper로 통일
- **민감 데이터 처리:** 숨김 디렉토리로 옮겨도 보안 기능이 생기는 것은 아니므로 문서상 과도한 의미 부여는 피함

---

## 8. 비기능 요구사항

| 항목             | 요구사항                                              |
| ---------------- | ----------------------------------------------------- |
| 응답 시간        | 기존 CLI 체감 성능 저하 없을 것                       |
| 동시 사용자      | 로컬 CLI 사용 기준 현행과 동일                        |
| 데이터 보존 기간 | `.sduck/` 아래 파일은 기존과 동일하게 프로젝트에 남음 |

---

## 9. 의존성 및 선행 조건

- 이 작업 시작 전 완료되어야 하는 작업: 없음
- 외부 서비스 / API 연동 필요 여부: 없음
- 피처 플래그(Feature Flag) 사용 여부: 없음

---

## 10. 미결 사항 (Open Questions)

- [ ] 추가 오픈 이슈 없음. 기존 루트 경로 자동 마이그레이션은 이번 범위에서 제외하고, 문서 예시 경로는 전부 `.sduck/...` 기준으로 수정한다.

---

## 11. 참고 자료

- `src/core/init.ts`
- `src/commands/init.ts`
- `src/commands/start.ts`
- `src/commands/spec-approve.ts`
- `src/commands/plan-approve.ts`
- `tests/e2e/`
