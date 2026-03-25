import { readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

import { runCli } from '../helpers/run-cli.js';
import { prepareProjectWorkspace, removeProjectWorkspace } from '../helpers/temp-workspace.js';

describe('sduck use + implement', () => {
  const cliRoot = process.cwd();
  let tempWorkspace = '';
  const workspaceName = 'use-implement-e2e';

  afterEach(async () => {
    await removeProjectWorkspace(cliRoot, workspaceName);
    tempWorkspace = '';
  });

  async function getTaskDir(slug: string): Promise<string> {
    const entries = await readdir(join(tempWorkspace, '.sduck', 'sduck-workspace'));
    const taskDir = entries.find((entry) => entry.endsWith(`-${slug}`));

    if (taskDir === undefined) {
      throw new Error(`Expected created task directory for ${slug}.`);
    }

    return taskDir;
  }

  it('switches current work with use and shows context with implement', async () => {
    tempWorkspace = await prepareProjectWorkspace(cliRoot, workspaceName);
    await runCli(['init'], { cliRoot, cwd: tempWorkspace });

    await runCli(['start', 'feature', 'alpha', '--no-git'], { cliRoot, cwd: tempWorkspace });
    await runCli(['start', 'feature', 'beta', '--no-git'], { cliRoot, cwd: tempWorkspace });

    const betaDir = await getTaskDir('beta');

    // Switch to beta
    const useResult = await runCli(['use', betaDir], { cliRoot, cwd: tempWorkspace });
    expect(useResult.exitCode).toBe(0);
    expect(useResult.stdout).toContain(betaDir);

    // Implement should show beta context
    const implResult = await runCli(['implement'], { cliRoot, cwd: tempWorkspace });
    expect(implResult.exitCode).toBe(0);
    expect(implResult.stdout).toContain(`Work ID:      ${betaDir}`);
    expect(implResult.stdout).toContain('Branch:       (none)');
  });
});
