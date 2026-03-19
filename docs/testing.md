# Testing

## Principles

- Prefer real behavior over mocks.
- Use temporary directories for filesystem tests.
- Run the real CLI entrypoint in end-to-end tests.

## Commands

- `npm run test:unit`
- `npm run test:e2e`
- `npm run test`

## Debugging

- Re-run a focused Vitest file while iterating.
- Inspect stdout and stderr in CLI tests before widening assertions.
- Keep fixtures small and intentional so failures are easy to diagnose.
