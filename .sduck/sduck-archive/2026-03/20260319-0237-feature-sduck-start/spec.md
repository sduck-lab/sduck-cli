# [feature] sduck start

> **작업 타입:** `feature` (Standard Feature)
> **작성자:** taehee
> **작성일:** 2026-03-19
> **연관 티켓:** -

---

## 1. 배경 및 목적

### 문제 / 요구사항

현재 `sduck init`은 프로젝트 초기화와 에이전트 규칙 파일 생성을 지원하지만,
실제 작업을 시작하는 핵심 명령인 `sduck start <type> <slug>`는 아직 구현되지 않았다.

이 명령은 SDD 워크플로우에서 새로운 작업 디렉토리를 만들고,
`meta.yml`, `spec.md`, `plan.md`를 정확한 상태와 템플릿으로 생성하는 핵심 진입점이다.

`sduck start`가 없으면 사용자가 작업 ID, UTC 타임스탬프, 파일 구조, 상태 초기값,
타입별 스펙 템플릿 적용을 수동으로 맞춰야 하므로 워크플로우 일관성이 쉽게 깨진다.

### 기대 효과

- 사용자가 `sduck start <type> <slug>` 한 번으로 새 작업을 시작할 수 있다
- 작업 폴더명과 `meta.yml.id`가 동일한 규칙으로 생성된다
- UTC 타임스탬프와 초기 상태가 자동으로 맞춰진다
- 타입별 `spec.md` 템플릿이 `.sduck/sduck-assets/` 기준으로 정확히 적용된다
- `plan.md`는 빈 파일로 생성되어 이후 승인 워크플로우를 자연스럽게 이어갈 수 있다

---

## 2. 기능 명세

### 사용자 스토리

```text
As a developer,
I want to run `sduck start <type> <slug>`,
So that a new SDD task workspace is created with the correct metadata and templates.
```

### 수용 기준 (Acceptance Criteria)

> 모든 항목이 충족되어야 이 작업이 완료(Done)로 간주된다.

- [x] AC1: `sduck start <type> <slug>` 실행 시 `.sduck/sduck-workspace/YYYYMMDD-HHmm-{type}-{slug}/` 디렉토리가 생성된다
- [x] AC2: 생성된 디렉토리 안의 `meta.yml.id`는 폴더명과 정확히 동일하다
- [x] AC3: `created_at`은 UTC ISO 8601(`Z`) 형식으로 기록된다
- [x] AC4: 초기 상태는 `PENDING_SPEC_APPROVAL`이고, spec/plan 승인값과 steps 값이 규칙대로 채워진다
- [x] AC5: `spec.md`는 `.sduck/sduck-assets/`의 타입별 템플릿을 사용해 생성된다
- [x] AC6: `plan.md`는 빈 파일로 생성된다
- [x] AC7: 지원하지 않는 type, 잘못된 slug, 누락 인자에 대해 명확한 에러를 출력한다
- [x] AC8: 실제 e2e 테스트로 디렉토리명, meta, spec 템플릿, plan 빈 파일 생성을 검증한다

### 기능 상세 설명

- 명령어 형식: `sduck start <type> <slug>`
- 현재 지원 type은 최소 아래를 포함한다
  - `feature`
  - `fix`
  - `refactor`
  - `chore`
  - `build`
- `type`은 `.sduck/sduck-assets/types/{type}.md` 템플릿과 매핑된다
- `slug`는 폴더명과 `meta.yml`에 직접 들어가므로 안전한 slug 형식 검증이 필요하다
- 생성 구조는 아래를 따른다

```text
.sduck/sduck-workspace/
└── YYYYMMDD-HHmm-{type}-{slug}/
    ├── meta.yml
    ├── spec.md
    └── plan.md
```

- `meta.yml` 초기값은 최소 아래 구조를 따라야 한다

```yaml
id: YYYYMMDD-HHmm-{type}-{slug}
type: { type }
slug: { slug }
created_at: 2026-03-19T00:00:00Z

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

### 엣지 케이스

- `.sduck/sduck-workspace/`가 아직 없을 때 `start`가 이를 같이 생성해야 하는지
- 같은 타임스탬프/slug 조합의 디렉토리가 이미 존재하는 경우
- `slug`에 공백, 대문자, 특수문자, 경로 구분자가 들어오는 경우
- 지원하지 않는 `type`을 전달한 경우
- `.sduck/sduck-assets/types/{type}.md` 템플릿이 없는 경우
- 이미 `IN_PROGRESS` 또는 `PENDING_*` 상태 작업이 있을 때 새 작업 시작을 허용할지 여부

---

## 3. 기술 설계

### 변경 대상 컴포넌트

| 레이어   | 파일 / 모듈                            | 변경 내용 요약                         |
| -------- | -------------------------------------- | -------------------------------------- |
| CLI      | `src/cli.ts`                           | `start <type> <slug>` 명령 등록        |
| Commands | `src/commands/start.ts`                | 입력 검증, 실행 결과 출력              |
| Core     | `src/core/start.ts`                    | 작업 ID 생성, meta/spec/plan 생성 로직 |
| Core     | `src/core/workspace.ts` 또는 동등 모듈 | 기존 작업 조회, 경로 계산, 상태 검사   |
| Tests    | `tests/unit/*`                         | slug/type/ID/meta 생성 로직 검증       |
| Tests    | `tests/e2e/*`                          | 실제 파일 생성 흐름 검증               |

### API 명세 (해당 시)

해당 없음.

### 데이터 모델 변경 (해당 시)

해당 없음.

### 시퀀스 다이어그램 (해당 시)

```text
User → CLI(start)
        → input validation
        → start command
        → workspace creation
        → meta/spec/plan generation
        → summary output
```

---

## 4. UI/UX 명세 (해당 시)

CLI 출력 기준으로 정의한다.

### 인터랙션 정의

- 성공 시 생성된 작업 경로와 초기 상태를 명확히 출력한다
- 생성 후 아래와 유사한 안내를 제공해야 한다

```text
✅ 작업 디렉토리 생성됨
   경로: .sduck/sduck-workspace/YYYYMMDD-HHmm-{type}-{slug}/
   상태: PENDING_SPEC_APPROVAL
```

- 지원하지 않는 type이나 잘못된 slug는 무엇이 잘못됐는지 바로 이해 가능한 메시지로 출력한다
- 기존 활성 작업 정책이 있다면, 왜 차단되었는지와 다음 액션을 안내한다

---

## 5. 테스트 계획

### 단위 테스트 (Unit Test)

| 대상 함수 / 모듈 | 테스트 케이스  | 예상 결과                               |
| ---------------- | -------------- | --------------------------------------- |
| ID 생성 로직     | UTC 시각 입력  | `YYYYMMDD-HHmm-{type}-{slug}` 형식 생성 |
| slug 검증 로직   | 유효/무효 slug | 허용/거부 정확히 구분                   |
| meta 생성 로직   | 신규 작업 생성 | 초기 상태와 값 일치                     |
| 템플릿 경로 계산 | type별 입력    | 올바른 asset 경로 반환                  |

### 통합 / E2E 테스트

| 시나리오          | 단계                             | 예상 결과                     |
| ----------------- | -------------------------------- | ----------------------------- |
| feature 작업 시작 | `sduck start feature login` 실행 | workspace/meta/spec/plan 생성 |
| fix 작업 시작     | `sduck start fix bad-state` 실행 | fix 템플릿 기반 spec 생성     |
| 잘못된 type       | `sduck start unknown task` 실행  | 실패 코드와 에러 메시지 출력  |
| 잘못된 slug       | 공백/특수문자 포함 slug로 실행   | 실패 코드와 에러 메시지 출력  |
| 템플릿 누락       | 필요한 spec asset 없음           | 명확한 실패 출력              |

---

## 6. 영향 범위 분석

### 변경 파일 목록 (예상)

```yaml
target_paths:
  - src/cli.ts
  - src/commands/start.ts
  - src/core/start.ts
  - src/core/workspace.ts
  - tests/unit/*
  - tests/e2e/*
  - docs/snippets.md
```

### 사이드 이펙트 검토

- 이후 `spec approve`, `plan create`, `status` 명령이 이 생성 결과를 기준으로 동작하게 된다
- ID/타임스탬프 형식이 바뀌면 기존 워크플로우 문서 및 테스트와 충돌할 수 있다
- build/feature/fix 등 템플릿 자산명이 실제 구현과 어긋나면 생성 실패가 발생한다

### 롤백 계획

- `start` 명령과 관련 생성 로직을 제거한다
- 잘못 생성된 workspace는 사용자가 삭제 가능하도록 경로를 명확히 안내한다

---

## 7. 보안 / 성능 고려사항

- **인증·인가:** 해당 없음
- **입력값 검증:** `type`, `slug`는 내부 허용 규칙으로 제한한다
- **성능:** 파일 3개 생성 수준이므로 즉시 완료 가능한 수준이어야 한다
- **민감 데이터 처리:** 사용자 입력 slug를 파일 경로에 넣기 전에 경로 traversal 불가 형태로 검증한다

---

## 8. 비기능 요구사항

| 항목             | 요구사항                                                  |
| ---------------- | --------------------------------------------------------- |
| 응답 시간        | 일반 로컬 환경에서 즉시 완료 가능한 수준                  |
| 동시 사용자      | 고려 대상 아님                                            |
| 데이터 보존 기간 | 생성된 workspace는 사용자가 명시적으로 삭제할 때까지 유지 |

---

## 9. 의존성 및 선행 조건

- 이 작업 시작 전 완료되어야 하는 작업: `sduck init` 및 asset 초기화 기능 완료
- 외부 서비스 / API 연동 필요 여부: 없음
- 피처 플래그(Feature Flag) 사용 여부: 없음

---

## 10. 미결 사항 (Open Questions)

- [ ] 이미 활성 작업(`IN_PROGRESS`, `PENDING_*`)이 있으면 `sduck start`는 새 작업 생성을 거부하고, 기존 작업 경로와 상태를 안내한다
- [ ] `slug`는 입력을 소문자 kebab-case로 정규화한 뒤 사용한다
- [ ] `build` 타입은 `.sduck/sduck-assets/types/build.md` 템플릿을 사용한다

---

## 11. 참고 자료

- `.sduck/sduck-workspace/20260319-0114-feature-sduck-init/spec.md`
- `.sduck/sduck-workspace/20260318-1430-build-sduck-cli/spec.md`
- `CLAUDE.md`
- `AGENT.md`
