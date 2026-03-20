# Plan

## Step 1. `task.yml` 평가 자산 구조 정의

- `.sduck/sduck-assets/eval/task.yml`을 추가한다.
- 구조는 `spec.yml`, `plan.yml`과 동일한 패턴으로 맞춘다.
- 최소 아래 필드를 포함한다.
  - `version`
  - `task_evaluation`
  - `scale.min`, `scale.max`
  - `criteria[]`

## Step 2. 기본 task 평가 항목 정의

- 기본 criteria는 최소 아래 영역을 포함하도록 설계한다.
  - `spec_alignment`
  - `plan_alignment`
  - `implementation_quality`
  - `test_completeness`
  - `documentation_quality`
  - `maintainability`
- 각 항목은 `key`, `label`, `question` 구조로 넣는다.

## Step 3. 워크플로우 문서에 task eval 단계 반영

- `AGENT.md`, `CLAUDE.md`에 task eval 사용 규칙을 추가한다.
- 기본 흐름을 아래처럼 명시한다.
  - `spec eval`
  - `plan eval`
  - 구현
  - `task eval`
  - `task done`
- task 완료 직전에는 `.sduck/sduck-assets/eval/task.yml`을 읽고 그 기준으로 평가하도록 적는다.

## Step 4. agent rule 자산에도 task eval 경로 반영

- `.sduck/sduck-assets/agent-rules/core.md`에 task eval 경로와 사용 시점을 추가한다.
- spec/plan/task 세 평가 자산 경로가 모두 일관되게 보이도록 정리한다.

## Step 5. 완료 처리 연계 문구 정리

- 문서에서 task eval 결과를 확인한 뒤 `task done` 또는 최종 완료 처리로 넘어간다는 점을 명확히 적는다.
- task eval 자체는 아직 자산/문서 단계인지, 향후 CLI 명령으로 확장할지 경계를 유지한다.

## Step 6. 정합성 검증과 품질 게이트 실행

- `task.yml`이 YAML 구조상 유효한지 확인한다.
- `AGENT.md`, `CLAUDE.md`, `.sduck/sduck-assets/agent-rules/core.md`의 경로와 흐름 문구가 일치하는지 확인한다.
- `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build`를 실행한다.
- spec의 acceptance criteria를 대조하고 완료 처리한다.
