# Review: 20260626-0241-fix-opencode-agent-rule-file

## 변경 요약

- `src/core/agent-rules.ts`에서 OpenCode agent rule target을 `AGENT.md`에서 `AGENTS.md`로 변경했다.
- `tests/unit/sdd-core-regression.test.ts`에 OpenCode 단독 init, Codex+OpenCode 분리 설치, 기존 `AGENTS.md` 사용자 content 보존 regression test를 추가했다.
- `tests/e2e/v2-cli.test.ts`의 default init 검증에 `AGENTS.md` 생성 및 Codex/OpenCode 분리 assertion을 추가했다.

## 테스트 결과

- `npx vitest run tests/unit/sdd-core-regression.test.ts` — 통과 (5 tests)
- `npx vitest run tests/e2e/v2-cli.test.ts` — 통과 (1 test)
- `npm run typecheck` — 통과
- `npm run test:unit` — 통과 (7 files, 28 tests)

## 코드 리뷰 결과

- @oracle review: Approved
- Blocking issue: 없음
- Non-blocking concern 중 `AGENTS.md` 외부 content 보존 테스트 부족 항목은 regression test 추가로 해소했다.
- Legacy `AGENT.md`에 설치된 과거 OpenCode rules 자동 migration은 승인된 scope 밖 follow-up이다.

## Task 평가

`.sduck/sduck-assets/eval/task.yml` 기준 자체 평가:

| 기준                   | 점수(1-5) | 근거                                                                                                  |
| ---------------------- | --------- | ----------------------------------------------------------------------------------------------------- |
| spec_alignment         | 5         | OpenCode target file을 `AGENTS.md`로 변경하고 완료 조건을 모두 검증했다.                              |
| plan_alignment         | 5         | 승인된 Step 1-3을 모두 수행했고 sduck step도 모두 완료됐다.                                           |
| implementation_quality | 5         | 핵심 매핑 1줄 변경으로 최소 수정이며 기존 rendering/dedupe 구조를 유지했다.                           |
| test_completeness      | 5         | OpenCode 단독, Codex+OpenCode 조합, default init e2e, 기존 AGENTS.md 보존을 검증한다.                 |
| documentation_quality  | 4         | review 문서와 spec 체크리스트를 구현 결과에 맞춰 정리했다. 사용자-facing docs 변경은 필요하지 않았다. |
| maintainability        | 5         | agent별 target mapping이 공식 tool convention과 일치하고 regression coverage가 명확하다.              |

평균: 4.8 / 5

## 리뷰 체크리스트

- [x] 코드 품질 확인
- [x] 테스트 통과 확인
- [x] 문서 업데이트 확인
