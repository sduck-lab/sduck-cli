# Plan

## Step 1. sdd-guard.sh hook 스크립트 작성

- **대상 파일:** `.sduck/sduck-assets/agent-rules/hooks/sdd-guard.sh` (신규)
- **변경 내용:**
  - stdin으로 JSON 받음 (`tool_name`, `tool_input.file_path`)
  - `.sduck/sduck-workspace/` 존재 확인 → 없으면 exit 0 (허용)
  - 활성 태스크 (PENDING\_\*, SPEC_APPROVED, IN_PROGRESS, DONE) 탐색 → meta.yml에서 status 읽기
  - 활성 태스크 없음 → exit 0 (허용)
  - 항상 허용 경로: meta.yml, .sduck/sduck-assets/**, CLAUDE.md, AGENT.md, GEMINI.md, .cursor/**, .agents/**, .claude/** → exit 0
  - 상태별 매트릭스 적용:
    - `PENDING_SPEC_APPROVAL`: spec.md, plan.md 허용 / 구현 파일 차단
    - `SPEC_APPROVED`: plan.md 허용 / spec.md, 구현 파일 차단
    - `IN_PROGRESS`: 구현 파일 허용 / spec.md, plan.md 차단
    - `DONE`: spec.md, plan.md, 구현 파일 모두 차단
  - 차단 시 stderr에 상태와 안내 메시지 출력 + exit 2
  - `jq` 의존성: tool_input 파싱에 사용
- **검증:** 스크립트 직접 실행 테스트 (echo JSON | bash sdd-guard.sh)

## Step 2. init에 hook 설치 로직 추가

- **대상 파일:** `src/core/init.ts`, `src/core/agent-rules.ts`
- **변경 내용:**
  - `agent-rules.ts`에 `CLAUDE_CODE_HOOK_TARGETS` 정의: `{ settingsPath: '.claude/settings.json', hookScriptPath: '.claude/hooks/sdd-guard.sh' }`
  - `agent-rules.ts`에 `needsClaudeCodeHook(agents)` 함수: claude-code가 포함되면 true
  - `init.ts`의 `initProject()` 끝에 hook 설치 단계 추가:
    1. `needsClaudeCodeHook` 체크
    2. `.claude/hooks/` 디렉토리 ensureDirectory
    3. `sdd-guard.sh`를 `.sduck/sduck-assets/agent-rules/hooks/`에서 `.claude/hooks/`로 복사
    4. `chmod +x` 실행
    5. `.claude/settings.json` 생성 또는 merge (기존 파일이 있으면 hooks 필드만 추가)
  - summary에 `.claude/settings.json`, `.claude/hooks/sdd-guard.sh` 상태 추가
- **검증:** `npm run typecheck`

## Step 3. 규칙 템플릿 강화

- **대상 파일:**
  - `.sduck/sduck-assets/agent-rules/core.md`
  - `.sduck/sduck-assets/agent-rules/claude-code.md`
  - `.sduck/sduck-assets/agent-rules/codex.md`
  - `.sduck/sduck-assets/agent-rules/opencode.md`
  - `.sduck/sduck-assets/agent-rules/gemini-cli.md`
  - `.sduck/sduck-assets/agent-rules/cursor.mdc`
  - `.sduck/sduck-assets/agent-rules/antigravity.md`
- **변경 내용:**
  - `core.md` 최상단에 CRITICAL 경고 블록 추가:
    ```
    ## ⚠️ CRITICAL: 상태별 파일 접근 제한
    - 코드를 작성하기 전에 반드시 활성 태스크의 `meta.yml`을 읽고 `status`를 확인한다.
    - IN_PROGRESS에서만 구현 코드를 작성할 수 있다.
    - 승인된 spec.md/plan.md는 수정하지 않는다. 요구사항이 바뀌면 새 태스크를 시작한다.
    - spec.md 또는 plan.md를 작성한 직후라도, 사용자가 승인하기 전까지 구현하지 않는다.
    - "같은 세션"이라는 이유로 승인을 생략하지 않는다.
    ```
  - 각 에이전트 템플릿 절대 규칙 섹션에 상태 확인 리마인더 추가
- **검증:** 수동 확인 (텍스트 변경)

## Step 4. 테스트 작성

- **대상 파일:** `tests/e2e/init.test.ts` 또는 `tests/e2e/init-agent-rules.test.ts`
- **테스트 케이스:**
  - `sduck init --agents claude-code` → `.claude/settings.json` 생성 확인, hooks 블록 포함 확인
  - `sduck init --agents claude-code` → `.claude/hooks/sdd-guard.sh` 생성 확인, 실행 권한 확인
  - `sduck init --agents codex` → `.claude/` 디렉토리 생성 안 됨
  - `sduck init --agents claude-code` 재실행 → 기존 settings.json의 다른 설정 유지, hooks만 갱신
- **검증:** `npm run test:e2e`, `npm run lint`

## Step 5. 빌드 및 전체 테스트

- `npm run typecheck && npm run lint && npm run test && npm run build`
- hook 스크립트 수동 테스트:
  - PENDING_SPEC_APPROVAL + src/foo.ts → 차단
  - PENDING_SPEC_APPROVAL + spec.md → 허용
  - SPEC_APPROVED + spec.md → 차단
  - SPEC_APPROVED + plan.md → 허용
  - IN_PROGRESS + src/foo.ts → 허용
  - IN_PROGRESS + spec.md → 차단
  - DONE + src/foo.ts → 차단
  - DONE + spec.md → 차단
  - 태스크 없음 + src/foo.ts → 허용
  - sduck 미초기화 + src/foo.ts → 허용
