# Plan: codebase decision skill

## 작업 원칙

- 구현은 plan 승인 후 `IN_PROGRESS` 상태에서만 진행한다.
- 코드/asset 변경은 `agent-context.json`의 `worktreeAbsolutePath`인 `.sduck-worktrees/20260617-0020-feature-codebase-decision-skill`에서 수행한다.
- `meta.yml`은 직접 수정하지 않고, 각 step 완료 직후 `npm run dev -- step done <N>`을 실행한다.
- 새 skill은 CLI 자동 분석 기능이 아니라 agent-facing markdown asset이다.
- 저장 형식은 기존 `SduckDraft` / `schemaVersion: "v2alpha1"`만 사용한다.

## Step 1. 번들 skill asset 추가

### 대상 파일

- 신규: `.sduck/sduck-assets/agent-rules/skills/codebase-decisions/SKILL.md`

### 변경 의도

- agent가 “기존 코드베이스를 읽고 존재했던 의사결정을 저장”하는 요청에서 사용할 수 있는 skill 문서를 추가한다.
- `write-a-skill` 형식을 따른다.
  - YAML frontmatter 포함:
    - `name: codebase-decisions`
    - `description`: 기존 코드베이스/문서/테스트를 읽어 명시적·추론 의사결정을 sduck decision store에 기록하는 기능과 trigger를 1024자 이하로 설명.
- 본문은 100줄 안팎을 목표로 하고 다음 섹션을 포함한다.
  - `# Codebase Decisions`
  - `## Quick start`
  - `## Workflow`
  - `## Decision classification`
  - `## Draft format`
  - `## Evidence and safety rules`
  - `## Verification`

### 핵심 내용

- agent workflow:
  1. `sduck status --json` 또는 `sduck work "Codebase decision inventory"`로 현재 decision task 확인/생성.
  2. `sduck context add <path-or-glob>`로 읽은 코드/문서/테스트 경로 추가.
  3. 코드·문서·테스트·ADR·설정 파일에서 결정 후보 추출.
  4. `EXPLICIT`, `INFERRED`, `CARRIED`, `CONFLICT`, `OPEN`으로 분류.
  5. `decisions`, `evidence`, `questions`, `expectedScope`, `avoidScope`를 포함한 `SduckDraft` 작성.
  6. `sduck submit --stdin`으로 제출.
  7. `sduck remember`로 export.
  8. `sduck recall <query>`로 저장 확인.
- `json sduck-draft` fenced block 예시 포함.
- `sourceRefs`와 `evidence.sourceRef`는 가능하면 `path:line` 또는 `path:line-line` 사용.
- 추론 결정은 confidence를 보수적으로 설정하고, 확정 불가한 내용은 `questions`로 남김.
- secrets/tokens/credentials 원문을 summary나 evidence에 복사하지 말라는 안전 규칙 포함.

### 검증

- `SKILL.md`가 frontmatter와 trigger 문구를 포함하는지 확인한다.
- 예시 JSON이 `schemaVersion: "v2alpha1"`와 `decisions`, `evidence`, `questions`를 포함하는지 확인한다.
- 완료 후 `npm run dev -- step done 1` 실행.

## Step 2. agent rule에서 skill 발견 가능하게 노출

### 대상 파일

- 수정: `.sduck/sduck-assets/agent-rules/core.md`
  - 현재 구조: line 20-49 디렉토리 구조, line 79-90 workflow rules, line 113-118 평가 규칙.

### 변경 의도

- 모든 supported agent가 generated rule block을 통해 새 skill asset의 존재를 발견할 수 있게 한다.
- core rule에 `## Agent skills` 또는 유사 섹션을 추가한다.
- 새 섹션은 다음 정보를 포함한다.
  - 경로: `.sduck/sduck-assets/agent-rules/skills/codebase-decisions/SKILL.md`
  - 사용 시점: 사용자가 기존 코드베이스/문서/테스트에서 의사결정을 읽고 저장하라고 요청할 때.
  - 행동: skill 파일을 읽고 그 workflow에 따라 `sduck work`, `context add`, `submit`, `remember`, `recall`을 사용.

### 고려사항

- 기존 SDD 승인/상태 제한 규칙을 약화하지 않는다.
- “코드 작성 전 승인 필요”와 충돌하지 않도록, 이 skill은 decision 기록 workflow용이며 SDD 구현 승인을 우회하지 않는다고 명시한다.
- core rule이 generated `CLAUDE.md`, `AGENT.md`, `GEMINI.md`, Cursor/Antigravity managed files에 포함되므로 agent별 문구가 아닌 공통 문구로 작성한다.

### 검증

- `.sduck/sduck-assets/agent-rules/core.md`에 skill 경로와 `codebase-decisions` 문자열이 포함되는지 확인한다.
- 완료 후 `npm run dev -- step done 2` 실행.

## Step 3. asset registry와 init 복사 목록 등록

### 대상 파일

- 수정: `src/core/assets.ts`
  - line 30-39 `AGENT_RULE_ASSET_RELATIVE_PATHS`
  - line 41-47 `INIT_ASSET_RELATIVE_PATHS`
- 수정: `src/core/init.ts`
  - line 43-59 `AssetTemplateKey`
  - line 118-180 `ASSET_TEMPLATE_DEFINITIONS`

### 변경 의도

- 새 skill asset을 번들 asset 목록과 init/update 대상 asset 목록에 포함한다.
- `src/core/assets.ts`:
  - `AGENT_RULE_ASSET_RELATIVE_PATHS`에 `join('agent-rules', 'skills', 'codebase-decisions', 'SKILL.md')` 추가.
  - 이 배열을 재사용하는 `INIT_ASSET_RELATIVE_PATHS`에는 자동 포함되도록 유지한다.
- `src/core/init.ts`:
  - `AssetTemplateKey` union에 `'agent-rules-skill-codebase-decisions'` 추가.
  - `ASSET_TEMPLATE_DEFINITIONS`에 같은 key와 `getProjectRelativeSduckAssetPath('agent-rules', 'skills', 'codebase-decisions', 'SKILL.md')` 추가.

### 타입/호환성 고려사항

- `AssetTemplateMap = Record<AssetTemplateKey, AssetTemplateDefinition>` 타입이 누락 key를 잡을 수 있으므로 union과 definition을 함께 수정한다.
- 기존 `planInitActions`의 create/keep/overwrite semantics를 변경하지 않는다.
- `sduck update`는 `initProject({ force: true, agents: [] })`를 사용하므로 registry에 추가하면 update 대상에도 포함된다.

### 검증

- TypeScript compile 상수/union 누락 오류가 없는지 `npm run typecheck`로 확인 예정.
- 완료 후 `npm run dev -- step done 3` 실행.

## Step 4. init/update 설치 경로 테스트 갱신

### 대상 파일

- 수정: `tests/unit/sdd-core-regression.test.ts`
  - line 1 imports: 필요 시 `access` import 추가.
  - line 23-26 `initProject({ agents: [], force: false }, workspace)` 직후 asset existence assertion 추가.
- 수정: `tests/e2e/sdd-cli-reachability.test.ts`
  - line 75-83 `init` 후 asset access assertion 추가.
  - line 99-102 `CLAUDE.md` content assertion 추가.

### 변경 의도

- unit regression에서 core `initProject`가 새 skill asset을 임시 workspace로 복사하는지 검증한다.
- E2E reachability에서 CLI `init --agents claude-code` 후 다음을 검증한다.
  - `.sduck/sduck-assets/agent-rules/skills/codebase-decisions/SKILL.md` 존재.
  - generated `CLAUDE.md` managed block에 `codebase-decisions`와 skill path가 포함.
- 기존 idempotency assertion(`sdd-guard.sh` 중복 방지)을 유지한다.

### 세부 변경안

- `tests/unit/sdd-core-regression.test.ts`:
  - `import { access, readFile, writeFile } from 'node:fs/promises';`
  - `await access(join(workspace, '.sduck', 'sduck-assets', 'agent-rules', 'skills', 'codebase-decisions', 'SKILL.md'));`
- `tests/e2e/sdd-cli-reachability.test.ts`:
  - init 후 같은 `access` assertion 추가.
  - `claudeRules` assertion:
    - `expect(claudeRules).toContain('codebase-decisions');`
    - `expect(claudeRules).toContain('.sduck/sduck-assets/agent-rules/skills/codebase-decisions/SKILL.md');`

### 검증

- 완료 후 `npm run dev -- step done 4` 실행.

## Step 5. 전체 검증과 완료 처리

### 대상 파일

- 검증 대상 전체:
  - `.sduck/sduck-assets/agent-rules/skills/codebase-decisions/SKILL.md`
  - `.sduck/sduck-assets/agent-rules/core.md`
  - `src/core/assets.ts`
  - `src/core/init.ts`
  - `tests/unit/sdd-core-regression.test.ts`
  - `tests/e2e/sdd-cli-reachability.test.ts`
  - `.sduck/sduck-workspace/20260617-0020-feature-codebase-decision-skill/spec.md`

### 검증 명령

1. `npm run test:unit`
2. `npm run typecheck`
3. 필요 시 `npm run test:e2e -- --run tests/e2e/sdd-cli-reachability.test.ts` 또는 `npx vitest run tests/e2e/sdd-cli-reachability.test.ts`

### 완료 조건 점검

- `spec.md` AC1-AC9를 실제 변경 결과와 대조한다.
- 모든 AC가 충족되면 `spec.md`의 checklist를 체크 처리한다.
- `.sduck/sduck-assets/eval/task.yml`을 읽고 task 평가 결과를 작성/보고한다.
- Step 5 완료 후 `npm run dev -- step done 5` 실행.
- 모든 step 완료 후 `npm run dev -- review ready 20260617-0020-feature-codebase-decision-skill` 실행.
- `review.md`가 생성되고 상태가 `REVIEW_READY`인지 확인한다.

## 자체 평가

평가 기준: `.sduck/sduck-assets/eval/plan.yml`

| 기준 | 점수(1-5) | 근거 |
| ---- | --------- | ---- |
| semantic_clarity | 5 | 각 step의 대상 파일, 섹션, 변경 의도, 완료 명령이 분명함 |
| abstraction | 5 | skill 작성, rule 노출, registry 등록, 테스트, 검증으로 적절히 분리됨 |
| typing | 5 | `AssetTemplateKey` union과 registry definition 동시 변경 및 typecheck를 명시함 |
| security | 4 | skill에 secrets/tokens 원문 저장 금지 규칙을 포함하도록 명시함 |
| maintainability | 5 | 기존 asset copy 구조를 재사용하고 CLI/DB 신규 기능을 추가하지 않음 |
| testability | 5 | unit/E2E/typecheck 및 AC checklist 검증을 단계별로 정의함 |

종합: 4.8 / 5
