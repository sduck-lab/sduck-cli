# [feature] step-command — Step 완료 CLI 명령 및 Step 파싱 개선

> **작업 타입:** `feature`
> **작성자:** taehee
> **작성일:** 2026-03-25
> **연관 티켓:** -

---

## 1. 배경 및 목적

### 문제 / 요구사항

implement 단계에서 LLM 에이전트가 plan.md의 각 step 완료를 meta.yml에 기록해야 하는데, 두 가지 문제가 있다:

1. **step 완료 기록 수단 부재**: CLI 명령이 없어 LLM이 meta.yml의 YAML을 직접 편집해야 하며, 이 과정에서 포맷 오류가 빈번하게 발생한다.
2. **step 헤더 파싱이 너무 엄격**: `countPlanSteps()`가 `## Step N. 제목` 형식만 인식하여, LLM이 `## Step N:`, `## Step N -`, `### StepN.` 등 약간 다른 형식으로 작성하면 step 수가 0으로 카운트되어 plan approve가 실패한다.

### 기대 효과

- `sduck step <number>` 명령으로 step 완료를 안전하게 기록
- step 헤더 파싱을 유연하게 하여 LLM의 사소한 형식 차이를 허용
- agent rules에 "step 완료 시 `sduck step <N>` 실행"으로 명시하여 일관성 확보

---

## 2. 기능 명세

### 사용자 스토리

```
As a LLM coding agent,
I want to mark plan steps as completed via CLI command,
So that step tracking is reliable without manual YAML editing.
```

### 수용 기준 (Acceptance Criteria)

> 모든 항목이 충족되어야 이 작업이 완료(Done)로 간주된다.

- [x] AC1: `sduck step <N>` 실행 시 current work의 meta.yml `steps.completed`에 N이 추가된다
- [x] AC2: 이미 완료된 step 번호를 다시 실행하면 중복 없이 무시(멱등)하고 성공 메시지 반환
- [x] AC3: N이 1 미만이거나 steps.total 초과이면 에러 반환
- [x] AC4: current work가 없으면 에러 반환
- [x] AC5: status가 `IN_PROGRESS`가 아니면 에러 반환
- [x] AC6: steps.total이 null(plan 미승인)이면 에러 반환
- [x] AC7: `countPlanSteps()`가 `## Step N. 제목`, `## Step N: 제목`, `## Step N - 제목`, `### Step N. 제목` 등 흔한 변형을 모두 인식한다
- [x] AC8: step 번호가 연속이 아니거나 중복 헤더가 있어도 고유 번호 기준으로 정확히 카운트한다
- [x] AC9: agent-rules/core.md에 step 완료 시 `sduck step <N>` 사용 안내가 추가된다
- [x] AC10: 단위 테스트와 E2E 테스트가 통과한다

### 기능 상세 설명

#### `sduck step <number>` 명령

- current work의 meta.yml을 읽어 `steps.completed` 배열에 number를 추가
- completed 배열은 오름차순 정렬 유지
- 이미 포함된 번호면 변경 없이 성공 처리 (멱등)
- `updated_at` 갱신

#### step 헤더 파싱 개선

현재 regex: `/^#{2,3} Step \d+\. .+$/gm`

개선 후 인식 패턴:

- `## Step 1. 제목` (현재)
- `## Step 1: 제목`
- `## Step 1 - 제목`
- `## Step 1 제목` (구분자 없이 공백만)
- `### Step 1. 제목` (h3)
- 위 모든 패턴에서 `Step`과 숫자 사이 공백 없는 경우도 허용 (`Step1.`)

개선 regex: `/^#{2,3}\s+[Ss]tep\s*(\d+)/gm` — 고유 step 번호를 추출하고 Set으로 중복 제거 후 카운트

---

## 3. 기술 설계

### 변경 대상 컴포넌트

| 레이어  | 파일 / 모듈                               | 변경 내용 요약                |
| ------- | ----------------------------------------- | ----------------------------- |
| core    | `src/core/step.ts` (신규)                 | step 완료 로직                |
| command | `src/commands/step.ts` (신규)             | CLI command 래퍼              |
| cli     | `src/cli.ts`                              | `step <number>` 명령 등록     |
| core    | `src/core/plan-approve.ts`                | `countPlanSteps()` regex 개선 |
| rules   | `.sduck/sduck-assets/agent-rules/core.md` | step 완료 안내 추가           |

---

## 4. 테스트 계획

### 단위 테스트 (Unit Test)

| 대상 함수 / 모듈    | 테스트 케이스                 | 예상 결과          |
| ------------------- | ----------------------------- | ------------------ |
| `markStepCompleted` | 정상 step 번호                | completed에 추가   |
| `markStepCompleted` | 이미 완료된 번호 (멱등)       | 변경 없이 성공     |
| `markStepCompleted` | 범위 밖 번호 (0, total+1)     | 에러               |
| `markStepCompleted` | steps.total이 null            | 에러               |
| `markStepCompleted` | status가 IN_PROGRESS 아님     | 에러               |
| `countPlanSteps`    | `## Step 1. 제목` (기존 형식) | 1                  |
| `countPlanSteps`    | `## Step 1: 제목`             | 1                  |
| `countPlanSteps`    | `## Step1. 제목` (공백 없음)  | 1                  |
| `countPlanSteps`    | 중복 step 번호 헤더           | 고유 번호만 카운트 |
| `countPlanSteps`    | 혼합 형식 (`.`, `:`, `-`)     | 모두 인식          |

### E2E 테스트

| 시나리오                       | 예상 결과            |
| ------------------------------ | -------------------- |
| step 1 완료 → meta.yml 확인    | completed: [1]       |
| step 1, 2, 3 순차 완료         | completed: [1, 2, 3] |
| 중복 step 실행                 | 멱등, 에러 없음      |
| plan 미승인 상태에서 step 실행 | 에러                 |

---

## 5. 영향 범위 분석

### 변경 파일 목록 (예상)

```
target_paths:
  - src/core/step.ts (신규)
  - src/commands/step.ts (신규)
  - src/cli.ts
  - src/core/plan-approve.ts
  - .sduck/sduck-assets/agent-rules/core.md
  - tests/unit/step.test.ts (신규)
  - tests/unit/plan-approve.test.ts (수정)
  - tests/e2e/step.test.ts (신규)
```

### 사이드 이펙트 검토

- `countPlanSteps()` regex 변경으로 기존에 인식되던 패턴이 깨지지 않아야 함 → 기존 테스트로 검증
- meta.yml의 `steps.completed` 포맷은 기존 `done.ts`의 파싱과 호환되어야 함 (`[1, 2, 3]` 형식)

---

## 6. 미결 사항

- (없음)
