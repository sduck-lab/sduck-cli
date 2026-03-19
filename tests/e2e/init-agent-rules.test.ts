import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

import { runCli } from '../helpers/run-cli.js';
import { prepareProjectWorkspace, removeProjectWorkspace } from '../helpers/temp-workspace.js';

describe('sduck init agent rule generation', () => {
  const cliRoot = process.cwd();
  let tempWorkspace = '';
  const workspaceName = 'init-agent-rules-e2e';

  afterEach(async () => {
    await removeProjectWorkspace(cliRoot, workspaceName);
    tempWorkspace = '';
  });

  it('creates selected rule files for the full supported agent set', async () => {
    tempWorkspace = await prepareProjectWorkspace(cliRoot, workspaceName);

    const result = await runCli(
      ['init', '--agents', 'claude-code,codex,opencode,gemini-cli,cursor,antigravity'],
      {
        cliRoot,
        cwd: tempWorkspace,
      },
    );

    await expect(stat(join(tempWorkspace, 'CLAUDE.md'))).resolves.toBeDefined();
    await expect(stat(join(tempWorkspace, 'AGENT.md'))).resolves.toBeDefined();
    await expect(stat(join(tempWorkspace, 'GEMINI.md'))).resolves.toBeDefined();
    await expect(
      stat(join(tempWorkspace, '.cursor', 'rules', 'sduck-core.mdc')),
    ).resolves.toBeDefined();
    await expect(
      stat(join(tempWorkspace, '.agents', 'rules', 'sduck-core.md')),
    ).resolves.toBeDefined();

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain(
      'Selected agents: claude-code, codex, opencode, gemini-cli, cursor, antigravity',
    );

    const agentContent = await readFile(join(tempWorkspace, 'AGENT.md'), 'utf8');
    const claudeContent = await readFile(join(tempWorkspace, 'CLAUDE.md'), 'utf8');
    const geminiContent = await readFile(join(tempWorkspace, 'GEMINI.md'), 'utf8');
    const antigravityContent = await readFile(
      join(tempWorkspace, '.agents', 'rules', 'sduck-core.md'),
      'utf8',
    );
    expect(agentContent).toContain('Use `AGENT.md` as project-level instruction context.');
    expect(agentContent).toContain('Selected agents: Codex, OpenCode');
    expect(agentContent).toContain('sduck init');
    expect(agentContent).toContain('sduck start <type> <slug>');
    expect(agentContent).toContain('sduck spec approve [target]');
    expect(agentContent).toContain('sduck plan approve [target]');
    expect(claudeContent).toContain('Keep plans highly detailed');
    expect(geminiContent).toContain('Use `GEMINI.md` as project-level instruction context.');
    expect(antigravityContent).toContain('Follow the repository SDD workflow exactly.');
  });

  it('prepends a managed block to existing root rule files in safe mode', async () => {
    tempWorkspace = await prepareProjectWorkspace(cliRoot, workspaceName);
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
    tempWorkspace = await prepareProjectWorkspace(cliRoot, workspaceName);
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
    tempWorkspace = await prepareProjectWorkspace(cliRoot, workspaceName);
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
