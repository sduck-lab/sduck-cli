# Plan

## Step 1. 지원 에이전트 모델과 출력 파일 매핑 정의

- `src/core/agent-rules.ts` 같은 전용 모듈을 만든다.
- 지원 에이전트를 아래 고정 목록으로 정의한다.
  - `claude-code`
  - `codex`
  - `opencode`
  - `gemini-cli`
  - `cursor`
  - `antigravity`
- 최소 아래 타입을 고정한다.
  - `SupportedAgentId`
  - `AgentRuleTargetKind`: `'root-file' | 'managed-file'`
  - `AgentRuleTarget`: `{ agentId: SupportedAgentId; outputPath: string; kind: AgentRuleTargetKind }`
- 파일 매핑은 아래 정책으로 고정한다.
  - Claude Code → `CLAUDE.md`
  - Codex → `AGENTS.md`
  - OpenCode → `AGENTS.md`
  - Gemini CLI → `GEMINI.md`
  - Cursor → `.cursor/rules/sduck-core.mdc`
  - Antigravity → `.agents/rules/sduck-core.md`

## Step 2. 공통 SDD 규칙 원본과 도구별 렌더링 구조 설계

- `.sduck/sduck-assets/agent-rules/` 아래 공통 규칙 원본과 도구별 템플릿 구조를 만든다.
- 최소 아래 구조를 고려한다.
  - `.sduck/sduck-assets/agent-rules/core.md`
  - `.sduck/sduck-assets/agent-rules/claude-code.md`
  - `.sduck/sduck-assets/agent-rules/codex.md`
  - `.sduck/sduck-assets/agent-rules/opencode.md`
  - `.sduck/sduck-assets/agent-rules/gemini-cli.md`
  - `.sduck/sduck-assets/agent-rules/cursor.mdc`
  - `.sduck/sduck-assets/agent-rules/antigravity.md`
- 모든 렌더링 결과에 공통 SDD 규칙이 포함되도록 조합 함수를 만든다.

## Step 3. 기존 문서 prepend/replace 정책 타입과 마커 정의

- 루트 규칙 파일에는 sduck 관리 블록 마커를 도입한다.
- 최소 아래 상수를 고정한다.
  - `SDUCK_RULES_BEGIN = '<!-- sduck:begin -->'`
  - `SDUCK_RULES_END = '<!-- sduck:end -->'`
- 최소 아래 타입을 고정한다.
  - `AgentRuleMergeMode`: `'create' | 'prepend' | 'keep' | 'replace-block' | 'overwrite'`
  - `PlannedAgentRuleAction`: `{ agentId: SupportedAgentId; outputPath: string; mergeMode: AgentRuleMergeMode }`
- safe 모드 정책:
  - 루트 파일 없으면 create
  - 루트 파일 있고 sduck 블록 없으면 prepend
  - 루트 파일 있고 sduck 블록 있으면 keep
  - 전용 관리 파일 있으면 keep
- force 모드 정책:
  - 루트 파일 있으면 sduck 블록 replace
  - 전용 관리 파일 있으면 overwrite

## Step 4. `init` 입력 모델에 복수 선택 에이전트 반영

- `src/commands/init.ts`와 `src/core/init.ts`의 init 입력 타입에 에이전트 목록을 추가한다.
- 최소 아래 타입을 고정한다.
  - `InitCommandOptions`: `{ force: boolean; agents: SupportedAgentId[] }`
  - `ResolvedInitOptions`: `{ mode: InitMode; agents: SupportedAgentId[] }`
- 입력 단계에서 중복 에이전트 제거와 지원 목록 검증을 수행한다.

## Step 5. 다중 선택 UX 구현

- `sduck init` 실행 시 interactive 환경에서는 체크박스형 복수 선택 프롬프트를 제공한다.
- non-interactive 환경 또는 명시적 옵션 사용 시에는 CLI 옵션으로도 선택 가능하게 한다.
- 예시 옵션 방향:
  - `--agents claude-code,codex,gemini-cli`
- 기본 선택값 정책은 구현 시 명시하되, 무선택 허용 여부를 코드에서 일관되게 처리한다.

## Step 6. 에이전트 규칙 파일 생성 계획을 init summary에 통합

- 기존 asset 생성 계획과 agent rule 생성 계획을 함께 계산한다.
- summary에 아래 상태를 구분해 포함한다.
  - `created`
  - `prepended`
  - `kept`
  - `overwritten`
- ASCII 표 출력이 유지되도록 summary row 타입을 확장한다.

## Step 7. 루트 규칙 파일 prepend 구현

- `CLAUDE.md`, `AGENTS.md`, `GEMINI.md`가 이미 있는 경우 맨 위에 sduck 관리 블록을 추가한다.
- 기존 본문은 그대로 유지하고, sduck 블록과 원문 사이에 안정적인 줄바꿈 규칙을 적용한다.
- 이미 sduck 블록이 있으면 safe 모드에서는 중복 삽입하지 않는다.

## Step 8. force 모드 block replace와 managed file overwrite 구현

- `--force`에서 루트 규칙 파일은 sduck 블록만 최신 내용으로 교체한다.
- `Cursor`, `Antigravity`용 전용 파일은 전체 파일을 최신 내용으로 재생성한다.
- 사용자 작성 본문이 있는 루트 파일은 block 바깥 내용을 보존한다.

## Step 9. 단위 테스트로 매핑/병합 정책 검증

- 에이전트 매핑, merge mode 판정, prepend/replace 렌더링 함수를 순수 로직으로 분리한다.
- 최소 아래 케이스를 검증한다.
  - 단일 선택
  - 복수 선택
  - Codex/OpenCode 공용 `AGENTS.md` 처리
  - 기존 루트 파일 prepend
  - 기존 sduck 블록 replace
  - managed file keep/overwrite

## Step 10. E2E 테스트로 실제 다중 선택 초기화 검증

- temp workspace에서 실제 `sduck init`을 실행한다.
- 최소 아래 시나리오를 검증한다.
  - `Claude Code` + `Codex` + `Gemini CLI` 선택 시 각 파일 생성
  - 기존 `CLAUDE.md`가 있을 때 safe 모드 prepend
  - `--force` 시 sduck 블록 갱신
  - Cursor/Antigravity 전용 파일 생성
  - 기존 `AGENTS.md`가 있을 때 Codex/OpenCode 공용 처리

## Step 11. 문서와 자산 설명 갱신

- `docs/snippets.md`에 agent 선택 예시를 추가한다.
- `docs/architecture.md`에 init이 asset + agent rule bootstrap을 담당한다고 반영한다.
- 필요하면 `.sduck/sduck-assets/agent-rules/README` 또는 동등 문서로 자산 구조 설명을 추가한다.

## Step 12. 전체 검증과 완료 조건 확인

- `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build`를 실행한다.
- 실패 시 수정 후 재실행한다.
- spec의 acceptance criteria와 실제 생성 정책을 대조하고 완료 처리한다.
