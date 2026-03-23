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
10. **Reopen (optional):** 완료된 작업을 다시 열어 후속 수정 사이클을 진행

## 🛠 설치 및 초기화

```bash
# 글로벌 설치
npm install -g @sduck/sduck-cli

# 프로젝트 초기화 (사용할 에이전트 지정)
sduck init --agents claude-code,cursor,codex
```

### Windows 환경에서 `sduck`을 찾지 못할 때

Windows(PowerShell)에서 `npm install -g` 후 `sduck`을 실행했을 때 아래와 같은 에러가 발생할 수 있습니다.

```
sduck : 이 시스템에서 스크립트를 실행할 수 없습니다.
# 또는
sduck: The term 'sduck' is not recognized as the name of a cmdlet...
```

이는 npm 전역 설치 경로가 시스템 PATH에 포함되지 않아서 발생합니다.

**1. npm 전역 경로 확인**

```powershell
npm config get prefix
# 예: C:\Users\사용자이름\AppData\Roaming\npm
```

**2. PATH에 포함되어 있는지 확인**

```powershell
$env:PATH -split ';' | Select-String 'npm'
```

결과가 없으면 PATH에 추가해야 합니다.

**3. PATH에 영구 추가 (PowerShell)**

```powershell
# 현재 사용자에게 영구 추가
[Environment]::SetEnvironmentVariable(
  'Path',
  [Environment]::GetEnvironmentVariable('Path', 'User') + ';' + (npm config get prefix),
  'User'
)
```

설정 후 PowerShell을 재시작하면 `sduck` 명령어가 정상 동작합니다.

## 📖 주요 명령어

### 빠른 시작 예시

```bash
# 1) 초기화
sduck init --agents claude-code,codex

# 2) 일반 흐름
sduck start feature login-system
sduck spec approve login-system
sduck plan approve login-system

# 3) 빠른 흐름
sduck fast-track fix copy-bug

# 4) 구현 완료 후
sduck done login-system

# 5) 완료된 작업을 다시 열 때
sduck reopen login-system
```

### 1. 작업 시작 (Start)

작업 타입에 맞는 폴더와 템플릿 파일을 생성합니다.

```bash
# sduck start <type> <slug>
sduck start feature login-system
sduck start fix auth-bug
```

생성 직후 상태는 `PENDING_SPEC_APPROVAL`입니다.

### 2. 스펙 승인 (Approve Spec)

작성된 `spec.md`를 검토한 후 승인합니다. 상태가 `SPEC_APPROVED`로 변경됩니다.
target을 지정할 때는 정확한 `slug` 또는 전체 task `id`만 허용됩니다.

```bash
sduck spec approve [slug]
```

### 3. 빠른 시작 (Fast Track)

반복적이거나 범위가 명확한 작업은 minimal spec과 minimal plan을 한 번에 생성할 수 있습니다. `spec.md`는 생략되지 않으며, 비대화형 환경에서는 자동 승인 없이 생성만 수행합니다.

- `spec.md`는 항상 생성됩니다
- interactive 환경에서는 확인 1회 후 spec/plan 승인을 묶어 진행할 수 있습니다
- 비대화형 환경에서는 생성만 수행하고, 이후 `sduck spec approve <slug>` → `sduck plan approve <slug>`로 이어집니다
- 범위가 크거나 요구사항이 불명확한 작업은 일반 `start` 흐름을 권장합니다

```bash
sduck fast-track <type> <slug>
```

### 4. 플랜 승인 (Approve Plan)

`plan.md`에 작성된 단계(Steps)를 검토하고 승인합니다. 상태가 `IN_PROGRESS`로 변경되며 구현 권한이 부여됩니다.
target을 지정할 때는 정확한 `slug` 또는 전체 task `id`만 허용됩니다.

```bash
sduck plan approve [slug]
```

### 5. 작업 완료 (Done)

구현이 끝난 작업의 step 완료 여부, spec 체크리스트, task eval 자산을 확인한 뒤 `DONE` 상태로 마감합니다.

- `steps.total`과 `steps.completed`가 모두 맞아야 합니다
- `spec.md`의 체크리스트가 모두 완료돼야 합니다
- target을 지정할 때는 정확한 `slug` 또는 전체 task `id`만 허용됩니다

```bash
sduck done [slug]
```

### 6. 작업 다시 열기 (Reopen)

완료된 작업에 작은 후속 수정이 필요하면 `DONE` 상태 task를 다시 열 수 있습니다.

- `reopen`은 완료된 task를 새 작업 사이클로 되돌립니다
- target을 지정할 때는 정확한 `slug` 또는 전체 task `id`만 허용됩니다
- 큰 요구사항 변경이나 범위 확장은 기존 task를 reopen하기보다 새 task를 만드는 편이 더 적합합니다
- 방금 끝낸 작업의 누락 수정, 작은 보완, 후속 검증 보강 같은 경우에 적합합니다

```bash
sduck reopen [slug]
```

## ✅ 상태 전이

```text
PENDING_SPEC_APPROVAL -> SPEC_APPROVED -> IN_PROGRESS -> DONE
DONE -> IN_PROGRESS (reopen)
```

- `start`: `PENDING_SPEC_APPROVAL`
- `spec approve`: `SPEC_APPROVED`
- `plan approve`: `IN_PROGRESS`
- `done`: `DONE`
- `reopen`: `DONE`인 task를 다시 열어 `IN_PROGRESS`로 되돌림
- `fast-track`: minimal spec/plan을 생성하고, 환경에 따라 `PENDING_SPEC_APPROVAL` 또는 `IN_PROGRESS`까지 진행

`reopen`은 기존 task의 연속 수정에 사용하고, 요구사항이 바뀌거나 범위가 커지면 새 task를 만드는 것을 권장합니다.

## 🧭 일반 흐름 vs fast-track

| 구분          | 일반 흐름                      | fast-track                                |
| ------------- | ------------------------------ | ----------------------------------------- |
| 문서 생성     | 타입 템플릿 기반 spec, 빈 plan | minimal spec + minimal plan               |
| 승인 방식     | spec 승인, plan 승인 각각 진행 | interactive에서는 확인 1회로 묶을 수 있음 |
| 비대화형 동작 | 각 명령 수동 실행              | 생성만 수행, 승인 자동 진행 없음          |
| 추천 상황     | 범위가 크거나 애매한 작업      | 반복적이고 범위가 명확한 작업             |

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
│           ├── spec.md     # 요구사항 명세서 또는 minimal spec
│           └── plan.md     # 상세 구현 계획서 또는 minimal plan
├── CLAUDE.md               # Claude Code용 규칙
└── AGENT.md                # Codex/OpenCode용 규칙
```

`meta.yml`에는 최소 아래 상태 정보가 들어갑니다.

```yaml
status: PENDING_SPEC_APPROVAL | SPEC_APPROVED | IN_PROGRESS | DONE
spec:
  approved: <boolean>
plan:
  approved: <boolean>
steps:
  total: <number | null>
  completed: [<step numbers>]
completed_at: <timestamp | null>
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
