import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

import { runCli } from '../helpers/run-cli.js';
import { createTempWorkspace, removeTempWorkspace } from '../helpers/temp-workspace.js';

const supportsNodeSqlite = (() => {
  const [major = '0', minor = '0'] = process.versions.node.split('.');
  return Number(major) > 22 || (Number(major) === 22 && Number(minor) >= 13);
})();

const describeIfSqlite = supportsNodeSqlite ? describe : describe.skip;

function countOccurrences(content: string, needle: string): number {
  return content.split(needle).length - 1;
}

describeIfSqlite('SDD CLI reachability regression', () => {
  const cliRoot = process.cwd();
  let workspace: string | null = null;

  afterEach(async () => {
    if (workspace !== null) await removeTempWorkspace(workspace);
    workspace = null;
  });

  it('re-exposes legacy SDD commands and merged init assets', async () => {
    workspace = await createTempWorkspace('sdd-cli-');

    const help = await runCli(['--help'], { cliRoot, cwd: workspace });
    expect(help.exitCode).toBe(0);
    expect(help.stdout).toContain('work <description...>');
    expect(help.stdout).toContain('start [options] <type> <slug>');
    expect(help.stdout).toContain('fast-track [options] <type> <slug>');
    expect(help.stdout).toContain('done [target]');
    expect(help.stdout).toContain('Legacy SDD');

    const startHelp = await runCli(['start', '--help'], { cliRoot, cwd: workspace });
    expect(startHelp.exitCode).toBe(0);
    expect(startHelp.stdout).toContain('start [options] <type> <slug>');

    const specHelp = await runCli(['spec', 'approve', '--help'], { cliRoot, cwd: workspace });
    expect(specHelp.exitCode).toBe(0);
    expect(specHelp.stdout).toContain('approve [options] [target]');

    const planHelp = await runCli(['plan', 'approve', '--help'], { cliRoot, cwd: workspace });
    expect(planHelp.exitCode).toBe(0);
    expect(planHelp.stdout).toContain('approve [options] [target]');

    const stepHelp = await runCli(['step', 'done', '--help'], { cliRoot, cwd: workspace });
    expect(stepHelp.exitCode).toBe(0);
    expect(stepHelp.stdout).toContain('done [options] <number> [target]');

    const reviewHelp = await runCli(['review', 'ready', '--help'], { cliRoot, cwd: workspace });
    expect(reviewHelp.exitCode).toBe(0);
    expect(reviewHelp.stdout).toContain('ready [options] [target]');

    await mkdir(join(workspace, '.claude'), { recursive: true });
    await writeFile(
      join(workspace, '.claude', 'settings.json'),
      JSON.stringify(
        {
          customSetting: true,
          hooks: {
            PostToolUse: [{ matcher: '.*', hooks: [{ type: 'command', command: 'custom-post' }] }],
            PreToolUse: [{ matcher: 'Bash', hooks: [{ type: 'command', command: 'custom-pre' }] }],
          },
        },
        null,
        2,
      ) + '\n',
      'utf8',
    );

    const init = await runCli(['init', '--agents', 'claude-code'], { cliRoot, cwd: workspace });
    expect(init.exitCode).toBe(0);
    expect(init.stdout).toContain('sduck init completed.');
    expect(init.stdout).toContain('Decision workspace initialized.');
    await access(join(workspace, '.decision', 'state.json'));
    await access(join(workspace, '.sduck', 'sduck-assets', 'eval', 'spec.yml'));
    await access(join(workspace, '.sduck', 'sduck-assets', 'agent-rules', 'core.md'));
    await access(
      join(
        workspace,
        '.sduck',
        'sduck-assets',
        'agent-rules',
        'skills',
        'sduck-codebase-decisions',
        'SKILL.md',
      ),
    );
    await access(join(workspace, '.claude', 'hooks', 'sdd-guard.sh'));
    await access(join(workspace, '.claude', 'settings.json'));

    const settings = await readFile(join(workspace, '.claude', 'settings.json'), 'utf8');
    expect(settings).toContain('customSetting');
    expect(settings).toContain('custom-post');
    expect(settings).toContain('custom-pre');
    expect(settings).toContain('sdd-guard.sh');
    expect(countOccurrences(settings, 'sdd-guard.sh')).toBe(1);

    const rerun = await runCli(['init', '--agents', 'claude-code'], { cliRoot, cwd: workspace });
    expect(rerun.exitCode).toBe(0);
    const rerunSettings = await readFile(join(workspace, '.claude', 'settings.json'), 'utf8');
    expect(rerunSettings).toContain('custom-post');
    expect(rerunSettings).toContain('custom-pre');
    expect(countOccurrences(rerunSettings, 'sdd-guard.sh')).toBe(1);

    const claudeRules = await readFile(join(workspace, 'CLAUDE.md'), 'utf8');
    expect(claudeRules).toContain('<!-- sduck:begin -->');
    expect(claudeRules).toContain('spec -> approval -> plan -> approval');
    expect(claudeRules).toContain('sduck start');
    expect(claudeRules).toContain('sduck-codebase-decisions');
    expect(claudeRules).toContain(
      '.sduck/sduck-assets/agent-rules/skills/sduck-codebase-decisions/SKILL.md',
    );
    expect(claudeRules).toContain('Primary workflow: v2 `.decision` decision briefing');
  });
});
