# Plan: skill-backed grill prompt

> Spec: `.sduck/sduck-workspace/20260507-0037-feature-skill-backed-grill-prompt/spec.md`  
> 상태: spec approved, plan pending approval  
> 원칙: plan 승인 전 구현 코드는 작성하지 않는다.

## Step 1. Extend ContextPack type for canonical agent prompt

### 목표

`sduck context --json`이 기존 `grillMeProtocol`보다 풍부한 skill-backed prompt 정보를 machine-readable하게 제공하도록 타입 계약을 확장한다.

### 대상 파일

- `src/types/index.ts`
  - `ContextPack` interface 주변, 현재 line 148-156 근처를 수정한다.
  - 새 필드 후보:
    - `grillMePrompt: string`
    - `grillMeChecklist: string[]`
  - 기존 `grillMeProtocol: string[]`은 backward-compatible하게 유지한다.

### 변경 의도

- 기존 JSON consumer가 `grillMeProtocol`을 계속 읽을 수 있게 하면서, agent가 바로 복사/수행할 수 있는 canonical prompt를 별도 필드로 제공한다.
- `grillMeChecklist`는 skill scan에서 얻은 domain/docs/test/debug/architecture 보조 원칙을 짧고 구조적으로 전달한다.
- `exactOptionalPropertyTypes` 환경에서 optional field로 애매하게 만들지 않고, `ContextPack` 생성 시 항상 채워지는 required field로 둔다.

### 검증

- `npm run typecheck`
- JSON serialization 경로는 `src/commands/v2/index.ts`의 `runContextCommand()`가 `JSON.stringify(pack, null, 2)`를 사용하므로 별도 command routing 변경 없이 새 필드가 출력되는지 테스트에서 확인한다.

---

## Step 2. Add skill-backed prompt builders in context core

### 목표

`getContextPack()`이 실제 `grill-me` skill 원문과 관련 skill 원칙을 반영한 prompt/checklist를 반환하게 한다.

### 대상 파일

- `src/core/v2/context.ts`
  - 현재 line 126-153 근처 `getContextPack(projectRoot)`의 return object를 수정한다.
  - 현재 line 141-147의 inline `grillMeProtocol` 배열은 helper 함수로 분리한다.
  - 새 helper 함수 후보를 같은 파일 하단 또는 `buildDraftSchemaExample()` 근처에 추가한다.
    - `buildGrillMeProtocol(): string[]`
    - `buildGrillMePrompt(): string`
    - `buildGrillMeChecklist(): string[]`

### prompt 내용

`buildGrillMePrompt()`에는 최소한 다음 문장을 포함한다.

```text
Interview the user relentlessly about every aspect of this plan until shared understanding is reached.
Walk down each branch of the design tree, resolving dependencies between decisions one-by-one.
Ask one question at a time.
For each question, provide a recommended answer and rationale.
If a question can be answered by exploring the codebase, explore the codebase instead and cite evidence/source refs.
Do not ask what can already be inferred from context.
Classify outcomes as EXPLICIT, INFERRED, CARRIED, CONFLICT, or OPEN decisions.
When the decision tree is sufficiently resolved, submit a structured draft with `sduck submit --stdin`.
```

`buildGrillMeChecklist()`에는 다음 branch를 짧게 포함한다.

- Domain/docs: check glossary, ADRs, and contradictions between user claims and code.
- Brief quality: keep the final brief durable, behavioral, testable, and explicit about out-of-scope items.
- Testing: identify public interfaces, observable behaviors, and test priorities.
- Bug/performance: establish feedback loop, reproduction signal, and falsifiable hypotheses before fix choices.
- Architecture/refactor: reason in terms of module, interface, seam, locality, and leverage.

### 변경 의도

- 런타임에 사용자 로컬 skill 디렉토리를 읽지 않는다. 제품에 필요한 canonical prompt를 코드 상수/helper로 내장한다.
- prompt 생성은 DB나 filesystem에 의존하지 않는 pure helper로 두어 테스트하기 쉽게 한다.
- `grillMeProtocol`은 compact backward-compatible 요약, `grillMePrompt`는 실행용 full prompt, `grillMeChecklist`는 task branch별 보조 질문 기준으로 역할을 분리한다.

### 검증

- Unit: `getContextPack()` 결과에 `grillMePrompt`, `grillMeChecklist`, 기존 `grillMeProtocol`이 모두 존재한다.
- Unit: prompt 문자열에 `Interview the user relentlessly`, `design tree`, `sduck submit --stdin`이 포함된다.
- Unit: checklist에 `glossary`, `public interfaces`, `feedback loop`, `module`, `out-of-scope` 계열 문구가 포함된다.

---

## Step 3. Render the canonical prompt in human-readable context output

### 목표

`sduck context` human-readable 출력이 agent에게 full prompt와 checklist를 명확하게 보여준다.

### 대상 파일

- `src/ui/v2/render.ts`
  - 현재 line 32-63 `renderContextPack(pack)`를 수정한다.
  - 현재 출력 흐름:
    - Context items
    - Prior decisions
    - Prior implementation traces
    - Current evidence
    - Grill-me protocol
    - Draft schema example
  - 새 출력 흐름 후보:
    - 기존 섹션 유지
    - `Agent grill-me prompt:` 섹션 추가 후 `pack.grillMePrompt` 출력
    - `Skill-backed checklist:` 섹션 추가 후 `pack.grillMeChecklist` bullet 출력
    - 기존 `Grill-me protocol:`은 compact rules로 유지
    - 마지막 `Next: create draft and run ...` 유지

### 변경 의도

- 사람이 터미널에서 `sduck context`를 봐도 “이제 agent가 어떻게 grill해야 하는지”가 바로 보이게 한다.
- draft schema와 submit next step을 prompt 바로 뒤에 보여줘서 decision tree 종료 조건과 CLI 제출 흐름을 연결한다.
- 출력이 너무 길어지지 않도록 checklist는 한 줄 bullet 중심으로 제한한다.

### 검증

- E2E 또는 unit-render 검증에서 `sduck context` stdout에 다음 문자열이 포함되는지 확인한다.
  - `Agent grill-me prompt:`
  - `Interview the user relentlessly`
  - `Skill-backed checklist:`
  - `sduck submit --stdin`

---

## Step 4. Update tests for JSON and rendered context behavior

### 목표

새 prompt contract가 core와 CLI 양쪽에서 깨지지 않도록 테스트를 갱신한다.

### 대상 파일

- `tests/unit/v2-core.test.ts`
  - 현재 line 22-92의 `initializes workspace, submits draft...` 테스트 안에서 `buildContextIndex()` 이후 `getContextPack()`을 import/call하거나, 별도 test case를 추가한다.
  - 확인할 내용:
    - `contextPack.grillMeProtocol`이 기존 compact rule을 포함한다.
    - `contextPack.grillMePrompt`가 `Interview the user relentlessly`, `design tree`, `recommended answer`, `sduck submit --stdin`을 포함한다.
    - `contextPack.grillMeChecklist`가 domain/docs, testing, bug/performance, architecture branch를 포함한다.
- `tests/e2e/v2-cli.test.ts`
  - 현재 line 25-60의 v2 CLI flow에서 `work` 이후 `context` 또는 `context --json` 호출을 추가한다.
  - human-readable stdout 확인:
    - `Agent grill-me prompt:`
    - `Skill-backed checklist:`
  - JSON stdout 확인:
    - parsed object에 `grillMePrompt` string과 `grillMeChecklist` array가 있다.

### 변경 의도

- core contract와 CLI renderer를 모두 잠근다.
- Node `>=22.13`이 아닌 환경에서는 기존 테스트 구조처럼 v2 suites가 skip된다. 타입/정적 검증은 현재 Node 20에서도 수행 가능하다.

### 검증

- Node `>=22.13` 환경:
  - `npm run test:unit -- tests/unit/v2-core.test.ts`
  - `npm run test:e2e -- tests/e2e/v2-cli.test.ts`
- 현재 로컬 Node 20 환경:
  - v2 suites는 skip될 수 있으므로 `npm run typecheck`와 `npm run lint`를 우선 확인한다.

---

## Step 5. Update README agent-led grill-me documentation

### 목표

문서의 agent-led grill-me loop를 새 prompt 수준에 맞게 갱신한다.

### 대상 파일

- `README.md`
  - 현재 line 28-34 `## Agent-led grill-me loop` 섹션을 수정한다.
  - 추가/수정할 내용:
    - `sduck context`가 canonical agent prompt, compact protocol, skill-backed checklist, draft schema를 제공한다.
    - agent는 codebase/context로 답할 수 있는 질문은 사용자에게 묻지 않고 evidence/source refs로 draft에 넣는다.
    - agent는 한 번에 한 질문씩 묻고, 각 질문마다 recommended answer/rationale을 제공한다.
    - decision tree가 충분히 해소되면 `sduck submit --stdin`으로 decisions/questions/evidence/scope draft를 제출한다.

### 변경 의도

- README가 실제 CLI 출력과 동일한 mental model을 제공한다.
- “sduck가 직접 LLM 질문을 생성한다”는 오해를 피하고, agent-led + CLI-managed 경계를 명확히 한다.

### 검증

- `npm run format:check` 또는 구현 중 markdown formatting 확인
- README grep/manual review:
  - `canonical agent prompt`
  - `one question at a time`
  - `sduck submit --stdin`

---

## Step 6. Run validation and complete SDD step tracking

### 목표

구현 후 repo 품질 게이트와 sduck workflow 상태를 정리한다.

### 대상 파일/명령

- 변경 파일 예상:
  - `src/types/index.ts`
  - `src/core/v2/context.ts`
  - `src/ui/v2/render.ts`
  - `tests/unit/v2-core.test.ts`
  - `tests/e2e/v2-cli.test.ts`
  - `README.md`
- 검증 명령:
  - `npm run typecheck`
  - `npm run lint`
  - `npm run test:unit -- tests/unit/v2-core.test.ts`
  - `npm run test:e2e -- tests/e2e/v2-cli.test.ts`
  - `npm run build`
- SDD 진행 기록:
  - 각 Step 구현 완료 직후 `sduck step done <N>` 실행
  - 모든 Step 완료 후 `.sduck/sduck-assets/eval/task.yml` 기준 task 평가
  - 평가 결과를 보여준 뒤 `sduck review ready`

### 변경 의도

- 구현/테스트/문서 갱신이 완료 조건을 모두 만족하는지 확인한다.
- 현재 로컬 Node가 `v20.20.0`이라 제품 CLI/v2 tests는 `node:sqlite` 때문에 실행 또는 유효 검증이 제한될 수 있다. Node `>=22.13` 환경에서 최종 CLI 검증이 필요하다는 점을 결과에 명시한다.

### 검증

- 가능한 모든 명령 결과를 기록한다.
- Node version으로 인해 skip/fail된 검증은 원인과 필요한 후속 환경을 명확히 남긴다.
