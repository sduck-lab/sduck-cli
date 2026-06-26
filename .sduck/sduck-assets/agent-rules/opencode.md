이 프로젝트는 **v2 `.decision` decision briefing**을 기본 워크플로우로 사용한다. legacy SDD(`start`, `spec`/`plan` 승인 게이트)는 호환용 내부 워크플로우이며 활성 SDD 태스크에서만 적용된다.
task 생성과 상태 전이는 `sduck` CLI로 관리한다.
opencode는 `spec.md`, `plan.md` 본문 작성/수정과 구현을 담당한다.
워크플로우 구조와 규칙은 `sduck` CLI와 생성된 rule 문서를 기준으로 따른다.

## 절대 규칙

다음 두 가지 승인은 절대 opencode가 직접 처리하지 않는다.

- **스펙 승인**은 사용자가 명시적으로 승인해야 한다
- **플랜 승인**은 사용자가 명시적으로 승인해야 한다

승인 전에는 어떤 코드도 작성하지 않는다.
승인된 spec.md/plan.md의 요구사항 본문, 범위, 계획 내용은 사용자 승인 없이 수정하지 않는다. 요구사항이 바뀌면 새 태스크를 시작한다.
예외: 구현과 검증이 끝난 뒤 완료 조건/수용 기준 체크박스를 실제 검증 결과에 맞춰 `- [ ]`에서 `- [x]`로 반영하는 것은 허용된다. 이는 요구사항 변경이 아니라 완료 증적 기록이다.

## OpenCode Instructions

- Follow the repository v2 `.decision` decision briefing workflow as the primary workflow; legacy SDD approval gates apply only to active SDD tasks.
- Use `AGENTS.md` as project-level instruction context.
- Keep plans highly detailed: list exact file paths, likely functions or sections to edit, concrete change intent, and verification commands.
