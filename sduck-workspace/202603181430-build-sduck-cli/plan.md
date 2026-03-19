# Plan

## Step 1. Node 패키지 메타데이터와 실행 스크립트 정의

- `package.json`을 생성한다.
- 패키지 이름을 `sduck` 또는 저장소 규칙에 맞는 CLI 패키지명으로 정의한다.
- `type`은 `module`로 설정한다.
- `bin`에 CLI 엔트리포인트를 연결한다.
- `engines.node`를 `>=20`으로 설정한다.
  - 이 설정은 이 패키지가 지원하는 최소 Node.js 버전을 명시한다.
  - `npm`은 설치 시 경고에 활용하고, 팀/CI는 런타임 버전 기준을 일관되게 맞출 수 있다.
  - 이번 작업에서는 ESM, 최신 Node API, 테스트 실행 환경을 통일하기 위해 `>=20`으로 고정한다.
- 아래 스크립트를 정의한다.
  - `dev`: `tsx src/cli.ts`
  - `build`: `tsup src/cli.ts --format esm --dts --clean`
  - `lint`: `eslint . --max-warnings=0`
  - `format`: `prettier --write .`
  - `format:check`: `prettier --check .`
  - `typecheck`: `tsc --project tsconfig.json --noEmit`
  - `test:unit`: `vitest run tests/unit`
  - `test:e2e`: `vitest run tests/e2e`
  - `test`: `npm run test:unit && npm run test:e2e`
  - `prepare`: `husky`

## Step 2. 의존성 설치 목록 확정

- runtime dependencies를 설치한다.
  - `commander`
  - `@inquirer/prompts`
  - `js-yaml`
- dev dependencies를 설치한다.
  - `typescript`
  - `tsx`
  - `tsup`
  - `vitest`
  - `eslint`
  - `@eslint/js`
  - `typescript-eslint`
  - `eslint-config-prettier`
  - `eslint-plugin-import`
  - `eslint-plugin-n`
  - `prettier`
  - `husky`
  - `lint-staged`
  - `@types/node`
- 패키지 선택 이유를 `docs/snippets.md` 또는 `docs/architecture.md`에 간단히 남길 수 있도록 정리한다.

## Step 3. TypeScript 설정 파일 작성

- `tsconfig.json`을 생성한다.
- TypeScript 설정은 실무적으로 적용 가능한 범위에서 가장 엄격한 기준을 목표로 한다.
- 아래 옵션 조합으로 런타임 버그 가능성과 타입 우회를 최대한 줄이고, 필요 시 `noFallthroughCasesInSwitch`, `allowUnusedLabels: false`, `allowUnreachableCode: false`까지 함께 검토한다.
- 주요 compiler option을 아래 기준으로 설정한다.
  - `target: ES2022`
  - `module: NodeNext`
  - `moduleResolution: NodeNext`
  - `strict: true`
  - `noImplicitAny: true`
  - `noImplicitOverride: true`
  - `noImplicitReturns: true`
  - `noUncheckedIndexedAccess: true`
  - `exactOptionalPropertyTypes: true`
  - `noPropertyAccessFromIndexSignature: true`
  - `noUnusedLocals: true`
  - `noUnusedParameters: true`
  - `useUnknownInCatchVariables: true`
  - `verbatimModuleSyntax: true`
  - `isolatedModules: true`
  - `skipLibCheck: false`
- `include`는 `src`, `tests`, 설정 파일 타입 범위를 포함하도록 잡는다.
- `tsconfig.build.json`을 추가해 테스트 파일을 제외한 빌드 전용 범위를 분리한다.

## Step 4. ESLint flat config와 Prettier 설정 작성

- `eslint.config.js`를 flat config 방식으로 작성한다.
- 아래 규칙군을 활성화한다.
  - `@eslint/js` recommended
  - `typescript-eslint` strict/type-checked
  - `typescript-eslint` stylistic/type-checked
  - `eslint-plugin-import`의 import 순서/중복 import 방지 규칙
  - `eslint-plugin-n`의 Node 환경 규칙
  - `eslint-config-prettier`로 포맷 충돌 제거
- 아래 품질 규칙을 명시적으로 강화한다.
  - `no-console`: CLI entrypoint 등 예외 위치만 허용
  - `@typescript-eslint/no-explicit-any`: error
  - `@typescript-eslint/no-unsafe-assignment`: error
  - `@typescript-eslint/no-unsafe-call`: error
  - `@typescript-eslint/no-unsafe-member-access`: error
  - `@typescript-eslint/no-floating-promises`: error
  - `@typescript-eslint/consistent-type-imports`: error
  - `import/order`: error
- `.prettierrc`에 기본 포맷 값을 정의한다.
  - `semi: true`
  - `singleQuote: true`
  - `trailingComma: all`
  - `printWidth: 100`

## Step 5. Husky와 lint-staged 품질 게이트 구성

- `husky init` 또는 동등한 수동 설정으로 `.husky/`를 구성한다.
- `.husky/pre-commit`에 아래 흐름을 넣는다.
  - `npx lint-staged`
  - `npm run typecheck`
  - `npm run test:unit`
  - `npm run test:e2e`
  - `npm run build`
- `lint-staged` 설정을 `package.json` 또는 별도 설정 파일에 추가한다.
- staged 파일에 대해 최소 아래 작업을 수행한다.
  - `eslint --fix`
  - `prettier --write`
- 전체 검사는 pre-commit에서 다시 수행해 부분 통과 상태로 커밋되는 것을 막는다.

## Step 6. 기본 디렉토리 구조와 CLI 엔트리포인트 생성

- 아래 디렉토리를 생성한다.
  - `src/commands`
  - `src/core`
  - `src/services`
  - `src/utils`
  - `tests/unit`
  - `tests/e2e`
  - `tests/helpers`
  - `tests/fixtures`
  - `docs`
- 디렉토리 구조는 의미와 유지보수성을 기준으로 다음처럼 역할을 분리한다.
  - `commands`: CLI 입력 계층, 인자 파싱과 출력 연결 담당
  - `core`: 상태 전이, 파일 포맷, 검증 규칙 등 핵심 도메인 로직 담당
  - `services`: 여러 core 모듈을 조합하는 유스케이스 계층 담당
  - `utils`: 부작용 없는 범용 함수만 배치
  - `tests/helpers`: 테스트 실행을 위한 보조 도구
  - `tests/fixtures`: 재사용 가능한 입력 샘플
- 구현 초기에 불필요한 계층 분산을 피하기 위해, 실제 파일 수가 적을 때는 `services`를 최소화하고 `commands -> core` 중심으로 시작해도 된다.
- 단, 파일 시스템 접근과 상태 규칙이 뒤섞이지 않도록 CLI 계층과 도메인 계층은 분리한다.
- `src/cli.ts`를 생성한다.
- commander 기반 최소 CLI 부트스트랩을 작성한다.
- 초기에는 `--help`, `--version`, placeholder command 또는 skeleton command만 제공한다.
- 출력/에러 처리 유틸의 기본 위치를 정한다.

## Step 7. 빌드 설정과 배포 엔트리 연결

- `tsup.config.ts`를 작성한다.
- 빌드 엔트리를 `src/cli.ts`로 고정한다.
- ESM 출력, declaration 생성, sourcemap, clean build 여부를 설정한다.
- 생성 산출물 디렉토리를 `dist/`로 고정한다.
- `package.json`의 `bin` 필드가 빌드 결과를 가리키도록 연결한다.

## Step 8. 테스트 공통 인프라 작성

- `vitest.config.ts`를 작성한다.
- 테스트 프로젝트 구조를 최소 `unit`과 `e2e`로 분리한다.
- Node 환경에서 실행되도록 설정한다.
- `tests/helpers/`에 아래 헬퍼를 작성한다.
  - temp workspace 생성/정리 헬퍼
  - CLI 실행 헬퍼 (`child_process` 또는 동등 방식)
  - fixture 복사 헬퍼
- E2E는 mock이 아니라 실제 프로세스 실행과 실제 파일 시스템을 사용하도록 기반을 만든다.

## Step 9. 실제 동작 기반 unit 테스트 샘플 작성

- `src/utils/` 또는 `src/core/`의 순수 함수 하나를 만든다.
- 해당 함수의 입력/출력을 검증하는 `tests/unit` 테스트를 작성한다.
- 아래 기준을 만족시킨다.
  - mock 없이 동작 검증
  - 정상 케이스 + 실패 케이스 포함
  - 타입 안전성 보장

## Step 10. 실제 동작 기반 e2e 테스트 샘플 작성

- `tests/e2e`에 CLI 실행 시나리오를 작성한다.
- 최소 아래 흐름을 실제로 검증한다.
  - 임시 디렉토리 준비
  - CLI 실행
  - 종료 코드 확인
  - 생성/수정된 파일 또는 출력 메시지 확인
- 테스트 대상은 mock CLI가 아니라 실제 `src/cli.ts` 또는 빌드 결과물이다.

## Step 11. 설계 및 경계 문서 작성

- `docs/architecture.md`를 작성한다.
  - 디렉토리 구조
  - 레이어 책임
  - 실행 흐름
- `docs/boundaries.md`를 작성한다.
  - 어떤 레이어가 어떤 레이어를 참조할 수 있는지
  - 테스트 가능한 경계와 금지 의존성

## Step 12. 코드 스니펫 및 테스트 문서 작성

- `docs/snippets.md`를 작성한다.
  - 새 command 추가 예시
  - 상태 전이 로직 추가 예시
  - 테스트 추가 예시
- `docs/testing.md`를 작성한다.
  - unit / integration / e2e 작성 원칙
  - 빈 mocking 금지 원칙
  - 로컬 실행 방법과 실패 시 디버깅 방법

## Step 13. 전체 검증과 완료 조건 확인

- 아래 명령을 순서대로 실행한다.
  - `npm run lint`
  - `npm run typecheck`
  - `npm run test`
  - `npm run build`
- 실패 시 원인을 수정하고 재실행한다.
- `spec.md`의 완료 조건과 실제 산출물을 대조한다.
- 완료 조건을 모두 충족할 때까지 누락 항목을 정리한다.
