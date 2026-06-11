# Review: 20260605-0537-feature-file-aware-decision-provenance

## 변경 요약

- `sduck impact <file...> [--json]` 명령을 추가했다.
- file-aware provenance core를 추가해 decision applies/avoids, optional implementation plan targets, trace filesChanged, decision-to-code map, fallback search를 조회한다.
- impact JSON에 stable keys와 `matchSource`, `confidence`, `explanation`을 포함했다.
- context prompt와 agent rule에 target file이 명확하면 impact를 먼저 실행하라는 안내를 추가했다.
- review-required default trace map은 high-confidence provenance로 반환하지 않도록 방어했다.

## 테스트 결과

- `npm run lint` 통과
- `npm run typecheck` 통과
- `npm run test:unit` 통과
- `npm run test:e2e` 통과
- `npm run test` 통과

## 리뷰 체크리스트

- [x] 코드 품질 확인
- [x] 테스트 통과 확인
- [x] 문서 업데이트 확인

## Acceptance Criteria 확인

- AC1~AC12 충족 확인.
- AC5는 승인된 plan에 따라 `implementation_plans` compatible table이 존재할 때 조회하는 optional structured source로 구현했고, fixture table 기반 unit test로 검증했다.
- AC11 제외 범위(line-level causality, embedding/vector search)는 구현하지 않았다.

## Task 자체 평가

평가 기준: `.sduck/sduck-assets/eval/task.yml`

| 기준                   | 점수(1-5) | 근거                                                                                                                                |
| ---------------------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| spec_alignment         | 5         | impact command, JSON shape, provenance source, fallback, guidance, tests를 AC 기준으로 구현했다.                                    |
| plan_alignment         | 5         | 승인된 Step 1~7의 타입/core/helper/CLI/context/test/검증 흐름을 반영했다.                                                           |
| implementation_quality | 4         | core와 adapter를 분리하고 path guard/dedupe/sorting을 구현했다. optional plan data source는 현재 base의 모델 제약을 따른다.         |
| test_completeness      | 5         | unit/e2e에서 exact/prefix, avoid, plan, trace, provenance, fallback, JSON/human output, path guard를 검증한다.                      |
| documentation_quality  | 4         | context prompt와 agent rule에 사용 안내를 추가했고 review에 optional plan source 제약을 기록했다.                                   |
| maintainability        | 4         | impact 전용 모듈과 types로 확장 가능하게 구성했다. 향후 real implementation plan writer가 생기면 `plan.ts` adapter를 연결하면 된다. |

총평: 승인된 spec/plan 범위 내에서 file-aware decision provenance recall을 구현했고, 현재 v2 base에 없는 plan/FTS 구조는 optional compatible adapter로 처리했다.

---

## Cycle 2 release-hardening 변경 요약

- v2 CLI root resolver를 추가해 `init` 외 command가 nested cwd/worktree에서 root `.decision`을 사용하게 했다.
- `requireMutableCurrentTask()` 계열 guard를 추가하고 `submit`, `context add`, `answer`, `trace`, `remember`, `confirm` mutation에 적용했다.
- `close`/`abandon`은 terminal status 전환 후 current task를 clear한다.
- `decisions`, `questions`, `evidence` 저장에서 `INSERT OR REPLACE`를 제거하고 duplicate id conflict를 명시적으로 반환한다.
- impact/trace path matching을 `path-matcher.ts`로 공유하고 exact, directory prefix, `src/foo/**` glob을 지원한다.
- `BRIEF_READY`를 유지하면서 submit/answer 후 readiness 갱신을 연결했고 open question이 남으면 `confirm`을 금지했다.
- `node:sqlite` 로딩을 DB open 시점으로 lazy-load해 Node 20에서도 `--help`가 동작하게 했고, CI(Node 22.13) workflow와 README release 정책을 추가했다.

## Cycle 2 테스트 결과

- `npm run lint` 통과
- `npm run typecheck` 통과
- `npm run test:unit` 통과: 7 files / 40 tests
- `npm run test:e2e` 통과: 2 files / 7 tests
- `npm run build` 통과
- `node dist/cli.js --help` 통과
- `node dist/cli.js --version` 통과 (`0.2.5`)
- Node 20.20.0에서 `node dist/cli.js --help` 통과

## Cycle 2 Acceptance Criteria 확인

- AC13~AC15 충족: close/abandon current clear 및 terminal mutation 방지 unit/e2e 검증.
- AC16~AC17 충족: decision/question/evidence duplicate id global reject 및 기존 row 보존 검증.
- AC18 충족: nested cwd에서 root `.decision` 사용 e2e 검증, `init` 예외 README 문서화.
- AC19~AC20 충족: shared matcher exact/prefix/glob/broad/traversal 정책 구현 및 테스트.
- AC21 충족: `BRIEF_READY` 유지, submit/answer call site 연결, unresolved question confirm 금지 테스트.
- AC22~AC23 충족: Node 22.13+ README/CI/검증 명령 정리, Node 22에서 v2 tests skip 없이 통과.

## Cycle 2 Task 자체 평가

평가 기준: `.sduck/sduck-assets/eval/task.yml`

| 기준                   | 점수(1-5) | 근거                                                                                                                  |
| ---------------------- | --------- | --------------------------------------------------------------------------------------------------------------------- |
| spec_alignment         | 5         | AC13~AC23을 모두 구현하고 spec checklist를 완료했다.                                                                  |
| plan_alignment         | 5         | 승인된 Step 1~7의 root resolver, guard, duplicate id, matcher, brief workflow, runtime/docs/test 계획을 반영했다.     |
| implementation_quality | 5         | mutation guard/root resolver/path matcher를 공통 helper로 분리했고 overwrite/terminal/root confusion 회귀를 제거했다. |
| test_completeness      | 5         | unit/e2e가 terminal immutability, duplicate id, nested cwd, matcher, brief readiness, packaged CLI를 검증한다.        |
| documentation_quality  | 5         | README에 Node runtime, root policy, terminal immutability, id collision, path target syntax를 반영했고 CI를 추가했다. |
| maintainability        | 5         | 핵심 정책이 shared module/API로 모였고 release readiness를 CI로 고정했다.                                             |

총평: Cycle 2는 file-aware provenance 기능 위에 필요한 v2 release-hardening을 완료했다. terminal task mutation, history overwrite, cwd/worktree confusion, matcher inconsistency, brief workflow mismatch, Node runtime ambiguity를 테스트 가능한 정책으로 정리했다.

---

## Cycle 3 init agent-rails 변경 요약

- `sduck init`이 기본적으로 repo-local `AGENTS.md`에 sduck-managed agent rails block을 설치/업데이트하도록 확장했다.
- managed block marker를 추가했다: `<!-- sduck:v2-agent-rails:begin -->` / `<!-- sduck:v2-agent-rails:end -->`.
- agent rails는 `status/context`, target files known 시 `impact`, draft submit, question gate, brief confirm, trace/remember/close 흐름을 명시한다.
- `sduck init --no-agent` opt-out을 추가했다.
- `runWorkCommand()`의 implicit init은 agent rails를 설치하지 않도록 해 명시적 bootstrap 책임을 `sduck init`에 유지했다.
- 기존 `AGENTS.md` 사용자 content 보존, repeated init idempotency, malformed marker 방어를 구현했다.
- README quick start와 agent rails 설명을 “init 후 agent에게 자연어 요청” UX 중심으로 갱신했다.

## Cycle 3 테스트 결과

- `npm run lint` 통과
- `npm run typecheck` 통과
- `npm run test:unit` 통과: 7 files / 43 tests
- `npm run test:e2e` 통과: 2 files / 9 tests
- `npm run build` 통과
- `node dist/cli.js --help` 통과
- `node dist/cli.js --version` 통과 (`0.2.5`)
- `node dist/cli.js init --help` 통과, `--no-agent` option 표시 확인

## Cycle 3 Acceptance Criteria 확인

- AC24 충족: `sduck init`이 `.decision`과 함께 `AGENTS.md` agent instruction을 설치/업데이트한다.
- AC25 충족: installed rails에 status/context/impact/submit/ask-answer/confirm/trace/remember/close workflow를 포함했다.
- AC26 충족: repeated init marker count 1개 idempotency를 unit/e2e로 검증했다.
- AC27 충족: 기존 `AGENTS.md` 사용자 content 보존을 unit/e2e로 검증했다.
- AC28 충족: `sduck init --no-agent` opt-out을 추가하고 `.decision`만 생성됨을 검증했다.
- AC29 충족: init stdout에 agent instructions 설치/skip 결과와 다음 UX를 표시한다.
- AC30 충족: fresh init, existing `AGENTS.md`, repeated init, opt-out init, CLI output을 테스트했다.
- AC31 충족: README에 init 이후 agent가 rails를 따르는 UX, managed block, opt-out 정책을 문서화했다.

## Cycle 3 Task 자체 평가

평가 기준: `.sduck/sduck-assets/eval/task.yml`

| 기준                   | 점수(1-5) | 근거                                                                                                                     |
| ---------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------ |
| spec_alignment         | 5         | AC24~AC31을 모두 구현하고 spec checklist를 완료했다.                                                                     |
| plan_alignment         | 5         | 승인된 Step 1~7의 core writer, init API, CLI option, tests, docs, validation 계획을 반영했다.                            |
| implementation_quality | 5         | agent rails rendering/install을 `agent-rails.ts`로 격리했고 idempotent managed block과 malformed marker 방어를 구현했다. |
| test_completeness      | 5         | unit/e2e가 fresh/existing/idempotent/opt-out/error/output UX를 검증한다.                                                 |
| documentation_quality  | 5         | README quick start, command docs, managed block policy, opt-out, automatic agent UX를 구현과 일치시켰다.                 |
| maintainability        | 5         | 향후 rails 문구 변경은 managed block renderer만 갱신하면 되며 사용자 문서 보존 정책이 명확하다.                          |

총평: Cycle 3는 `sduck init`을 `.decision` DB bootstrap에서 agent workflow bootstrap으로 확장했다. 사용자는 init 후 CLI sequence를 외우지 않고 agent에게 자연어로 요청할 수 있으며, agent는 repo-local `AGENTS.md` rails를 통해 안전한 v2 workflow를 발견한다.
