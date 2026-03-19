# Plan

## Step 1. `start` 명령 입력 계약과 타입 모델 정의

- `src/cli.ts`에 `start <type> <slug>` 명령을 등록한다.
- `src/commands/start.ts`와 `src/core/start.ts`를 위한 입력 타입을 고정한다.
- 최소 아래 타입을 정의한다.
  - `SupportedTaskType`: `'build' | 'feature' | 'fix' | 'refactor' | 'chore'`
  - `StartCommandInput`: `{ type: SupportedTaskType; slug: string }`
  - `StartExecutionResult`: `{ workspaceId: string; workspacePath: string; status: 'PENDING_SPEC_APPROVAL' }`
- 이 작업에서는 asset 디렉토리 구조도 함께 정리한다.
  - 스펙 템플릿은 `.sduck/sduck-assets/types/{type}.md` 기준으로 이동한다
  - 평가 기준은 `.sduck/sduck-assets/eval/spec.yml`, `.sduck/sduck-assets/eval/plan.yml` 기준으로 이동한다
  - 기존 flat 구조를 참조하는 로직이 있다면 새 구조를 기준으로 전부 갱신한다

## Step 2. slug 정규화와 검증 로직 구현

- 입력 slug를 소문자 kebab-case로 정규화하는 함수를 만든다.
- 공백, 대문자, 밑줄, 중복 구분자, 경로 구분자 입력을 안전하게 처리한다.
- 최소 아래 시그니처를 고정한다.
  - `normalizeSlug(input: string): string`
  - `validateSlug(slug: string): void`
- 빈 slug 또는 정규화 후 비어 버리는 입력은 명확한 에러로 처리한다.

## Step 3. UTC 기반 작업 ID 생성 로직 구현

- 현재 UTC 시각으로 `YYYYMMDD-HHmm-{type}-{slug}` 형식의 작업 ID를 생성한다.
- 폴더명과 `meta.yml.id`가 정확히 일치하도록 단일 함수에서 생성한다.
- 최소 아래 시그니처를 고정한다.
  - `createWorkspaceId(date: Date, type: SupportedTaskType, slug: string): string`
  - `formatUtcTimestamp(date: Date): string`

## Step 4. 활성 작업 탐지 정책 구현

- `.sduck/sduck-workspace/` 아래 `IN_PROGRESS`, `PENDING_SPEC_APPROVAL`, `PENDING_PLAN_APPROVAL` 상태의 작업을 탐지한다.
- 활성 작업이 하나라도 있으면 새 `start`를 거부한다.
- 에러 메시지에 기존 작업 경로와 상태를 함께 출력한다.
- 최소 아래 타입을 고정한다.
  - `ActiveTaskSummary`: `{ id: string; status: string; path: string }`

## Step 5. 타입별 템플릿 매핑 구현

- `type`별로 `.sduck/sduck-assets/types/{type}.md`를 매핑한다.
- `build` 타입은 `.sduck/sduck-assets/types/build.md`를 사용한다.
- 템플릿이 없으면 파일 생성 전에 명확한 실패를 반환한다.
- 최소 아래 시그니처를 고정한다.
  - `resolveSpecTemplatePath(type: SupportedTaskType): string`

## Step 6. asset 디렉토리 구조 마이그레이션 반영

- 기존 asset 경로를 새 구조로 정리한다.
  - `.sduck/sduck-assets/spec-*.md` → `.sduck/sduck-assets/types/*.md`
  - `.sduck/sduck-assets/spec-evaluation.yml` → `.sduck/sduck-assets/eval/spec.yml`
  - `.sduck/sduck-assets/plan-evaluation.yml` → `.sduck/sduck-assets/eval/plan.yml`
- `init`, 규칙 문서, 평가 로직, 테스트에서 참조하는 경로를 모두 새 구조로 맞춘다.
- 새 구조에서 누락 자산이 없도록 `init` 기본 생성 대상도 함께 갱신한다.

## Step 7. workspace 디렉토리와 초기 파일 생성 구현

- `.sduck/sduck-workspace/`가 없으면 생성한다.
- 새 작업 디렉토리를 만든 뒤 `meta.yml`, `spec.md`, `plan.md`를 생성한다.
- `plan.md`는 빈 파일로 만든다.
- 이미 동일한 workspace 경로가 있으면 덮어쓰지 않고 실패 처리한다.

## Step 8. `meta.yml` 초기 상태 렌더링 구현

- 초기 `meta.yml`을 워크플로우 규칙과 동일한 구조로 작성한다.
- `created_at`은 UTC ISO 8601(`Z`) 형식으로 기록한다.
- `status`는 `PENDING_SPEC_APPROVAL`로 시작한다.
- 최소 아래 시그니처를 고정한다.
  - `renderInitialMeta(input: { id: string; type: SupportedTaskType; slug: string; createdAt: string }): string`

## Step 9. `spec.md` 템플릿 복사와 기본 치환 구현

- 타입별 asset 템플릿을 읽어서 새 `spec.md`로 복사한다.
- 템플릿에 `{기능명}` 또는 타입별 placeholder가 있으면 최소한 slug 기준 값으로 치환한다.
- 템플릿 본문을 크게 훼손하지 않으면서 작업명과 작성일 같은 기본 값만 채운다.

## Step 10. 시작 결과 출력 형식 구현

- 성공 시 아래 정보를 출력한다.
  - 생성된 workspace 경로
  - 초기 상태 `PENDING_SPEC_APPROVAL`
- 실패 시에는 아래를 구분한다.
  - 지원하지 않는 type
  - 잘못된 slug
  - 활성 작업 존재
  - 템플릿 누락
  - 동일 경로 충돌

## Step 11. 단위 테스트로 정규화/ID/meta/활성 작업 판정 검증

- 최소 아래 케이스를 검증한다.
  - slug 정규화
  - 잘못된 slug 거부
  - UTC ID 형식 생성
  - `meta.yml` 초기값 렌더링
  - 활성 작업 탐지
  - 타입별 템플릿 경로 계산
  - 새 `types/`, `eval/` 구조 기준 경로 계산

## Step 12. E2E 테스트로 실제 작업 생성 흐름 검증

- temp workspace에서 실제 `sduck start feature login`을 실행한다.
- 최소 아래 시나리오를 검증한다.
  - feature 작업 생성
  - fix 작업 생성
  - build 작업 생성 시 `.sduck/sduck-assets/types/build.md` 사용
  - 잘못된 type 실패
  - 잘못된 slug 실패
  - 활성 작업 존재 시 차단
  - 새 asset 구조 기준 init/start 연동 검증

## Step 13. 문서 갱신과 전체 품질 게이트 검증

- `docs/snippets.md`에 `sduck start <type> <slug>` 예시를 추가한다.
- 필요 시 `docs/architecture.md`에 start가 workspace 생성 진입점이라는 점을 반영한다.
- `CLAUDE.md`, `AGENT.md`, 관련 spec 문서의 asset 경로 예시도 `types/`, `eval/` 구조로 갱신한다.
- `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build`를 실행한다.
- spec의 acceptance criteria와 실제 산출물을 대조한 뒤 완료 처리한다.
