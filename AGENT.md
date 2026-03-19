<!-- sduck:begin -->

# sduck managed rules

Selected agents: Codex, OpenCode

이 프로젝트는 **Spec-Driven Development(SDD)** 워크플로우를 따른다.
생성된 `AGENT.md`는 codex 계열 도구가 참고할 project-level instruction context다.
워크플로우 구조와 규칙은 `sduck` CLI와 동일하다.

## 절대 규칙

다음 두 가지 승인은 에이전트가 직접 처리하지 않는다.

- **스펙 승인**은 사용자가 명시적으로 승인해야 한다
- **플랜 승인**은 사용자가 명시적으로 승인해야 한다

승인 전에는 어떤 코드도 작성하지 않는다.

## Codex Instructions

- Follow the repository SDD workflow exactly.
- Use `AGENT.md` as project-level instruction context.
- Keep plans highly detailed: list exact file paths, likely functions or sections to edit, concrete change intent, and verification commands.
  이 프로젝트는 **Spec-Driven Development(SDD)** 워크플로우를 따른다.
  `sduck` CLI가 없으므로 opencode가 직접 파일을 생성하고 상태를 관리한다.
  워크플로우 구조와 규칙은 `sduck` CLI와 동일하다.

## 절대 규칙

다음 두 가지 승인은 절대 opencode가 직접 처리하지 않는다.

- **스펙 승인**은 사용자가 명시적으로 승인해야 한다
- **플랜 승인**은 사용자가 명시적으로 승인해야 한다

승인 전에는 어떤 코드도 작성하지 않는다.

## OpenCode Instructions

- Follow the repository SDD workflow exactly.
- Use `AGENT.md` as project-level instruction context.
- Keep plans highly detailed: list exact file paths, likely functions or sections to edit, concrete change intent, and verification commands.

# SDD Workflow Rules

## 디렉토리 구조

에이전트는 아래 경로를 기준으로 `sduck` 상태를 읽고 쓴다.

```text
프로젝트 루트/
├── .sduck/sduck-assets/
│   ├── eval/
│   │   ├── plan.yml
│   │   ├── spec.yml
│   │   └── task.yml
│   ├── types/
│   │   ├── build.md
│   │   ├── chore.md
│   │   ├── feature.md
│   │   ├── fix.md
│   │   └── refactor.md
│   └── agent-rules/
│
└── .sduck/sduck-workspace/
    └── {timestamp}-{type}-{slug}/
        ├── meta.yml
        ├── spec.md
        └── plan.md
```

## 세션 시작 시 필수 확인

작업을 시작하기 전에 반드시 아래를 확인한다.

1. `.sduck/sduck-workspace/` 디렉토리가 있는지 확인
2. 진행 중인 작업(`IN_PROGRESS`, `PENDING_*`)이 있는지 확인
3. 있다면 해당 작업의 `meta.yml`을 읽고 현재 상태를 파악한 뒤 이어서 진행

## 사용자 메모 규칙

사용자가 `spec.md`, `plan.md` 같은 문서의 특정 라인 끝에 `<-` 형식으로 메모를 추가할 수 있다.

- `<-` 뒤의 내용은 사용자 메모로 간주한다
- 에이전트는 문서를 읽을 때 본문과 함께 이 메모도 반드시 반영한다
- 사용자 메모가 기존 본문과 충돌하면, 사용자 메모를 최신 지시사항으로 우선 해석한다
- 메모는 가능하면 해당 문장을 수정하거나 정식 섹션에 흡수해 문서 본문에 반영한다
- 여러 줄에 메모가 흩어져 있어도 무시하지 말고 작업 전 확인한다

## 워크플로우 규칙

- Use the shipped CLI commands for workflow operations: `sduck init`, `sduck start <type> <slug>`, `sduck fast-track <type> <slug>`, `sduck spec approve [target]`, and `sduck plan approve [target]`.
- Do not write implementation code before spec approval.
- Do not start implementation before plan approval.
- Follow the workflow order: `spec -> approval -> plan -> approval -> implementation`.
- Respect `meta.yml` state transitions and update step completion immediately.
- Write `plan.md` in detailed implementation units: include target files, the functions/sections or rough line ranges to inspect, the exact change intent for each file, and the tests or commands to verify the step.

## fast-track 규칙

- `sduck fast-track <type> <slug>`는 `spec.md`를 생략하지 않고 minimal spec + minimal plan을 생성하는 빠른 경로다.
- fast-track은 반복적이거나 범위가 작고 명확한 작업에서만 사용한다.
- 범위가 크거나 요구사항이 불확실한 작업에는 fast-track 대신 일반 `start -> spec -> plan` 흐름을 사용한다.
- fast-track은 사용자 승인 자체를 우회하지 않는다.
- interactive 환경에서만 확인 1회로 spec/plan 승인을 묶을 수 있다.
- 비대화형 환경에서는 문서 생성만 수행하고, 이후 `sduck spec approve`, `sduck plan approve`로 이어간다.

## 승인 규칙

- 스펙 승인은 반드시 사용자가 직접 승인 의사를 전달해야 한다
- 플랜 승인도 반드시 사용자가 직접 승인 의사를 전달해야 한다
- `PENDING_SPEC_APPROVAL` 상태에서는 spec.md 작성/수정만 가능하고 코드 작성은 금지한다
- `PENDING_PLAN_APPROVAL` 상태에서는 plan.md 작성/수정만 가능하고 코드 작성은 금지한다
- `IN_PROGRESS` 상태에서만 구현과 step 완료 기록을 진행한다
- Do not mark a task `DONE` until all completion criteria are satisfied.

## 평가 규칙

- spec을 새로 작성하거나 수정한 직후, 반드시 `.sduck/sduck-assets/eval/spec.yml`을 읽고 그 기준으로 자체 평가 점수를 남긴다
- plan을 새로 작성하거나 수정한 직후, 반드시 `.sduck/sduck-assets/eval/plan.yml`을 읽고 그 기준으로 자체 평가 점수를 남긴다
- 모든 Step 완료 후 `spec.md`의 완료 조건 체크리스트를 검증하고, `.sduck/sduck-assets/eval/task.yml`을 읽어 task 평가를 수행한다
- After implementation is complete, run task evaluation, show the results, and only then move to completion processing.
<!-- sduck:end -->

이 프로젝트는 **Spec-Driven Development(SDD)** 워크플로우를 따릅니다.
`sduck` CLI가 없으므로 opencode가 직접 파일을 생성하고 상태를 관리합니다.
워크플로우 구조와 규칙은 sduck CLI와 동일합니다.

---

## 절대 규칙

다음 두 가지 승인은 **절대 opencode가 직접 처리하지 않는다**.
반드시 사용자가 직접 승인 의사를 전달해야 한다.

- **스펙 승인** → 사용자가 "스펙 승인", "spec approve", "ok", "ㅇㅇ" 등 명시적으로 승인해야 한다
- **플랜 승인** → 사용자가 "플랜 승인", "plan approve", "ok", "ㅇㅇ" 등 명시적으로 승인해야 한다
- `sduck fast-track <type> <slug>`를 쓰더라도 `spec.md`는 생략하지 않고 minimal spec + minimal plan만 허용한다
- fast-track의 묶음 승인은 interactive 환경에서만 가능하고, 비대화형 환경에서는 생성 후 일반 승인 명령으로 이어간다

승인 전에는 **어떤 코드도 작성하지 않는다.**

---

## 디렉토리 구조

opencode가 직접 생성하고 관리한다.

```
프로젝트 루트/
├── .sduck/sduck-assets/
│   ├── eval/
│   │   ├── plan.yml
│   │   └── spec.yml
│   ├── types/
│   │   ├── build.md
│   │   ├── chore.md
│   │   ├── feature.md
│   │   ├── fix.md
│   │   └── refactor.md
│   └── agent-rules/
│
└── .sduck/sduck-workspace/
    └── {timestamp}-{type}-{slug}/
        ├── meta.yml
        ├── spec.md
        └── plan.md
```

---

## 세션 시작 시 필수 확인

작업을 시작하기 전에 **반드시** 아래를 확인한다.

1. `.sduck/sduck-workspace/` 디렉토리가 있는지 확인
2. 진행 중인 작업(`IN_PROGRESS`, `PENDING_*`)이 있는지 확인
3. 있다면 해당 작업의 `meta.yml`을 읽고 현재 상태 파악 후 이어서 진행

---

## 사용자 메모 규칙

사용자가 `spec.md`, `plan.md` 같은 문서의 특정 라인 끝에 `<-` 형식으로 메모를 추가할 수 있다.

예시:

```md
- ESLint는 strict rule 사용 <- warning 없이 유지

## Step 3. ESLint 설정 <- import order도 강제
```

규칙:

- `<-` 뒤의 내용은 **사용자 메모**로 간주한다
- opencode는 문서를 읽을 때 본문과 함께 이 메모도 반드시 반영한다
- 사용자 메모가 기존 본문과 충돌하면, 사용자 메모를 최신 지시사항으로 우선 해석한다
- 메모는 가능하면 해당 문장을 수정하거나 정식 섹션에 흡수해 문서 본문에 반영한다
- 여러 줄에 메모가 흩어져 있어도 무시하지 말고 작업 전 확인한다

---

## 워크플로우

### 1단계. 작업 시작

사용자가 작업을 요청하면:

**1-1. 타임스탬프 기반 ID 생성**

```
형식: YYYYMMDD-HHmm-{type}-{slug}
예시: 20260318-1430-feature-login
```

- 폴더명과 `meta.yml`의 `id`는 반드시 같은 값을 사용한다
- 타임스탬프는 반드시 UTC 기준으로 생성한다
- `created_at`, `approved_at`, `completed_at` 같은 모든 시각 필드도 UTC ISO 8601(`Z`) 형식으로 기록한다
- 로컬 시각에 `Z`를 붙여 기록하면 안 된다

**1-2. 디렉토리 및 파일 생성**

```
.sduck/sduck-workspace/20260318-1430-feature-login/
├── meta.yml
├── spec.md   (타입에 맞는 템플릿으로 생성)
└── plan.md   (빈 파일)
```

**1-3. meta.yml 초기 상태로 생성**

```yaml
id: 20260318-1430-feature-login
type: feature
slug: login
created_at: 2026-03-18T14:30:00Z

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

**1-4. 사용자에게 안내**

```
✅ 작업 디렉토리 생성됨
   경로: .sduck/sduck-workspace/20260318-1430-feature-login/
   상태: PENDING_SPEC_APPROVAL
```

---

### 2단계. 스펙 작성

`spec.md`를 타입에 맞는 템플릿으로 작성한다.

**spec 품질 평가 규칙:**

- spec을 새로 작성하거나 수정한 직후, 반드시 `.sduck/sduck-assets/eval/spec.yml`을 읽고 그 기준으로 자체 평가 점수를 남긴다
- 사용자는 `.sduck/sduck-assets/eval/spec.yml`을 수정해 평가 항목, 표시 이름, 질문, 점수 범위를 커스터마이즈할 수 있다
- 별도 지시가 없으면 asset에 정의된 기본 점수 범위와 항목을 그대로 사용한다
- 평가 결과는 사용자 메시지에 함께 보여주고, 필요하면 spec.md 본문에도 반영해 개선한다

**feature 템플릿:**

```markdown
# feature: {slug}

## 목표

<!-- 이 작업이 달성해야 하는 것 -->

## 범위

<!-- 구현할 항목 -->

## 제외 범위

<!-- 이번 작업에서 하지 않을 것 -->

## 완료 조건

- [ ]
```

**fix 템플릿:**

```markdown
# fix: {slug}

## 문제 설명

<!-- 어떤 버그인가 -->

## 재현 조건

1.

## 원인 분석

<!-- 왜 발생하는가 -->

## 수정 방법

<!-- 어떻게 고칠 것인가 -->

## 완료 조건

- [ ] 버그 재현 불가
- [ ] 기존 테스트 통과
```

**refactor 템플릿:**

```markdown
# refactor: {slug}

## 목표

<!-- 무엇을 개선하는가 -->

## 변경 범위

<!-- 어떤 파일/모듈이 영향받는가 -->

## 변경하지 않는 것

<!-- 동작은 그대로 유지되어야 하는 것 -->

## 완료 조건

- [ ] 기존 테스트 전부 통과
- [ ]
```

**chore 템플릿:**

```markdown
# chore: {slug}

## 목표

<!-- 무엇을 정리/설정하는가 -->

## 작업 내용

<!-- 구체적인 작업 항목 -->

## 완료 조건

- [ ]
```

spec.md 작성 또는 수정 완료 후 사용자에게 안내한다:

```
📝 spec.md 작성 완료
   경로: .sduck/sduck-workspace/20260318-1430-feature-login/spec.md

   Spec 평가
   - {asset 기준 항목 1}: X/{asset max}
   - {asset 기준 항목 2}: X/{asset max}
   - ...

검토 후 "스펙 승인" 또는 "ok"라고 말씀해주세요.
수정이 필요하면 피드백을 주세요.
```

**이후 코드 작성 금지. 사용자 응답을 기다린다.**

---

### 3단계. 스펙 승인 처리

사용자가 승인 의사를 전달하면 `meta.yml`을 업데이트한다.

```yaml
status: SPEC_APPROVED

spec:
  approved: true
  approved_at: 2026-03-18T14:45:00Z # 현재 UTC 시각
```

```
✅ 스펙 승인됨
   상태: SPEC_APPROVED → 플랜 작성을 시작합니다.
```

---

### 4단계. 플랜 작성

`plan.md`를 작성하고 `meta.yml`을 업데이트한다.

**plan.md 작성 규칙:**

- Step은 반드시 `## Step N. 제목` 형식으로 작성
- 각 Step은 독립적으로 완료 가능한 단위
- Step 하나당 파일 1~3개 수준의 작업량
- 각 Step에는 수정할 파일 경로를 구체적으로 적는다
- 가능한 경우 각 파일에서 볼 함수, 섹션, 또는 대략적인 라인 범위를 적는다
- 각 파일에서 무엇을 어떻게 바꿀지 코드 수준으로 설명한다
- 테스트가 필요하면 어떤 테스트 파일이나 명령으로 검증할지도 적는다

**plan 품질 평가 규칙:**

- plan을 새로 작성하거나 수정한 직후, 반드시 `.sduck/sduck-assets/eval/plan.yml`을 읽고 그 기준으로 자체 평가 점수를 남긴다
- 사용자는 `.sduck/sduck-assets/eval/plan.yml`을 수정해 평가 항목, 표시 이름, 질문, 점수 범위를 커스터마이즈할 수 있다
- 별도 지시가 없으면 asset에 정의된 기본 점수 범위와 항목을 그대로 사용한다
- 평가 결과는 사용자 메시지에 함께 보여주고, 필요하면 plan.md 본문에도 반영해 개선한다

```markdown
# Plan

## Step 1.

## Step 2.

## Step 3.
```

**meta.yml 업데이트:**

```yaml
status: PENDING_PLAN_APPROVAL
```

plan.md 작성 완료 후 사용자에게 안내한다:

```
📋 plan.md 작성 완료
   경로: .sduck/sduck-workspace/20260318-1430-feature-login/plan.md
   총 N단계

   Plan 평가
   - {asset 기준 항목 1}: X/{asset max}
   - {asset 기준 항목 2}: X/{asset max}
   - ...

검토 후 "플랜 승인" 또는 "ok"라고 말씀해주세요.
수정이 필요하면 피드백을 주세요.
```

**이후 코드 작성 금지. 사용자 응답을 기다린다.**

---

### 5단계. 플랜 승인 처리

사용자가 승인 의사를 전달하면 `meta.yml`을 업데이트한다.

```yaml
status: IN_PROGRESS

plan:
  approved: true
  approved_at: 2026-03-18T15:00:00Z # 현재 UTC 시각

steps:
  total: N # plan.md에서 파싱한 Step 수
  completed: []
```

```
✅ 플랜 승인됨 (총 N단계)
   상태: IN_PROGRESS → 작업을 시작합니다.
```

---

### 6단계. 코드 작업

- plan.md의 **Step 순서를 반드시** 따른다
- 각 Step 완료 시 즉시 `meta.yml` 업데이트

```yaml
steps:
  total: 4
  completed: [1, 2] # 완료된 Step 번호 누적
```

각 Step 완료마다 사용자에게 안내:

```
✅ [1/4] {Step 제목} 완료
```

---

### 7단계. 작업 완료

모든 Step 완료 후 `spec.md`의 완료 조건 체크리스트를 검증하고, `.sduck/sduck-assets/eval/task.yml`을 읽어 task 평가를 수행한다.

**미완료 항목이 있을 경우:**

```
⚠️ 미완료 항목이 있습니다:
   - [ ] 입력값 누락 시 422

마저 구현한 후 완료 처리하겠습니다.
```

**모든 항목 완료 시 task 평가를 사용자에게 보여준 뒤 `task done` 또는 완료 처리로 진행하고 `meta.yml` 업데이트:**

```yaml
status: DONE
completed_at: 2026-03-18T16:30:00Z # 현재 UTC 시각
```

```
✅ 모든 완료 조건 충족
   상태: DONE

   Task 평가
   - {asset 기준 항목 1}: X/{asset max}
   - {asset 기준 항목 2}: X/{asset max}
   - ...

커밋 메시지 제안: feat: implement email/password login with JWT
git commit 하시겠습니까?
```

---

## 상태 전환 요약

```
PENDING_SPEC_APPROVAL   → (사용자 승인) → SPEC_APPROVED
SPEC_APPROVED           → (opencode)      → PENDING_PLAN_APPROVAL
PENDING_PLAN_APPROVAL   → (사용자 승인) → IN_PROGRESS
IN_PROGRESS             → (opencode)      → DONE
```

| 상태                    | opencode 가능 행동        | opencode 불가 행동   |
| ----------------------- | ------------------------- | -------------------- |
| `PENDING_SPEC_APPROVAL` | spec.md 작성 및 수정      | 코드 작성, 플랜 작성 |
| `SPEC_APPROVED`         | plan.md 작성              | 코드 작성            |
| `PENDING_PLAN_APPROVAL` | plan.md 수정              | 코드 작성            |
| `IN_PROGRESS`           | 코드 작성, step 완료 기록 | 승인 처리            |
| `DONE`                  | -                         | 모든 작업            |

---

## 금지 사항

- 사용자 승인 없이 `meta.yml`의 `status`를 `SPEC_APPROVED` 또는 `IN_PROGRESS`로 변경하는 것
- `PENDING_*` 상태에서 코드 파일 생성 또는 수정
- plan.md의 Step 순서 무시
- 완료 조건 미충족 상태에서 `status: DONE` 처리
