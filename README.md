# 🦆 sduck (Spec-Driven Development CLI)

> "Don't let your AI write code before you approve the plan."

sduck은 AI 에이전트(Claude Code, Cursor, Codex 등)가 설계를 건너뛰고 바로 코드를 작성하는 것을 방지하고, Spec-Driven Development(SDD) 워크플로우를 물리적으로 강제하는 CLI 도구입니다.

![node](https://img.shields.io/badge/node-%3E%3D20-blue.svg)
![license](https://img.shields.io/badge/License-MIT-yellow.svg)

## 🚀 왜 sduck인가요?

AI 에이전트와 협업할 때 가장 흔한 문제는 **"충분한 설계 없이 타이핑부터 시작한다"**는 것입니다. 이는 결국 잘못된 설계로 인한 재작업(Rework)과 기술 부채로 이어집니다.

sduck은 개발자와 AI 사이의 '설계-승인-구현' 프로세스를 도구 수준에서 강제합니다:

- **물리적 승인 단계:** 사용자가 스펙과 플랜을 승인하기 전까지 AI가 코드를 수정하지 못하게 차단합니다.
- **구조화된 작업 관리:** 모든 작업은 `spec.md`, `plan.md`, `meta.yml`을 통해 기록되고 관리됩니다.
- **우리 팀만의 워크플로우 자산:** 팀의 컨벤션에 맞는 템플릿과 평가 기준을 프로젝트 자산으로 관리합니다.

## 🔄 워크플로우 (The SDD Process)

sduck은 아래의 엄격한 절차를 지향하며, 각 단계는 CLI를 통해 전이됩니다.

1. **Init:** 프로젝트 환경 설정 및 에이전트 규칙(`CLAUDE.md` 등) 생성
2. **Start:** 새로운 작업(feature, fix 등) 생성 및 템플릿 준비
3. **Fast Track (optional):** minimal spec + minimal plan을 빠르게 생성하고, 대화형 환경에서는 확인 1회로 승인까지 이어질 수 있음
4. **Spec:** AI가 요구사항을 분석하여 `spec.md` 작성 및 자체 품질 평가
5. **Approve Spec:** 사용자가 설계를 검토하고 `sduck spec approve` 실행
6. **Plan:** AI가 상세 구현 계획을 `plan.md`에 단계별로 작성
7. **Approve Plan:** 사용자가 계획을 검토하고 `sduck plan approve` 실행
8. **Implementation:** 승인된 계획의 Step에 따라 AI가 실제 코드 구현
9. **Done:** spec 체크리스트와 task eval 기준을 확인한 뒤 `sduck done` 실행

## 🛠 설치 및 초기화

```bash
# 글로벌 설치
npm install -g @sduck/sduck-cli

# 프로젝트 초기화 (사용할 에이전트 지정)
sduck init --agents claude-code,cursor,codex
```

## 📖 주요 명령어

### 1. 작업 시작 (Start)

작업 타입에 맞는 폴더와 템플릿 파일을 생성합니다.

```bash
# sduck start <type> <slug>
sduck start feature login-system
sduck start fix auth-bug
```

### 2. 스펙 승인 (Approve Spec)

작성된 `spec.md`를 검토한 후 승인합니다. 상태가 `SPEC_APPROVED`로 변경됩니다.

```bash
sduck spec approve [slug]
```

### 3. 빠른 시작 (Fast Track)

반복적이거나 범위가 명확한 작업은 minimal spec과 minimal plan을 한 번에 생성할 수 있습니다. `spec.md`는 생략되지 않으며, 비대화형 환경에서는 자동 승인 없이 생성만 수행합니다.

```bash
sduck fast-track <type> <slug>
```

### 4. 플랜 승인 (Approve Plan)

`plan.md`에 작성된 단계(Steps)를 검토하고 승인합니다. 상태가 `IN_PROGRESS`로 변경되며 구현 권한이 부여됩니다.

```bash
sduck plan approve [slug]
```

### 5. 작업 완료 (Done)

구현이 끝난 작업의 step 완료 여부, spec 체크리스트, task eval 자산을 확인한 뒤 `DONE` 상태로 마감합니다.

```bash
sduck done [slug]
```

## 🎨 자산 커스터마이징 (Asset Customization)

sduck은 팀의 컨벤션을 자산(`.sduck/sduck-assets/`)으로 관리합니다. 이 폴더를 Git에 포함하여 팀원 모두가 동일한 기준을 공유하세요.

### 1. 스펙 템플릿 (`types/`)

작업 타입별 `spec.md`의 형식을 정의합니다. 보안 체크리스트나 성능 고려사항을 추가하세요.

- 경로: `.sduck/sduck-assets/types/` (`feature.md`, `fix.md`, `refactor.md` 등)

### 2. 품질 평가 기준 (`eval/`)

AI가 작성한 문서의 품질을 스스로 검토할 때 사용하는 기준입니다. YAML 파일에서 질문 항목과 점수 범위를 수정할 수 있습니다.

- 경로: `.sduck/sduck-assets/eval/`
- 파일: `spec.yml` (설계 평가), `plan.yml` (계획 평가), `task.yml` (결과 평가)

## 📂 디렉토리 구조

sduck은 모든 상태를 로컬 파일로 관리하여 Git으로 완벽하게 추적 가능합니다.

```
your-project/
├── .sduck/
│   ├── sduck-assets/       # ✨ 팀 표준 (템플릿, 평가 기준, 규칙 원본)
│   │   ├── types/          # 작업 타입별 spec.md 템플릿
│   │   ├── eval/           # 품질 평가 기준 (YAML)
│   │   └── agent-rules/    # 에이전트별 규칙 원본
│   └── sduck-workspace/    # 📝 작업 이력 (Git 추적 권장)
│       └── 20260319-1000-feature-login/
│           ├── meta.yml    # 작업 상태 관리 (status, timestamps)
│           ├── spec.md     # 요구사항 명세서
│           └── plan.md     # 상세 구현 계획서
├── CLAUDE.md               # Claude Code용 규칙
└── AGENT.md                # Codex/OpenCode용 규칙
```

## 🤖 지원 에이전트 (Rule Generation)

`sduck init` 시 각 에이전트의 특성에 맞는 규칙 파일을 생성합니다.

| 에이전트         | 생성 파일             | 특징                             |
| ---------------- | --------------------- | -------------------------------- |
| Claude Code      | `CLAUDE.md`           | 프로젝트 루트 지침으로 자동 로드 |
| Cursor           | `.cursor/rules/*.mdc` | Cursor 전용 Rule 파일로 동작     |
| Codex / OpenCode | `AGENT.md`            | 공용 에이전트 규칙 파일          |
| Gemini CLI       | `GEMINI.md`           | 구글 제미나이 에이전트용 지침    |
| Antigravity      | `.agents/rules/*.md`  | Antigravity 에이전트 전용 지침   |

## 🤝 기여하기

1. 이 리포지토리를 포크합니다.
2. 새로운 브랜치를 생성합니다 (`git checkout -b feature/amazing-feature`).
3. 변경 사항을 커밋합니다 (`git commit -m 'feat: Add amazing feature'`).
4. Pull Request를 생성합니다.

## 📄 라이선스

이 프로젝트는 MIT 라이선스에 따라 라이선스가 부여됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.
