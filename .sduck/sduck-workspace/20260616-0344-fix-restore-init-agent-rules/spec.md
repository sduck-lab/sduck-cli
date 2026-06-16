# [fix] restore init agent rules

> **작업 타입:** `fix` (Quick Fix)
> **심각도:** `high`
> **작성자:** taehee
> **작성일:** 2026-06-16
> **연관 티켓:** -

---

## 1. 버그 개요

### 문제 요약

현재 배포된 `@sduck/sduck-cli@0.2.6`에서 `sduck init`는 v2 `.decision/` workspace만 생성하고, legacy `.sduck/` SDD asset과 agent rule 파일을 생성하지 않는다. 그 결과 사용자가 init 후 Claude Code/OpenCode/Codex 등 agent에게 일을 시켜도 agent가 `spec -> approval -> plan -> approval -> implementation -> review ready -> done` 흐름을 따르도록 안내되지 않는다.

또한 agent rule이 설치되더라도 현재 CLI entrypoint가 legacy SDD 명령(`start`, `spec approve`, `plan approve`, `step done`, `review ready`, `done` 등)을 노출하지 않으면 rule이 지시하는 명령을 실행할 수 없다.

### 발견 경위

- [x] 사용자 제보
- [x] CLI 동작 확인
- [x] 모니터링 알림: 해당 없음
- [x] 코드 리뷰 중 발견: 해당 없음
- [x] QA 테스트: 해당 없음
- [x] 기타: 해당 없음

### 발생 빈도

- [x] 항상 재현됨 (100%)
- [x] 간헐적 재현: 해당 없음
- [x] 특정 조건에서만 재현: 해당 없음

---

## 2. 재현 방법 (Steps to Reproduce)

**환경 정보**
| 항목 | 내용 |
|------|------|
| 환경 (local / dev / staging / production) | production npm package |
| OS / 브라우저 / 앱 버전 | `@sduck/sduck-cli@0.2.6`, Node 22 |
| 계정 유형 / 권한 | 일반 로컬 프로젝트 |
| 관련 데이터 ID / 조건 | 새 임시 디렉터리에서 `sduck init` 실행 |

**재현 단계**

1. 빈 프로젝트/임시 디렉터리에서 `npm exec --yes @sduck/sduck-cli@0.2.6 -- init`를 실행한다.
2. 생성된 파일을 확인한다.
3. `sduck --help`에서 사용 가능한 명령을 확인한다.

**실제 결과 (Actual)**

- `.decision/` 하위 파일만 생성된다.
- `CLAUDE.md`, `AGENT.md`, `GEMINI.md`, `.cursor/rules/sduck-core.mdc`, `.agents/rules/sduck-core.md` 같은 agent instruction 파일이 생성되지 않는다.
- `.sduck/sduck-assets/`와 legacy SDD workspace 기반 파일이 생성되지 않는다.
- CLI help에는 `start`, `fast-track`, `spec approve`, `plan approve`, `step done`, `review ready`, `done` 같은 legacy SDD workflow 명령이 없다.

**기대 결과 (Expected)**

- `sduck init` 후 agent가 읽는 repository instruction 파일에 sduck SDD workflow rule이 설치되어야 한다.
- 설치된 rule이 지시하는 legacy SDD 명령이 실제 CLI에서도 실행 가능해야 한다.
- npm 배포 패키지에도 init이 필요로 하는 `.sduck/sduck-assets`와 agent-rule template/hook asset이 포함되어야 한다.
- 기존 v2 `.decision` 기능을 유지할지 여부는 구현 시 호환성을 검토하되, 최소한 기존 v2 사용자에게 불필요한 파괴적 제거를 하지 않는다.

---

## 3. 원인 분석 (Root Cause)

### 원인 파악 현황

- [x] 원인 특정 완료
- [x] 원인 조사 중: 해당 없음
- [x] 원인 불명: 해당 없음

### 원인 요약

CLI entrypoint가 legacy command layer 대신 `src/commands/v2/index.ts`의 `runInitCommand`를 사용한다. 이 v2 init은 `src/core/v2/workspace.ts`의 `initDecisionWorkspace`만 호출해 `.decision/` storage를 만들며, `src/core/init.ts`와 `src/core/agent-rules.ts`에 남아 있는 legacy `.sduck` asset/agent-rule 설치 경로를 호출하지 않는다.

배포 설정도 `package.json`의 `files`가 `dist`만 포함하고, `tsup.config.ts`에는 `.sduck/sduck-assets`를 dist/package로 복사하는 설정이 없어 published package에서 legacy init asset을 찾지 못할 수 있다.

### 원인 코드 위치

```text
파일: src/cli.ts
함수 / 라인: `init` command가 v2 `runInitCommand`에 연결됨

파일: src/commands/v2/index.ts
함수 / 라인: `runInitCommand`가 `initDecisionWorkspace`만 호출함

파일: src/core/v2/workspace.ts
함수 / 라인: `.decision` 디렉터리와 state/db만 생성함

파일: src/core/init.ts, src/core/agent-rules.ts
함수 / 라인: legacy `.sduck` asset 및 agent rule 설치 구현은 존재하지만 현재 CLI entrypoint와 배포 asset 경로에 연결되지 않음
```

### 발생 조건

- 현재 배포판 또는 현재 `src/cli.ts` entrypoint로 `sduck init`를 실행할 때 항상 발생한다.
- 특히 non-interactive 환경에서는 legacy init의 agent 선택 prompt도 실행될 수 없으므로, 기본 동작이 agent rule 설치를 보장해야 한다.

---

## 4. 수정 방안

### 방안 검토

| 방안   | 설명                                                                                                  | 장점                                                            | 단점                                                                                                         |
| ------ | ----------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| 방안 A | `init`만 legacy init으로 되돌린다                                                                     | 변경 범위가 작다                                                | rule이 지시하는 SDD 명령이 CLI에 없으면 workflow가 여전히 실패한다                                           |
| 방안 B | `init`에서 legacy `.sduck`/agent-rule 설치를 수행하고, legacy SDD workflow 명령도 CLI에 다시 노출한다 | init 후 agent rule과 CLI 명령이 일치해 실제 SDD flow가 가능하다 | CLI command surface가 커지고 v2 명령과의 공존을 설계해야 한다                                                |
| 방안 C | agent rule 내용을 v2 `.decision` flow에 맞춰 새로 작성한다                                            | 현재 CLI와 일치한다                                             | 사용자가 요구한 기존 sduck SDD flow/spec-plan approval semantics와 다르고, legacy SDD 자산을 활용하지 못한다 |

### 선택한 방안 및 이유

> **선택:** 방안 B
>
> **이유:** 사용자의 요구는 “init 후 agent가 sduck flow를 따르게” 하는 것이다. 따라서 agent instruction 설치뿐 아니라 instruction이 참조하는 SDD 명령도 실제 CLI에서 사용할 수 있어야 한다. legacy 구현과 asset이 이미 남아 있으므로 이를 entrypoint와 배포 패키지에 다시 연결하는 것이 가장 직접적인 수정이다.

### 기본 동작 요구사항

- `sduck init`는 기본적으로 agent rule 설치까지 수행해야 한다.
- interactive 환경에서는 legacy agent 선택 UX를 유지하거나 개선할 수 있다.
- non-interactive 환경에서는 no-op이 되면 안 된다. 별도 `--agents`가 없더라도 agent rule 설치가 보장되어야 한다.
- `--agents <list>`는 특정 agent만 설치하는 명시적 경로로 유지한다.
- `--force`는 기존 managed block/asset 갱신에 사용한다.
- 필요하면 agent rule 설치를 끄는 opt-out 옵션을 추가할 수 있다. 단, 기본값은 “init 후 agent가 SDD flow를 볼 수 있음”이어야 한다.

### 변경 파일 목록 (예상)

```yaml
target_paths:
  - src/cli.ts
  - src/commands/init.ts
  - src/commands/v2/index.ts
  - src/core/init.ts
  - src/core/agent-rules.ts
  - src/core/assets.ts
  - package.json
  - tsup.config.ts
  - tests/unit/sdd-core-regression.test.ts
  - tests/e2e/sdd-cli-reachability.test.ts
  - tests/e2e/v2-cli.test.ts
  - README.md
```

---

## 5. 테스트 계획

### 버그 재현 테스트 (수정 전 실패 확인)

- [x] published `@sduck/sduck-cli@0.2.6`에서 `sduck init`가 `.decision`만 생성함을 확인했다.
- [x] 현재 CLI help에 legacy SDD workflow 명령이 없음을 확인했다.
- [x] e2e regression test로 `sduck init` 후 agent rule 파일과 `.sduck` asset 생성 여부를 검증한다.

### 수정 검증 테스트 (수정 후 통과 확인)

| 테스트 케이스                | 조건                                                                                                                                                                       | 예상 결과                                                                                                           |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| init 기본 동작               | 새 temp workspace에서 `sduck init`                                                                                                                                         | `.sduck/sduck-assets`, `.sduck/sduck-workspace`, agent instruction 파일이 생성되고 SDD workflow rule block이 포함됨 |
| init 명시 agent              | `sduck init --agents claude-code`                                                                                                                                          | `CLAUDE.md`에 sduck managed block이 생성/갱신됨                                                                     |
| init force                   | 기존 managed block이 있는 workspace에서 `sduck init --force`                                                                                                               | managed block과 asset이 갱신됨                                                                                      |
| legacy command reachability  | `sduck --help`, `sduck start --help`, `sduck spec approve --help`, `sduck plan approve --help`, `sduck step done --help`, `sduck review ready --help`, `sduck done --help` | agent rule이 참조하는 명령이 노출됨                                                                                 |
| published asset availability | `npm pack` 산출물을 설치/실행하거나 pack contents 확인                                                                                                                     | dist runtime에서 `.sduck/sduck-assets/agent-rules`를 찾을 수 있음                                                   |
| v2 compatibility             | 기존 v2 e2e test                                                                                                                                                           | 기존 v2 command가 제거되지 않고 계속 통과함                                                                         |

### 회귀 테스트

- [x] `npm run test:unit`
- [x] `npm run test:e2e`
- [x] `npm run typecheck`
- [x] `npm run build`
- [x] 필요 시 `npm pack --dry-run` 또는 pack contents 확인

---

## 6. 영향 범위

### 사이드 이펙트 검토

- `sduck init`가 생성하는 파일이 늘어난다. 이는 요구사항상 의도된 동작이지만, 기존 v2-only 사용자는 output과 repository 변경 파일이 증가할 수 있다.
- root instruction 파일(`CLAUDE.md`, `AGENT.md`, `GEMINI.md`)은 기존 파일이 있으면 managed block을 prepend/replace/keep하는 legacy merge 정책을 따라야 한다.
- `AGENT.md`는 Codex와 OpenCode가 같은 target을 공유하므로 중복/누락 없이 병합되어야 한다.
- npm package에 dot-directory asset을 포함하거나 dist asset path를 변경해야 하므로 배포 크기와 pack contents가 바뀐다.

### 데이터 정합성

- [x] DB 데이터 정정 작업 필요 없음
- [x] DB 데이터 정정 작업 필요: 해당 없음

---

## 7. 롤백 계획

- 롤백 방법: CLI entrypoint의 init/legacy SDD command 연결 및 package asset 포함 변경을 이전 상태로 되돌린다.
- 롤백 판단 기준: init이 기존 v2 workflow를 깨뜨리거나, agent rule 파일 merge가 사용자 파일을 손상시키는 회귀가 확인될 때.

---

## 8. 임시 조치 (Workaround, 해당 시)

- 사용자는 수동으로 `CLAUDE.md`/`AGENT.md`에 sduck SDD workflow rule을 추가할 수 있다.
- 하지만 현재 배포 CLI에 legacy SDD 명령도 노출되지 않으므로, 수동 rule 추가만으로는 완전한 해결이 아니다.

---

## 9. 재발 방지 대책

- [x] 테스트 케이스 추가
- [x] 코드 리뷰 체크리스트 항목 추가: 해당 없음
- [x] 모니터링 알림 추가: 해당 없음
- [x] npm package contents 검증 추가 또는 수동 검증 절차 문서화

---

## 10. 완료 조건

- [x] `sduck init`가 init 후 agent가 읽을 수 있는 sduck SDD workflow instruction을 설치한다.
- [x] `sduck init --agents <list>`로 선택 agent rule 설치가 가능하다.
- [x] non-interactive `sduck init`에서도 agent rule 설치가 no-op으로 끝나지 않는다.
- [x] agent rule이 지시하는 legacy SDD workflow 명령이 CLI에서 실행 가능하다.
- [x] published package에 init/agent-rule asset이 포함된다.
- [x] 관련 unit/e2e/build/typecheck 검증이 통과한다.

---

## 11. 참고 자료

- `src/cli.ts`
- `src/commands/init.ts`
- `src/commands/v2/index.ts`
- `src/core/init.ts`
- `src/core/agent-rules.ts`
- `.sduck/sduck-assets/agent-rules/core.md`
- `package.json`
- `tsup.config.ts`

---

## 12. Spec 자체 평가

`.sduck/sduck-assets/eval/spec.yml` 기준 자체 평가:

| 기준                | 점수 | 근거                                                                                           |
| ------------------- | ---- | ---------------------------------------------------------------------------------------------- |
| problem_clarity     | 5    | 배포 init의 실제 동작과 기대 SDD/agent rule 동작 차이를 명확히 기술함                          |
| scope_definition    | 5    | init, agent rules, legacy command reachability, package assets, v2 compatibility 범위를 구분함 |
| completion_criteria | 5    | 완료 조건을 실행 가능한 checklist로 정의함                                                     |
| feasibility         | 4    | legacy 구현이 남아 있어 실현 가능하나 v2 공존 설계가 필요함                                    |
| risk_coverage       | 4    | root instruction 파일 merge, package assets, v2 호환성 위험을 포함함                           |
| testability         | 5    | e2e/unit/build/pack 검증 방법을 구체화함                                                       |

총평: 구현 전 승인에 충분한 수준. 주요 잔여 리스크는 `sduck init`의 기본 agent 선택 정책과 v2 command 공존 방식이며, plan에서 구체화한다.

---

## 13. Task 자체 평가

`.sduck/sduck-assets/eval/task.yml` 기준 자체 평가:

| 기준                   | 점수 | 근거                                                                                                           |
| ---------------------- | ---- | -------------------------------------------------------------------------------------------------------------- |
| spec_alignment         | 5    | init agent rule 설치, legacy command reachability, package asset 포함, v2 compatibility 요구사항을 모두 반영함 |
| plan_alignment         | 5    | 승인된 5개 plan step의 대상 파일, 테스트, 문서, SDD 상태 기록 요구를 순서대로 수행함                           |
| implementation_quality | 4    | legacy/v2 init 병합과 command aliasing이 명확하며 numeric parsing과 opt-out 옵션을 포함함                      |
| test_completeness      | 5    | unit/e2e/typecheck/lint/build/pack 검증을 수행했고 e2e가 핵심 init/CLI 회귀를 직접 검증함                      |
| documentation_quality  | 4    | README에 init 옵션, agent rule 설치, legacy SDD command 흐름을 반영함                                          |
| maintainability        | 4    | asset root 재사용과 command wrapper 재활용으로 중복을 줄였으나 CLI surface가 커진 만큼 후속 정리는 가능함      |

총평: 완료 조건과 검증 기준을 충족한다. 후속 개선으로는 legacy SDD command를 별도 registration helper로 분리해 `src/cli.ts` 크기를 줄일 수 있다.
