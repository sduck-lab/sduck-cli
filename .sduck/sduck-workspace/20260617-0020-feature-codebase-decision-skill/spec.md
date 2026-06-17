# [feature] codebase decision skill

> **작업 타입:** `feature` (Standard Feature)
> **작성자:** taehee
> **작성일:** 2026-06-17
> **연관 티켓:** -

---

## 1. 배경 및 목적

### 문제 / 요구사항

현재 sduck에는 `.decision` 기반으로 의사결정, 근거, 질문, 구현 추적을 저장하는 v2 명령(`work`, `context add`, `submit`, `remember`, `recall`)이 존재한다. 그러나 “이미 존재하는 코드베이스를 읽고, 과거에 암묵적으로 내려진 의사결정들을 추출해 저장하는 방법”은 agent가 따라 할 수 있는 번들 지침으로 제공되지 않는다.

CLI 자체가 코드베이스를 의미적으로 읽고 역사적 의사결정을 판단하는 기능을 내장하기보다는, agent가 코드와 문서를 읽고 sduck의 기존 저장 형식으로 제출하도록 안내하는 skill 형태가 적합하다.

### 기대 효과

- sduck로 초기화된 프로젝트에서 agent가 기존 코드 구조, 설정, 테스트, 문서, ADR 등을 근거로 과거 의사결정을 체계적으로 기록할 수 있다.
- 기록된 결정은 `.decision/db.sqlite`와 `remember` markdown/graph export를 통해 재사용 가능해진다.
- 신규 작업 전에 `recall`로 기존 선택지를 확인할 수 있어 중복 논의와 맥락 손실을 줄인다.
- 저장 형식은 기존 `SduckDraft`(`schemaVersion: v2alpha1`)를 사용하므로 별도 DB 스키마 변경 없이 기능을 제공한다.

---

## 2. 기능 명세

### 사용자 스토리

```text
As a developer using sduck in an existing codebase,
I want an agent-usable bundled skill that inspects the codebase and records inferred/existing decisions,
So that future agents and contributors can recall the project’s architectural and implementation rationale.
```

### 수용 기준 (Acceptance Criteria)

> 모든 항목이 충족되어야 이 작업이 완료(Done)로 간주된다.

- [x] AC1: 번들 asset에 agent가 직접 읽을 수 있는 skill 문서가 추가된다. 경로는 `.sduck/sduck-assets/agent-rules/skills/codebase-decisions/SKILL.md`를 사용한다.
- [x] AC2: skill 문서는 frontmatter `name`, `description`을 포함하고, “기존 코드베이스를 읽어 의사결정을 저장”하는 요청에서 사용할 trigger를 명확히 설명한다.
- [x] AC3: `sduck init`과 `sduck update`가 대상 프로젝트의 `.sduck/sduck-assets/agent-rules/skills/codebase-decisions/SKILL.md`를 생성/갱신한다.
- [x] AC4: 생성되는 agent rule에는 이 skill의 존재, 사용 시점, 파일 경로가 노출되어 agent가 발견할 수 있다.
- [x] AC5: skill은 agent workflow를 제공한다: 범위 설정 → 코드/문서 탐색 → 근거 수집 → 결정 분류 → `sduck submit --stdin`으로 저장 → `sduck remember`로 export → `sduck recall`로 검증.
- [x] AC6: skill은 기존 저장 형식인 `SduckDraft`를 사용하며, `schemaVersion: "v2alpha1"`, `decisions`, `evidence`, `questions`, `expectedScope`, `avoidScope` 필드와 예시를 포함한다.
- [x] AC7: skill은 근거 참조 규칙을 포함한다. 코드/문서 근거는 가능한 한 `path:line` 또는 `path:line-line` 형태로 기록하고, 추론 결정은 confidence를 보수적으로 설정한다.
- [x] AC8: 이 기능은 CLI가 자체적으로 코드베이스를 분석하는 자동 분석기를 추가하지 않는다. DB 스키마 변경도 하지 않는다.
- [x] AC9: asset 등록 및 설치 경로를 검증하는 단위 또는 E2E 테스트가 추가/갱신되고, `npm run test:unit`, `npm run typecheck`가 통과한다.

### 기능 상세 설명

#### Skill의 역할

`codebase-decisions` skill은 agent에게 다음 책임을 부여한다.

1. 사용자가 “현재 코드베이스에서 기존 의사결정을 찾아 저장해줘”와 유사한 요청을 할 때 사용한다.
2. agent는 먼저 현재 sduck decision task가 있는지 확인하고, 없으면 `sduck work "Codebase decision inventory"`로 decision briefing task를 만든다.
3. 관련 파일/문서를 탐색하고 중요한 근거를 `sduck context add <path-or-glob>`로 context에 추가한다.
4. 발견한 결정을 `EXPLICIT`, `INFERRED`, `CARRIED`, `CONFLICT`, `OPEN` 중 하나로 분류한다.
5. 결정마다 근거(`evidence`)와 sourceRefs를 연결한다.
6. 확정할 수 없는 내용은 `questions`로 남겨 사용자 확인을 유도한다.
7. `sduck submit --stdin`에 `sduck-draft` JSON block 또는 raw JSON을 제출한다.
8. 제출 후 `sduck remember`로 markdown/graph export를 생성하고, `sduck recall <query>`로 저장 여부를 확인한다.

#### 저장 형식

Skill은 새 저장 형식을 만들지 않고 기존 `SduckDraft`를 사용한다.

```json sduck-draft
{
  "schemaVersion": "v2alpha1",
  "expectedScope": ["src/core/", "tests/unit/", "docs/adr/"],
  "avoidScope": ["node_modules/", "dist/", "coverage/"],
  "decisions": [
    {
      "title": "Keep CLI wrappers thin and move behavior into core modules",
      "kind": "INFERRED",
      "confidence": 0.82,
      "summary": "Commands parse arguments and delegate behavior to src/core so core logic remains independently testable.",
      "rationale": [
        "Command files mainly handle CLI input/output.",
        "Unit tests target core modules without invoking the full CLI."
      ],
      "appliesTo": ["src/commands/", "src/core/"],
      "avoids": ["Embedding business logic directly in Commander action handlers"],
      "sourceRefs": ["src/commands/init.ts:1-80", "src/core/init.ts:1-120", "CLAUDE.md:17-28"]
    }
  ],
  "evidence": [
    {
      "sourceType": "CODE",
      "sourceRef": "src/commands/init.ts:1-80",
      "summary": "Init command resolves CLI options and delegates initialization behavior to core code.",
      "confidence": 0.9
    }
  ],
  "questions": [
    {
      "text": "Should inferred architectural decisions be marked CONFIRMED only after user review?",
      "recommendedAnswer": "Keep inferred decisions as DRAFT until the user confirms them.",
      "rationale": ["The agent can infer intent but cannot authoritatively approve historical rationale."],
      "options": ["Keep DRAFT", "Mark CONFIRMED", "Split by confidence threshold"]
    }
  ]
}
```

#### Decision classification guidance

- `EXPLICIT`: ADR, README, comments, specs, or user instruction에서 직접 확인된 결정.
- `INFERRED`: 코드 구조와 반복 패턴으로부터 추론한 결정.
- `CARRIED`: 이전 결정 또는 관습이 현재 코드에도 이어지는 경우.
- `CONFLICT`: 코드/문서/테스트가 서로 다른 방향을 가리키는 경우.
- `OPEN`: 결정이 필요하지만 근거가 부족한 경우.

---

## 3. 기술 설계

### 변경 대상 컴포넌트

| 레이어 | 파일 / 모듈 | 변경 내용 요약 |
| ------ | ----------- | -------------- |
| 번들 asset | `.sduck/sduck-assets/agent-rules/skills/codebase-decisions/SKILL.md` | agent가 사용할 skill 문서 신규 추가 |
| 번들 agent rule | `.sduck/sduck-assets/agent-rules/core.md` | 새 skill의 경로와 사용 trigger를 agent instruction에 노출 |
| asset registry | `src/core/assets.ts` | 새 skill asset을 init/update 대상 asset 목록에 포함 |
| init registry | `src/core/init.ts` | `AssetTemplateKey`와 `ASSET_TEMPLATE_DEFINITIONS`에 새 skill asset 추가 |
| 테스트 | `tests/unit/sdd-core-regression.test.ts` 또는 신규 unit test | `initProject`가 skill asset을 복사하는지 검증 |
| 테스트 | `tests/e2e/sdd-cli-reachability.test.ts` | CLI `init` 실행 후 skill asset과 agent rule 참조가 존재하는지 검증 |

### API 명세 (해당 시)

해당 없음. 새 CLI 명령이나 public API를 추가하지 않는다.

### 데이터 모델 변경 (해당 시)

해당 없음. 기존 `.decision/db.sqlite` 스키마와 `SduckDraft`를 그대로 사용한다.

### 시퀀스 다이어그램 (해당 시)

```text
User request
  → Agent loads/reads codebase-decisions skill
  → Agent inspects code/docs/tests
  → Agent runs sduck work/context add as needed
  → Agent builds SduckDraft JSON
  → Agent runs sduck submit --stdin
  → Agent runs sduck remember
  → Future agent/user runs sduck recall
```

---

## 4. UI/UX 명세 (해당 시)

해당 없음. CLI 출력과 agent-facing markdown asset만 변경한다.

---

## 5. 테스트 계획

### 단위 테스트 (Unit Test)

| 대상 함수 / 모듈 | 테스트 케이스 | 예상 결과 |
| ---------------- | ------------- | --------- |
| `initProject` / asset registry | 임시 workspace에서 init 실행 | `.sduck/sduck-assets/agent-rules/skills/codebase-decisions/SKILL.md` 생성 |
| `initProject` / force mode | 기존 skill asset이 있을 때 force 갱신 | 새 번들 내용으로 overwrite |
| agent rule asset | `core.md` 렌더 결과 확인 | skill 경로와 trigger 문구 포함 |

### 통합 / E2E 테스트

| 시나리오 | 단계 | 예상 결과 |
| -------- | ---- | --------- |
| CLI init reachability | `runCli(['init', '--agents', 'claude-code'])` | `.sduck/sduck-assets/.../SKILL.md` 존재, `CLAUDE.md` managed block에 skill 안내 포함 |
| 전체 검증 | `npm run test:unit`, `npm run typecheck` | 모두 성공 |

---

## 6. 영향 범위 분석

### 변경 파일 목록 (예상)

```yaml
target_paths:
  - .sduck/sduck-assets/agent-rules/skills/codebase-decisions/SKILL.md
  - .sduck/sduck-assets/agent-rules/core.md
  - src/core/assets.ts
  - src/core/init.ts
  - tests/unit/sdd-core-regression.test.ts
  - tests/e2e/sdd-cli-reachability.test.ts
```

### 사이드 이펙트 검토

- 영향 가능성 있는 모듈:
  - `sduck init`: asset 목록이 늘어나므로 초기화 결과에 새 파일이 추가된다.
  - `sduck update`: force refresh 시 새 skill asset도 갱신 대상이 된다.
  - agent rule 렌더링: `core.md` 문구 추가가 모든 supported agent managed block에 반영될 수 있다.
- 회귀 테스트 필요 영역:
  - init idempotency
  - force overwrite behavior
  - generated root agent rule contents

### 롤백 계획

- 신규 skill asset 파일을 제거한다.
- `src/core/assets.ts`, `src/core/init.ts`의 asset registry 항목을 되돌린다.
- `.sduck/sduck-assets/agent-rules/core.md`의 skill 안내 문구를 제거한다.
- 관련 테스트 변경을 되돌린다.

---

## 7. 보안 / 성능 고려사항

- **인증·인가:** 해당 없음.
- **입력값 검증:** skill은 기존 `sduck submit` validator가 허용하는 `SduckDraft` 필드만 사용하도록 안내해야 한다.
- **성능:** CLI 자동 분석기를 추가하지 않으므로 런타임 성능 영향은 asset copy 수준으로 제한된다.
- **민감 데이터 처리:** agent가 코드베이스를 읽어 결정을 기록할 때 secrets, credentials, private tokens를 `summary`, `sourceRefs`, `evidence.summary`에 복사하지 말라고 명시해야 한다.

---

## 8. 비기능 요구사항

| 항목 | 요구사항 |
| ---- | -------- |
| 호환성 | 기존 `.decision` v2alpha1 draft schema와 호환 |
| 이식성 | Claude/Codex/OpenCode/Gemini/Cursor/Antigravity 등 특정 agent에 종속되지 않는 markdown skill |
| 유지보수성 | skill 본문은 100줄 안팎을 목표로 하고, 저장 형식 예시는 최소하지만 실행 가능해야 함 |
| 안정성 | 기존 init/update idempotency와 force overwrite semantics를 깨지 않아야 함 |

---

## 9. 의존성 및 선행 조건

- 이 작업 시작 전 완료되어야 하는 작업: 없음.
- 외부 서비스 / API 연동 필요 여부: 없음.
- 피처 플래그(Feature Flag) 사용 여부: 없음.
- 기존 의존성: `sduck submit`, `remember`, `recall`, `.decision` v2 store가 존재해야 한다.

---

## 10. 미결 사항 (Open Questions)

- 현재 결정: 사용자는 “번들 스킬” 방향을 선택했다. repo-local `docs/agents/` 전용 문서는 이번 범위에서 제외한다.

---

## 11. 참고 자료

- `.sduck/sduck-assets/eval/spec.yml`
- `src/core/v2/draft.ts`
- `src/types/index.ts`
- `src/core/v2/store.ts`
- `src/core/assets.ts`
- `src/core/init.ts`
- `.sduck/sduck-assets/agent-rules/core.md`

---

## 12. 자체 평가

평가 기준: `.sduck/sduck-assets/eval/spec.yml`

| 기준 | 점수(1-5) | 근거 |
| ---- | --------- | ---- |
| problem_clarity | 5 | CLI가 아닌 agent skill로 기존 의사결정을 저장해야 하는 문제와 목표가 명확함 |
| scope_definition | 5 | 번들 skill asset, agent rule 노출, asset registry/test 범위와 제외 범위를 명시함 |
| completion_criteria | 5 | init/update 설치, 저장 형식, trigger, 테스트까지 검증 가능한 AC로 정의함 |
| feasibility | 5 | 기존 asset copy 구조와 `SduckDraft` 저장 경로를 재사용하므로 구현 가능함 |
| risk_coverage | 4 | 민감정보, idempotency, force overwrite, agent rule 영향 범위를 다룸 |
| testability | 5 | unit/E2E/typecheck 검증 방법을 구체화함 |

종합: 4.8 / 5
