# Plan

## Step 1. fast-track 상태 모델과 UX 계약 정의

- `src/core/fast-track.ts`를 새로 만든다.
- 이 파일에서 fast-track 전용 입력/출력 타입을 정의한다.
  - `FastTrackCommandInput`
  - `FastTrackTarget`
  - `FastTrackResult`
  - 필요하면 단계별 실행 결과 row 타입
- fast-track의 기본 UX를 아래처럼 고정한다.
  - 명령 형식: `sduck fast-track <type> <slug>` 또는 동등한 서브커맨드 구조
  - 역할: 새 task를 만들고, minimal spec과 minimal plan을 자동 생성한 뒤, 마지막에 사용자 확인 1회로 spec/plan 승인을 함께 처리할 수 있게 한다
  - 단, 사용자 확인 없이 승인 상태를 바꾸지는 않는다
- 기존 상태 모델은 그대로 재사용한다.
  - 생성 직후: `PENDING_SPEC_APPROVAL`
  - 사용자 1회 확인 후 spec/plan 동시 승인 시: `IN_PROGRESS`
- 새 상태는 추가하지 않는다.
- 성공/실패 출력에 아래가 반드시 포함되도록 계약을 정리한다.
  - 생성된 task id/path
  - minimal spec 생성 여부
  - minimal plan 생성 여부
  - 어떤 승인 단계까지 처리됐는지
  - 실패 시 일반 명령 대안 (`sduck spec approve`, `sduck plan approve`)

## Step 2. minimal spec / minimal plan 생성 로직 구현

- `src/core/start.ts`를 확장하거나 `src/core/fast-track.ts` 내부 helper로 분리해 fast-track 전용 문서 생성 로직을 추가한다.
- 일반 `start`는 그대로 유지하고, fast-track만 별도 minimal 템플릿을 사용하게 한다.
- minimal spec은 파일을 생략하지 않고 아래 필수 내용만 포함하는 초경량 문서로 생성한다.
  - 목표
  - 범위
  - 제외 범위
  - 완료 조건 2~3개
- minimal plan은 바로 승인 가능한 수준의 짧은 Step 구조를 생성한다.
  - `## Step N. 제목` 형식을 유지한다
  - Step 수는 작게 유지하되, 검증 명령을 포함한다
- 생성 결과는 기존 `done` 검증과 충돌하지 않도록 해야 한다.
  - spec에는 체크박스가 있어야 한다
  - plan에는 유효한 Step header가 있어야 한다
- 필요하면 `src/core/start.ts`의 `renderInitialMeta()`나 템플릿 적용 helper를 재사용 가능한 형태로 분리한다.

## Step 3. 한 번의 확인으로 spec/plan 승인 처리하는 흐름 구현

- `src/commands/fast-track.ts`를 새로 만든다.
- 비대화형 환경과 대화형 환경을 나눠 처리한다.
- 대화형 환경에서는 아래 흐름을 구현한다.
  - fast-track task 생성
  - 생성된 minimal spec / minimal plan 요약 출력
  - 사용자에게 한 번만 확인받기
  - 확인 시 내부적으로 `approveSpecs()`와 `approvePlans()`를 순차 호출
- 비대화형 환경에서는 승인 자동 수행을 막고, 생성만 한 뒤 다음 명령을 안내한다.
- spec 승인과 plan 승인을 묶더라도 내부 검증은 그대로 재사용한다.
  - spec은 기존 approval 함수 사용
  - plan은 Step header 검증 포함 기존 approval 함수 사용
- 중간 실패가 나면 상태가 어정쩡하게 남지 않도록 순서를 보수적으로 잡는다.
  - 예: task 생성 후 spec 승인 성공, plan 승인 실패 시 상태/메시지를 명확히 표시

## Step 4. CLI 연결과 메시지 정리

- `src/cli.ts`에 fast-track 명령을 등록한다.
- 기존 `start`, `spec approve`, `plan approve`, `done`와 톤이 맞는 설명문을 추가한다.
- 성공 메시지는 아래를 이해 가능하게 보여줘야 한다.
  - fast-track workspace 생성
  - minimal spec / plan 생성
  - 승인 완료 시 `IN_PROGRESS` 진입
  - 승인 미완료 시 수동 다음 단계
- 실패 메시지는 아래 상황을 구분한다.
  - 이미 활성 task가 있는 경우
  - interactive 확인이 불가능한 경우
  - 승인 중 일부 단계 실패
  - target/type/slug 유효성 오류
- `README.md`에 fast-track 사용법, minimal spec 개념, interactive 제한을 추가한다.

## Step 5. agent rule과 워크플로우 문서에 fast-track 규칙 반영

- `CLAUDE.md`, `AGENT.md`, `.sduck/sduck-assets/agent-rules/core.md`를 수정한다.
- 필요하면 agent별 자산 문서(`.sduck/sduck-assets/agent-rules/*.md`)에도 fast-track 사용 원칙을 반영한다.
- 아래 규칙을 문서에 명시한다.
  - fast-track은 `spec.md`를 생략하지 않는다
  - fast-track은 minimal spec + minimal plan을 사용하는 빠른 경로다
  - 사용자 승인 자체는 우회하지 않는다
  - interactive 환경에서만 확인 1회로 spec/plan 승인을 묶을 수 있다
  - 비대화형 환경에서는 생성만 수행하고, 이후 `sduck spec approve`, `sduck plan approve`로 이어간다
  - 범위가 크거나 불확실한 작업에는 fast-track을 쓰지 않고 일반 흐름을 사용한다
- fast-track을 언제 추천하고 언제 금지하는지 예시를 넣어, 에이전트가 적절한 상황에서만 사용하도록 유도한다.

## Step 6. 단위 테스트 추가

- `tests/unit/fast-track.test.ts`를 새로 만든다.
- 아래 항목을 순수 로직 중심으로 검증한다.
  - minimal spec 내용이 필수 섹션과 체크리스트를 포함하는지
  - minimal plan 내용이 유효한 Step header를 포함하는지
  - fast-track 결과 상태 계산이 기대와 일치하는지
- 비대화형 환경에서 승인 자동 진행을 막는지
- 기존 상태 모델을 재사용하는지
- 필요하면 `tests/unit/start.test.ts`, `tests/unit/spec-approve.test.ts`, `tests/unit/plan-approve.test.ts`의 helper 패턴을 재사용한다.

## Step 7. E2E 검증과 품질 게이트 실행

- `tests/e2e/fast-track.test.ts`를 새로 만든다.
- 실제 CLI 기준으로 최소 아래 시나리오를 검증한다.
  - interactive가 아닌 환경에서 `fast-track` 실행 시 task와 minimal spec/plan은 생성되지만 자동 승인 없이 안내만 출력
  - 허용 가능한 흐름에서 fast-track 결과물이 이후 `spec approve`, `plan approve`로 자연스럽게 이어짐
  - 이미 활성 task가 있으면 fast-track이 거부됨
  - 생성된 spec/plan이 `done` 검증과 호환되는 최소 구조를 가짐
- `tests/helpers/run-cli.ts`가 interactive 입력 주입이 어렵다면, 이번 단계에서는 비대화형 fallback 중심으로 먼저 검증한다.
- 마지막으로 `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build`를 실행한다.
- spec의 acceptance criteria를 대조해 체크하고 task 완료 처리로 이어간다.
