이 프로젝트는 **Spec-Driven Development(SDD)** 워크플로우를 따른다.
`GEMINI.md`는 Gemini CLI가 직접 파일을 생성하고 상태를 관리할 때 참고하는 project-level instruction context다.
워크플로우 구조와 규칙은 `sduck` CLI와 동일하다.

## 절대 규칙

다음 두 가지 승인은 절대 에이전트가 직접 처리하지 않는다.

- **스펙 승인**은 사용자가 명시적으로 승인해야 한다
- **플랜 승인**은 사용자가 명시적으로 승인해야 한다

승인 전에는 어떤 코드도 작성하지 않는다.

## Gemini CLI Instructions

- Follow the repository SDD workflow exactly.
- Use `GEMINI.md` as project-level instruction context.
- Keep plans highly detailed: list exact file paths, likely functions or sections to edit, concrete change intent, and verification commands.
