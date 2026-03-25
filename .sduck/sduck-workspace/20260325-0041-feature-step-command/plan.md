# Plan: step-command

## Step 1. `countPlanSteps()` regex 개선 (`plan-approve.ts`)

**대상 파일:** `src/core/plan-approve.ts` (기존, ~170줄)

**변경 의도:**

- `countPlanSteps()` (L60-63)의 regex를 `/^#{2,3}\s+[Ss]tep\s*(\d+)/gm`으로 변경
- 캡처 그룹 `(\d+)`로 step 번호를 추출하고, `Set`으로 중복 제거 후 `.size` 반환
- 기존 반환 타입 `number` 유지
- `validatePlanHasSteps()` (L65-71)는 `countPlanSteps()` 호출만 하므로 변경 불필요
- 기존 `## Step 1. 제목` 형식은 새 regex에도 매치됨 (하위호환)

**검증:**

- `tests/unit/plan-approve.test.ts`의 기존 `countPlanSteps` 테스트 통과 확인
- 새 테스트 케이스 추가: `## Step 1: 제목`, `## Step1. 제목`, 중복 번호 헤더, `## Step 1 제목` (구분자 없음)
- `npm run test:unit -- --reporter verbose tests/unit/plan-approve.test.ts`

---

## Step 2. `src/core/step.ts` 신규 생성

**대상 파일:** `src/core/step.ts` (신규)

**변경 의도:**

### 2-1. `parseStepsBlock(metaContent: string): { total: number | null; completed: number[] }`

- `done.ts`의 `validateDoneMetaContent()`와 동일한 regex 패턴으로 steps 블록 파싱
  - `total`: `/^ {2}total:[ \t]+(.+)$/m` — `null` 문자열이면 `null`, 그 외 `parseInt`
  - `completed`: `/^ {2}completed:[ \t]+\[(.*)\]$/m` — 쉼표 분리 후 `parseInt`, 빈 배열이면 `[]`
- steps 블록 자체가 없으면 에러 throw

### 2-2. `updateStepsCompleted(metaContent: string, completedSteps: number[]): string`

- `steps.completed` 라인을 새 배열로 교체
- 포맷: `  completed: [1, 2, 3]` (오름차순 정렬, 쉼표+공백 구분)
- `updated_at` 라인도 갱신

### 2-3. `markStepCompleted(projectRoot: string, stepNumber: number): Promise<StepResult>`

- `readCurrentWorkId()` → null이면 에러 (`throwNoCurrentWorkError('step')`)
- current work의 meta.yml 읽기
- `parseMetaText()`로 status 확인 → `IN_PROGRESS` 아니면 에러
- `parseStepsBlock()`로 steps 파싱
  - `total === null`이면 에러: `"Steps not initialized. Run \`sduck plan approve\` first."`
  - `stepNumber < 1 || stepNumber > total`이면 에러: `"Step {N} is out of range (1-{total})."`
- completed 배열에 stepNumber 추가 (이미 있으면 무시)
- 오름차순 정렬
- `updateStepsCompleted()`로 meta.yml 업데이트
- `updated_at` 갱신
- 반환: `{ workId: string; stepNumber: number; alreadyCompleted: boolean; completed: number[]; total: number }`

**StepResult 인터페이스:**

```typescript
export interface StepResult {
  alreadyCompleted: boolean;
  completed: number[];
  stepNumber: number;
  total: number;
  workId: string;
}
```

**검증:** `npm run typecheck`

---

## Step 3. `src/commands/step.ts` 신규 생성 및 CLI 등록

**대상 파일:**

- `src/commands/step.ts` (신규)
- `src/cli.ts` (기존, ~318줄)

**변경 의도:**

### 3-1. `src/commands/step.ts`

- 기존 command 래퍼 패턴 (`{ stdout, stderr, exitCode }`) 준수
- `runStepCommand(stepNumber: number, projectRoot: string): Promise<StepCommandResult>`
- 성공 시 stdout: `Step {N} completed. ({completed}/{total})` 또는 `Step {N} already completed. ({completed}/{total})`
- 에러 시 stderr에 에러 메시지

### 3-2. `src/cli.ts` 수정

- `import { runStepCommand } from './commands/step.js';` 추가
- `program.command('step done <number>')` 등록 (서브커맨드 구조)
  - `.description('Mark a plan step as completed')`
  - action에서 `Number.parseInt(number, 10)` → `isNaN`이면 에러 → `runStepCommand()` 호출
- 향후 확장성 고려: `sduck step list`, `sduck step undo` 등 서브커맨드 추가 가능

**검증:** `npm run typecheck`, `npm run dev -- step done --help`

---

## Step 4. 단위 테스트 작성 (`tests/unit/step.test.ts`, `tests/unit/plan-approve.test.ts` 수정)

**대상 파일:**

- `tests/unit/step.test.ts` (신규)
- `tests/unit/plan-approve.test.ts` (기존, ~133줄)

**변경 의도:**

### 4-1. `tests/unit/step.test.ts`

`parseStepsBlock` 테스트:

- total이 숫자일 때 정상 파싱
- total이 `null`일 때 `null` 반환
- completed가 비어있을 때 빈 배열
- completed에 값이 있을 때 파싱

`updateStepsCompleted` 테스트:

- 빈 배열 → `completed: []`
- `[1, 3, 2]` → `completed: [1, 2, 3]` (정렬)
- `updated_at` 갱신 확인

`markStepCompleted` 테스트 (파일시스템 기반):

- 정상 step 완료 → completed에 추가
- 이미 완료된 step → `alreadyCompleted: true`, 배열 변경 없음
- step 0 → 에러
- step > total → 에러
- total이 null → 에러
- status가 `PENDING_PLAN_APPROVAL` → 에러

### 4-2. `tests/unit/plan-approve.test.ts` 수정

`countPlanSteps` describe 블록에 새 케이스 추가:

- `## Step 1: First` → 1
- `## Step1. First` (공백 없음) → 1
- `## Step 1 - First` → 1
- `## Step 1 First` (구분자 없음) → 1
- 중복 step 번호 (`## Step 1. A\n## Step 1. B`) → 1 (고유 카운트)
- `## step 1. First` (소문자) → 1
- 기존 "ignores untitled step headers" 테스트: `## Step 1.`은 새 regex에서 여전히 매치됨 → 테스트 기대값 수정 필요 (1로 변경, 제목 없는 것도 step으로 인식)

**검증:** `npm run test:unit`

---

## Step 5. E2E 테스트 작성 (`tests/e2e/step.test.ts`)

**대상 파일:** `tests/e2e/step.test.ts` (신규)

**변경 의도:**

기존 E2E 패턴 참고: `tests/e2e/start.test.ts` (임시 디렉토리, `--no-git`, CLI 실행)

시나리오:

1. `sduck start feature test-step --no-git` → spec/plan 작성 → `sduck spec approve` → `sduck plan approve` → `sduck step done 1` → meta.yml 확인: `completed: [1]`
2. 연속 실행: `sduck step done 1` → `sduck step done 2` → `sduck step done 3` → `completed: [1, 2, 3]`
3. 멱등: `sduck step done 1` 두 번 실행 → 에러 없이 `completed: [1]`, stdout에 "already completed"
4. 범위 밖: `sduck step done 0` → exitCode 1, stderr에 에러
5. plan 미승인: `sduck start` 직후 `sduck step done 1` → exitCode 1, stderr에 에러

**검증:** `npm run test:e2e`

---

## Step 6. agent-rules 업데이트 및 빌드 검증

**대상 파일:** `.sduck/sduck-assets/agent-rules/core.md` (기존, ~106줄)

**변경 의도:**

### 6-1. agent-rules/core.md에 step 완료 안내 추가

워크플로우 규칙 섹션에 다음 추가:

- `IN_PROGRESS` 상태에서 각 plan step 구현 완료 후 `sduck step done <N>`을 실행하여 진행 상황을 기록한다
- 모든 step 완료 후 `sduck review ready`로 전환한다

### 6-2. 빌드 검증

```bash
npm run typecheck
npm run lint
npm run test:unit
npm run test:e2e
npm run build
```

**검증:** 모든 명령 통과
