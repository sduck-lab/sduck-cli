# [chore] README project overview

> **작업 타입:** `chore` (documentation)
> **작성자:** taehee
> **작성일:** 2026-05-07
> **연관 티켓:** -

---

## 1. 작업 개요

### 작업 목적

현재 `README.md`는 sduck v2의 핵심 흐름만 짧게 설명한다. 사용자가 저장소를 처음 접했을 때 다음을 한 번에 이해할 수 있도록 README를 꼼꼼하게 보강한다.

- 이 프로젝트가 해결하려는 문제와 핵심 가치
- 현재 공개 CLI인 v2 decision briefing workflow
- 주요 명령어, 사용 예시, 데이터 저장 위치
- 에이전트/사용자 협업 방식과 draft schema 입력 방식
- 개발·검증 명령어와 코드 구조
- 현재 구현상 제약과 주의사항

### 작업 범위

- [x] 문서 작성 / 수정
- [ ] 패키지 / 의존성 업데이트
- [ ] 빌드 스크립트 / 설정 변경
- [ ] CI/CD 파이프라인 수정
- [ ] 환경 설정 변경
- [ ] 기타:

---

## 2. 변경 상세

### 현재 상태 (As-Is)

- `README.md`는 `sduck v2` 제목과 간단한 설명, core flow, agent-led grill-me loop, 명령어 목록, draft input, storage, development 명령만 포함한다.
- 패키지 메타데이터 기준 프로젝트는 `@sduck/sduck-cli`이며 Node.js `>=22.13`을 요구한다.
- 실제 현재 CLI 진입점 `src/cli.ts`는 v2 `.decision` 기반 명령을 등록한다: `init`, `work`, `status`, `context`, `submit`, `ask`, `answer`, `brief`, `confirm`, `trace`, `remember`, `recall`, `close`, `abandon`.
- v2 저장소 구조는 `.decision/db.sqlite`, `.decision/state.json`, `.decision/exports/markdown/*`, `.decision/exports/graphify/*`로 구성된다.
- 레거시 `.sduck` SDD 워크플로우와 코어 파일은 저장소에 남아 있으나 현재 README는 최종 사용자용 v2 CLI와의 관계를 명확히 설명하지 않는다.

### 변경 후 상태 (To-Be)

`README.md`를 프로젝트 랜딩 문서로 재구성한다.

- 프로젝트 소개와 “터미널 우선 decision briefing harness”의 목적을 명확히 설명한다.
- 설치/요구사항/빠른 시작 섹션을 보강한다.
- v2 end-user workflow를 단계별로 설명한다.
- 명령어 레퍼런스를 기능별로 정리한다.
- draft JSON/Markdown 입력 예시를 유지하되 필드 의미를 더 분명히 한다.
- `.decision` 저장 구조와 export/memory/trace 개념을 설명한다.
- 에이전트가 사용하는 grill-me protocol과 사용자가 참여하는 지점을 설명한다.
- 개발자를 위해 코드 구조, 개발 명령어, 테스트 전략을 정리한다.
- 제약사항을 명시한다: Node `>=22.13`, Graphify는 런타임 의존성이 아님, context discovery는 경량 키워드/경로 기반, `trace`는 git work tree 필요, `context add`는 프로젝트 내부 경로만 허용.
- 레거시 `.sduck` 워크플로우는 end-user command surface가 아니라 저장소 내부/이전 SDD 자산으로 구분해 짧게 언급한다.

### 변경 파일 목록

```yaml
target_paths:
  - README.md
```

### 제외 범위

- 런타임 코드 변경
- CLI 명령어 동작 변경
- 패키지/의존성 변경
- 테스트 코드 변경
- 레거시 `.sduck` SDD 자산 구조 변경

---

## 3. 의존성 변경

해당 없음.

---

## 4. CI/CD 변경

해당 없음.

---

## 5. 문서 변경

| 문서      | 변경 내용 요약                                                  | 변경 이유                        |
| --------- | --------------------------------------------------------------- | -------------------------------- |
| README.md | 프로젝트 소개, 사용법, 명령어, 저장 구조, 개발 가이드 전면 보강 | 신규 사용자의 이해와 온보딩 개선 |

---

## 6. 완료 조건

- [x] README가 현재 v2 CLI 명령 표면과 일치한다.
- [x] README가 패키지명, Node 요구사항, 개발 명령어를 정확히 반영한다.
- [x] README가 `.decision` 저장 구조와 export 결과물을 설명한다.
- [x] README가 agent-led grill-me / decision briefing 흐름을 처음 보는 사용자도 따라갈 수 있게 설명한다.
- [x] README가 주요 제약사항과 레거시 `.sduck` 자산의 위치를 오해 없이 설명한다.
- [x] 문서 변경만 포함하고 런타임 코드/패키지 변경은 없다.
- [x] `npm run format:check` 또는 README 포맷 확인이 통과한다.

---

## 7. 검증 계획

### 검증 체크리스트

- [x] README 명령어가 `src/cli.ts`의 실제 등록 명령과 일치하는지 확인
- [x] README 개발 명령어가 `package.json` scripts와 일치하는지 확인
- [x] README 저장 구조가 `src/core/v2/paths.ts`와 일치하는지 확인
- [x] README 제약사항이 소스/테스트에서 확인된 내용과 일치하는지 확인
- [x] 문서 포맷 검사 실행

### 검증 방법

```bash
npm run format:check
```

문서만 변경하므로 전체 테스트/빌드는 필수 검증에서 제외하되, 필요 시 아래 명령을 추가로 실행할 수 있다.

```bash
npm run typecheck
npm run test
```

---

## 8. 영향 범위

### 런타임 영향

- [x] 런타임 코드 변경 없음
- [ ] 런타임에 영향 있음

### 개발자 환경 영향

- [x] 변경 없음
- [ ] `npm install` 재실행 필요
- [ ] `.env` 파일 업데이트 필요
- [ ] 별도 마이그레이션 절차 필요

---

## 9. 롤백 계획

- 롤백 방법: README 변경 커밋을 되돌린다.
- 특이사항: 런타임 코드나 의존성 변경이 없으므로 별도 마이그레이션/데이터 롤백은 필요 없다.

---

## 10. 참고 자료

- `README.md`
- `package.json`
- `src/cli.ts`
- `src/types/index.ts`
- `src/core/v2/*`
- `tests/e2e/v2-cli.test.ts`
- `.sduck/sduck-assets/agent-rules/core.md`

---

## 11. 자체 평가

`.sduck/sduck-assets/eval/spec.yml` 기준 자체 평가:

| 기준                | 점수 | 근거                                             |
| ------------------- | ---: | ------------------------------------------------ |
| problem_clarity     |    5 | README 보강 목적과 현재 부족한 점이 명확함       |
| scope_definition    |    5 | 대상 파일과 제외 범위를 명시함                   |
| completion_criteria |    5 | 완료 조건을 체크리스트로 검증 가능하게 정의함    |
| feasibility         |    5 | 문서 1개 수정이며 현재 소스 기준으로 실행 가능함 |
| risk_coverage       |    4 | v2/레거시 혼동, 제약사항, 검증 범위를 다룸       |
| testability         |    4 | 포맷 검사와 소스 대조 검증 방법을 제시함         |
