# [fix] init interactive agent selection and root md file generation

> **작업 타입:** `fix` (Quick Fix)
> **심각도:** `high`
> **작성자:** Claude
> **작성일:** 2026-03-19
> **연관 티켓:**

---

## 1. 버그 개요

### 문제 요약

`sduck init`의 대화형 에이전트 선택에서 여러 항목을 선택해도 선택값이 완전하게 반영되지 않거나, 그 결과 생성되어야 할 루트 `.md` 규칙 파일이 누락되는 문제가 있다. 또한 생성되는 agent rules 내용이 프로젝트의 실제 `CLAUDE.md`/`AGENT.md` 기준 문서와 충분히 정렬되지 않아, 이미 구현된 CLI 명령어 사용 흐름을 규칙에 반영하지 못하고 있다.

### 발견 경위

- [x] 사용자 제보
- [ ] 모니터링 알림
- [ ] 코드 리뷰 중 발견
- [ ] QA 테스트
- [ ] 기타:

### 발생 빈도

- [ ] 항상 재현됨 (100%)
- [ ] 간헐적 재현 (약 %)
- [x] 특정 조건에서만 재현

---

## 2. 재현 방법 (Steps to Reproduce)

**환경 정보**
| 항목 | 내용 |
|------|------|
| 환경 (local / dev / staging / production) | local |
| OS / 브라우저 / 앱 버전 | macOS CLI 환경 |
| 계정 유형 / 권한 | 해당 없음 |
| 관련 데이터 ID / 조건 | 빈 작업 디렉토리, interactive `sduck init` |

**재현 단계**

1. 빈 작업 디렉토리에서 `sduck init`를 실행한다.
2. 대화형 선택 UI에서 `.md` 기반 에이전트 둘 이상을 선택한다.
3. init 완료 후 출력된 selected agents와 실제 생성 파일을 확인한다.
4. 생성된 agent rules 내용이 프로젝트 기준 문서와 실제 CLI 명령 집합을 반영하는지 확인한다.

**실제 결과 (Actual)**

여러 항목을 선택했는데 일부 선택이 누락되거나, 선택된 에이전트에 대응하는 `CLAUDE.md`, `AGENT.md`, `GEMINI.md` 같은 루트 `.md` 파일이 모두 생성되지 않는다. 생성되더라도 agent rules 내용이 실제 프로젝트 기준 문서와 CLI 명령 흐름을 충분히 안내하지 못할 수 있다.

**기대 결과 (Expected)**

대화형 다중 선택 결과가 그대로 반영되고, 선택된 모든 `.md` 기반 에이전트의 규칙 파일이 작업 루트에 생성되어야 한다. 또한 생성되는 agent rules는 프로젝트의 기준 문서 구조와 현재 제공되는 CLI 명령어(`init`, `start`, `spec approve`, `plan approve` 등)를 반영해야 한다.

---

## 3. 원인 분석 (Root Cause)

### 원인 파악 현황

- [ ] 원인 특정 완료
- [x] 원인 조사 중
- [ ] 원인 불명

### 원인 요약

현재 정보상으로는 대화형 checkbox 선택값 처리와 init 후속 파일 생성 계획 사이에 불일치가 있을 가능성이 높다. 선택 결과가 일부만 전달되거나, 선택된 에이전트 목록이 `.md` 대상 파일 액션으로 완전히 확장되지 않을 수 있다. 동시에 `.sduck/sduck-assets/agent-rules/`의 템플릿이 프로젝트 기준 문서와 느슨하게 연결되어 있어 실제 사용 가능한 CLI 명령 안내가 부족할 가능성이 있다.

### 원인 코드 위치

```text
파일: src/commands/init.ts, src/core/init.ts, src/cli.ts,
      .sduck/sduck-assets/agent-rules/*.md, tests/e2e/init-agent-rules.test.ts
함수 / 라인: resolveSelectedAgents, initProject 및 관련 rule generation 경로
```

### 발생 조건

interactive 모드에서 `--agents` 없이 실행하고, 루트 `.md` 규칙 파일을 생성해야 하는 에이전트를 여러 개 선택할 때 발생 가능성이 높다. 또한 agent rules 템플릿을 갱신하지 않으면 생성 결과가 현재 CLI 기능과 어긋날 수 있다.

---

## 4. 수정 방안

### 방안 검토

| 방안   | 설명                                                                        | 장점                                   | 단점                                      |
| ------ | --------------------------------------------------------------------------- | -------------------------------------- | ----------------------------------------- |
| 방안 A | interactive 선택값 처리만 보정                                              | 수정 범위가 작음                       | 파일 생성 누락과 rules 내용 정합성은 남음 |
| 방안 B | 선택값 처리, 파일 생성 매핑, agent rules 템플릿을 함께 점검하고 테스트 추가 | 재현 경로와 생성 결과를 함께 고정 가능 | 수정 범위가 약간 넓음                     |

### 선택한 방안 및 이유

> **선택:** 방안 B
>
> **이유:** 현재 증상은 입력 처리와 파일 생성 단계가 연결된 흐름 문제일 가능성이 높고, 사용자가 기대하는 결과는 생성 파일의 내용 품질까지 포함한다. interactive 선택부터 `.md` 파일 생성, 그리고 agent rules 내용 정렬까지 전체 경로를 함께 고정하는 편이 안전하다.

### 변경 파일 목록 (예상)

```text
target_paths:
  - src/commands/init.ts
  - src/core/init.ts
  - src/cli.ts
  - CLAUDE.md
  - AGENT.md
  - .sduck/sduck-assets/agent-rules/core.md
  - .sduck/sduck-assets/agent-rules/claude-code.md
  - .sduck/sduck-assets/agent-rules/codex.md
  - .sduck/sduck-assets/agent-rules/opencode.md
  - .sduck/sduck-assets/agent-rules/gemini-cli.md
  - tests/e2e/init-agent-rules.test.ts
  - tests/e2e/init.test.ts
```

---

## 5. 테스트 계획

### 버그 재현 테스트 (수정 전 실패 확인)

- [ ] 기존 버그 재현 테스트 케이스 작성 완료

### 수정 검증 테스트 (수정 후 통과 확인)

| 테스트 케이스                        | 조건                                          | 예상 결과                           |
| ------------------------------------ | --------------------------------------------- | ----------------------------------- |
| interactive multi-select init        | `.md` 기반 에이전트 여러 개 선택              | 선택 결과와 생성 파일이 모두 반영됨 |
| generated agent rules content        | 생성된 `CLAUDE.md`/`AGENT.md`/기타 rules 확인 | 기준 문서와 CLI 명령 안내가 반영됨  |
| non-interactive init with `--agents` | 기존 comma-separated agents 입력              | 기존 동작 유지                      |
| safe/force re-run                    | 기존 규칙 파일이 이미 존재                    | safe/force 정책 유지                |

### 회귀 테스트

interactive 선택 경로와 기존 `--agents` 경로, 그리고 생성된 rule content를 e2e 테스트로 검증한다.

- [ ] interactive multi-select e2e 추가 또는 보강
- [ ] 기존 init/agent-rule e2e 회귀 확인

---

## 6. 영향 범위

### 사이드 이펙트 검토

`init`의 대화형 입력 처리, 선택된 에이전트 목록 출력, 루트 규칙 파일 생성, `.sduck/sduck-assets/agent-rules` 템플릿, safe/force 재실행 동작에 영향이 있을 수 있다.

### 데이터 정합성

- [x] DB 데이터 정정 작업 필요 없음
- [ ] DB 데이터 정정 작업 필요: _(내용 작성)_

---

## 7. 롤백 계획

문제 발생 시 interactive 선택 처리 변경분과 rule generation 매핑 변경분을 되돌리고, 기존 `--agents` 기반 경로만 유지한다.

- 롤백 방법: 관련 init 로직과 테스트 변경분 revert
- 롤백 판단 기준 (임계값 또는 조건): 단일 선택 또는 기존 `--agents` 흐름까지 깨질 경우

---

## 8. 임시 조치 (Workaround, 해당 시)

수정 전까지는 interactive 선택 대신 `--agents` 옵션으로 필요한 에이전트를 명시적으로 전달해 초기화하고, 생성된 rules 내용은 수동 검토한다.

---

## 9. 재발 방지 대책

interactive 입력 경로와 실제 파일 생성 결과, 그리고 생성된 rules 내용이 현재 CLI 기능과 일치하는지 함께 검증하는 회귀 테스트를 추가한다.

- [x] 테스트 케이스 추가
- [ ] 코드 리뷰 체크리스트 항목 추가
- [ ] 모니터링 알림 추가
- [ ] 기타:

---

## 10. 참고 자료

- 에러 로그:
- 관련 이슈 / PR:
