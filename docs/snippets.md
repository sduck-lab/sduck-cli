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
