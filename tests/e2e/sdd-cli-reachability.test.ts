import { afterEach, describe, expect, it } from 'vitest';

import { runCli } from '../helpers/run-cli.js';
import { createTempWorkspace, removeTempWorkspace } from '../helpers/temp-workspace.js';

const supportsNodeSqlite = (() => {
  const [major = '0', minor = '0'] = process.versions.node.split('.');
  return Number(major) > 22 || (Number(major) === 22 && Number(minor) >= 13);
})();

const describeIfSqlite = supportsNodeSqlite ? describe : describe.skip;

describeIfSqlite('SDD CLI reachability regression', () => {
  const cliRoot = process.cwd();
  let workspace: string | null = null;

  afterEach(async () => {
    if (workspace !== null) await removeTempWorkspace(workspace);
    workspace = null;
  });

  it('keeps the current v2 CLI entrypoint from exposing legacy SDD commands', async () => {
    workspace = await createTempWorkspace('sdd-cli-');

    const help = await runCli(['--help'], { cliRoot, cwd: workspace });
    expect(help.exitCode).toBe(0);
    expect(help.stdout).toContain('work <description...>');
    expect(help.stdout).not.toContain('start <type> <slug>');

    const init = await runCli(['init'], { cliRoot, cwd: workspace });
    expect(init.exitCode).toBe(0);
    expect(init.stdout).toContain('Decision workspace initialized.');

    const legacyStart = await runCli(['start', 'refactor', 'architecture-deepening'], {
      cliRoot,
      cwd: workspace,
    });
    expect(legacyStart.exitCode).not.toBe(0);
    expect(`${legacyStart.stdout}\n${legacyStart.stderr}`.toLowerCase()).toContain(
      'unknown command',
    );
  });
});
