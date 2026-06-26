# Review: 20260626-0313-feature-decision-trace-relevance

## 변경 요약

- `src/core/v2/relevance.ts`를 추가해 decision relevance score/reason, `appliesTo` normalize, glob/directory/exact/weak fallback matching, Graphify decision-file link parsing을 공용화했다.
- `src/core/v2/trace.ts`에서 기존 `file.includes(target)` + all changed files fallback을 제거하고, threshold 이상 match만 `decisionToCodeMap`에 붙이며 threshold 미만/no-match decision은 `unmappedDecisions`로 분리했다.
- `src/core/v2/context.ts`에서 context relevance 후보를 Graphify/recent memory/appliesTo/weak fallback 순으로 병합하고, weak filename/path fallback에는 낮은 score/reason을 붙였다.
- Graphify relevance는 current task scoped files(`expectedScope`, discovered files, existing current-task `FILE`/`DISCOVERY` context)와 교차할 때만 `matched by graph edge`가 되도록 제한했다.
- `src/types/index.ts`, `src/ui/v2/render.ts`, `src/core/v2/remember.ts`를 갱신해 trace/context 출력과 markdown export가 score/reason 및 unmapped review 정보를 보존한다.
- `tests/unit/v2-relevance.test.ts`, `tests/unit/v2-core.test.ts`, `tests/e2e/v2-cli.test.ts`에 exact/glob/wrong appliesTo, graph edge positive/negative, malformed graph, CLI JSON/render regression coverage를 추가했다.

## 테스트 결과

- `npx vitest run tests/unit/v2-relevance.test.ts` — 통과 (3 tests)
- `npx vitest run tests/unit/v2-core.test.ts` — 통과 (5 tests)
- `npx vitest run tests/e2e/v2-cli.test.ts` — 통과 (1 test)
- `npm run typecheck` — 통과

## 코드 리뷰 결과

- 1차 @oracle review: Changes requested
  - Blocking issue: Graphify edge가 current task scope와 무관해도 relevance로 표시되는 false provenance 위험.
- 수정 조치:
  - graph edge relevance를 scoped files와 교차하는 경우로 제한했다.
  - graph artifact presence는 `GRAPHIFY_GRAPH`/`GRAPHIFY_REPORT` evidence availability로만 유지했다.
  - `GRAPH_RELEVANCE_SCORE = 0.7` semantic constant를 도입했다.
  - unrelated graph edge negative test, expectedScope-intersecting positive test, malformed graph no-fail test를 추가했다.
- @oracle re-review: Approved
  - prior blocker resolved, no serious new blocking issue.

## Spec 완료 조건 검증

- [x] `decision.appliesTo` normalize와 match score/reason 계산 구현
- [x] exact path, glob/direct child, Graphify relation, substring fallback score 정책 테스트 고정
- [x] threshold 미만 decision은 changed file에 붙지 않고 unmapped/review 섹션에 표시
- [x] trace 출력이 linked decision과 unmapped review decision을 구분하고 reason 표시
- [x] context가 Graphify/recent recall/appliesTo를 primary로 사용하고 substring fallback을 낮은 신뢰도로 사용
- [x] wrong appliesTo가 changed files 전체에 매핑되지 않는 regression test 추가
- [x] exact path/glob 정상 매핑 regression test 추가
- [x] graph edge가 있으면 substring 없이도 scoped relevance로 잡히는 regression test 추가
- [x] 관련 unit/e2e 테스트와 `npm run typecheck` 통과

## Task 평가

`.sduck/sduck-assets/eval/task.yml` 기준 자체 평가:

| 기준                   | 점수(1-5) | 근거                                                                                                                   |
| ---------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------- |
| spec_alignment         | 5         | false provenance 방지, score/reason, unmapped review, Graphify scoped relevance 요구사항을 모두 반영했다.              |
| plan_alignment         | 5         | 승인된 Step 1-5를 순서대로 구현/검증했고 sduck step도 모두 완료했다.                                                   |
| implementation_quality | 5         | relevance 규칙을 공용 utility로 모으고 trace/context/render/export 경계를 유지했다. Oracle blocking review도 해결했다. |
| test_completeness      | 5         | exact/glob/wrong appliesTo, weak fallback, graph positive/negative, malformed graph, CLI e2e, typecheck를 검증했다.    |
| documentation_quality  | 5         | spec 완료 조건을 갱신하고 review에 변경/검증/리뷰 결과와 task 평가를 정리했다.                                         |
| maintainability        | 5         | score 상수/reason 문자열/Graphify parsing/threshold 로직이 중앙화되어 후속 조정이 쉽다.                                |

평균: 5.0 / 5

## 후속 참고

- Glob parser는 현재 `*`, `**`, `?` 중심의 제한된 subset이다. brace/class glob 확장은 별도 개선으로 분리 가능하다.
- confirm gate 강화, sqlite/schema 안정화, team sharing model 확정은 기존 우선순위에 따라 별도 task 후보로 남긴다.

## 리뷰 체크리스트

- [x] 코드 품질 확인
- [x] 테스트 통과 확인
- [x] 문서 업데이트 확인
- [x] Oracle review 승인 확인
