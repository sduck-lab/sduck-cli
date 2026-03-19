# Snippets

## Add a command

```ts
program
  .command('example')
  .description('Describe the command')
  .action(() => {
    console.log('example');
  });
```

## Add a pure helper

```ts
export function normalizeCommandName(input: string): string {
  return input.trim().toLowerCase().replace(/\s+/g, '-');
}
```

## Add a unit test

```ts
it('normalizes whitespace and casing', () => {
  expect(normalizeCommandName('  Build   Sduck CLI  ')).toBe('build-sduck-cli');
});
```

## Initialize a repository

```bash
sduck init
sduck init --force
sduck init --agents claude-code,codex,gemini-cli
```

## Start a task

```bash
sduck start feature login
sduck start build bootstrap-cli
```

## Approve a spec

```bash
sduck spec approve
sduck spec approve login
```

## Plan asset actions

```ts
const actions = planInitActions('safe', existingEntries);
const summary = summarizeInitActions(actions);
```

## Generate agent rule files

```bash
sduck init --agents claude-code,codex
sduck init --force --agents cursor,antigravity
```
