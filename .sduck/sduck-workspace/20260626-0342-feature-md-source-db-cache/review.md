# Review: 20260626-0342-feature-md-source-db-cache

## 변경 요약

- `.decision` DB를 canonical source가 아닌 cache로 취급하도록 v2 storage 흐름을 재구성했다.
- source-store/cache/rebuild 계층을 추가해 markdown/entity text source에서 DB cache를 rebuild할 수 있게 했다.
- `sduck rebuild` CLI/command 경로를 추가했다.
- `work`, `submit`, `answer`, `trace` 등 write path가 source 우선 기록 후 cache 갱신/재생성 흐름을 따르도록 조정했다.
- `status`, `recall`, `brief`, `context`, `ask` 등 query path에서 DB missing/stale 상황을 자동 rebuild로 복구하도록 했다.
- `.decision` DB cache ignore와 source 파일 tracking 정책을 반영했다.
- v2 unit/e2e 테스트에 DB 삭제/rebuild/자동 rebuild round-trip coverage를 추가했다.

## 테스트 결과

- `npm run lint` — 통과
- `npm run typecheck` — 통과
- `npm run test` — 통과
  - unit: 7 files / 28 tests passed
  - e2e: 2 files / 2 tests passed
- `npm run build` — 통과

## Spec 완료 조건 검증

- [x] `sduck rebuild` 명령 동작 검증
- [x] remember/source 산출물 기반 DB state 복원 검증
- [x] write path source-first 기록 및 DB cache 갱신 흐름 반영
- [x] DB 삭제 후 query command 자동 rebuild 검증
- [x] stale cache 자동 rebuild/동기화 검증
- [x] DB cache `.gitignore` 반영 및 source tracking 정책 확인
- [x] 기존 recall/status/context/brief/ask query 회귀 방지
- [x] unit/e2e round-trip regression 추가
- [x] lint/typecheck/test/build 통과

## Task 평가

`.sduck/sduck-assets/eval/task.yml` 기준 자체 평가:

| 기준                   | 점수(1-5) | 근거                                                                                                                 |
| ---------------------- | --------- | -------------------------------------------------------------------------------------------------------------------- |
| spec_alignment         | 5         | markdown source of truth, DB cache, rebuild/auto rebuild, gitignore, round-trip 요구사항을 충족했다.                 |
| plan_alignment         | 5         | 승인된 Step 1-9를 모두 완료했고 sduck step도 9/9 완료했다.                                                           |
| implementation_quality | 4         | source/cache/rebuild 계층을 분리했고 기존 v2 command 흐름을 유지했다. 변경 범위가 커서 후속 실사용 검증 여지는 있다. |
| test_completeness      | 5         | unit/e2e에서 rebuild, auto rebuild, 기존 command flow를 검증했고 lint/typecheck/build도 통과했다.                    |
| documentation_quality  | 4         | review와 spec checklist를 결과에 맞춰 정리했다. 사용자 문서 확장은 후속으로 분리 가능하다.                           |
| maintainability        | 4         | 역할별 모듈을 추가했지만 storage 전환 범위가 넓어 후속 리팩터링/문서화 여지가 있다.                                  |

평균: 4.5 / 5

## 리뷰 체크리스트

- [x] 코드 품질 확인
- [x] 테스트 통과 확인
- [x] 문서 업데이트 확인
