이 프로젝트는 **Spec-Driven Development(SDD)** 워크플로우를 따른다.
생성된 `AGENT.md`는 codex 계열 도구가 참고할 project-level instruction context다.
task 생성과 상태 전이는 `sduck` CLI로 관리한다.
에이전트는 `spec.md`, `plan.md` 본문 작성/수정과 구현을 담당한다.
워크플로우 구조와 규칙은 `sduck` CLI와 생성된 rule 문서를 기준으로 따른다.

## 절대 규칙

다음 두 가지 승인은 에이전트가 직접 처리하지 않는다.

- **스펙 승인**은 사용자가 명시적으로 승인해야 한다
- **플랜 승인**은 사용자가 명시적으로 승인해야 한다

승인 전에는 어떤 코드도 작성하지 않는다.
승인된 spec.md/plan.md를 수정하지 않는다. 요구사항이 바뀌면 새 태스크를 시작한다.

## Codex Instructions

- Follow the repository SDD workflow exactly.
- Use `AGENT.md` as project-level instruction context.
- Keep plans highly detailed: list exact file paths, likely functions or sections to edit, concrete change intent, and verification commands.
