# Review: 20260507-0037-feature-skill-backed-grill-prompt

## 변경 요약

- `sduck context` context pack에 `grillMePrompt`와 `grillMeChecklist`를 추가하고, 기존 `grillMeProtocol`은 유지했다.
- `grill-me` skill 원문 기반의 canonical prompt와 skill scan 기반 checklist를 `src/core/v2/context.ts`의 exported constants로 단일화했다.
- human-readable `sduck context` 출력에 `Agent grill-me prompt:`와 `Skill-backed checklist:` 섹션을 추가했다.
- unit/e2e 테스트와 README의 Agent-led grill-me loop 문서를 갱신했다.

## 테스트 결과

- `npm run typecheck` 통과
- `npm run lint` 통과
- `npm run build` 통과
- `npm run test:unit -- tests/unit/v2-core.test.ts` 실행됨: 현재 Node `v20.20.0` 환경에서는 existing sqlite gate로 2 tests skipped
- `npm run test:e2e -- tests/e2e/v2-cli.test.ts` 실행됨: 현재 Node `v20.20.0` 환경에서는 existing sqlite gate로 1 test skipped
- Changed-file formatting check 통과
- 참고: 제품 CLI와 v2 tests의 실제 runtime 검증은 Node `>=22.13` 환경이 필요하다.

## 리뷰 체크리스트

- [x] 코드 품질 확인
- [x] 테스트 통과 확인
- [x] 문서 업데이트 확인
