# SDD Workflow Rules

## ⚠️ CRITICAL: 상태별 파일 접근 제한

- 코드를 작성하기 전에 반드시 `.sduck/sduck-workspace/`의 활성 태스크 `meta.yml`을 읽고 `status`를 확인한다.
- `IN_PROGRESS` 상태에서만 구현 코드를 작성할 수 있다.
- 승인된 `spec.md`/`plan.md`는 수정하지 않는다. 요구사항이 바뀌면 새 태스크를 시작한다.
- `spec.md` 또는 `plan.md`를 작성한 직후라도, 사용자가 승인하기 전까지 구현하지 않는다.
- "같은 세션"이라는 이유로 승인을 생략하지 않는다.

| 상태                  | spec.md | plan.md | 구현 파일 |
| --------------------- | ------- | ------- | --------- |
| PENDING_SPEC_APPROVAL | 허용    | 허용    | 차단      |
| SPEC_APPROVED         | 차단    | 허용    | 차단      |
| IN_PROGRESS           | 차단    | 차단    | 허용      |
| DONE                  | 차단    | 차단    | 차단      |

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
