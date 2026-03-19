# [feature] init agent rules

> **작업 타입:** `feature` (Standard Feature)
> **작성자:** taehee
> **작성일:** 2026-03-19
> **연관 티켓:** -

---

## 1. 배경 및 목적

### 문제 / 요구사항

현재 `sduck init`은 `sduck-assets/`와 `sduck-workspace/`를 초기화할 수 있지만,
Claude Code, Codex, OpenCode, Gemini CLI, Cursor, Antigravity 같은 에이전트가
실제로 SDD 워크플로우를 따르도록 만드는 저장소 루트 규칙 파일까지는 생성하지 않는다.

이 상태에서는 CLI와 asset은 준비되어 있어도, 에이전트가 저장소에 들어왔을 때
`spec -> approval -> plan -> approval -> implementation` 순서를 읽고 따를 가능성이 낮다.

따라서 `sduck init`은 사용자가 사용할 에이전트를 선택하게 하고,
복수 선택된 에이전트에 맞는 규칙 파일을 저장소 루트에 생성할 수 있어야 한다.

### 기대 효과

- 사용자가 `sduck init` 시 지원 에이전트를 여러 개 선택할 수 있다
- 선택된 에이전트별 규칙 파일이 저장소 루트 또는 해당 도구의 규칙 경로에 생성된다
- 생성된 규칙 파일은 모두 동일한 SDD 코어 규칙을 반영한다
- 이후 Claude Code, Codex, OpenCode, Gemini CLI, Cursor, Antigravity가 저장소 진입 시 워크플로우를 읽고 따를 가능성이 높아진다

---

## 2. 기능 명세

### 사용자 스토리

```text
As a developer,
I want to choose multiple AI coding agents during `sduck init`,
So that each selected agent gets the correct repository rule file for the SDD workflow.
```

### 수용 기준 (Acceptance Criteria)

> 모든 항목이 충족되어야 이 작업이 완료(Done)로 간주된다.

- [x] AC1: `sduck init`이 지원 에이전트 목록을 기준으로 복수 선택을 받을 수 있다
- [x] AC2: 선택 가능한 에이전트는 최소 `Claude Code`, `Codex`, `OpenCode`, `Gemini CLI`, `Cursor`, `Antigravity`를 포함한다
- [x] AC3: 선택된 에이전트에 대응하는 규칙 파일이 각 도구의 표준 경로에 생성된다
- [x] AC4: 생성된 규칙 파일은 공통 SDD 핵심 규칙을 일관되게 포함한다
- [x] AC5: 기본 safe 모드에서는 기존 규칙 파일을 무단 덮어쓰지 않고 유지 정책을 적용한다
- [x] AC6: `--force` 사용 시 선택된 에이전트 규칙 파일을 재생성할 수 있다
- [x] AC7: 실제 e2e 테스트에서 복수 선택, 기존 파일 유지, 강제 재생성을 검증한다

### 기능 상세 설명

- `sduck init`은 에이전트 규칙 파일 생성 여부를 init 범위에 포함한다
- 사용자는 복수 선택으로 여러 에이전트를 동시에 고를 수 있어야 한다
- 선택 결과는 init 실행 중 생성 계획에 반영된다
- 각 에이전트는 서로 다른 파일명을 가질 수 있으나, 본문은 공통 SDD 규칙을 공유해야 한다
- 이미 규칙 파일이 있으면 safe 모드에서는 문서 맨 위에 sduck 관리 블록을 prepend하는 방식을 우선 사용하고, 기존 본문은 유지한다
- prepend된 sduck 블록은 시작/끝 마커를 가져서 이후 force 또는 재실행 시 해당 블록만 갱신 가능해야 한다
- 공통 규칙에는 최소 아래가 포함되어야 한다
  - 세션 시작 시 `sduck-workspace/`와 현재 상태 확인
  - 승인 전 코드 작성 금지
  - `spec.md`, `plan.md`, `meta.yml` 상태 전이 규칙
  - `<-` 사용자 메모 규칙
  - `sduck-assets/spec-evaluation.yml`, `sduck-assets/plan-evaluation.yml` 사용 규칙
  - Step 완료 시 `meta.yml` 갱신 규칙
  - 완료 조건 미충족 시 `DONE` 금지

### 지원 에이전트 및 출력 파일 정책

| 에이전트    | 출력 파일                      | 비고              |
| ----------- | ------------------------------ | ----------------- |
| Claude Code | `CLAUDE.md`                    | 루트 파일 사용    |
| Codex       | `AGENTS.md`                    | 루트 파일 사용    |
| OpenCode    | `AGENTS.md`                    | Codex와 공용 가능 |
| Gemini CLI  | `GEMINI.md`                    | 루트 파일 사용    |
| Cursor      | `.cursor/rules/sduck-core.mdc` | 규칙 폴더 사용    |
| Antigravity | `.agents/rules/sduck-core.md`  | 규칙 폴더 사용    |

### 기존 파일 병합 정책

- 대상 파일이 없으면 새 파일을 생성한다
- 대상 파일이 이미 있으면 safe 모드에서는 문서 맨 위에 sduck 관리 블록을 prepend한다
- prepend 블록 예시는 아래처럼 명시적 마커를 사용한다

```md
<!-- sduck:begin -->

...sduck generated rules...

<!-- sduck:end -->
```

- 이미 sduck 관리 블록이 있으면 safe 모드에서는 기존 블록을 유지하고 중복 삽입하지 않는다
- `--force` 사용 시에는 sduck 관리 블록만 최신 내용으로 교체하고, 블록 바깥의 사용자 작성 내용은 유지한다
- `.cursor/rules/sduck-core.mdc`, `.agents/rules/sduck-core.md`처럼 sduck가 전용 파일을 관리하는 경우에는 safe 모드에서 유지, force 모드에서 파일 전체를 갱신한다

---

## 3. 기술 설계

### 변경 대상 컴포넌트

| 레이어   | 파일 / 모듈                                 | 변경 내용 요약                                |
| -------- | ------------------------------------------- | --------------------------------------------- |
| CLI      | `src/cli.ts`                                | `init` 에이전트 선택 옵션/프롬프트 연결       |
| Commands | `src/commands/init.ts`                      | 선택 결과를 init 실행 입력으로 전달           |
| Core     | `src/core/init.ts`                          | 에이전트 규칙 파일 생성 계획 포함             |
| Core     | 새 모듈 (`src/core/agent-rules.ts` 등)      | 지원 에이전트 정의, 파일 매핑, 공통 규칙 조합 |
| Assets   | `sduck-assets/agent-rules/*` 또는 동등 구조 | 공통 규칙/에이전트별 템플릿 저장              |
| Tests    | `tests/unit/*`, `tests/e2e/*`               | 선택, 생성, 유지, force 정책 검증             |

### API 명세 (해당 시)

해당 없음.

### 데이터 모델 변경 (해당 시)

해당 없음.

### 시퀀스 다이어그램 (해당 시)

```text
User → CLI(init)
        → agent selection
        → init command
        → init core
        → asset copy + agent rule file generation
        → summary output
```

---

## 4. UI/UX 명세 (해당 시)

CLI 인터랙션 기준으로 정의한다.

### 인터랙션 정의

- `sduck init` 실행 시 사용자가 지원 에이전트를 여러 개 선택할 수 있어야 한다
- 선택 UI는 체크박스형 또는 다중 선택과 동등한 UX여야 한다
- 기본 선택값을 둘지 여부는 구현 전에 명확히 정한다
- summary에는 생성된 규칙 파일, 유지된 규칙 파일, 강제 재생성된 규칙 파일을 asset과 함께 보여준다
- 기존 문서에 prepend된 경우, summary에서 `prepended` 또는 동등한 상태를 구분해 보여줄 수 있어야 한다

---

## 5. 테스트 계획

### 단위 테스트 (Unit Test)

| 대상 함수 / 모듈   | 테스트 케이스            | 예상 결과                          |
| ------------------ | ------------------------ | ---------------------------------- |
| 에이전트 매핑 로직 | 단일 선택                | 해당 파일만 생성 계획 포함         |
| 에이전트 매핑 로직 | 복수 선택                | 여러 규칙 파일 생성 계획 포함      |
| safe/force 정책    | 기존 루트 규칙 파일 존재 | safe prepend / force block replace |
| safe/force 정책    | 전용 관리 파일 존재      | safe keep / force overwrite        |
| 규칙 조합 로직     | 선택된 에이전트별 렌더링 | 공통 SDD 규칙 포함                 |

### 통합 / E2E 테스트

| 시나리오          | 단계                                         | 예상 결과                               |
| ----------------- | -------------------------------------------- | --------------------------------------- |
| 복수 선택 초기화  | `Claude Code` + `Codex` 등 선택 후 init 실행 | 선택된 규칙 파일 모두 생성              |
| 기존 파일 prepend | 기존 `CLAUDE.md` 존재 상태에서 safe init     | 맨 위에 sduck 블록 추가, 기존 본문 유지 |
| 강제 재생성       | `--force`로 init 재실행                      | sduck 블록 또는 전용 규칙 파일 갱신     |
| 혼합 생성         | 일부 에이전트 규칙 파일만 존재               | 누락 파일만 생성                        |

---

## 6. 영향 범위 분석

### 변경 파일 목록 (예상)

```yaml
target_paths:
  - src/cli.ts
  - src/commands/init.ts
  - src/core/init.ts
  - src/core/agent-rules.ts
  - sduck-assets/agent-rules/*
  - tests/unit/*
  - tests/e2e/*
  - docs/snippets.md
  - docs/architecture.md
```

### 사이드 이펙트 검토

- `sduck init` 인터랙션이 단순 자산 생성에서 다중 선택형 초기화로 확장된다
- 기존 `CLAUDE.md`, `AGENTS.md`, `GEMINI.md` 문서의 사용자 작성 내용과 prepend 정책이 충돌할 수 있다
- Cursor와 Antigravity는 루트 파일이 아니라 규칙 폴더를 쓰므로 경로 생성 정책이 달라진다

### 롤백 계획

- 에이전트 선택 기능과 규칙 파일 생성을 제거하고 기존 asset-only init으로 되돌린다
- 생성된 규칙 파일은 사용자가 유지할 수 있으므로 자동 삭제는 하지 않는다

---

## 7. 보안 / 성능 고려사항

- **인증·인가:** 해당 없음
- **입력값 검증:** 선택 가능한 에이전트는 내부 고정 목록으로 제한한다
- **성능:** 규칙 파일 생성 수는 적으므로 성능 부담은 낮아야 한다
- **민감 데이터 처리:** 기존 사용자 규칙 파일을 safe 모드에서 무단 덮어쓰지 않는다

---

## 8. 비기능 요구사항

| 항목             | 요구사항                                                       |
| ---------------- | -------------------------------------------------------------- |
| 응답 시간        | 일반 로컬 환경에서 즉시 완료 가능한 수준                       |
| 동시 사용자      | 고려 대상 아님                                                 |
| 데이터 보존 기간 | 생성된 규칙 파일은 사용자가 명시적으로 수정/삭제할 때까지 유지 |

---

## 9. 의존성 및 선행 조건

- 이 작업 시작 전 완료되어야 하는 작업: `sduck init` 기본 asset 초기화 기능 완료
- 외부 서비스 / API 연동 필요 여부: 없음
- 피처 플래그(Feature Flag) 사용 여부: 없음

---

## 10. 미결 사항 (Open Questions)

- [ ] `sduck init` interactive 모드에서 기본 선택값을 둘지, 무선택을 허용할지
- [ ] `--force`가 asset과 agent rule 파일 모두를 재생성할지, 선택된 항목만 재생성할지

---

## 11. 참고 자료

- `sduck-workspace/20260319-0114-feature-sduck-init/spec.md`
- `CLAUDE.md`
- `AGENT.md`
