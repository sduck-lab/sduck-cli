# Review: 20260617-0020-feature-codebase-decision-skill

## 변경 요약

- `.sduck/sduck-assets/agent-rules/skills/codebase-decisions/SKILL.md` 신규 추가
  - 기존 코드베이스/문서/테스트에서 의사결정을 추출해 `SduckDraft v2alpha1`로 저장하는 agent-facing skill
  - `sduck work`, `context add`, `submit`, `remember`, `recall` workflow와 evidence/safety 규칙 포함
- `.sduck/sduck-assets/agent-rules/core.md`에 bundled skill 경로와 trigger 안내 추가
- `src/core/assets.ts`, `src/core/init.ts`에 skill asset 등록
- `src/core/update.ts`에서 기존 generated agent rule을 감지해 `sduck update` 시 managed block도 refresh하도록 보강
- init/update asset 설치와 generated rule discoverability 회귀 테스트 추가/갱신

## 테스트 결과

- `npm run test:unit` — pass, 25 tests
- `npm run typecheck` — pass
- `npx vitest run tests/e2e/sdd-cli-reachability.test.ts` — pass
- `npm run lint` — pass
- @oracle review — no blockers after update discoverability fix

## 리뷰 체크리스트

- [x] 코드 품질 확인
- [x] 테스트 통과 확인
- [x] 문서 업데이트 확인
