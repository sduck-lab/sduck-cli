# Review: 20260616-0344-fix-restore-init-agent-rules

## 변경 요약

- `sduck init`를 legacy SDD init과 v2 `.decision` init을 함께 수행하는 병합 진입점으로 복구했다.
- non-interactive `init` 기본값이 agent rule 설치 no-op으로 끝나지 않도록 all-agent 기본 선택을 적용하고, `--agents`, `--force`, `--no-agent-rules` 옵션을 노출했다.
- agent rule이 안내하는 legacy SDD 명령(`start`, `spec approve`, `plan approve`, `step done`, `review ready`, `done` 등)을 CLI에 다시 노출했다.
- npm package에 `.sduck/sduck-assets`가 포함되도록 하고 dist runtime asset lookup을 확인했다.
- Claude Code hook/settings safe init이 기존 custom hook/settings를 덮어쓰지 않도록 병합 로직과 회귀 테스트를 추가했다.

## 테스트 결과

- `npm run lint` 통과
- `npm run typecheck` 통과
- `npm run test:unit` 통과
- `npm run test:e2e` 통과
- `npm run build` 통과
- `npm pack --dry-run --json` 통과, `.sduck/sduck-assets` 포함 확인
- local tarball smoke: `npm exec --package <packed.tgz> -- sduck init --agents claude-code` 통과

## 리뷰 체크리스트

- [x] 코드 품질 확인
- [x] 테스트 통과 확인
- [x] 문서 업데이트 확인
