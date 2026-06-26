# [feature] decision trace relevance

> **작업 타입:** `feature` (Standard Feature)
> **작성자:** taehee
> **작성일:** 2026-06-26
> **연관 티켓:** -

---

## 1. 배경 및 목적

### 문제 / 요구사항

현재 decision `trace`/`context` 흐름에서 `decision.appliesTo`가 변경 파일과 정확히 맞지 않거나 약한 substring/tree-walk 휴리스틱만 맞아도, 결정이 변경 파일 전체에 귀속될 수 있다. 이 동작은 실제 provenance가 약한 결정을 “연결된 결정”처럼 보여 주는 false provenance를 만들며, 사용자가 변경 파일에 적용되지 않는 결정을 신뢰하거나 반대로 중요한 검토 지점을 놓칠 위험이 있다.

현재 코드 기준 핵심 문제는 `src/core/v2/trace.ts`의 `createImplementationTrace()`가 confirmed decision을 changed files에 매핑할 때 `changedFile.includes(appliesToEntry)` 수준의 substring 매칭만 사용하고, 매칭 파일이 없으면 decision을 모든 changed file에 `Needs review`로 붙이는 점이다. 또한 `src/core/v2/context.ts`의 context discovery는 task description keyword/path 매칭과 SQLite `LIKE` 기반 prior memory 검색에 치우쳐 있고, `remember()`가 만든 Graphify-style artifact는 읽기 context에 포함되지만 relevance ranking/score의 primary 근거로 쓰이지 않는다.

이번 작업의 핵심 원칙은 다음과 같다.

> provenance 근거가 약하면 결정을 변경 파일에 매핑하지 않고, `Unmapped / Needs review` 영역에 따로 보여준다.

### 기대 효과

- `trace`와 `context` 결과가 “왜 이 결정이 이 파일과 연결됐는지”를 명시한다.
- `appliesTo`가 빗나간 decision이 변경 파일 전체에 잘못 붙지 않는다.
- exact path, glob, directory prefix, symbol hint, Graphify relation처럼 신뢰 가능한 근거는 relevant decision으로 유지된다.
- 약한 substring fallback은 primary 매칭이 아니라 낮은 score fallback으로만 동작하고, threshold 미만이면 review 대상으로 분리된다.
- Graphify 그래프가 있는 환경에서는 단순 문자열 일치가 없어도 changed file → related symbols/modules → related decisions 또는 decision evidence → files 관계로 관련 결정을 찾을 수 있다.

---

## 2. 기능 명세

### 사용자 스토리

```text
As a developer using sduck decision trace/context,
I want decisions to be attached to changed files only when provenance is strong enough,
So that I can trust linked decisions and separately review weak or unmapped decisions.
```

### 수용 기준 (Acceptance Criteria)

> 모든 항목이 충족되어야 이 작업이 완료(Done)로 간주된다.

- [x] AC1: `decision.appliesTo`가 틀린 decision은 변경 파일 전체에 매핑되지 않고 `Unmapped decisions requiring review` 또는 이에 준하는 review 섹션에 표시된다.
- [x] AC2: exact path `appliesTo`는 match score `1.0` 또는 최고 신뢰도로 해당 changed file에 매핑된다.
- [x] AC3: glob 또는 direct child/directory prefix 매칭은 match score `0.85` 수준의 강한 근거로 해당 changed file에 매핑된다.
- [x] AC4: Graphify relation 기반 매칭은 match score `0.7` 수준으로 해당 changed file/context에 매핑되며, substring 일치가 없어도 relevant로 잡힌다.
- [x] AC5: substring/tree-walk fallback은 match score `0.3` 수준의 약한 근거로 취급되고, threshold 미만이면 파일에 붙지 않는다.
- [x] AC6: trace/context 출력은 각 매칭 결과에 reason을 포함한다. 예: `matched by appliesTo exact path`, `matched by appliesTo glob`, `matched by graph edge`, `weak substring fallback`.
- [x] AC7: Graphify 그래프가 없거나 recall 결과가 비어 있어도 기존 명령은 실패하지 않고 fallback 결과와 review 섹션을 안정적으로 출력한다.
- [x] AC8: 관련 unit/e2e 테스트와 `npm run typecheck`가 통과한다.

### 기능 상세 설명

#### 2.1 appliesTo 정규화

`decision.appliesTo` 입력은 비교 전에 정규화한다.

- exact path: repo-root 기준 상대 경로와 동일한 파일 경로
- glob: `*`, `**`, 확장자 패턴 등 glob 의미를 가진 값
- directory prefix/direct child: directory 또는 하위 파일 범위로 해석 가능한 값
- symbol hint: 파일 경로가 아닌 symbol/module/class/function 힌트로 해석 가능한 값

정규화는 path separator, leading `./`, 불필요한 공백, repo-root 상대/절대 혼재를 안정적으로 처리해야 한다.

#### 2.2 match score와 threshold

decision-file relevance는 단순 boolean이 아니라 score와 reason을 가진 match result로 계산한다.

| 근거                               | 기본 score | 매핑 처리                                          |
| ---------------------------------- | ---------- | -------------------------------------------------- |
| exact path                         | `1.0`      | threshold 이상이면 파일에 매핑                     |
| glob/direct child/directory prefix | `0.85`     | threshold 이상이면 파일에 매핑                     |
| Graphify relation                  | `0.7`      | threshold 이상이면 파일에 매핑                     |
| substring/tree-walk fallback       | `0.3`      | 기본적으로 threshold 미만이며 review 섹션으로 분리 |

기본 attach threshold는 `0.7`로 둔다. threshold 미만 decision은 changed file에 붙이지 않고 `Unmapped decisions requiring review` 섹션에 표시한다.

#### 2.3 trace 동작

`trace`는 변경 파일별로 관련 decision을 출력할 때 score와 reason을 함께 계산한다.

- strong match: changed file 아래에 linked decision으로 표시
- weak/unmapped match: linked decision으로 붙이지 않고 review 섹션에 표시
- 한 decision이 여러 근거로 매칭되면 가장 높은 score/reason을 사용하되, 필요하면 보조 evidence를 보존한다.

#### 2.4 context 동작

`context`는 현재 tree walk + substring matching을 primary로 쓰지 않는다.

우선순위는 다음 순서를 따른다.

1. changed file → related symbols/modules → related decisions (Graphify graph가 있는 경우)
2. decision evidence → files 관계 (Graphify graph가 있는 경우)
3. 최근 recall 결과와 병합
4. appliesTo exact/glob/directory/symbol hint 매칭
5. tree-walk + substring fallback (weak reason, 낮은 score)

병합 시 중복 decision은 하나로 합치고 가장 강한 reason/score를 대표값으로 사용한다.

#### 2.5 출력 reason

trace/context 결과에는 사용자가 provenance 강도를 판단할 수 있는 reason을 표시한다.

필수 reason 예시는 다음과 같다.

- `matched by appliesTo exact path`
- `matched by appliesTo glob`
- `matched by appliesTo directory prefix`
- `matched by appliesTo symbol hint`
- `matched by graph edge`
- `matched by recall result`
- `weak substring fallback`

---

## 3. 기술 설계

### 변경 대상 컴포넌트

| 레이어      | 파일 / 모듈                                        | 변경 내용 요약                                                                                                                                  |
| ----------- | -------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| core        | `src/core/v2/trace.ts`                             | `createImplementationTrace()`의 decision-to-code 매핑을 score/reason 기반으로 변경하고 threshold 미만은 unmapped review로 분리                  |
| core        | `src/core/v2/context.ts`                           | `buildContextIndex()`, `findMemoryItems()`, `findRelevantFiles()` 주변에서 Graphify/recent recall/appliesTo/fallback 병합 순서와 threshold 적용 |
| core        | `src/core/v2/recall.ts`                            | 최근 recall 결과를 context relevance 후보로 병합할 수 있도록 score/reason 입력 또는 어댑터 검토                                                 |
| core        | `src/core/v2/decision.ts` / `src/core/v2/draft.ts` | `appliesTo` 저장/검증 타입 유지, normalize/matcher 입력으로 안정적으로 해석                                                                     |
| core        | 신규 또는 기존 공용 utility                        | `appliesTo` normalize, path/glob/directory/symbol hint matcher, match score 타입 도입                                                           |
| core        | `src/core/v2/remember.ts`, `src/core/v2/paths.ts`  | `buildDecisionGraph()`가 내보내는 `APPLIES_TO`, `CHANGED_FILE`, `TRACE_FOR` 등 Graphify-style edge를 relevance 근거로 읽는 경로 검토            |
| types       | `src/types/index.ts`                               | `DecisionToCodeMap`, `ImplementationTrace`, `ContextPack`, `RecallResult`에 reason/score/unmapped 표현이 필요한지 검토                          |
| commands/ui | `src/commands/v2/index.ts`, `src/ui/v2/render.ts`  | trace/context CLI 출력에 reason 및 unmapped review 섹션 표시                                                                                    |
| tests       | `tests/unit/v2-core.test.ts`                       | exact/glob/wrong appliesTo/graph edge/fallback threshold regression 테스트 추가                                                                 |
| tests       | `tests/e2e/v2-cli.test.ts`                         | `trace --json` 또는 CLI 출력에서 mapping/reason/unmapped 섹션 검증 추가                                                                         |

### API 명세 (해당 시)

외부 HTTP API 변경은 없다. CLI 출력에는 reason/score 또는 reason 문구가 추가될 수 있다.

예상 출력 개념:

```text
Changed file: src/core/example.ts
Linked decisions:
- DEC-001 matched by appliesTo exact path (score 1.0)
- DEC-002 matched by graph edge (score 0.7)

Unmapped decisions requiring review:
- DEC-003 weak substring fallback (score 0.3): appliesTo did not match changed files
```

### 데이터 모델 변경 (해당 시)

DB schema 변경은 이번 작업 범위가 아니다. match score/reason은 runtime 계산 결과 또는 CLI 출력 모델로 처리한다.

### 시퀀스 다이어그램 (개념)

```text
Changed files
  → normalize appliesTo candidates
  → collect graph/recent recall candidates
  → score candidates with reason
  → attach matches above threshold
  → render weak/unmapped matches in review section
```

---

## 4. UI/UX 명세 (해당 시)

CLI 텍스트 UX만 해당한다.

### 화면 목록

| 화면명         | 라우트              | 설명                                                        |
| -------------- | ------------------- | ----------------------------------------------------------- |
| trace output   | `sduck trace ...`   | changed file별 linked decisions와 unmapped review 섹션 표시 |
| context output | `sduck context ...` | relevant decisions의 reason 및 weak fallback 분리 표시      |

### 인터랙션 정의

- 사용자는 reason 문구를 보고 decision provenance 강도를 판단할 수 있어야 한다.
- weak fallback은 linked decision처럼 보이지 않아야 하며, review 필요 항목으로 분리되어야 한다.
- 출력이 너무 장황해지지 않도록 reason은 짧은 고정 문구를 우선 사용한다.

---

## 5. 테스트 계획

### 단위 테스트 (Unit Test)

| 대상 함수 / 모듈            | 테스트 케이스                                        | 예상 결과                                                    |
| --------------------------- | ---------------------------------------------------- | ------------------------------------------------------------ |
| appliesTo normalize/matcher | exact path matches changed file                      | score `1.0`, reason `matched by appliesTo exact path`        |
| appliesTo normalize/matcher | glob matches changed file                            | score `0.85`, reason `matched by appliesTo glob`             |
| appliesTo normalize/matcher | directory prefix/direct child matches changed file   | score `0.85`, reason `matched by appliesTo directory prefix` |
| trace relevance             | wrong appliesTo with weak substring only             | changed file에 attach되지 않고 unmapped review 섹션에 표시   |
| context relevance           | Graphify edge exists without substring match         | score `0.7`, reason `matched by graph edge`, relevant로 포함 |
| merge logic                 | same decision matched by graph and substring         | higher score graph reason을 대표값으로 사용                  |
| fallback logic              | graph/recall/appliesTo absent and substring hit only | weak fallback reason, threshold 미만이면 unmapped            |

### 통합 / E2E 테스트

| 시나리오                    | 단계                                                              | 예상 결과                                                                        |
| --------------------------- | ----------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| trace false provenance 방지 | appliesTo가 변경 파일과 틀린 decision을 가진 fixture로 trace 실행 | decision이 linked decision이 아니라 `Unmapped decisions requiring review`에 표시 |
| trace exact/glob 매핑       | exact path와 glob appliesTo decision을 가진 fixture로 trace 실행  | 각 decision이 변경 파일에 reason과 함께 매핑                                     |
| context Graphify relevance  | graph edge가 있고 substring은 없는 fixture로 context 실행         | graph reason으로 relevant decision 표시                                          |
| fallback 안정성             | Graphify graph 없음/recall 없음 상태에서 context 실행             | 실패하지 않고 weak fallback 또는 unmapped review 출력                            |

검증 명령 예상:

- `npx vitest run tests/unit/<decision-trace-or-context-test>.test.ts`
- `npx vitest run tests/e2e/<relevant-cli-test>.test.ts`
- `npm run typecheck`
- 필요 시 `npm run test:unit`

---

## 6. 영향 범위 분석

### 변경 파일 목록 (예상)

```yaml
target_paths:
  - src/core/v2/trace.ts
  - src/core/v2/context.ts
  - src/core/v2/recall.ts
  - src/core/v2/decision.ts
  - src/core/v2/draft.ts
  - src/core/v2/remember.ts
  - src/core/v2/paths.ts
  - src/types/index.ts
  - src/commands/v2/index.ts
  - src/ui/v2/render.ts
  - tests/unit/v2-core.test.ts
  - tests/e2e/v2-cli.test.ts
  - .sduck/sduck-workspace/20260626-0313-feature-decision-trace-relevance/plan.md
```

### 사이드 이펙트 검토

- 기존 trace/context 출력 snapshot 또는 assertion이 reason/unmapped 섹션 추가로 변경될 수 있다.
- substring fallback에 의존하던 기존 결과가 linked decision에서 review 섹션으로 이동할 수 있다. 이는 의도한 동작 변경이다.
- Graphify graph가 없거나 손상된 환경에서는 fallback으로 동작해야 하며 command failure로 이어지면 안 된다.
- 너무 낮은 threshold는 false provenance를 다시 만들고, 너무 높은 threshold는 useful relation을 누락할 수 있다. 기본 attach threshold는 `0.7`로 시작한다.
- score/reason 계산이 여러 경로에 흩어지면 유지보수가 어려우므로 공용 utility 도입을 우선 검토한다.

### 롤백 계획

- relevance score/reason utility와 trace/context 출력 변경을 되돌린다.
- 새 테스트 fixture/assertion을 제거하거나 기존 출력 기대값으로 되돌린다.
- 문제가 score threshold에 한정되면 threshold 상수 조정으로 완화한다.

---

## 7. 보안 / 성능 고려사항

- **인증·인가:** 해당 없음. 로컬 CLI 기능이다.
- **입력값 검증:** `appliesTo` path/glob/symbol 값은 repo-root 기준으로 normalize하고 path traversal처럼 오해될 수 있는 값은 파일 시스템 쓰기 대상이 되지 않도록 matcher 입력으로만 사용한다.
- **성능:** changed files × decisions × appliesTo 후보 계산이 커질 수 있으므로 normalize 결과와 graph candidate lookup은 가능한 한 캐시/인덱싱한다.
- **민감 데이터 처리:** trace/context 출력은 기존 decision metadata/evidence 범위를 넘는 민감 정보를 새로 노출하지 않는다.

---

## 8. 비기능 요구사항

| 항목        | 요구사항                                                             |
| ----------- | -------------------------------------------------------------------- |
| 신뢰성      | threshold 미만 provenance는 linked decision으로 표시하지 않는다.     |
| 설명 가능성 | 모든 attached/review decision에는 짧은 reason이 있어야 한다.         |
| 호환성      | Graphify 데이터가 없어도 trace/context 명령은 실패하지 않는다.       |
| 유지보수성  | score/reason 규칙은 테스트 가능한 공용 함수 또는 명확한 모듈에 둔다. |

---

## 9. 의존성 및 선행 조건

- 이 작업 시작 전 완료되어야 하는 작업: 현재 없음.
- 외부 서비스 / API 연동 필요 여부: 없음.
- 피처 플래그(Feature Flag) 사용 여부: 기본 동작 변경으로 피처 플래그는 사용하지 않는다.
- 후속 후보 작업: confirm gate 강화, sqlite/schema migration 안정화, team sharing model 확정은 별도 task로 분리한다.

---

## 10. 미결 사항 (Open Questions)

- 없음. 구현 중 발견되는 출력 포맷 세부는 plan에서 확정한다.

---

## 11. 참고 자료

- 사용자 요구사항: trace/context 휴리스틱 정밀화, false provenance 방지, Graphify 기반 relevance + confidence reason 도입
- 코드맵 조사 결과:
  - `src/core/v2/trace.ts:createImplementationTrace()`는 현재 `changedFile.includes(appliesToEntry)`로 매칭하고 매칭 실패 시 decision을 모든 changed file에 `Needs review`로 붙인다.
  - `src/core/v2/context.ts`는 keyword/path matching, Graphify artifact inclusion, prior memory SQL `LIKE` 검색 중심이다.
  - `src/core/v2/remember.ts:buildDecisionGraph()`는 decision/file `APPLIES_TO`, trace/file `CHANGED_FILE`, task/trace `TRACE_FOR` graph artifact를 생성한다.
  - `tests/unit/v2-core.test.ts`, `tests/e2e/v2-cli.test.ts`가 우선 테스트 확장 지점이다.
- 후속 우선순위 후보: confirm gate 강화, sqlite/schema 안정화, team sharing model 확정

---

## 12. 완료 조건

- [x] `decision.appliesTo` normalize와 match score/reason 계산이 구현된다.
- [x] exact path, glob/direct child, Graphify relation, substring fallback의 score 정책이 테스트로 고정된다.
- [x] threshold 미만 decision은 changed file에 붙지 않고 unmapped/review 섹션에 표시된다.
- [x] trace 출력이 linked decision과 unmapped review decision을 구분하고 reason을 표시한다.
- [x] context가 Graphify/recent recall/appliesTo를 primary로 사용하고 substring fallback을 낮은 신뢰도로만 사용한다.
- [x] appliesTo가 틀린 decision이 변경 파일 전체에 매핑되지 않는 regression test가 추가된다.
- [x] exact path/glob decision이 정상 매핑되는 regression test가 추가된다.
- [x] graph edge가 있으면 substring 없이도 relevant로 잡히는 regression test가 추가된다.
- [x] 관련 unit/e2e 테스트와 `npm run typecheck`가 통과한다.

---

## 13. Spec 자체 평가

`.sduck/sduck-assets/eval/spec.yml` 기준 자체 평가:

| 기준                | 점수(1-5) | 근거                                                                                                                  |
| ------------------- | --------- | --------------------------------------------------------------------------------------------------------------------- |
| problem_clarity     | 5         | false provenance 문제와 “약한 근거는 Unmapped/Needs review로 분리” 원칙을 명확히 정의했다.                            |
| scope_definition    | 5         | trace/context relevance에 집중하고 confirm/sqlite/team sharing은 후속 task로 제외했다.                                |
| completion_criteria | 5         | score 정책, reason 출력, unmapped 섹션, Graphify relevance, 테스트 조건을 검증 가능하게 체크리스트화했다.             |
| feasibility         | 5         | 코드맵으로 `trace.ts`, `context.ts`, `remember.ts`, `v2-core.test.ts`, `v2-cli.test.ts` 등 주요 변경 지점을 확인했다. |
| risk_coverage       | 5         | Graphify 부재, fallback 회귀, threshold 부작용, 출력 변경, 성능 영향을 포함했다.                                      |
| testability         | 5         | wrong appliesTo, exact/glob, graph edge, weak fallback, merge 우선순위 테스트를 구체화했다.                           |

평균: 5.0 / 5
