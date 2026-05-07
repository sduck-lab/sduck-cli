# [feature] skill backed grill prompt

## 배경

현재 sduck v2는 `sduck context`에 최소한의 grill-me protocol을 포함한다.

```text
Ask one question at a time.
Do not ask what can be inferred from context.
Provide a recommended answer with rationale.
Separate EXPLICIT, INFERRED, CARRIED, CONFLICT, and OPEN decisions.
Submit structured draft with `sduck submit --stdin`.
```

이 방향은 맞지만, 실제 agent skill인 `grill-me`의 핵심 프롬프트보다 약하다. 특히 다음 의도가 충분히 드러나지 않는다.

- 계획의 모든 면을 집요하게 인터뷰한다.
- shared understanding에 도달할 때까지 design tree의 각 branch를 따라간다.
- 결정 간 dependency를 한 번에 하나씩 해소한다.
- 코드베이스 탐색으로 답할 수 있는 질문은 사용자에게 묻지 않고 evidence로 처리한다.

추가로 다른 skill 파일을 스캔한 결과, sduck의 decision briefing prompt에는 다음 원칙도 함께 반영할 가치가 있다.

- `grill-with-docs`: domain glossary/ADR/코드와 사용자 주장 간 충돌을 확인한다.
- `triage/AGENT-BRIEF.md`: brief는 durable, behavioral, acceptance criteria, explicit scope boundary 중심이어야 한다.
- `tdd`: 구현 전 public interface와 observable behavior/test priority를 확인한다.
- `diagnose`: bug/performance 작업은 repro/feedback loop/hypothesis가 먼저다.
- `improve-codebase-architecture`: architecture/refactor 작업은 module/interface/seam/locality/leverage 관점으로 design tree를 걷는다.

## 목표

- `sduck context`가 agent에게 더 강한 canonical grill-me prompt를 제공한다.
- prompt는 실제 `grill-me` skill의 문장을 중심으로 하되, sduck의 decision draft/brief/confirm 흐름에 맞게 종료 조건과 제출 형식을 명시한다.
- context JSON과 human-readable 출력 모두에서 agent가 같은 지시를 받을 수 있게 한다.
- 범용 sduck CLI에 과도한 외부 skill 런타임 의존성을 추가하지 않고, 필요한 prompt 내용을 제품 내 상수/타입으로 안정적으로 제공한다.

## 사용자 스토리

```text
As a developer using sduck with an AI coding agent,
I want `sduck context` to give the agent a strong skill-backed grill-me prompt,
So that the agent resolves the decision tree before implementation instead of asking shallow or redundant questions.
```

## 범위

- `sduck context`의 context pack에 canonical grill-me agent prompt를 추가하거나 기존 `grillMeProtocol`을 확장한다.
- prompt에는 최소한 다음 지시를 포함한다.
  - Interview the user relentlessly about every aspect of the plan until shared understanding is reached.
  - Walk down each branch of the design tree.
  - Resolve dependencies between decisions one-by-one.
  - Ask one question at a time.
  - Provide a recommended answer and rationale for each question.
  - If a question can be answered by exploring the codebase, explore the codebase instead and cite evidence/source refs.
  - Do not ask what can already be inferred from context.
  - Classify outcomes as `EXPLICIT`, `INFERRED`, `CARRIED`, `CONFLICT`, or `OPEN` decisions.
  - When resolved enough, submit a structured draft with `sduck submit --stdin`.
- prompt는 skill scan에서 얻은 보조 원칙을 짧은 checklist로 포함한다.
  - domain glossary/ADR/code contradiction check
  - durable behavioral brief with acceptance criteria and out-of-scope boundaries
  - public interface / observable behavior / test priority questions
  - bug 작업의 feedback loop/repro/hypothesis branch
  - architecture 작업의 module/interface/seam/locality/leverage branch
- `sduck context` human-readable renderer가 새 prompt/checklist를 읽기 쉬운 섹션으로 출력한다.
- `sduck context --json`도 같은 정보를 machine-readable하게 제공한다.
- README의 agent-led grill-me loop 설명을 새 prompt 수준에 맞게 갱신한다.
- 관련 unit/e2e 테스트를 갱신한다.

## 제외 범위

- `sduck grill-me` 같은 새 CLI command 추가는 포함하지 않는다.
- CLI가 LLM을 호출해 질문을 직접 생성하는 기능은 포함하지 않는다.
- 사용자의 로컬 skill 디렉토리를 런타임에 읽거나 동기화하는 기능은 포함하지 않는다.
- `CONTEXT.md` 또는 `docs/adr/`를 sduck가 자동 생성/수정하는 기능은 포함하지 않는다.
- v2 command set의 lifecycle/status/DB schema를 대규모로 바꾸지 않는다.
- React/Next.js 같은 특정 기술 전용 rule pack을 기본 prompt에 길게 내장하지 않는다.

## 완료 조건

- [x] `sduck context` 출력에 skill-backed canonical grill-me prompt가 포함된다.
- [x] `sduck context --json`에 같은 prompt/checklist 정보가 포함된다.
- [x] 기존 최소 protocol보다 강한 design tree/dependency/shared-understanding 지시가 명확히 보인다.
- [x] codebase로 답 가능한 질문은 묻지 말고 evidence/source ref로 처리하라는 지시가 명확히 보인다.
- [x] draft 제출 종료 조건이 `sduck submit --stdin`과 연결된다.
- [x] README의 Agent-led grill-me loop가 새 동작을 설명한다.
- [x] 관련 테스트가 추가/갱신되고 통과한다.
- [x] `npm run typecheck`가 통과한다.

## 리스크 및 고려사항

- prompt가 너무 길면 `sduck context`가 시끄러워질 수 있으므로, full prompt와 compact checklist의 균형이 필요하다.
- skill 파일을 런타임에 직접 읽으면 사용자 환경 의존성이 커지므로, 이번 작업은 스캔 결과를 제품 prompt로 반영하는 방식으로 제한한다.
- 현재 로컬 Node가 `v20.20.0`이면 제품 CLI 실행은 `node:sqlite` 때문에 실패한다. 검증은 Node `>=22.13` 환경에서 CLI 실행까지 확인해야 한다.
