import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

import { runCli } from '../helpers/run-cli.js';
import { createTempWorkspace, removeTempWorkspace } from '../helpers/temp-workspace.js';

describe('sduck init agent rule generation', () => {
  const cliRoot = process.cwd();
  let tempWorkspace = '';

  afterEach(async () => {
    if (tempWorkspace !== '') {
      await removeTempWorkspace(tempWorkspace);
    }
  });

  it('creates selected rule files for multiple agents', async () => {
    tempWorkspace = await createTempWorkspace();

    const result = await runCli(
      ['init', '--agents', 'claude-code,codex,gemini-cli,cursor,antigravity'],
      {
        cliRoot,
        cwd: tempWorkspace,
      },
    );

    await expect(stat(join(tempWorkspace, 'CLAUDE.md'))).resolves.toBeDefined();
    await expect(stat(join(tempWorkspace, 'AGENTS.md'))).resolves.toBeDefined();
    await expect(stat(join(tempWorkspace, 'GEMINI.md'))).resolves.toBeDefined();
    await expect(
      stat(join(tempWorkspace, '.cursor', 'rules', 'sduck-core.mdc')),
    ).resolves.toBeDefined();
    await expect(
      stat(join(tempWorkspace, '.agents', 'rules', 'sduck-core.md')),
    ).resolves.toBeDefined();

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain(
      'Selected agents: claude-code, codex, gemini-cli, cursor, antigravity',
    );
  });

  it('prepends a managed block to existing root rule files in safe mode', async () => {
    tempWorkspace = await createTempWorkspace();
    const claudePath = join(tempWorkspace, 'CLAUDE.md');

    await writeFile(claudePath, '# Existing project rules\n', 'utf8');

    const result = await runCli(['init', '--agents', 'claude-code'], {
      cliRoot,
      cwd: tempWorkspace,
    });

    const content = await readFile(claudePath, 'utf8');

    expect(content.startsWith('<!-- sduck:begin -->')).toBe(true);
    expect(content).toContain('# Existing project rules');
    expect(result.stdout).toContain('| prepended');
  });

  it('replaces only the managed block in force mode', async () => {
    tempWorkspace = await createTempWorkspace();
    const claudePath = join(tempWorkspace, 'CLAUDE.md');
    const originalContent =
      '<!-- sduck:begin -->\nold block\n<!-- sduck:end -->\n\n# Existing project rules\n';

    await writeFile(claudePath, originalContent, 'utf8');

    const result = await runCli(['init', '--force', '--agents', 'claude-code'], {
      cliRoot,
      cwd: tempWorkspace,
    });

    const content = await readFile(claudePath, 'utf8');

    expect(content).toContain('# Existing project rules');
    expect(content).not.toContain('old block');
    expect(result.stdout).toContain('| overwritten');
  });

  it('keeps managed cursor files in safe mode and overwrites them in force mode', async () => {
    tempWorkspace = await createTempWorkspace();
    const cursorPath = join(tempWorkspace, '.cursor', 'rules', 'sduck-core.mdc');

    await mkdir(dirname(cursorPath), { recursive: true });
    await writeFile(cursorPath, 'custom cursor rules\n', 'utf8');

    const safeResult = await runCli(['init', '--agents', 'cursor'], {
      cliRoot,
      cwd: tempWorkspace,
    });
    expect(await readFile(cursorPath, 'utf8')).toBe('custom cursor rules\n');
    expect(safeResult.stdout).toContain('| kept');

    const forceResult = await runCli(['init', '--force', '--agents', 'cursor'], {
      cliRoot,
      cwd: tempWorkspace,
    });
    expect(await readFile(cursorPath, 'utf8')).not.toBe('custom cursor rules\n');
    expect(forceResult.stdout).toContain('| overwritten');
  });
});
