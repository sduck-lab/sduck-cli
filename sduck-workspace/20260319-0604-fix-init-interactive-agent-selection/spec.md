# [fix] restore interactive init multi-agent selection and rule generation

> **작업 타입:** `fix` (Quick Fix)
> **심각도:** `high`
> **작성자:** Claude
> **작성일:** 2026-03-19
> **연관 티켓:**

---

## 1. 버그 개요

### 문제 요약

`sduck init`를 interactive 모드로 실행할 때 선택 UI의 조작 방식이 충분히 안내되지 않아서, 사용자가 아무 agent도 선택하지 않은 채 제출하거나 기대와 다른 방식으로 입력할 수 있다. 그 결과 선택된 agent에 맞는 root markdown 파일이나 `sduck-assets/agent-rules` 기반 규칙 내용이 생성되지 않아 init이 실패한 것처럼 보인다.

### 발견 경위

- [x] 사용자 제보
- [ ] 모니터링 알림
- [ ] 코드 리뷰 중 발견
- [ ] QA 테스트
- [ ] 기타:

### 발생 빈도

- [x] 항상 재현됨 (100%)
- [ ] 간헐적 재현 (약 %)
- [ ] 특정 조건에서만 재현

---

## 2. 재현 방법 (Steps to Reproduce)

**환경 정보**
| 항목 | 내용 |
|------|------|
| 환경 (local / dev / staging / production) | local |
| OS / 브라우저 / 앱 버전 | macOS CLI 환경 |
| 계정 유형 / 권한 | 해당 없음 |
| 관련 데이터 ID / 조건 | 빈 작업 디렉토리, `sduck init` interactive 실행 |

**재현 단계**

1. 빈 작업 디렉토리에서 `sduck init`를 실행한다.
2. interactive agent 선택 UI에서 조작 방법을 모른 채 바로 `enter`를 누르거나, 아무 agent도 선택하지 않고 제출한다.
3. init 결과와 생성 파일을 확인한다.

**실제 결과 (Actual)**

아무 agent도 선택하지 않은 채 제출해도 init이 그대로 끝나 버리면, 사용자는 선택이 반영되지 않은 이유를 이해하기 어렵다. 결과적으로 기대한 rule file이 생성되지 않거나 interactive 선택이 오동작한 것처럼 보인다.

**기대 결과 (Expected)**

interactive UI에서 선택 방법이 명확하게 안내되어야 하고, 아무 agent도 선택하지 않고 제출하려 하면 안내 메시지와 함께 재선택하거나 명확히 실패 처리되어야 한다. 선택된 agent들에 대해서는 올바른 rule file과 agent-rule 내용이 생성되어야 한다.

---

## 3. 원인 분석 (Root Cause)

### 원인 파악 현황

- [ ] 원인 특정 완료
- [x] 원인 조사 중
- [ ] 원인 불명

### 원인 요약

현재 `src/commands/init.ts`는 `@inquirer/prompts`의 `checkbox`를 그대로 사용하고 있는데, 이 프롬프트의 기본 UX는 `space`로 토글하고 `enter`로 제출하는 전통적인 터미널 방식이다. 사용자가 이 조작을 모르면 아무 agent도 선택하지 않은 채 제출할 수 있다. 즉, 첫 번째 원인은 라이브러리 기본 UX와 현재 안내 수준이 사용자 기대에 비해 부족한 점이다.

두 번째 원인은 테스트 경로의 공백이다. `tests/helpers/run-cli.ts`는 `stdio: ['ignore', 'pipe', 'pipe']`로 CLI를 실행해 TTY interactive 흐름을 재현하지 못하므로, 현재 `tests/e2e/init-agent-rules.test.ts`는 `--agents` 경로만 검증하고 있다. 그래서 이전 수정이 non-interactive 경로에는 반영되어도, 실제 interactive 경로 버그는 계속 남아 있을 수 있다.

세 번째 원인은 rule file 생성 자체가 별도 버그라기보다 선택 결과 의존이라는 점이다. `src/core/init.ts`는 `listAgentRuleTargets(resolvedOptions.agents)`로 target을 만들고, 그 결과가 비어 있으면 `CLAUDE.md`, `AGENT.md`, `GEMINI.md`, managed file 생성도 전부 건너뛴다. 즉 현재 보이는 file 생성 문제는 empty selection을 그대로 허용하는 interactive 단계의 2차 증상일 가능성이 높다.

### 원인 코드 위치

```text
파일: src/commands/init.ts, src/core/agent-rules.ts, src/core/init.ts,
      tests/e2e/init-agent-rules.test.ts, tests/helpers/run-cli.ts
함수 / 라인: resolveSelectedAgents, listAgentRuleTargets, renderAgentRuleContent,
             initProject, interactive CLI test harness
```

### 발생 조건

`--agents` 없이 interactive `sduck init`를 실행하고, 사용자가 `space` 대신 `enter`로 선택한다고 기대하거나 아무것도 선택하지 않은 채 제출할 때 발생한다. `.md` root file이나 managed file 생성을 기대한 경우 empty selection은 곧바로 file 생성 누락으로 드러난다.

---

## 4. 수정 방안

### 방안 검토

| 방안   | 설명                                                                             | 장점                          | 단점                                                             |
| ------ | -------------------------------------------------------------------------------- | ----------------------------- | ---------------------------------------------------------------- |
| 방안 A | empty selection 안내만 추가                                                      | 수정 범위가 작음              | interactive UX 설명과 테스트 공백이 충분히 해결되지 않을 수 있음 |
| 방안 B | interactive 안내, empty selection 방지, rule generation, 테스트 경로를 함께 정리 | 증상 전체를 한 번에 고정 가능 | 조사와 테스트 보강 범위가 큼                                     |

### 선택한 방안 및 이유

> **선택:** 방안 B
>
> **이유:** 현재 문제는 `@inquirer/prompts` 기본 UX 설명 부족과 empty selection 허용, 그리고 interactive 테스트 부재가 함께 얽혀 있다. 선택 안내와 empty selection 방지, generated content 검증까지 한 흐름으로 점검해야 재발을 막을 수 있다.

### 변경 파일 목록 (예상)

```text
target_paths:
  - src/commands/init.ts
  - src/core/agent-rules.ts
  - src/core/init.ts
  - tests/helpers/run-cli.ts
  - tests/e2e/init-agent-rules.test.ts
  - tests/unit/agent-rules.test.ts
  - 필요 시 대체 interactive prompt wrapper 파일
```

---

## 5. 테스트 계획

### 버그 재현 테스트 (수정 전 실패 확인)

- [ ] interactive multi-select 재현 경로를 테스트 또는 수동 재현으로 고정

### 수정 검증 테스트 (수정 후 통과 확인)

| 테스트 케이스              | 조건                                     | 예상 결과                                                                 |
| -------------------------- | ---------------------------------------- | ------------------------------------------------------------------------- |
| empty selection guard      | 아무 agent도 선택하지 않고 제출          | 안내 메시지와 함께 재선택 또는 명확한 실패 처리                           |
| interactive multi-select   | 여러 agent 선택 후 제출                  | 선택 방법이 안내되고 전체 선택이 반영됨                                   |
| mixed target generation    | root file + managed file agent 혼합 선택 | `CLAUDE.md`, `AGENT.md`, `GEMINI.md`, managed file이 모두 기대대로 생성됨 |
| generated rule content     | 생성된 rule file 확인                    | 선택된 agent에 맞는 내용과 shared rules가 반영됨                          |
| non-interactive regression | `--agents` 사용                          | 기존 정상 동작 유지                                                       |

### 회귀 테스트

- [ ] interactive 선택 경로 e2e 추가 또는 보강
- [ ] init agent rule unit/e2e 회귀 확인
- [ ] typecheck/build 통과 확인

---

## 6. 영향 범위

### 사이드 이펙트 검토

interactive prompt 동작, `--agents`를 제외한 init 진입 흐름, selected agents 출력, rule file 생성, generated content에 영향이 있을 수 있다.

### 데이터 정합성

- [x] DB 데이터 정정 작업 필요 없음
- [ ] DB 데이터 정정 작업 필요: _(내용 작성)_

---

## 7. 롤백 계획

문제 발생 시 interactive 선택 처리 변경분과 rule generation 변경분을 되돌리고, 최소한 `--agents` 기반 non-interactive 경로는 안정적으로 유지한다.

- 롤백 방법: interactive selection 및 관련 test harness 변경 revert
- 롤백 판단 기준 (임계값 또는 조건): `sduck init` 기본 경로가 실패하거나 기존 `--agents` 흐름까지 깨질 경우

---

## 8. 임시 조치 (Workaround, 해당 시)

임시 우회는 가능하지만 이번 작업에서 interactive 경로 자체를 고친다. spec/plan에서는 workaround를 남기되 구현 완료 후 더 이상 기본 사용 경로로 안내하지 않는다.

---

## 9. 재발 방지 대책

interactive empty selection 방지, multi-select, generated rule content를 함께 검증하는 e2e 테스트를 추가하고 유지한다.

- [x] 테스트 케이스 추가
- [ ] 코드 리뷰 체크리스트 항목 추가
- [ ] 모니터링 알림 추가
- [ ] 기타:

---

## 10. 참고 자료

- `src/commands/init.ts`
- `src/core/agent-rules.ts`
- `src/core/init.ts`
- `tests/e2e/init-agent-rules.test.ts`
