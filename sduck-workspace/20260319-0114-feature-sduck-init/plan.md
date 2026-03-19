# Plan

## Step 1. `init` 명령 진입점과 옵션 계약 정의

- `src/cli.ts`에 `init` 명령을 등록한다.
- macOS와 Windows 모두에서 동일하게 동작하도록 경로 처리, 줄바꿈, 실행 방식 차이를 고려한 계약으로 구현한다.
- `--force` 옵션을 추가하고, 기본 동작과 강제 재생성 동작의 차이를 help text에 반영한다.
- 출력 메시지 형식을 기존 CLI 톤과 맞출 최소 계약으로 정리한다.
- CLI 옵션과 실행 입력은 최소 아래 타입으로 고정한다.
  - `InitCommandOptions`: `{ force: boolean }`
  - `InitMode`: `'safe' | 'force'`

## Step 2. 초기화 대상 asset 목록을 상수로 분리

- `sduck-assets/` 아래 기본 생성 대상 파일 목록을 코드 상수로 정의한다.
- asset 경로와 메타데이터는 아래 타입으로 고정한다.
  - `AssetTemplateKey`: `'plan-evaluation' | 'spec-build' | 'spec-feature' | 'spec-fix' | 'spec-refactor' | 'spec-chore'`
  - `AssetTemplateDefinition`: `{ key: AssetTemplateKey; fileName: string; relativePath: string }`
  - `AssetTemplateMap`: `Record<AssetTemplateKey, AssetTemplateDefinition>`
- 최소 대상은 아래로 고정한다.
  - `plan-evaluation.yml`
  - `spec-build.md`
  - `spec-feature.md`
  - `spec-fix.md`
  - `spec-refactor.md`
  - `spec-chore.md`
- 이후 다른 명령이 재사용할 수 있도록 asset 목록과 상대 경로를 한곳에서 관리한다.

## Step 3. 파일 시스템 헬퍼와 충돌 판별 로직 작성

- 디렉토리 존재 여부, 파일 존재 여부, 파일/디렉토리 타입 충돌 여부를 판별하는 헬퍼를 작성한다.
- 경로 생성은 프로젝트 루트 기준으로만 수행해 임의 경로 입력이나 traversal 여지를 없앤다.
- 파일 시스템 상태와 충돌 판정 결과는 아래 타입으로 고정한다.
  - `FsEntryKind`: `'missing' | 'file' | 'directory'`
  - `AssetActionKind`: `'create' | 'keep' | 'overwrite' | 'error'`
  - `AssetCollisionKind`: `'none' | 'file-directory-mismatch' | 'directory-file-mismatch' | 'unknown'`
  - `PlannedAssetAction`: `{ key: AssetTemplateKey; targetPath: string; currentKind: FsEntryKind; action: AssetActionKind; collision: AssetCollisionKind }`
- 충돌 유형을 최소 아래처럼 분류한다.
  - 생성 필요
  - 이미 존재함
  - 강제 갱신 대상
  - 타입 충돌 에러

## Step 4. 기본 `sduck init` 생성 정책 구현

- `sduck-assets/`와 `sduck-workspace/`가 없으면 생성한다.
- 기본 모드에서는 누락된 디렉토리/파일만 생성한다.
- 이미 존재하는 파일은 덮어쓰지 않고 유지한다.
- 유지된 파일은 summary에 포함해 사용자가 스킵 사실을 알 수 있게 한다.
- 출력 요약은 사람이 스캔하기 쉬운 표 형태로도 렌더링할 수 있게 데이터 구조를 설계한다.
- 초기화 실행 결과는 아래 타입으로 고정한다.
  - `InitExecutionSummary`: `{ created: string[]; kept: string[]; overwritten: string[]; warnings: string[]; errors: string[] }`
  - `InitExecutionResult`: `{ mode: InitMode; summary: InitExecutionSummary; didChange: boolean }`

## Step 5. `--force` 재생성 정책 구현

- `sduck init --force` 실행 시 기본 asset 파일만 재생성한다.
- `sduck-workspace/`는 디렉토리 보장만 수행하고 내부 작업 디렉토리는 건드리지 않는다.
- 사용자 커스텀 파일을 덮어쓸 수 있는 대상은 `sduck-assets/`의 기본 파일로 한정한다.
- 강제 갱신된 항목은 일반 생성/유지와 다른 출력 그룹으로 보여준다.

## Step 6. 출력 요약과 오류 메시지 정책 구현

- 성공 시 아래 항목을 그룹화해 출력한다.
  - 생성된 항목
  - 유지된 항목
  - 강제 갱신된 항목
- 텍스트 출력은 macOS와 Windows 터미널 모두에서 깨지지 않도록 ASCII 우선 포맷과 고정 컬럼 폭 전략을 검토한다.
- 충돌이 발생하면 어떤 경로에서 어떤 타입 충돌이 났는지 명확히 출력한다.
- 기본 모드에서 충돌 또는 유지 항목이 있으면 `--force` 또는 수동 확인 같은 다음 액션을 함께 안내한다.
- 사용자에게 표시할 메시지는 아래 타입으로 고정한다.
  - `InitWarningCode`: `'kept-existing-asset' | 'type-conflict' | 'force-recommended'`
  - `InitErrorCode`: `'asset-root-conflict' | 'workspace-root-conflict' | 'asset-write-failed' | 'unknown-fs-error'`

## Step 7. asset 원본 로딩 방식 정리

- 저장소의 기준 asset 원본은 현재 프로젝트 루트 `sduck-assets/`로 본다.
- `init`는 이 기준 asset을 대상 프로젝트 루트에 복사하는 방식으로 구현한다.
- 구현 시 현재 실행 컨텍스트에서 기준 asset을 안전하게 찾을 수 있도록 상대 경로 전략을 고정한다.

## Step 8. 단위 테스트로 생성 정책과 충돌 판정 검증

- 생성 계획 계산 함수 또는 충돌 판별 함수를 순수 로직으로 분리한다.
- 최소 아래 순수 함수 시그니처를 기준으로 테스트 가능하게 만든다.
  - `planInitActions(mode: InitMode, existingEntries: Map<string, FsEntryKind>): PlannedAssetAction[]`
  - `summarizeInitActions(actions: PlannedAssetAction[]): InitExecutionSummary`
- 단위 테스트에서 최소 아래 케이스를 검증한다.
  - 비어 있는 프로젝트
  - 일부 asset만 존재하는 프로젝트
  - 전부 존재하는 프로젝트
  - 파일/디렉토리 타입 충돌
  - `--force` 여부에 따른 결과 차이

## Step 9. E2E 테스트로 실제 초기화 흐름 검증

- temp workspace에서 실제 `sduck init` 명령을 실행한다.
- 최소 아래 시나리오를 검증한다.
  - 신규 초기화 시 `sduck-assets/`, `sduck-workspace/` 생성
  - 재실행 시 기존 파일 유지와 안내 메시지 출력
  - 일부 asset 삭제 후 재실행 시 누락 항목만 복구
  - `--force` 실행 시 기본 asset 재생성
  - 타입 충돌 상황에서 실패 코드와 오류 메시지 출력

## Step 10. 문서와 스니펫 갱신

- `docs/snippets.md`에 `sduck init` 사용 예시를 추가한다.
- 필요 시 `docs/architecture.md` 또는 `docs/boundaries.md`에 init 관련 책임 분리를 반영한다.
- asset을 source of truth로 사용하는 현재 워크플로우 기준과 구현이 어긋나지 않게 정리한다.

## Step 11. 전체 검증과 완료 조건 대조

- `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build`를 순서대로 실행한다.
- 실패 시 원인을 수정하고 다시 검증한다.
- `spec.md`의 acceptance criteria와 생성 정책을 실제 결과와 대조한다.
- 모든 조건 충족 후에만 완료 처리한다.
