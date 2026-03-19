# Boundaries

## Dependency Direction

- `src/cli.ts` may depend on `src/commands`, `src/core`, and `src/utils`.
- `src/commands` may depend on `src/services`, `src/core`, and `src/utils`.
- `src/services` may depend on `src/core` and `src/utils`.
- `src/core` may depend on `src/utils`.
- `src/utils` must not depend on command or service layers.

## Guardrails

- Keep file-system side effects out of generic helpers.
- Keep parsing and validation logic in `src/core` so it remains testable without mocks.
- Only the CLI entrypoint should be responsible for process-level concerns.
