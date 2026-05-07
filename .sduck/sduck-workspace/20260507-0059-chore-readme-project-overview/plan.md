# Plan: README project overview

## 전제

- 현재 작업 상태는 `SPEC_APPROVED`이며, 이 문서는 plan 승인 전 작성물이다.
- 실제 README 수정은 사용자의 명시적 plan 승인 후 `IN_PROGRESS` 상태에서만 수행한다.
- 코드 작업 위치는 `agent-context.json` 기준 worktree인 `.sduck-worktrees/20260507-0059-chore-readme-project-overview`를 사용한다.
- 작업 대상은 `README.md` 1개 파일이다. 런타임 코드, 테스트 코드, 패키지 파일은 수정하지 않는다.

## Step 1. README 정보 소스 대조 및 섹션 구조 확정

### 대상 파일 / 구간

- 읽기 전용 대조:
  - `README.md:1-123`
  - `package.json:1-58`
  - `src/cli.ts:35-132`
  - `src/types/index.ts:1-215`
  - `src/core/v2/paths.ts:3-52`
  - `src/core/v2/context.ts`의 grill-me protocol, checklist, context discovery 관련 구간
  - `src/core/v2/draft.ts`의 draft 입력/검증 관련 구간
  - `src/core/v2/trace.ts`, `src/core/v2/git-diff.ts`의 git trace 관련 구간
  - `src/core/v2/remember.ts`, `src/core/v2/recall.ts`의 export/memory 관련 구간
  - `tests/e2e/v2-cli.test.ts`의 end-to-end workflow 예시

### 변경 의도

- README에 넣을 사실 정보를 현재 구현과 다시 대조한다.
- 공개 CLI(v2 `.decision`)와 레거시 저장소 내부 `.sduck` SDD 자산을 구분한다.
- README 최종 섹션 구조를 아래처럼 확정한다.
  1. 프로젝트 소개
  2. Requirements
  3. Install / local usage
  4. Quick start
  5. How the workflow works
  6. Agent-led grill-me loop
  7. Commands
  8. Draft input
  9. Storage and generated artifacts
  10. Concepts
  11. Development
  12. Project structure
  13. Limitations / notes
  14. Legacy `.sduck` note

### 완료 기준

- README에 반영할 명령어, 경로, 제약사항이 실제 소스 기준으로 확인된다.
- README 구조가 처음 보는 사용자와 개발자 모두를 대상으로 충분한지 검토된다.

### 검증

- 수동 대조: `src/cli.ts`, `package.json`, `src/core/v2/paths.ts`와 계획된 README 내용 비교.

## Step 2. README 본문 전면 작성

### 대상 파일 / 구간

- `README.md:1-123` 전체 교체 또는 대폭 재작성

### 변경 의도

- 기존 짧은 README를 상세 프로젝트 랜딩 문서로 재작성한다.
- 다음 내용을 반드시 포함한다.
  - 패키지명: `@sduck/sduck-cli`
  - CLI bin: `sduck`
  - Node 요구사항: `>=22.13`
  - 핵심 가치: coding agent와 developer가 구현 전 결정사항을 터미널에서 정렬하는 decision briefing harness
  - 빠른 시작 예시:
    - `sduck init`
    - `sduck work "..."`
    - `sduck context`
    - `sduck submit --stdin < draft.json`
    - `sduck ask` / `sduck answer ...`
    - `sduck brief`
    - `sduck confirm`
    - 구현 후 `sduck trace`, `sduck remember`, `sduck recall`, `sduck close`
  - 명령어 레퍼런스:
    - workspace/task: `init`, `work`, `status`
    - context: `context`, `context add`
    - draft/question: `submit`, `ask`, `answer`
    - brief: `brief`, `confirm`
    - implementation memory: `trace`, `remember`, `recall`
    - lifecycle: `close`, `abandon`
  - draft schema 예시와 Markdown fenced block 예시
  - `.decision` 저장 구조와 generated artifacts
  - decision kinds/status/evidence/context/trace/recall 개념
  - 개발 명령어: `npm run dev -- --help`, `npm run typecheck`, `npm run lint`, `npm run format:check`, `npm run test:unit`, `npm run test:e2e`, `npm run test`, `npm run build`
  - 프로젝트 구조: `src/cli.ts`, `src/commands/`, `src/core/v2/`, `src/types/`, `tests/unit/`, `tests/e2e/`
  - 제약사항: Node `>=22.13`, Graphify 런타임 불필요, context discovery는 경량 경로/키워드 기반, `trace`는 git work tree 필요, `context add`는 프로젝트 내부 경로로 제한
  - 레거시 `.sduck` SDD 자산은 현재 공개 v2 command surface와 구분된 저장소 내부/이전 워크플로우라고 명시

### 작성 기준

- README는 영어로 작성한다. 현재 README가 영어이며 npm 공개 패키지 문서로 쓰기 적합하기 때문이다.
- 과장된 기능 표현을 피하고, 구현된 기능과 제약을 정확히 쓴다.
- 명령어 예시는 복사해 실행 가능한 형태로 작성한다.
- 한국어 사용자도 따라갈 수 있도록 불필요하게 난해한 표현은 피한다.

### 완료 기준

- `README.md`가 spec의 완료 조건을 모두 만족한다.
- 런타임 코드나 설정 파일 변경 없이 README만 수정된다.

### 검증

- 수동 리뷰: README 명령어/경로/제약사항이 소스와 일치하는지 확인.

## Step 3. README 포맷 및 사실 검증

### 대상 파일 / 구간

- `README.md` 전체
- `package.json` scripts
- `src/cli.ts` command registration
- `src/core/v2/paths.ts` storage paths

### 변경 의도

- Markdown 표/코드블록/헤딩 구조가 Prettier 규칙에 맞는지 확인한다.
- README가 실제 CLI와 어긋나는 내용을 포함하지 않도록 수정한다.
- 문서 변경 범위가 README에만 머무르는지 확인한다.

### 검증 명령

```bash
npm run format:check
git diff -- README.md
git diff --stat
```

### 완료 기준

- `npm run format:check` 통과.
- diff가 의도한 README 변경만 포함한다.
- 명령어/경로/스크립트 정보가 실제 소스와 일치한다.

## Step 4. sduck 완료 조건 점검 및 상태 기록

### 대상 파일 / 구간

- `.sduck/sduck-workspace/20260507-0059-chore-readme-project-overview/spec.md:96-104`
- `.sduck/sduck-workspace/20260507-0059-chore-readme-project-overview/review.md` 생성 예정

### 변경 의도

- 구현 후 spec 완료 조건 체크리스트를 README 결과와 대조한다.
- 필요한 경우 spec.md의 완료 조건 체크박스를 충족 상태로 반영한다.
- `.sduck/sduck-assets/eval/task.yml`을 읽고 task 자체 평가를 수행한다.
- 각 Step 완료 직후 `sduck step done <N>`으로 진행 상태를 기록한다.
- 모든 step 완료 후 `sduck review ready 20260507-0059-chore-readme-project-overview`를 실행해 `REVIEW_READY` 상태로 전환한다.

### 검증 명령

```bash
sduck step done 1
sduck step done 2
sduck step done 3
sduck step done 4
sduck review ready 20260507-0059-chore-readme-project-overview
```

### 완료 기준

- 모든 plan step이 완료 처리된다.
- task 평가 결과가 사용자에게 보고된다.
- `review ready` 전환이 성공한다.

## 자체 평가

`.sduck/sduck-assets/eval/plan.yml` 기준 자체 평가:

| 기준             | 점수 | 근거                                                                                              |
| ---------------- | ---: | ------------------------------------------------------------------------------------------------- |
| semantic_clarity |    5 | 각 단계의 목적, 대상 파일, 검증 방법이 명확함                                                     |
| abstraction      |    5 | 문서 구조 설계 → 작성 → 검증 → 상태 전이로 적절히 분리함                                          |
| typing           |    5 | 코드 변경은 없지만 타입/스키마 관련 README 내용은 `src/types/index.ts` 기준으로 검증하도록 계획함 |
| security         |    5 | 문서 변경만 수행하며 외부 입력/보안 민감 파일을 다루지 않음                                       |
| maintainability  |    5 | README를 구현 소스 기준으로 유지보수 가능한 섹션 구조로 재작성함                                  |
| testability      |    5 | 포맷 검사, diff 확인, 소스 대조, sduck 상태 기록까지 검증 절차를 명시함                           |
