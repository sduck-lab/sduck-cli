# [fix] make generated agent rule docs match project workflow guidance

> **작업 타입:** `fix` (Quick Fix)
> **심각도:** `high`
> **작성자:** Claude
> **작성일:** 2026-03-19
> **연관 티켓:**

---

## 1. 버그 개요

### 문제 요약

`sduck init --agents ...`로 생성되는 agent용 규칙 문서는 현재 너무 얇아서, 실제 프로젝트의 `AGENT.md`와 `CLAUDE.md`에 들어 있는 SDD 워크플로우 규칙을 충분히 전달하지 못한다. 그 결과 agent tool이 repository workflow를 정확히 따르지 않거나, 승인/상태 전이/문서 위치 같은 핵심 규칙을 놓칠 수 있다.

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
| 관련 데이터 ID / 조건 | `sduck init --agents ...` 실행 후 생성된 `AGENT.md`, `CLAUDE.md`, `GEMINI.md` 또는 managed rule file 확인 |

**재현 단계**

1. 빈 프로젝트에서 `sduck init --agents claude-code,codex,opencode,gemini-cli,...`를 실행한다.
2. 생성된 root rule file 또는 managed agent rule file 내용을 연다.
3. 현재 저장소의 `AGENT.md` 또는 `CLAUDE.md`와 비교한다.

**실제 결과 (Actual)**

생성된 agent rule 문서는 몇 줄짜리 요약 수준에 그쳐, 실제 프로젝트 워크플로우 규칙, 디렉토리 구조, 승인 규칙, 상태 전이, 문서 평가 규칙, 상세 plan 규칙 등을 충분히 전달하지 못한다.

**기대 결과 (Expected)**

생성되는 agent rule 문서는 현재 저장소의 `AGENT.md`/`CLAUDE.md`와 거의 유사한 수준으로 정확하고 명확해야 하며, 최소한 agent가 workflow를 오해하지 않도록 핵심 규칙과 경로, 상태 전이, 승인 조건, 평가 규칙을 충분히 포함해야 한다.

---

## 3. 원인 분석 (Root Cause)

### 원인 파악 현황

- [ ] 원인 특정 완료
- [x] 원인 조사 중
- [ ] 원인 불명

### 원인 요약

현재 `.sduck/sduck-assets/agent-rules/*.md` 템플릿은 간단한 요약 지침만 담고 있고, 실제 프로젝트 기준 문서인 `AGENT.md`/`CLAUDE.md`의 상세 규칙을 구조적으로 재사용하지 않는다. 그래서 문서 원본이 발전해도 생성용 템플릿은 그 수준을 따라가지 못해 내용 격차가 계속 커진다.

### 원인 코드 위치

```text
파일: .sduck/sduck-assets/agent-rules/core.md,
      .sduck/sduck-assets/agent-rules/claude-code.md,
      .sduck/sduck-assets/agent-rules/codex.md,
      .sduck/sduck-assets/agent-rules/opencode.md,
      .sduck/sduck-assets/agent-rules/gemini-cli.md,
      src/core/agent-rules.ts,
      AGENT.md,
      CLAUDE.md
함수 / 라인: renderAgentRuleContent 및 각 agent rule asset 내용
```

### 발생 조건

agent tool용 규칙 파일을 새로 생성하거나 재생성할 때 항상 발생한다.

---

## 4. 수정 방안

### 방안 검토

| 방안   | 설명                                                                               | 장점                      | 단점                              |
| ------ | ---------------------------------------------------------------------------------- | ------------------------- | --------------------------------- |
| 방안 A | 현재 짧은 규칙에 몇 줄만 추가                                                      | 빠름                      | 다시 문서 격차가 커질 가능성 높음 |
| 방안 B | `AGENT.md`/`CLAUDE.md` 구조를 기준으로 agent rule 템플릿을 대폭 확장하고 내용 정렬 | 실제 workflow 전달력 향상 | 템플릿 유지보수 범위가 커짐       |

### 선택한 방안 및 이유

> **선택:** 방안 B
>
> **이유:** 현재 문제는 표현 부족이 아니라 핵심 workflow 정보 누락이다. 생성 문서가 실제 기준 문서와 거의 유사한 수준이어야 agent tool이 프로젝트 규칙을 안정적으로 따를 수 있다.

### 변경 파일 목록 (예상)

```text
target_paths:
  - .sduck/sduck-assets/agent-rules/core.md
  - .sduck/sduck-assets/agent-rules/claude-code.md
  - .sduck/sduck-assets/agent-rules/codex.md
  - .sduck/sduck-assets/agent-rules/opencode.md
  - .sduck/sduck-assets/agent-rules/gemini-cli.md
  - src/core/agent-rules.ts
  - AGENT.md
  - CLAUDE.md
  - tests/e2e/init-agent-rules.test.ts
  - tests/unit/agent-rules.test.ts
```

---

## 5. 테스트 계획

### 버그 재현 테스트 (수정 전 실패 확인)

- [ ] 현재 생성된 agent rule content가 핵심 workflow 문구를 충분히 포함하지 않는 상태 확인

### 수정 검증 테스트 (수정 후 통과 확인)

| 테스트 케이스                  | 조건                               | 예상 결과                                                      |
| ------------------------------ | ---------------------------------- | -------------------------------------------------------------- |
| claude rule generation         | `claude-code` 포함 init 실행       | `CLAUDE.md` 생성 내용이 기준 문서와 유사한 workflow 규칙 포함  |
| codex/opencode rule generation | `codex`, `opencode` 포함 init 실행 | `AGENT.md` 생성 내용이 기준 문서와 유사한 workflow 규칙 포함   |
| gemini rule generation         | `gemini-cli` 포함 init 실행        | `GEMINI.md`가 동일한 핵심 규칙 집합을 포함                     |
| content regression             | agent rule render unit/e2e         | 승인 규칙, `.sduck/...` 경로, 평가 규칙, 상세 plan 규칙이 포함 |

### 회귀 테스트

- [ ] agent rule render unit 테스트 보강
- [ ] `init --agents ...` e2e에서 생성 내용 회귀 확인
- [ ] typecheck/build 통과 확인

---

## 6. 영향 범위

### 사이드 이펙트 검토

생성되는 agent rule file 크기와 내용이 크게 늘어나며, 기존 짧은 규칙을 전제로 한 테스트나 문서 스냅샷이 있다면 함께 수정해야 한다.

### 데이터 정합성

- [x] DB 데이터 정정 작업 필요 없음
- [ ] DB 데이터 정정 작업 필요: _(내용 작성)_

---

## 7. 롤백 계획

문제 발생 시 agent rule 템플릿 확장 변경을 되돌리고 이전 간단한 템플릿으로 복귀할 수 있다.

- 롤백 방법: 관련 agent rule asset 및 렌더링 변경 revert
- 롤백 판단 기준 (임계값 또는 조건): init agent rule generation이 깨지거나 generated file merge가 비정상 동작할 경우

---

## 8. 임시 조치 (Workaround, 해당 시)

수정 전까지는 생성된 `AGENT.md`/`CLAUDE.md`를 수동으로 보강하거나 현재 저장소 루트의 기준 문서를 별도로 함께 제공해야 한다.

---

## 9. 재발 방지 대책

agent rule 템플릿과 기준 문서 사이의 핵심 규칙을 테스트로 고정하고, 경로/승인/평가 규칙이 빠지지 않는지 회귀 검증한다.

- [x] 테스트 케이스 추가
- [ ] 코드 리뷰 체크리스트 항목 추가
- [ ] 모니터링 알림 추가
- [ ] 기타:

---

## 10. 참고 자료

- `AGENT.md`
- `CLAUDE.md`
- `.sduck/sduck-assets/agent-rules/core.md`
- `.sduck/sduck-assets/agent-rules/codex.md`
- `.sduck/sduck-assets/agent-rules/claude-code.md`
