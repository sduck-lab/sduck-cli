# [feature] guided spec intake

> **작업 타입:** `feature` (Standard Feature)
> **작성자:** taehee
> **작성일:** 2026-04-21
> **연관 티켓:** -

---

## 1. 배경 및 목적

### 문제 / 요구사항

- 현재 `sduck start`는 task workspace와 빈 spec 템플릿을 바로 생성한다.
- 실제 사용자는 `spec.md` 본문을 꼼꼼히 읽지 않거나, 어떤 항목을 채워야 하는지 몰라 핵심 결정사항이 빠진 채 승인 직전까지 가는 경우가 생긴다.
- 특히 “무엇을 바꾸는지 / 범위와 제외 범위 / 성공 조건 / 검증 수준” 같은 고신호 정보가 문서에 늦게 들어가면 이후 plan 품질도 흔들린다.
- 따라서 사용자의 초기 작업 요청을 받은 직후, 구현에 필요한 핵심 질문을 CLI가 먼저 수집하고 그 답을 기반으로 `spec.md`를 생성하는 intake 흐름이 필요하다.

### 기대 효과

- [x] 사용자가 spec 본문을 전부 정독하지 않아도 필수 결정사항이 문서에 반영된다.
- [x] spec 승인 전에 요구사항 누락을 줄여 이후 plan 품질을 안정화한다.
- [x] 승인 흐름은 유지하면서도 문서 초안의 밀도를 높인다.
- [x] interactive 사용자 경험을 개선하되 non-interactive/자동화 경로는 깨지지 않게 유지한다.

---

## 2. 기능 명세

### 사용자 스토리

```text
As a task creator,
I want sduck to ask the essential follow-up questions for my requested work before drafting the spec,
So that the generated spec already contains the scope, constraints, and completion criteria I need to approve.
```

### 수용 기준 (Acceptance Criteria)

> 모든 항목이 충족되어야 이 작업이 완료(Done)로 간주된다.

- [ ] AC1: interactive TTY에서 `sduck start <type> <slug>` 실행 시, spec 생성 전에 핵심 질문 세트가 한 번에 수집된다.
- [ ] AC2: 수집된 답변은 `spec.md` 본문에 반영되며, 목표/범위/제외 범위/완료 조건/리스크/검증 방법이 비어 있지 않은 초안이 생성된다.
- [ ] AC3: 사용자가 질문을 취소하거나 non-interactive 환경에서 실행할 때, CLI가 멈추지 않고 안전한 fallback 경로(기존 템플릿 기반 생성 또는 명시적 중단)를 제공한다.
- [ ] AC4: spec 생성 후 상태는 여전히 `PENDING_SPEC_APPROVAL`이며, `sduck spec approve`를 통한 명시적 승인이 계속 필요하다.
- [ ] AC5: 질문 답변이 숨겨진 메타데이터에만 남지 않고, 승인 판단에 필요한 정보는 모두 markdown spec에 기록된다.

### 기능 상세 설명

#### 기대 사용자 흐름

```text
사용자 작업 요청
-> sduck start 실행
-> CLI가 필요한 질문 세트 수집
-> 답변 기반 spec.md 생성
-> 사용자 검토
-> sduck spec approve
```

#### guided intake 규칙

- 질문은 `spec.md`의 모든 헤더를 그대로 되묻는 방식이 아니라, 승인 전에 꼭 필요한 고신호 결정사항만 다룬다.
- 질문은 중간중간 문서 작성 도중 끼어드는 방식이 아니라 `start` 시점에 한 번에 수집한다.
- 질문 세트는 기본 공통 질문 + task type별 조건부 질문으로 구성한다.
- 사용자가 최초 요청에서 이미 충분히 표현한 내용이 있어도, 1차 구현에서는 “누락 방지”를 우선해 소수의 표준 질문 세트를 유지한다.
- 답변은 별도 숨김 저장소의 source of truth가 아니며, 승인 판단에 필요한 내용은 `spec.md` 본문으로 렌더링된다.

#### 질문 항목의 최소 범위

- 작업 목표 / 배경
- 포함 범위
- 제외 범위
- 성공 조건 또는 수용 기준 초안
- 검증 수준(예: unit / e2e / 수동 검증)
- 호환성, 운영, 리스크 관련 제약

#### fallback / 취소 동작

- non-interactive 환경에서는 prompt를 띄우지 않는다.
- interactive 환경에서 사용자가 guided intake를 취소했을 때는, partial state를 남기지 않도록 workspace 생성 전 취소하거나 명시적 에러로 종료한다.
- power user를 위한 template-only/skip 경로를 제공할 수 있어야 한다. 최종 옵션 이름은 plan에서 확정한다.

#### 본 작업의 제외 범위

- `plan.md` 생성을 위한 guided intake 추가
- `spec approve` / `plan approve` 단계에 질문 로직 삽입
- LLM 기반 자유 해석으로 질문 수를 동적으로 줄이는 기능
- review-ready / done 워크플로우 변경

---

## 3. 기술 설계

### 변경 대상 컴포넌트

| 레이어     | 파일 / 모듈                      | 변경 내용 요약                                                     |
| ---------- | -------------------------------- | ------------------------------------------------------------------ |
| CLI        | `src/cli.ts`                     | `start` 명령의 guided intake 진입점과 옵션 surface 추가            |
| Command    | `src/commands/start.ts`          | interactive prompt orchestration, fallback 처리, 출력 메시지 정리  |
| Core       | `src/core/start.ts`              | guided answer를 반영한 spec 생성 경로와 workspace 생성 순서 재조정 |
| Core       | `src/core/assets.ts`             | 기존 type template 연결 유지 여부 및 guided renderer 연계 검토     |
| Core (new) | `src/core/guided-intake/*`       | 질문 스키마, 답변 타입, spec 렌더링 helper 분리                    |
| Assets     | `.sduck/sduck-assets/types/*.md` | guided 렌더링과 충돌하지 않도록 기본 템플릿 구조 점검              |
| Tests      | `tests/unit/start.test.ts`       | guided / fallback / cancel 경로 단위 검증                          |
| Tests      | `tests/e2e/start.test.ts`        | 실제 CLI 상호작용 및 생성된 spec 내용 검증                         |
| Tests      | `tests/helpers/run-cli.ts`       | interactive CLI 테스트 harness 보완                                |
| Docs       | `README.md`                      | start 시 guided intake 동작과 fallback 사용법 문서화               |

### API 명세 (해당 시)

해당 없음. 외부 API 추가는 없다.

### 데이터 모델 변경 (해당 시)

```text
영속 데이터 모델 추가는 필수가 아니다.
guided intake 답변은 문서 생성 직전의 입력값으로 취급하고,
승인 판단에 필요한 정보는 spec.md 본문에 기록한다.
```

### 시퀀스 다이어그램 (해당 시)

```text
User -> CLI(start): type + slug 입력
CLI(start) -> Prompt Layer: guided intake 질문 세트 구성
Prompt Layer -> User: 질문 표시 및 답변 수집
User -> Prompt Layer: 답변 제출
Prompt Layer -> Core(start): normalized answers 전달
Core(start) -> Workspace: meta.yml / spec.md / plan.md 생성
Core(start) -> State: current_work_id 갱신
CLI(start) -> User: 생성 결과 및 다음 승인 단계 출력
```

---

## 4. UI/UX 명세 (해당 시)

### 화면 목록

| 화면명            | 라우트                  | 설명                                         |
| ----------------- | ----------------------- | -------------------------------------------- |
| CLI guided intake | `sduck start`           | 필수 질문을 한 번에 수집하는 터미널 상호작용 |
| CLI start result  | `sduck start` 결과 출력 | 생성 경로, 상태, 다음 단계 안내              |

### 디자인 레퍼런스

- 기존 CLI prompt 패턴 참고: `src/commands/init.ts`, `src/commands/fast-track.ts`

### 인터랙션 정의

- prompt는 `@inquirer/prompts` 기반 상호작용을 사용한다.
- 질문은 가능하면 선택지 우선, 필요 시 짧은 자유 입력을 받는다.
- 질문은 여러 단계로 끊기지 않고 한 세션에서 연속 진행된다.
- 응답 제출 후, 생성될 spec의 핵심 결정사항 요약을 보여주고 문서를 생성한다.
- 승인 여부는 여기서 묻지 않으며, 문서 생성 후 별도 `sduck spec approve`를 사용한다.

---

## 5. 테스트 계획

### 단위 테스트 (Unit Test)

| 대상 함수 / 모듈       | 테스트 케이스                    | 예상 결과                                              |
| ---------------------- | -------------------------------- | ------------------------------------------------------ |
| `runStartCommand`      | interactive TTY + guided answers | prompt 답변이 start core로 전달되고 성공 출력 반환     |
| guided question schema | task type별 질문 세트            | 공통 필수 질문과 조건부 질문이 의도대로 구성됨         |
| guided spec renderer   | answer -> markdown               | spec 핵심 섹션이 답변으로 채워짐                       |
| cancel / fallback 처리 | prompt 취소 / non-TTY            | partial workspace 없이 종료하거나 템플릿 fallback 수행 |

### 통합 / E2E 테스트

| 시나리오                | 단계                                 | 예상 결과                                  |
| ----------------------- | ------------------------------------ | ------------------------------------------ |
| interactive start       | `sduck start` 실행 후 답변 입력      | 생성된 `spec.md`에 답변 기반 내용이 반영됨 |
| non-interactive start   | TTY 없는 환경에서 `sduck start` 실행 | 프롬프트 없이 안전하게 기존 생성 경로 수행 |
| skip/template-only path | skip 옵션과 함께 실행                | 질문 없이 workspace/spec 생성              |
| approval continuity     | 생성 후 `sduck spec approve` 실행    | 상태 전이가 기존 규칙과 동일하게 유지됨    |

---

## 6. 영향 범위 분석

### 변경 파일 목록 (예상)

```text
target_paths:
  - src/cli.ts
  - src/commands/start.ts
  - src/core/start.ts
  - src/core/assets.ts
  - src/core/guided-intake/*
  - .sduck/sduck-assets/types/*.md
  - tests/unit/start.test.ts
  - tests/e2e/start.test.ts
  - tests/helpers/run-cli.ts
  - README.md
```

### 사이드 이펙트 검토

- 영향 가능성 있는 모듈:
  - `start` 명령의 생성 타이밍과 출력 메시지
  - interactive CLI 테스트 harness
  - 템플릿 기반 spec 생성 로직과 신규 guided renderer 간 역할 분리
- 회귀 테스트 필요 영역:
  - 기존 `sduck start` 기본 생성 성공 경로
  - no-git / git 경로와 guided intake의 결합
  - `current_work_id` 갱신 시점
  - 취소 시 workspace 잔여물 유무

### 롤백 계획

- guided intake 관련 명령/렌더링 변경을 제거하고 기존 템플릿 생성 경로로 되돌린다.
- `start`의 interactive 분기만 롤백 가능하도록 command layer와 core layer 분리를 유지한다.

---

## 7. 보안 / 성능 고려사항

- **인증·인가:** 로컬 CLI 기능이므로 별도 인증 변경 없음
- **입력값 검증:** prompt 답변은 빈값/과도한 길이/선택지 범위 등을 검증해야 한다.
- **성능:** 질문 수는 소수(고신호 위주)로 유지해 입력 부담과 시작 지연을 최소화한다.
- **민감 데이터 처리:** 사용자가 자유 입력에 민감 정보를 넣지 않도록 안내 문구를 검토한다.

---

## 8. 비기능 요구사항

| 항목          | 요구사항                                                              |
| ------------- | --------------------------------------------------------------------- |
| UX 일관성     | interactive start 경험이 기존 CLI 톤과 일관되어야 한다                |
| 자동화 안정성 | non-TTY/CI 환경에서 prompt로 인해 hang 되면 안 된다                   |
| 유지보수성    | 질문 정의, 답변 타입, markdown 렌더링이 분리되어 테스트 가능해야 한다 |

---

## 9. 의존성 및 선행 조건

- 이 작업 시작 전 완료되어야 하는 작업: 없음
- 외부 서비스 / API 연동 필요 여부: 없음
- 피처 플래그(Feature Flag) 사용 여부: 별도 런타임 플래그는 불필요하나, skip/template-only 옵션은 필요할 수 있음

---

## 10. 미결 사항 (Open Questions)

- [ ] guided intake를 기본값으로 둘 때 skip 옵션 이름을 `--no-prompt`, `--template-only`, 기타 무엇으로 둘지

---

## 11. 참고 자료

- `src/commands/init.ts`
- `src/commands/fast-track.ts`
- `src/core/start.ts`
- `.sduck/sduck-assets/types/feature.md`
- `.sduck/sduck-assets/eval/spec.yml`

---

## 12. Spec 자체 평가 (spec.yml 기준)

| 항목                | 점수(1-5) | 근거                                                                                           |
| ------------------- | --------- | ---------------------------------------------------------------------------------------------- |
| problem clarity     | 5         | 문서 누락이 왜 생기고, guided intake가 무엇을 해결하는지 명확히 정의했다                       |
| scope definition    | 4         | spec 생성 전 intake에 집중했고 plan/approval 변경을 제외 범위로 명시했다                       |
| completion criteria | 5         | interactive, fallback, approval continuity, markdown 반영 여부를 검증 가능한 항목으로 정의했다 |
| feasibility         | 4         | 기존 `start`/`@inquirer/prompts` 기반 위에서 구현 가능하나 interactive 테스트 보강이 필요하다  |
| risk coverage       | 5         | non-TTY, 취소 시 partial state, source of truth, prompt fatigue를 고려했다                     |
| testability         | 5         | unit/e2e 시나리오와 회귀 영역을 구체적으로 제시했다                                            |

총평: 4.7/5, 사용자 요구를 직접 해결하면서도 승인 규칙과 기존 자동화 경로를 보존하는 실행 가능한 spec.
