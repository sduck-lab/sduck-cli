<!-- sduck:begin -->

# sduck managed rules

Selected agents: Claude Code

이 프로젝트는 **v2 `.decision` decision briefing**을 기본 워크플로우로 사용한다. legacy SDD(`start`, `spec`/`plan` 승인 게이트)는 호환용 내부 워크플로우이며 활성 SDD 태스크에서만 적용된다.
task 생성과 상태 전이는 `sduck` CLI로 관리한다.
Claude는 `spec.md`, `plan.md` 본문 작성/수정과 구현을 담당한다.
워크플로우 구조와 규칙은 `sduck` CLI와 생성된 rule 문서를 기준으로 따른다.

## 절대 규칙

다음 두 가지 승인은 절대 Claude가 직접 처리하지 않는다.

- **스펙 승인**은 사용자가 명시적으로 승인해야 한다
- **플랜 승인**은 사용자가 명시적으로 승인해야 한다

승인 전에는 어떤 코드도 작성하지 않는다.
승인된 spec.md/plan.md의 요구사항 본문, 범위, 계획 내용은 사용자 승인 없이 수정하지 않는다. 요구사항이 바뀌면 새 태스크를 시작한다.
예외: 구현과 검증이 끝난 뒤 완료 조건/수용 기준 체크박스를 실제 검증 결과에 맞춰 `- [ ]`에서 `- [x]`로 반영하는 것은 허용된다. 이는 요구사항 변경이 아니라 완료 증적 기록이다.

## Claude Code Instructions

- Follow the repository v2 `.decision` decision briefing workflow as the primary workflow; legacy SDD approval gates apply only to active SDD tasks.
- Use `CLAUDE.md` as project-level instruction context.
- Keep plans highly detailed: list exact file paths, likely functions or sections to edit, concrete change intent, and verification commands.

# sduck Decision Briefing Rules

## Primary workflow: v2 `.decision` decision briefing

sduck의 기본 워크플로우는 v2 `.decision` decision briefing이다. (Primary workflow: v2 `.decision` decision briefing.)
구현을 시작하기 전에 decision context와 implementation brief를 먼저 정렬한다.
기본 명령: `init`, `work`, `status`, `context`, `submit`, `ask`, `answer`, `brief`, `confirm`, `trace`, `remember`, `recall`, `rebuild`, `close`, `abandon`.
저장소: `.decision/exports/markdown/**` 마크다운/엔티티 파일이 정본(source of truth)이며 `.decision/db.sqlite`는 Git-ignored 재생성 가능한 로컬 캐시다.

## Legacy SDD gated implementation rules

## ⚠️ CRITICAL: 상태별 파일 접근 제한

- 코드를 작성하기 전에 반드시 `.sduck/sduck-workspace/`의 활성 태스크 `meta.yml`을 읽고 `status`를 확인한다.
- `IN_PROGRESS` 상태에서만 구현 코드를 작성할 수 있다.
- 승인된 `spec.md`/`plan.md`의 요구사항 본문, 범위, 계획 내용은 임의로 수정하지 않는다. 요구사항이 바뀌면 새 태스크를 시작한다.
- 예외: 구현과 검증이 끝난 뒤 완료 조건/수용 기준 체크박스를 실제 검증 결과에 맞춰 `- [ ]`에서 `- [x]`로 반영하는 것은 허용된다. 이는 요구사항 변경이 아니라 완료 증적 기록이다.
- `spec.md` 또는 `plan.md`를 작성한 직후라도, 사용자가 승인하기 전까지 구현하지 않는다.
- "같은 세션"이라는 이유로 승인을 생략하지 않는다.

| 상태                  | spec.md                   | plan.md | 구현 파일 |
| --------------------- | ------------------------- | ------- | --------- |
| PENDING_SPEC_APPROVAL | 허용                      | 허용    | 차단      |
| SPEC_APPROVED         | 차단                      | 허용    | 차단      |
| IN_PROGRESS           | 완료 체크박스 반영만 허용 | 차단    | 허용      |
| REVIEW_READY          | 완료 체크박스 반영만 허용 | 차단    | 차단      |
| DONE                  | 차단                      | 차단    | 차단      |
| ABANDONED             | 차단                      | 차단    | 차단      |

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
│       └── skills/
│           └── sduck-codebase-decisions/
│               └── SKILL.md
│
├── .sduck/sduck-workspace/
│   └── {timestamp}-{type}-{slug}/
│       ├── meta.yml
│       ├── spec.md
│       ├── plan.md
│       └── review.md          # review ready 시 생성
│
├── .sduck/sduck-archive/       # 아카이브 (월별)
├── .sduck/sduck-state.yml      # 현재 작업 상태 (current_work_id)
└── .sduck-worktrees/           # Git worktree (자동 생성)
```

## 세션 시작 시 필수 확인

작업을 시작하기 전에 반드시 아래를 확인한다.

1. 현재 디렉토리에 `.sduck/`가 있으면 그것이 프로젝트 루트다. 없으면 `.git` 파일을 읽어 `gitdir`에서 실제 프로젝트 루트를 역추적한다 (워크트리 환경)
2. 프로젝트 루트의 `.sduck/sduck-state.yml`에서 `current_work_id`를 확인한다
3. 프로젝트 루트의 `.sduck/sduck-workspace/{current_work_id}/agent-context.json`을 읽는다
4. `worktreeAbsolutePath`가 있으면 해당 디렉토리에서 코드 작업을 수행한다
5. `worktreeAbsolutePath`가 `null`이면 프로젝트 root에서 작업한다

## 워크트리 환경

`sduck start`로 생성한 워크트리(`.sduck-worktrees/`)에서도 모든 `sduck` 명령이 정상 동작한다.

- CLI는 실행 위치의 `.git` 파일에서 실제 프로젝트 루트를 자동으로 역추적한다
- 에이전트는 프로젝트 루트의 `.sduck/`에서 상태를 읽고, `worktreeAbsolutePath`에 지정된 경로에서 코드를 작성한다
- 별도의 파일 복사나 동기화 작업이 필요 없다

## 사용자 메모 규칙

사용자가 `spec.md`, `plan.md` 같은 문서의 특정 라인 끝에 `<-` 형식으로 메모를 추가할 수 있다.

- `<-` 뒤의 내용은 사용자 메모로 간주한다
- 에이전트는 문서를 읽을 때 본문과 함께 이 메모도 반드시 반영한다
- 사용자 메모가 기존 본문과 충돌하면, 사용자 메모를 최신 지시사항으로 우선 해석한다
- 메모는 가능하면 해당 문장을 수정하거나 정식 섹션에 흡수해 문서 본문에 반영한다
- 여러 줄에 메모가 흩어져 있어도 무시하지 말고 작업 전 확인한다

## Agent skills

번들 agent-facing skill은 `.sduck/sduck-assets/agent-rules/skills/` 아래에 저장된다.

- `sduck-codebase-decisions`: `.sduck/sduck-assets/agent-rules/skills/sduck-codebase-decisions/SKILL.md`
  - 사용자가 기존 코드베이스, 문서, 테스트, 설정에서 이미 존재했던 의사결정을 읽고 저장하라고 요청할 때 사용한다.
  - skill 파일을 읽고 `sduck work`, `sduck context add`, `sduck submit`, `sduck remember`, `sduck recall` 흐름으로 decision store에 기록한다.
  - 이 skill은 의사결정 기록용이며, 활성 태스크에 legacy SDD 승인 게이트가 적용되는 경우 그 게이트를 우회하지 않는다.

## 워크플로우 규칙

- Use the shipped CLI commands for workflow operations: `sduck init`, `sduck start <type> <slug>`, `sduck fast-track <type> <slug>`, `sduck spec approve [target]`, `sduck plan approve [target]`, `sduck step done <N>`, `sduck review ready [target]`, `sduck done [target]`, `sduck use <target>`, `sduck implement`, `sduck abandon <target>`, `sduck clean [target]`, `sduck archive`.
- Do not write implementation code before spec approval.
- Do not start implementation before plan approval.
- Follow the workflow order: `spec -> approval -> plan -> approval -> implementation -> review ready -> done`.
- `done`은 `REVIEW_READY` 상태에서만 가능하다. `IN_PROGRESS`에서 바로 `done`할 수 없다.
- Respect `meta.yml` state transitions and update step completion immediately.
- `IN_PROGRESS` 상태에서 각 plan step 구현 완료 후 `sduck step done <N>`을 실행하여 진행 상황을 기록한다. meta.yml을 직접 편집하지 않는다.
- 모든 step 완료 후 `sduck review ready`로 전환한다.
- `sduck review ready`와 `sduck done`은 `spec.md`의 미체크 체크리스트를 거부한다. 구현/검증이 완료된 항목은 agent가 근거를 확인한 뒤 체크박스를 `[x]`로 반영할 수 있다.
- 체크박스 반영은 충족된 완료 조건/수용 기준에 한정한다. 요구사항 문구, 범위, 신규 조건, 승인된 plan 내용은 사용자 승인 없이 바꾸지 않는다.
- Write `plan.md` in detailed implementation units: include target files, the functions/sections or rough line ranges to inspect, the exact change intent for each file, and the tests or commands to verify the step.
- plan.md의 Step 헤더는 반드시 `## Step N. 제목` 형식을 따른다 (N은 1부터 연속, 대문자 Step, 마침표 필수, 제목 필수).

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
- 구현 완료 후 `sduck review ready`로 `REVIEW_READY` 상태로 전환해야 `done` 처리가 가능하다
- `REVIEW_READY` 상태에서도 `done` 전 누락된 완료 조건 체크박스 반영과 review 문서 보완은 가능하다. 코드 수정이 필요하면 `sduck reopen [target]`으로 `IN_PROGRESS`로 되돌린다.
- `sduck reopen [target]`으로 다시 열린 task는 `IN_PROGRESS` 기준으로 이어서 작업한다
- reopen은 작은 후속 수정에 사용하고, 요구사항 변경이나 범위 확장은 새 task로 분리한다
- Do not mark a task `DONE` until all completion criteria are satisfied.

## 평가 규칙

- spec을 새로 작성하거나 수정한 직후, 반드시 `.sduck/sduck-assets/eval/spec.yml`을 읽고 그 기준으로 자체 평가 점수를 남긴다
- plan을 새로 작성하거나 수정한 직후, 반드시 `.sduck/sduck-assets/eval/plan.yml`을 읽고 그 기준으로 자체 평가 점수를 남긴다
- 모든 Step 완료 후 `spec.md`의 완료 조건 체크리스트를 검증하고, 충족된 항목을 `[x]`로 반영한 뒤 `.sduck/sduck-assets/eval/task.yml`을 읽어 task 평가를 수행한다
- After implementation is complete, run task evaluation, show the results, and only then move to completion processing.
<!-- sduck:end -->
