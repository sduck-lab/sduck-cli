# [build] sduck CLI — 프로젝트 초기 설정

> **작업 타입:** `build` (Project Init/Build)
> **작성자:** taehee
> **작성일:** 2026-03-18
> **연관 티켓:** -

---

## 1. 프로젝트 개요

### 목적 및 배경

AI 에이전트(Claude Code, Codex 등)가 개발 작업 시 스펙 없이 바로 코드를 작성하는 문제를 방지한다.
`sduck`은 Spec-Driven Development(SDD) 워크플로우를 물리적으로 강제하는 CLI 도구로,
파일 생성 / 상태 관리 / 진행 추적만 담당하며 LLM을 직접 호출하지 않는다.

이번 build 작업의 범위는 기능 구현 자체보다, 이후 구현을 안전하게 진행할 수 있는
프로젝트 초기 개발 환경을 가장 엄격한 기준으로 세팅하는 것이다.

### 핵심 목표

- [x] TypeScript를 가장 엄격한 수준으로 설정해 컴파일 단계에서 오류를 최대한 조기 차단한다
- [x] ESLint를 type-aware strict 규칙으로 구성해 런타임 이전에 잠재 버그와 나쁜 패턴을 막는다
- [x] Husky 기반 pre-commit 훅으로 lint, typecheck, test, build가 모두 통과해야만 커밋되도록 강제한다
- [x] 빈 mocking 없이 실제 동작을 검증하는 unit test / e2e test 기반을 마련한다
- [x] `docs/` 아래에 아키텍처, 경계, 코드 스니펫, 테스트 전략 문서를 생성해 구현 기준을 명문화한다

---

## 2. 기술 스택

| 구분             | 선택              | 버전 | 선택 이유                              |
| ---------------- | ----------------- | ---- | -------------------------------------- |
| 언어             | TypeScript        | 5.x  | 가장 엄격한 타입 시스템과 생태계 활용  |
| 런타임           | Node.js           | 20+  | ESM, 파일 시스템, 프로세스 실행 안정성 |
| CLI 프레임워크   | commander.js      | 12.x | 명령어 구조화와 확장성                 |
| 인터랙티브 UI    | @inquirer/prompts | 최신 | 선택창, 확인창 UX                      |
| YAML 파싱        | js-yaml           | 4.x  | `meta.yml`, 설정 파일 읽기/쓰기        |
| 린터             | ESLint            | 9.x  | flat config 기반 엄격 규칙 적용        |
| TS 린트          | typescript-eslint | 8.x  | type-aware strict linting              |
| 포맷터           | Prettier          | 3.x  | 일관된 포맷 유지                       |
| Git Hooks        | Husky             | 9.x  | 커밋 전 검증 강제                      |
| Staged 파일 검사 | lint-staged       | 최신 | 변경 파일 빠른 검사                    |
| 번들러           | tsup              | 최신 | ESM CLI 빌드                           |
| Unit Test        | vitest            | 최신 | TypeScript 친화적 테스트 작성          |
| E2E Test         | vitest            | 최신 | 실제 CLI 실행 기반 end-to-end 검증     |
| 패키지 매니저    | npm               | 최신 | 범용성, CI 호환성                      |

---

## 3. 아키텍처

### 전체 구조

```
sduck-cli/
├── src/
│   ├── cli.ts                 # entrypoint, commander 설정
│   ├── commands/              # CLI command handlers
│   ├── core/                  # 파일/상태/설정 도메인 로직
│   ├── services/              # 조합 로직, 유스케이스 오케스트레이션
│   └── utils/                 # 순수 유틸리티
├── tests/
│   ├── unit/                  # 순수 함수 및 도메인 로직 테스트
│   ├── e2e/                   # 실제 CLI 실행 기반 테스트
│   ├── fixtures/              # 테스트 입력 템플릿
│   └── helpers/               # 임시 워크스페이스, 프로세스 실행 헬퍼
├── docs/
│   ├── architecture.md        # 전체 구조와 계층 설명
│   ├── boundaries.md          # 모듈 경계와 의존 방향 설명
│   ├── snippets.md            # 자주 쓰는 코드 스니펫
│   └── testing.md             # 테스트 전략과 작성 규칙
├── .husky/
├── eslint.config.js
├── .prettierrc
├── tsconfig.json
├── tsconfig.build.json
├── tsup.config.ts
├── vitest.config.ts
└── package.json
```

### 계층 및 의존성 규칙

- `commands/`는 사용자 입력을 받고 `services/` 또는 `core/`를 호출한다
- `services/`는 여러 `core/` 모듈을 조합하며 비즈니스 흐름을 구성한다
- `core/`는 파일 구조, 상태 전이, 설정 로딩 등 핵심 도메인 규칙을 담당한다
- `utils/`는 외부 상태에 의존하지 않는 순수 함수만 둔다
- `tests/unit/`는 구현 세부가 아닌 공개 동작을 검증한다
- `tests/e2e/`는 실제 바이너리 또는 CLI 엔트리포인트를 실행해 파일 시스템 산출물을 검증한다
- `docs/` 문서는 구현 후행 산출물이 아니라 설계 경계와 사용 예시의 기준 문서로 유지한다

---

## 4. 코드 컨벤션

### 네이밍 규칙

| 대상            | 규칙            | 예시                       |
| --------------- | --------------- | -------------------------- |
| 파일명          | kebab-case      | `plan-approve.ts`          |
| 함수            | camelCase       | `loadMeta()`               |
| 클래스          | PascalCase      | `WorkspaceService`         |
| 타입/인터페이스 | PascalCase      | `MetaYml`, `WorkspaceTask` |
| 상수            | SCREAMING_SNAKE | `STATUS_IN_PROGRESS`       |
| 문서 파일       | kebab-case      | `architecture.md`          |

### 포맷팅

- 들여쓰기: 2 spaces
- 최대 줄 길이: 100
- 세미콜론: 사용
- import 정렬: ESLint 규칙 또는 명시적 정렬 규칙으로 강제
- dead code, 미사용 변수, 미사용 매개변수는 허용하지 않는다

### TypeScript 엄격 옵션 원칙

- `strict: true`
- `noImplicitAny`, `noImplicitOverride`, `noImplicitReturns` 활성화
- `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noPropertyAccessFromIndexSignature` 활성화
- `noUnusedLocals`, `noUnusedParameters` 활성화
- 불필요한 `as` 단언과 `any` 사용을 금지한다

---

## 5. 린팅 및 타입 검사

| 도구       | 설정 파일          | 주요 규칙                                            |
| ---------- | ------------------ | ---------------------------------------------------- |
| ESLint     | `eslint.config.js` | type-aware strict, unsafe any 금지, 미사용 코드 금지 |
| Prettier   | `.prettierrc`      | 포맷 일관성 유지                                     |
| TypeScript | `tsconfig.json`    | strict 전체 활성화, 빌드/테스트 설정 분리            |

### 검사 정책

- `npm run lint`는 전체 소스와 테스트 코드를 검사한다
- `npm run typecheck`는 테스트 코드 포함 타입 검사를 수행한다
- staged 파일은 `lint-staged`로 빠르게 검사하되, pre-commit에서는 전체 품질 게이트를 다시 수행한다
- lint warning 없이 운영하는 것을 원칙으로 하며, warning 누적을 허용하지 않는다

### Husky 정책

- `pre-commit`에서 최소 `lint`, `typecheck`, `test:unit`, `test:e2e`, `build`를 순서대로 실행한다
- 하나라도 실패하면 커밋을 차단한다
- `--no-verify` 사용을 전제로 한 개발 흐름은 허용하지 않는다

---

## 6. 테스트 전략

### 목표

- 테스트는 구현 상세가 아니라 실제 동작과 산출물을 검증한다
- 테스트 작성의 편의를 위해 빈 mocking, 의미 없는 stub, 구현 없는 spy로 통과시키지 않는다
- CLI 도구 특성상 파일 생성 결과, 상태 전이, 종료 코드, 표준 출력 메시지를 중요 검증 대상으로 본다

### 테스트 레벨별 전략

| 레벨        | 도구   | 대상 범위                                      | 비고                    |
| ----------- | ------ | ---------------------------------------------- | ----------------------- |
| Unit        | vitest | 순수 함수, 상태 전이 규칙, 파서, 유틸리티      | 입력/출력 기반 검증     |
| Integration | vitest | 파일 시스템과 설정 로딩 조합 로직              | 실제 임시 디렉토리 사용 |
| E2E         | vitest | CLI 명령 실행부터 파일 생성/변경까지 전체 흐름 | 실제 프로세스 실행 기반 |

### 테스트 작성 원칙

- mock이 꼭 필요하더라도 외부 시스템 경계에서만 최소한으로 사용한다
- 파일 시스템 테스트는 temp workspace를 사용해 실제 읽기/쓰기를 수행한다
- e2e 테스트는 `sduck init`, `sduck start`, `sduck status` 등 실제 명령 시나리오를 검증한다
- golden file 또는 fixture 기반으로 생성 파일 구조를 검증할 수 있어야 한다
- 테스트는 CI와 로컬에서 동일하게 재현 가능해야 한다

---

## 7. 문서화 산출물

### 생성 대상

| 파일                   | 목적                                              |
| ---------------------- | ------------------------------------------------- |
| `docs/architecture.md` | 전체 구조, 계층 책임, 주요 흐름 설명              |
| `docs/boundaries.md`   | 모듈 경계, 의존 방향, 변경 허용 범위 설명         |
| `docs/snippets.md`     | 명령 추가, 상태 전이 구현, 테스트 작성 예시 제공  |
| `docs/testing.md`      | unit/integration/e2e 테스트 정책과 실행 방법 설명 |

### 문서 원칙

- 문서는 현재 구현과 불일치하지 않도록 유지한다
- 단순 소개보다 실제 작업 시 판단 기준이 되는 규칙과 예시를 포함한다
- 경계 문서에는 어떤 레이어가 어떤 레이어를 참조할 수 있는지 명확히 기록한다

---

## 8. 핵심 기능 명세

### 이번 build 작업 범위

- Node.js + TypeScript 기반 CLI 프로젝트 초기 골격 생성
- ESLint, Prettier, TypeScript strict 설정 파일 작성
- Husky, lint-staged, npm scripts 구성
- `vitest` 기반 unit / integration / e2e 테스트 실행 환경 구성
- `docs/` 문서 초안 생성
- 이후 feature 구현이 바로 가능하도록 기본 디렉토리/스크립트/설정 정리

### 기본 명령어 대상

향후 구현 대상 명령어는 아래와 같으며, 이번 build 단계에서는 해당 명령을 안전하게 구현할 수 있는 기반만 마련한다.

| 명령어                           | 설명                                      |
| -------------------------------- | ----------------------------------------- |
| `sduck init`                     | 프로젝트 sduck 환경 초기화                |
| `sduck start <type> <slug>`      | 작업 시작, 디렉토리/meta.yml/spec.md 생성 |
| `sduck spec approve [slug]`      | 스펙 승인                                 |
| `sduck plan create [slug]`       | 플랜 템플릿 삽입                          |
| `sduck plan approve [slug]`      | 플랜 승인                                 |
| `sduck step done <N>`            | 단계 완료 기록                            |
| `sduck done [--force]`           | 완료 조건 체크 + 완료 처리                |
| `sduck status [--json]`          | 현재 작업 상태 출력                       |
| `sduck list [--status] [--json]` | 전체 작업 목록                            |
| `sduck type list/add/show`       | 타입 관리                                 |

### 품질 게이트 스크립트

- `npm run lint`
- `npm run typecheck`
- `npm run test:unit`
- `npm run test:e2e`
- `npm run test`
- `npm run build`

---

## 9. 완료 조건

- [x] `package.json`에 개발/검증/빌드용 스크립트가 정리되어 있다
- [x] `tsconfig.json`, `tsconfig.build.json`이 strict 기준으로 구성되어 있다
- [x] `eslint.config.js`가 type-aware strict 규칙으로 구성되어 있다
- [x] Prettier 설정 파일이 추가되어 포맷 기준이 고정된다
- [x] Husky와 `pre-commit` 훅이 구성되어 전체 검사 실패 시 커밋이 차단된다
- [x] `lint-staged`가 staged 파일 빠른 검사를 수행한다
- [x] `tests/unit/`, `tests/e2e/`, `tests/helpers/`, `tests/fixtures/` 구조가 생성된다
- [x] unit 테스트 샘플이 실제 함수 동작을 검증한다
- [x] e2e 테스트 샘플이 실제 CLI 실행과 파일 시스템 결과를 검증한다
- [x] `docs/architecture.md`, `docs/boundaries.md`, `docs/snippets.md`, `docs/testing.md`가 생성된다
- [x] `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build`가 모두 통과한다

---

## 10. 제약 조건 및 비기능 요구사항

| 항목          | 요구사항                                           | 측정 기준                        |
| ------------- | -------------------------------------------------- | -------------------------------- |
| 타입 안정성   | TypeScript strict 기반으로 컴파일 경고성 우회 금지 | strict 옵션 활성화, `any` 최소화 |
| 코드 품질     | lint warning 없는 상태 유지                        | `npm run lint` 성공              |
| 테스트 신뢰성 | 빈 mocking 없이 실제 동작 검증                     | temp workspace 기반 테스트 통과  |
| 개발 안전성   | 커밋 전 전체 품질 게이트 강제                      | Husky 훅 실패 시 커밋 차단       |
| 문서 일관성   | 구조/경계/예시 문서 최신화                         | `docs/` 문서 존재 및 내용 일치   |

---

## 11. 제약 조건

- sduck 자체는 LLM을 호출하지 않는다
- Node.js 20+ 환경에서 동작한다 (ESM 모듈)
- 출력 언어 기본값은 한국어로 둔다 (추후 config에서 변경 가능)
- `npm install -g sduck` 또는 `npx sduck` 으로 실행 가능해야 한다
- refactor 작업이 아닌 이상 향후 기능 구현에서 외부 동작 변경이 가능하지만, 이번 build 작업은 기능 스펙을 임의로 앞당겨 구현하지 않는다
- 테스트 통과를 위해 mock으로 실제 동작을 대체하는 접근을 기본 전략으로 사용하지 않는다

---

## 12. 미결 사항 (Open Questions)

- [ ] E2E 실행 대상을 `tsx src/cli.ts`로 둘지, 빌드된 바이너리로 둘지 최종 결정
- [ ] `lint-staged`에서 Prettier만 수행할지 ESLint autofix까지 포함할지 결정
- [ ] CI 도입 시 GitHub Actions를 기본값으로 둘지 추후 별도 build 작업으로 분리할지 결정

---

## 13. 참고 자료

- 사용자 제공 초기 설정 요구사항
- `AGENT.md`의 sduck 워크플로우 규칙
