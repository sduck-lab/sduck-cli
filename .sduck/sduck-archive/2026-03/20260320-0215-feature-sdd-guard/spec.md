# [feature] sdd-guard

> **작업 타입:** `feature`
> **작성일:** 2026-03-20

---

## 1. 배경 및 목적

### 문제

긴 대화에서 에이전트가 CLAUDE.md / AGENT.md의 SDD 규칙을 잊고, 승인 없이 코드를 작성하는 경우가 발생한다.
규칙 파일만으로는 물리적 강제가 불가능하다.

### 기대 효과

1. Claude Code: PreToolUse hook으로 Edit/Write를 물리적으로 차단 (IN_PROGRESS가 아니면 코드 수정 불가)
2. 나머지 에이전트: 규칙 파일에 강화된 경고 문구를 추가하여 규칙 준수율을 높인다

---

## 2. 기능 명세

### 수용 기준 (Acceptance Criteria)

- [x] AC1: `sduck init --agents claude-code` 시 `.claude/settings.json`에 PreToolUse hook이 등록된다
- [x] AC2: `.claude/hooks/sdd-guard.sh` 스크립트가 생성된다
- [x] AC3: hook이 상태별 파일 접근 권한 매트릭스를 적용한다 (아래 표 참조)
- [x] AC4: sduck-workspace가 없거나 활성 태스크가 없으면 차단하지 않는다 (sduck 미초기화 프로젝트 호환)
- [x] AC5: DONE 상태에서도 구현 파일과 spec/plan 편집을 차단한다 (새 태스크 시작 강제)
- [x] AC6: core.md 규칙 템플릿에 강화된 경고 블록이 추가된다
- [x] AC7: 각 에이전트별 규칙 템플릿에 상태 확인 리마인더가 추가된다

### 기능 상세

**상태별 파일 접근 권한 매트릭스:**

| 상태                  | spec.md | plan.md | meta.yml | 구현 파일 |
| --------------------- | ------- | ------- | -------- | --------- |
| PENDING_SPEC_APPROVAL | 허용    | 허용    | 허용     | 차단      |
| SPEC_APPROVED         | 차단    | 허용    | 허용     | 차단      |
| IN_PROGRESS           | 차단    | 차단    | 허용     | 허용      |
| DONE                  | 차단    | 차단    | 허용     | 차단      |
| 태스크 없음           | -       | -       | -        | 허용      |

**항상 허용되는 경로:**

- `meta.yml` (모든 상태에서 허용)
- `.sduck/sduck-assets/**` (자산 파일)
- `CLAUDE.md`, `AGENT.md`, `GEMINI.md` (규칙 파일)
- `.cursor/**`, `.agents/**` (에이전트 설정)
- `.claude/**` (Claude Code 설정)

**Claude Code hook 동작 흐름:**

```
Edit/Write 호출
  → sdd-guard.sh 실행
  → .sduck/sduck-workspace/ 존재 확인
  → 없으면 → 허용 (sduck 미사용 프로젝트)
  → 있으면 → 활성 태스크의 meta.yml에서 status 확인
    → 활성 태스크 없음 → 허용
    → 항상 허용 경로 → 허용
    → 상태별 매트릭스 적용 → 허용 또는 차단
```

**규칙 파일 강화 내용:**

- core.md 상단에 `⚠️ CRITICAL` 경고 블록 추가
- "코드 작성 전 반드시 `meta.yml`의 status를 확인하라" 명시
- 각 에이전트 템플릿에도 짧은 리마인더 추가

---

## 3. 기술 설계

### 변경 대상 컴포넌트

| 레이어 | 파일 / 모듈                                                 | 변경 내용 요약                                   |
| ------ | ----------------------------------------------------------- | ------------------------------------------------ |
| Asset  | `.sduck/sduck-assets/agent-rules/hooks/sdd-guard.sh` (신규) | hook 스크립트                                    |
| Core   | `src/core/init.ts`                                          | Claude Code 선택 시 .claude/ hook 설치 로직 추가 |
| Core   | `src/core/agent-rules.ts`                                   | hook 설치 관련 함수                              |
| Asset  | `.sduck/sduck-assets/agent-rules/core.md`                   | 경고 블록 추가                                   |
| Asset  | `.sduck/sduck-assets/agent-rules/claude-code.md` 등         | 리마인더 추가                                    |

---

## 4. 테스트 계획

### 단위 테스트

| 대상           | 테스트 케이스                | 예상 결과              |
| -------------- | ---------------------------- | ---------------------- |
| hook 설치 로직 | claude-code 에이전트 선택 시 | .claude/ 파일 생성     |
| hook 설치 로직 | claude-code 미선택 시        | .claude/ 건드리지 않음 |

### E2E 테스트

| 시나리오                  | 예상 결과                                              |
| ------------------------- | ------------------------------------------------------ |
| init --agents claude-code | .claude/settings.json, .claude/hooks/sdd-guard.sh 생성 |
| init --agents codex       | .claude/ 생성 안 됨                                    |

### hook 스크립트 수동 검증

| 상태                  | 대상 파일  | 예상 |
| --------------------- | ---------- | ---- |
| PENDING_SPEC_APPROVAL | src/foo.ts | 차단 |
| PENDING_SPEC_APPROVAL | spec.md    | 허용 |
| IN_PROGRESS           | src/foo.ts | 허용 |
| sduck 미초기화        | src/foo.ts | 허용 |

---

## 5. 영향 범위 분석

### 변경 파일 목록

```
target_paths:
  - .sduck/sduck-assets/agent-rules/hooks/sdd-guard.sh (신규)
  - .sduck/sduck-assets/agent-rules/core.md
  - .sduck/sduck-assets/agent-rules/claude-code.md
  - .sduck/sduck-assets/agent-rules/codex.md
  - .sduck/sduck-assets/agent-rules/opencode.md
  - .sduck/sduck-assets/agent-rules/gemini-cli.md
  - .sduck/sduck-assets/agent-rules/cursor.mdc
  - .sduck/sduck-assets/agent-rules/antigravity.md
  - src/core/init.ts
  - src/core/agent-rules.ts
  - tests/unit/init.test.ts (또는 신규)
  - tests/e2e/init.test.ts
```

### 사이드 이펙트

- 기존 `sduck init`에 hook 설치가 추가됨
- `.claude/settings.json`이 이미 있으면 hooks 필드만 merge해야 함 (기존 설정 유지)
