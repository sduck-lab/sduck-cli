# [fix] opencode agent rule file

> **작업 타입:** `fix` (Quick Fix)
> **심각도:** `medium`
> **작성자:** taehee
> **작성일:** 2026-06-26
> **연관 티켓:** -

---

## 1. 버그 개요

### 문제 요약

`sduck init --agents opencode`가 OpenCode가 기본으로 읽는 project rules 파일인 `AGENTS.md`를 생성/갱신하지 않고, 현재 동작상 `AGENT.md`에 OpenCode 규칙을 설치하는 것으로 보인다. OpenCode 공식 문서와 현재 구현은 `AGENTS.md`를 primary project rules 파일로 사용하며, `AGENT.md` singular는 기본 instruction 파일로 문서화되어 있지 않다.

### 발견 경위

- [x] 사용자 제보
- [x] 모니터링 알림 (해당 없음)
- [x] 코드 리뷰 중 발견 (해당 없음)
- [x] QA 테스트 (해당 없음)
- [x] 기타: `sduck init --agents opencode` 실행 결과 `AGENT.md`만 유지되고 `AGENTS.md`가 생성되지 않음을 확인

### 발생 빈도

- [x] 항상 재현됨 (100%)
- [x] 간헐적 재현 (해당 없음)
- [x] 특정 조건에서만 재현 (해당 없음)

---

## 2. 재현 방법 (Steps to Reproduce)

**환경 정보**

| 항목                                      | 내용                                            |
| ----------------------------------------- | ----------------------------------------------- |
| 환경 (local / dev / staging / production) | local                                           |
| OS / 브라우저 / 앱 버전                   | macOS, sduck CLI local repo                     |
| 계정 유형 / 권한                          | 일반 개발 환경                                  |
| 관련 데이터 ID / 조건                     | `.sduck/` initialized repo, `--agents opencode` |

**재현 단계**

1. 기존 repo에서 `npx sduck init --agents opencode`를 실행한다.
2. 출력 결과와 생성/갱신 파일을 확인한다.
3. `AGENTS.md` 생성 여부와 `AGENT.md`의 managed block 내용을 확인한다.

**실제 결과 (Actual)**

- `sduck init --agents opencode` 실행 후 `AGENTS.md`가 생성되지 않았다.
- 현재 repo에서는 `AGENT.md`가 유지되며, 해당 파일의 managed block에 `Selected agents: Codex, OpenCode` 및 OpenCode instruction이 포함되어 있다.
- OpenCode가 기본으로 읽는 `AGENTS.md`가 없으면 OpenCode용 프로젝트 규칙이 기대대로 적용되지 않을 수 있다.

**기대 결과 (Expected)**

- `sduck init --agents opencode`는 OpenCode project rules 파일로 `AGENTS.md`를 생성/갱신해야 한다.
- OpenCode 전용 규칙은 `AGENT.md`가 아니라 `AGENTS.md`의 sduck managed block에 설치되어야 한다.
- `AGENT.md`는 Codex 등 해당 파일을 사용하는 agent target의 기존 동작을 위해 유지되어야 하며, OpenCode 단독 선택 시 새로 생성/갱신 대상이 되어서는 안 된다.
- 기존 `AGENTS.md`가 있고 sduck managed block 밖에 사용자/프레임워크 규칙이 있으면 보존해야 한다.

---

## 3. 원인 분석 (Root Cause)

### 원인 파악 현황

- [x] 원인 특정 완료
- [x] 원인 조사 중
- [x] 원인 불명 (해당 없음)

### 원인 요약

현재 `sduck init --agents`의 agent-to-rule-file 매핑에서 OpenCode가 Codex와 같은 `AGENT.md` 대상으로 처리되는 것으로 추정된다. OpenCode의 실제 기본 project rules 파일은 `AGENTS.md`이므로 매핑이 OpenCode 최신 규칙과 불일치한다.

### 원인 코드 위치

```text
파일: src/... (plan 작성 전 repo 매핑 조사 결과로 확정)
함수 / 라인: init agent parsing, supported agents definition, managed rule file selection/write logic
```

### 발생 조건

- `sduck init --agents opencode`를 실행하는 경우
- `sduck init --agents codex,opencode`처럼 OpenCode와 다른 agent를 함께 선택하는 경우
- `--force` 사용 여부와 관계없이 OpenCode의 target file이 `AGENTS.md`가 아닌 경우

---

## 4. 수정 방안

### 방안 검토

| 방안   | 설명                                                                               | 장점                                                                      | 단점                                                                                  |
| ------ | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| 방안 A | OpenCode agent target 파일을 `AGENTS.md`로 변경하고 init/write/test 로직을 맞춘다. | OpenCode 공식 동작과 일치, 사용자 기대와 일치, AGENT.md/Codex와 분리 가능 | 기존에 `AGENT.md`에 OpenCode block이 설치된 repo는 수동 마이그레이션이 필요할 수 있음 |
| 방안 B | `AGENT.md`와 `AGENTS.md` 모두 생성한다.                                            | 구버전/오해 상황을 넓게 커버                                              | 중복 규칙, 충돌, 관리 파일 증가                                                       |
| 방안 C | OpenCode 문서에 `opencode.json.instructions`로 `AGENT.md`를 지정하도록 안내한다.   | 구현 변경 최소                                                            | 기본 동작 문제를 회피할 뿐이며 OpenCode 표준과 어긋남                                 |

### 선택한 방안 및 이유

> **선택:** 방안 A
>
> **이유:** OpenCode 공식 문서와 현재 소스 기준으로 `AGENTS.md`가 primary project rules 파일이다. sduck initializer는 각 agent의 기본 convention에 맞는 파일을 생성해야 하며, `AGENT.md` singular를 OpenCode 대상으로 생성하는 것은 사용자가 OpenCode에서 규칙을 못 읽는 문제로 이어질 수 있다.

### 변경 파일 목록 (예상)

```yaml
target_paths:
  - src/... # init command/core mapping logic, plan에서 확정
  - tests/... # init --agents opencode expected output/file behavior tests, plan에서 확정
  - .sduck/sduck-workspace/20260626-0241-fix-opencode-agent-rule-file/plan.md
```

---

## 5. 테스트 계획

### 버그 재현 테스트 (수정 전 실패 확인)

- [x] `sduck init --agents opencode` 실행 시 `AGENTS.md`가 생성/갱신되는지 검증하는 테스트를 추가하고, 현 구현에서는 실패함을 확인한다.
- [x] `sduck init --agents codex,opencode` 실행 시 Codex와 OpenCode가 각각 올바른 파일에 설치되는지 검증하는 테스트를 추가한다.

### 수정 검증 테스트 (수정 후 통과 확인)

| 테스트 케이스         | 조건                                           | 예상 결과                                                         |
| --------------------- | ---------------------------------------------- | ----------------------------------------------------------------- |
| OpenCode 단독 init    | `--agents opencode`                            | `AGENTS.md` 생성/갱신, `AGENT.md`는 OpenCode 때문에 생성되지 않음 |
| Codex 단독 init       | `--agents codex`                               | 기존처럼 `AGENT.md` 생성/갱신                                     |
| Codex + OpenCode init | `--agents codex,opencode`                      | `AGENT.md`에는 Codex 규칙, `AGENTS.md`에는 OpenCode 규칙 설치     |
| 기존 AGENTS.md 보존   | managed block 밖에 Next.js 등 사용자 규칙 존재 | 사용자 규칙 보존, sduck managed block만 추가/갱신                 |
| force 갱신            | `--agents opencode --force`                    | `AGENTS.md`의 sduck managed block 갱신, 외부 내용 보존 정책 유지  |

### 회귀 테스트

- [x] `npm run test:unit`
- [x] 관련 init e2e/unit 단일 테스트
- [x] `npm run typecheck`

---

## 6. 영향 범위

### 사이드 이펙트 검토

- `sduck init --agents opencode`의 생성 파일이 `AGENT.md`에서 `AGENTS.md`로 바뀐다.
- `sduck init --agents codex` 기존 동작은 유지되어야 한다.
- 이미 `AGENT.md`에 OpenCode managed block이 있는 repo의 자동 migration 여부는 이번 수정 범위에서 신중히 다룬다. 기본 목표는 향후 init 대상 파일을 올바르게 생성하는 것이다.
- `--force`가 managed block을 갱신할 때 managed block 밖의 사용자 규칙을 덮어쓰지 않아야 한다.

### 데이터 정합성

- [x] DB 데이터 정정 작업 필요 없음
- [x] DB 데이터 정정 작업 필요 (해당 없음)

---

## 7. 롤백 계획

- 롤백 방법: OpenCode agent target file mapping 변경과 관련 테스트를 되돌린다.
- 롤백 판단 기준: `sduck init`이 기존 agent(Codex/Claude/Gemini/Cursor/Antigravity) 규칙 파일 생성을 깨뜨리거나, managed block 보존 로직에 회귀가 발생하는 경우.

---

## 8. 임시 조치 (Workaround, 해당 시)

- 현재 버전에서는 repo root에 `AGENTS.md`를 수동 생성하고 `.sduck/sduck-assets/agent-rules/opencode.md` 및 `core.md` 내용을 sduck managed block 형태로 붙이면 OpenCode가 읽을 수 있다.
- 또는 `opencode.json`의 `instructions` 배열에 원하는 규칙 파일을 명시할 수 있으나, 이는 OpenCode 표준 project rules 파일 생성 문제의 근본 해결은 아니다.

---

## 9. 재발 방지 대책

- [x] 테스트 케이스 추가
- [x] 코드 리뷰 체크리스트 항목 추가: agent별 공식 instruction 파일명과 CLI 생성 파일 매핑 일치 여부 확인
- [x] 모니터링 알림 추가 (해당 없음)
- [x] 기타 (해당 없음)

---

## 10. 참고 자료

- OpenCode Rules 공식 문서: https://opencode.ai/docs/rules/
  - `AGENTS.md` 생성 권장
  - project `CLAUDE.md`는 `AGENTS.md`가 없을 때 fallback
  - precedence: local `AGENTS.md`, `CLAUDE.md` → global `~/.config/opencode/AGENTS.md` → Claude global fallback
- OpenCode Config 공식 문서: https://opencode.ai/docs/config/#instructions
  - `instructions` option은 추가 instruction 파일/glob을 지정하며 `AGENTS.md`와 결합됨
- OpenCode 현재 소스: https://raw.githubusercontent.com/sst/opencode/dev/packages/opencode/src/session/instruction.ts
  - `instructionFiles = ["AGENTS.md", "CLAUDE.md", "CONTEXT.md" /* deprecated */]`
  - `AGENT.md` singular는 기본 instruction file list에 없음

---

## 11. 완료 조건

- [x] OpenCode target file mapping이 `AGENTS.md`로 변경된다.
- [x] `sduck init --agents opencode`가 `AGENTS.md`를 생성/갱신한다.
- [x] `sduck init --agents opencode`가 OpenCode만을 위해 `AGENT.md`를 생성하지 않는다.
- [x] `sduck init --agents codex`의 `AGENT.md` 동작은 유지된다.
- [x] `sduck init --agents codex,opencode` 조합에서 각 agent 규칙이 올바른 파일에 분리 설치된다.
- [x] 기존 `AGENTS.md`의 sduck managed block 밖 내용이 보존된다.
- [x] 관련 unit/e2e 테스트와 typecheck가 통과한다.

---

## 12. Spec 자체 평가

`.sduck/sduck-assets/eval/spec.yml` 기준 자체 평가:

| 기준                | 점수(1-5) | 근거                                                                                       |
| ------------------- | --------- | ------------------------------------------------------------------------------------------ |
| problem_clarity     | 5         | 실제/기대 동작과 OpenCode 공식 파일명을 명확히 구분했다.                                   |
| scope_definition    | 4         | OpenCode/Codex 파일 매핑과 보존 정책을 정의했다. 정확한 코드 파일은 plan에서 확정한다.     |
| completion_criteria | 5         | 생성 파일, 조합 동작, 보존, 테스트 통과 조건을 체크리스트로 정의했다.                      |
| feasibility         | 4         | 기존 init mapping/test 수정으로 해결 가능해 보이나, 세부 위치는 repo 조사 결과로 확정한다. |
| risk_coverage       | 4         | 기존 AGENT.md 사용자, --force, 조합 agent, 기존 AGENTS.md 보존 위험을 포함했다.            |
| testability         | 5         | 실패/성공 테스트 케이스와 검증 명령을 구체화했다.                                          |

평균: 4.5 / 5
