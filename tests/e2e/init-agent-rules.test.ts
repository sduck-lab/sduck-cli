import { access, constants, mkdir, readFile, stat, writeFile } from 'node:fs/promises';
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
    expect(agentContent).toContain('다음 두 가지 승인은');
    expect(agentContent).toContain('.sduck/sduck-workspace/');
    expect(agentContent).toContain('.sduck/sduck-assets/eval/spec.yml');
    expect(agentContent).toContain('task 생성과 상태 전이는 `sduck` CLI로 관리한다.');
    expect(agentContent).toContain(
      '에이전트는 `spec.md`, `plan.md` 본문 작성/수정과 구현을 담당한다.',
    );
    expect(agentContent).not.toContain('`sduck` CLI가 없으므로');
    expect(agentContent).toContain('sduck init');
    expect(agentContent).toContain('sduck start <type> <slug>');
    expect(agentContent).toContain('sduck spec approve [target]');
    expect(agentContent).toContain('sduck plan approve [target]');
    expect(agentContent).toContain('승인 전에는 어떤 코드도 작성하지 않는다.');
    expect(claudeContent).toContain('Keep plans highly detailed');
    expect(claudeContent).toContain('절대 Claude가 직접 처리하지 않는다');
    expect(claudeContent).toContain('.sduck/sduck-assets/eval/plan.yml');
    expect(claudeContent).toContain('task 생성과 상태 전이는 `sduck` CLI로 관리한다.');
    expect(claudeContent).toContain(
      'Claude는 `spec.md`, `plan.md` 본문 작성/수정과 구현을 담당한다.',
    );
    expect(geminiContent).toContain('Use `GEMINI.md` as project-level instruction context.');
    expect(geminiContent).toContain('승인 전에는 어떤 코드도 작성하지 않는다.');
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

  it('installs Claude Code hook when claude-code agent is selected', async () => {
    tempWorkspace = await prepareProjectWorkspace(cliRoot, workspaceName);

    const result = await runCli(['init', '--agents', 'claude-code'], {
      cliRoot,
      cwd: tempWorkspace,
    });

    expect(result.exitCode).toBe(0);

    // Hook script exists and is executable
    const hookPath = join(tempWorkspace, '.claude', 'hooks', 'sdd-guard.sh');
    await expect(stat(hookPath)).resolves.toBeDefined();
    await expect(access(hookPath, constants.X_OK)).resolves.toBeUndefined();

    // Settings.json exists with hook config
    const settingsPath = join(tempWorkspace, '.claude', 'settings.json');
    const settingsContent = await readFile(settingsPath, 'utf8');

    expect(settingsContent).toContain('"hooks"');
    expect(settingsContent).toContain('"PreToolUse"');
    expect(settingsContent).toContain('"Edit|Write"');
  });

  it('does not install Claude Code hook when claude-code is not selected', async () => {
    tempWorkspace = await prepareProjectWorkspace(cliRoot, workspaceName);

    await runCli(['init', '--agents', 'codex'], {
      cliRoot,
      cwd: tempWorkspace,
    });

    const hookPath = join(tempWorkspace, '.claude', 'hooks', 'sdd-guard.sh');

    await expect(stat(hookPath)).rejects.toThrow();
  });

  it('preserves existing settings.json fields when installing hook', async () => {
    tempWorkspace = await prepareProjectWorkspace(cliRoot, workspaceName);
    const settingsPath = join(tempWorkspace, '.claude', 'settings.json');

    await mkdir(dirname(settingsPath), { recursive: true });
    await writeFile(
      settingsPath,
      JSON.stringify({ permissions: { allow: ['Read'] } }, null, 2) + '\n',
      'utf8',
    );

    await runCli(['init', '--agents', 'claude-code'], {
      cliRoot,
      cwd: tempWorkspace,
    });

    const settingsContent = await readFile(settingsPath, 'utf8');

    expect(settingsContent).toContain('"permissions"');
    expect(settingsContent).toContain('"allow"');
    expect(settingsContent).toContain('"PreToolUse"');
  });
});
