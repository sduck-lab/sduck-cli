# Plan

## Step 1. 버전 추적 파일 생성 로직 추가

**목표:** `sduck init` 실행 시 프로젝트에 현재 CLI 버전을 기록하고, 업데이트 시 버전을 비교할 수 있게 한다.

**변경 파일:**

- `src/core/version-file.ts` (신규) — 버전 파일 읽기/쓰기 유틸리티
- `src/core/init.ts` — `initProject()` 끝에 `.sduck-version` 파일 생성 추가

**세부 내용:**

- `version-file.ts`에 `readProjectVersion()`, `writeProjectVersion()`, `getProjectVersionPath()` 함수 구현
- 버전 파일 경로: `.sduck/sduck-assets/.sduck-version`
- 파일 내용은 CLI 버전 문자열 (예: `0.2.1`)
- `initProject()`의 마지막에 `writeProjectVersion(projectRoot)` 호출 추가
- `planInitActions`에 `.sduck-version` 파일도 액션에 포함 (이미 존재하면 force 모드에서만 덮어쓰기)

**검증:** `npm run typecheck`

## Step 2. update 코어 로직 구현

**목표:** 에셋, 에이전트 룰, 훅을 버전 비교 기반으로 갱신하는 핵심 로직을 구현한다.

**변경 파일:**

- `src/core/update.ts` (신규) — update 명령어의 핵심 로직

**세부 내용:**

- `UpdateCommandOptions` 타입: `{ dryRun: boolean }`
- `UpdateExecutionResult` 타입: `{ fromVersion, toVersion, didChange, summary }`
- `UpdateExecutionSummary` 타입: init의 `InitExecutionSummary`와 동일한 구조 활용
- `updateProject()` 함수:
  1. `resolveRealProjectRoot()`로 프로젝트 루트 확인
  2. `.sduck/` 존재 여부 확인 — 없으면 에러 (`sduck init` 안내)
  3. `readProjectVersion()`으로 현재 프로젝트 버전 읽기
  4. `CLI_VERSION`과 비교 — 같으면 "already up to date" 반환
  5. `initProject({ force: true }, projectRoot)`를 호출하여 전체 에셋/룰 갱신 (force 모드: managed block만 교체, 템플릿은 덮어쓰기)
  6. `writeProjectVersion()`으로 새 버전 기록
  7. `dryRun`이면 5-6 단계를 건너뛰고 계획만 반환

**검증:** `npm run typecheck`

## Step 3. update 명령어 등록

**목표:** CLI에 `sduck update` 명령어를 추가한다.

**변경 파일:**

- `src/commands/update.ts` (신규) — update 명령어 핸들러
- `src/cli.ts` — update 명령어 등록

**세부 내용:**

- `src/commands/update.ts`:
  - `runUpdateCommand()` 함수 (init.ts의 `runInitCommand()`와 동일한 패턴)
  - `CommandResult` 타입 재사용 (commands/init.ts에서 import)
  - 포맷: 버전 전이 표시 + 요약 테이블 + 경고
- `src/cli.ts`:
  - `import { runUpdateCommand }` 추가
  - `.command('update')` 등록, `.option('--dry-run')` 추가
  - `resolveRealProjectRoot()` 후 `runUpdateCommand()` 호출

**검증:** `npm run typecheck`, `npm run build`, `sduck update --dry-run` 수동 실행

## Step 4. 단위 테스트

**목표:** update 코어 로직의 단위 테스트를 작성한다.

**변경 파일:**

- `tests/unit/version-file.test.ts` (신규)
- `tests/unit/update.test.ts` (신규)

**세부 내용:**

- `version-file.test.ts`:
  - `getProjectVersionPath()` 경로 정확성
  - `readProjectVersion()` — 파일 없으면 null, 파일 있으면 버전 문자열 반환
  - `writeProjectVersion()` — 파일 생성 및 내용 검증
- `update.test.ts`:
  - 버전이 같으면 `didChange: false`
  - 버전이 다르면 `didChange: true` + 올바른 fromVersion/toVersion
  - `.sduck/` 없으면 에러
  - `dryRun` 모드에서 파일 변경 없음

**검증:** `npm run test -- tests/unit/version-file.test.ts tests/unit/update.test.ts`

## Step 5. E2E 테스트

**목표:** update 명령어의 전체 흐름을 검증하는 E2E 테스트를 작성한다.

**변경 파일:**

- `tests/e2e/update.test.ts` (신규)

**세부 내용:**

- init 후 update --dry-run 실행 → 변경 없음 (버전 동일)
- init 후 .sduck-version을 이전 버전으로 수정 → update 실행 → 에셋 갱신됨
- init 후 CLAUDE.md에 사용자 커스텀 추가 → update 실행 → managed block만 교체, 커스텀 보존
- `.sduck/` 없는 상태에서 update 실행 → 에러 + `sduck init` 안내 메시지
- update 후 .sduck-version이 CLI_VERSION과 일치

**검증:** `npm run test -- tests/e2e/update.test.ts`

## Step 6. 빌드 및 전체 검증

**목표:** 모든 변경이 정상적으로 동작하는지 최종 검증한다.

**검증 명령:**

- `npm run lint`
- `npm run typecheck`
- `npm test`
- `npm run build`
