# [feature] expand real CLI e2e coverage

> **작업 타입:** `feature` (Standard Feature)
> **작성자:** Claude
> **작성일:** 2026-03-19
> **연관 티켓:**

---

## 1. 배경 및 목적

### 문제 / 요구사항

현재 일부 E2E 테스트는 프로젝트 내부의 실제 테스트 작업 디렉토리에서 로컬 CLI를 실행하도록 정리됐지만, 아직 모든 주요 명령과 agent rule 흐름이 같은 방식으로 검증되지는 않는다. 사용자는 `init`, `start`, `spec approve`, `plan approve`뿐 아니라 agent tool 관련 init 흐름(`claude-code`, `codex`, `opencode`, `gemini-cli`, `cursor`, `antigravity`)까지 실제 명령 실행과 실제 파일 생성 기준으로 반복 검증되길 원한다.

### 기대 효과

- 거의 모든 주요 CLI 명령이 프로젝트 내부의 실제 테스트 작업 디렉토리에서 검증된다.
- agent rule 관련 root file 및 managed file 생성이 실제 명령 실행 기준으로 확인된다.
- 테스트는 각 케이스 시작 전에 디렉토리를 비우고, 실행 후 생성물을 검사한 뒤 다시 반복 가능하게 유지된다.

---

## 2. 기능 명세

### 사용자 스토리

```text
As a CLI maintainer,
I want nearly all important commands and agent-rule flows to be tested through the real repo-local CLI,
So that I can trust actual file generation and workflow behavior across repeated runs.
```

### 수용 기준 (Acceptance Criteria)

> 모든 항목이 충족되어야 이 작업이 완료(Done)로 간주된다.

- [ ] AC1: 주요 E2E 테스트는 프로젝트 내부의 고정 테스트 작업 디렉토리를 비우고 로컬 CLI를 직접 실행한다.
- [ ] AC2: `init --agents ...`를 통한 agent tool 조합 테스트가 실제 파일 생성 기준으로 검증된다.
- [ ] AC3: root markdown file(`CLAUDE.md`, `AGENT.md`, `GEMINI.md`)와 managed file(`.cursor/...`, `.agents/...`) 생성이 실제 결과로 확인된다.
- [ ] AC4: init/start/spec approve/plan approve/agent-rule 관련 핵심 경로가 반복 실행 가능하게 유지된다.
- [ ] AC5: 테스트 간 디렉토리 충돌 없이 안정적으로 재실행된다.

### 기능 상세 설명

- 테스트는 글로벌 `sduck`가 아니라 현재 저장소의 로컬 CLI만 실행해야 한다.
- 각 테스트는 시작 전 자신이 사용하는 작업 디렉토리를 비우고, 실행 후 실제 파일/디렉토리/문서 내용을 검증해야 한다.
- agent 관련 테스트는 단순 stdout 확인이 아니라 각 agent별 생성 결과를 구체적으로 확인해야 한다.
- 전체 주요 명령을 real workspace 방식으로 전환하되, 명령군별로 고정된 workspace 이름을 나누어 반복 실행 시 충돌을 줄여야 한다.

---

## 3. 기술 설계

### 변경 대상 컴포넌트

| 레이어       | 파일 / 모듈                     | 변경 내용 요약                                        |
| ------------ | ------------------------------- | ----------------------------------------------------- |
| test helpers | `tests/helpers/*`               | 고정 workspace 준비/정리 및 로컬 CLI 실행 helper 보강 |
| e2e tests    | `tests/e2e/*`                   | 모든 주요 명령을 real workspace 기준으로 전환         |
| test layout  | `test/workspaces/*`             | 명령군별 workspace 분리 및 반복 초기화                |
| docs         | 필요 시 `CLAUDE.md`, `AGENT.md` | 테스트 원칙 보강                                      |

### API 명세 (해당 시)

해당 없음.

### 데이터 모델 변경 (해당 시)

해당 없음.

### 시퀀스 다이어그램 (해당 시)

```text
Test runner → clean fixed workspace → run repo-local CLI command → inspect generated files → repeat
```

---

## 4. UI/UX 명세 (해당 시)

### 화면 목록

해당 없음.

### 디자인 레퍼런스

해당 없음.

### 인터랙션 정의

- 각 테스트는 자신의 workspace를 비운다.
- 로컬 CLI로 실제 명령을 실행한다.
- 생성된 파일/디렉토리/내용을 검증한다.

---

## 5. 테스트 계획

### 단위 테스트 (Unit Test)

| 대상 함수 / 모듈 | 테스트 케이스           | 예상 결과                    |
| ---------------- | ----------------------- | ---------------------------- |
| workspace helper | workspace 초기화/재생성 | 안전하게 반복 실행 가능      |
| run helper       | 로컬 CLI 실행           | 글로벌 설치본 없이 결과 반환 |

### 통합 / E2E 테스트

| 시나리오          | 단계                                         | 예상 결과                                         |
| ----------------- | -------------------------------------------- | ------------------------------------------------- |
| init default      | workspace 초기화 후 `init` 실행              | 기본 자산 생성 검증                               |
| init agents       | workspace 초기화 후 `init --agents ...` 실행 | 한 테스트에서 전체 agent 조합 rule file 생성 검증 |
| start flow        | `start` 실행                                 | task 파일 생성 검증                               |
| spec approve flow | `spec approve` 실행                          | 상태 전이와 파일 변경 검증                        |
| plan approve flow | `plan approve` 실행                          | 상태 전이와 meta 반영 검증                        |

---

## 6. 영향 범위 분석

### 변경 파일 목록 (예상)

```text
target_paths:
  - tests/helpers/...
  - tests/e2e/...
  - test/workspaces/...
  - 필요 시 CLAUDE.md
  - 필요 시 AGENT.md
```

### 사이드 이펙트 검토

- 고정 workspace를 많이 쓰면 테스트 실행 시간이 길어질 수 있다.
- workspace 분리가 충분하지 않으면 테스트 간 충돌이 생길 수 있다.
- agent 조합 테스트를 넓게 추가하면 유지보수 비용이 증가할 수 있다.

- 영향 가능성 있는 모듈: e2e helper, workspace cleanup, agent-rule tests, CI 실행 시간
- 회귀 테스트 필요 영역: 모든 주요 CLI 명령과 agent-rule 생성

### 롤백 계획

- 새 real-workspace 전략을 일부 테스트에만 유지하고, 과도한 범위는 기존 방식으로 축소한다.

---

## 7. 보안 / 성능 고려사항

- **인증·인가:** 해당 없음
- **입력값 검증:** 삭제 가능한 workspace 경로는 프로젝트 내부 허용 경로로 제한
- **성능:** 과도한 중복 실행은 피하고 공통 helper를 통해 비용 통제
- **민감 데이터 처리:** 테스트 cleanup가 사용자 파일을 건드리지 않도록 안전장치 유지

---

## 8. 비기능 요구사항

| 항목             | 요구사항                                     |
| ---------------- | -------------------------------------------- |
| 응답 시간        | 테스트 시간이 증가해도 관리 가능한 수준일 것 |
| 동시 사용자      | 병렬/직렬 정책이 명확할 것                   |
| 데이터 보존 기간 | 테스트 산출물은 반복 실행 시 정리 가능       |

---

## 9. 의존성 및 선행 조건

- 이 작업 시작 전 완료되어야 하는 작업: real project test workspace helper 도입 작업
- 외부 서비스 / API 연동 필요 여부: 없음
- 피처 플래그(Feature Flag) 사용 여부: 없음

---

## 10. 미결 사항 (Open Questions)

- [ ] 추가 오픈 이슈 없음. agent 조합은 한 테스트에서 검증하고, 전체 주요 E2E를 real workspace 방식으로 전환한다.

---

## 11. 참고 자료

- `tests/helpers/run-cli.ts`
- `tests/helpers/temp-workspace.ts`
- `tests/e2e/init-agent-rules.test.ts`
- `tests/e2e/init.test.ts`
- `tests/e2e/start.test.ts`
- `tests/e2e/spec-approve.test.ts`
- `tests/e2e/plan-approve.test.ts`
