# Plan

## Step 1. project-paths에 archive 경로 추가

- **대상 파일:** `src/core/project-paths.ts`
- **변경 내용:**
  - `SDUCK_ARCHIVE_DIR = 'sduck-archive'` 상수 추가
  - `PROJECT_SDUCK_ARCHIVE_RELATIVE_PATH` 추가 (`.sduck/sduck-archive`)
  - `getProjectSduckArchivePath(projectRoot)` 함수 추가
- **검증:** `npm run typecheck`

## Step 2. core archive 로직 구현

- **대상 파일:** `src/core/archive.ts` (신규)
- **변경 내용:**
  - `ArchiveCommandInput` 인터페이스 (`keep?: number`)
  - `ArchiveTarget` 인터페이스 (WorkspaceTaskSummary + completedAt)
  - `filterArchiveCandidates(tasks)`: DONE 상태만 필터
  - `loadArchiveTargets(projectRoot, input)`: workspace에서 DONE 태스크 수집, meta.yml에서 completedAt 파싱, `--keep N`이면 completedAt 기준 최근 N개 제외
  - `extractCompletedAt(metaContent)`: `completed_at:` 라인에서 타임스탬프 추출
  - `deriveArchiveMonth(completedAt)`: YYYY-MM 문자열 추출
  - `isAlreadyArchived(archivePath, taskDirName)`: 대상 월 폴더에 동일 이름 디렉토리 존재 여부 체크
  - `runArchiveWorkflow(projectRoot, targets)`:
    1. 각 target의 completedAt에서 YYYY-MM 결정
    2. `.sduck/sduck-archive/YYYY-MM/` ensureDirectory
    3. 동일 id 폴더 존재하면 skip
    4. `fs.rename`으로 workspace → archive 이동
  - `ArchiveResult { archived: ArchiveSuccessRow[], skipped: ArchiveSkipRow[] }`
- **참고 패턴:** `src/core/done.ts`의 loadDoneTargets, runDoneWorkflow
- **검증:** `npm run typecheck`

## Step 3. command layer 구현

- **대상 파일:** `src/commands/archive.ts` (신규)
- **변경 내용:**
  - `ArchiveCommandResult` (`exitCode`, `stdout`, `stderr`)
  - `runArchiveCommand(input, projectRoot)`: core 호출 → 결과 포맷팅
  - 대상 없으면 `아카이브 대상이 없습니다.` 출력, exitCode 0
  - 결과 테이블: `| Result | Task | Month |` 형식
- **참고 패턴:** `src/commands/done.ts`의 buildResultTable
- **검증:** `npm run typecheck`

## Step 4. CLI 커맨드 등록

- **대상 파일:** `src/cli.ts`
- **변경 위치:** `done` 커맨드 블록 아래 (~L158)
- **변경 내용:**
  - `import { runArchiveCommand } from './commands/archive.js'` 추가
  - `program.command('archive').description(...).option('--keep <n>', ...).action(...)` 등록
  - `--keep` 값은 `Number()` 파싱, 기본값 0
- **검증:** `npm run typecheck`, `npm run build`

## Step 5. 단위 테스트 작성

- **대상 파일:** `tests/unit/archive.test.ts` (신규)
- **테스트 케이스:**
  - `filterArchiveCandidates`: DONE만 반환, IN*PROGRESS/PENDING*\* 제외
  - `extractCompletedAt`: 정상 타임스탬프 추출, null 값 처리
  - `deriveArchiveMonth`: `2026-03-19T13:30:37Z` → `2026-03`
  - `isAlreadyArchived`: 존재하는 폴더 → true, 없는 폴더 → false
  - keep 로직: 3개 DONE 중 keep=1 → 2개만 대상
  - keep=0 (기본): 전부 대상
- **검증:** `npm run test:unit`

## Step 6. E2E 테스트 작성

- **대상 파일:** `tests/e2e/archive.test.ts` (신규)
- **테스트 케이스:**
  - DONE 태스크 2개 archive → `sduck-archive/YYYY-MM/` 아래에 폴더 이동, workspace에서 삭제
  - 대상 없음 → 안내 메시지, exitCode 0
  - `--keep 1`로 3개 중 2개만 archive → 최근 완료 1개 workspace에 남음
  - 이미 archive에 동일 폴더 존재 시 skip
- **참고 패턴:** `tests/e2e/done.test.ts`의 helper 함수, `runCli` 패턴
- **검증:** `npm run test:e2e`, `npm run lint`
