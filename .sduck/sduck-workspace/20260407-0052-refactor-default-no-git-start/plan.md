# Plan

## Step 1. `start` 기본 동작을 no-git로 전환하고 CLI 옵션을 명확화

### 변경 파일

- `src/cli.ts`
- `src/core/start.ts`
- `src/commands/start.ts`
- `src/core/git.ts` (오류 메시지 문구 정합성만 필요 시)

### 구현 의도

- `sduck start <type> <slug>` 기본 실행 시 `startTask(..., { noGit: true })`로 동작하게 전환한다.
- 기존 `--no-git`는 하위 호환을 위해 유지하거나 deprecate 문구를 출력하되, 최종 동작은 기본 no-git와 동일하게 맞춘다.
- 신규 `--with-git` 옵션을 추가해 기존 worktree 생성 동작을 명시적 opt-in으로 제공한다.
- CLI 옵션 파싱에서 모호한 조합(`--with-git --no-git`)이 들어오면 명확한 에러를 반환한다.
- `startTask` 내부의 git 생성 분기 조건을 옵션 의미에 맞게 정리하고, 메타(`branch`, `base_branch`, `worktree_path`)가 기본 `null`로 기록되도록 보장한다.

### 확인 포인트

- `start` 기본 실행 결과 meta.yml에 `branch: null`, `base_branch: null`, `worktree_path: null`이 기록되는지 확인.
- `start --with-git` 실행 시에만 `.sduck-worktrees/<id>/`와 branch가 생성되는지 확인.
- 기존 `--no-git` 테스트/사용 경로가 깨지지 않는지 확인.

### 검증 명령

- `npm run test:unit -- tests/unit/start.test.ts`
- `npm run test:e2e -- tests/e2e/start.test.ts`

## Step 2. fast-track/agent-context/implement/clean 연동을 새 기본값에 맞게 정합화

### 변경 파일

- `src/cli.ts` (`fast-track` 옵션도 동일 정책 적용)
- `src/core/fast-track.ts`
- `src/commands/fast-track.ts`
- `src/core/agent-context.ts`
- `src/core/implement.ts`
- `src/core/clean.ts`
- `tests/unit/agent-context.test.ts`
- `tests/e2e/fast-track.test.ts`
- `tests/e2e/no-git.test.ts`

### 구현 의도

- `fast-track`도 `start`와 동일하게 기본 no-git, `--with-git` opt-in 정책으로 맞춘다.
- `agent-context.json`에서 worktree 관련 필드가 `null`일 때 출력/직렬화가 일관되도록 확인하고 필요 시 보완한다.
- `implement` 출력 문구가 no-git 기본에 맞게 자연스럽게 보이도록 조정한다(예: worktree 없음 안내).
- `clean`은 no-git task 증가를 전제로 기존 "no git resources" 경로가 안정적으로 동작하는지 테스트를 강화한다.

### 확인 포인트

- fast-track 기본 실행 시 git 자원이 생성되지 않는지 확인.
- fast-track `--with-git`에서만 worktree 생성되는지 확인.
- implement/agent-context가 worktree null에서 오류 없이 동작하는지 확인.
- clean이 no-git task를 안전하게 스킵하는지 확인.

### 검증 명령

- `npm run test:unit -- tests/unit/agent-context.test.ts tests/unit/fast-track.test.ts`
- `npm run test:e2e -- tests/e2e/fast-track.test.ts tests/e2e/no-git.test.ts`

## Step 3. 문서/사용 가이드를 새 운영 기본값으로 업데이트하고 회귀 검증

### 변경 파일

- `README.md`
- 필요 시 `CLAUDE.md`의 workflow 표현 중 "자동 worktree 생성" 뉘앙스 문구
- 테스트 보강 파일
  - `tests/e2e/start.test.ts`
  - `tests/e2e/fast-track.test.ts`
  - 관련 유닛 테스트 파일

### 구현 의도

- README의 "일반 흐름"과 명령 예시를 기본 no-git 기준으로 재작성한다.
- `--with-git`을 명시적 옵션으로 설명하고, 언제 쓰는지(병렬 격리 작업, branch 기반 리뷰 등) 가이드를 추가한다.
- `.sduck-worktrees` 설명을 "항상 생성"에서 "opt-in 시 생성"으로 수정한다.
- 전체 테스트를 돌려 새 기본 동작으로 인한 회귀를 점검한다.

### 확인 포인트

- README에 더 이상 "start 기본 = worktree 자동 생성"으로 오해될 문구가 없는지 확인.
- CI 기준으로 최소 `lint`, `typecheck`, 핵심 e2e가 통과하는지 확인.

### 검증 명령

- `npm run lint`
- `npm run typecheck`
- `npm run test`

## Plan 자체 평가 (plan.yml 기준)

| 항목             | 점수(1-5) | 근거                                                        |
| ---------------- | --------- | ----------------------------------------------------------- |
| semantic clarity | 5         | 단계별 목표/파일/검증 명령이 명확하게 분리됨                |
| abstraction      | 4         | 정책 전환(start/fast-track)과 연동 모듈을 균형 있게 분리함  |
| typing           | 4         | CLI 옵션 타입 및 StartTaskOptions 정합성을 단계에 포함함    |
| security         | 4         | git 리소스 조작 범위를 opt-in으로 제한해 운영 리스크를 낮춤 |
| maintainability  | 5         | 기본 경량 경로와 opt-in 경로를 문서/테스트 포함해 일관화    |
| testability      | 5         | 단계마다 구체 테스트 파일과 명령을 지정함                   |

총평: 4.5/5, 기본 정책 전환과 회귀 방지를 함께 다루는 실행 가능한 상세 계획.
