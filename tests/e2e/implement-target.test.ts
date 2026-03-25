import { readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

import { runCli } from '../helpers/run-cli.js';
import { prepareProjectWorkspace, removeProjectWorkspace } from '../helpers/temp-workspace.js';

describe('sduck implement [target]', () => {
  const cliRoot = process.cwd();
  let tempWorkspace = '';
  const workspaceName = 'implement-target-e2e';

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

  it('shows context for explicit target work', async () => {
    tempWorkspace = await prepareProjectWorkspace(cliRoot, workspaceName);
    await runCli(['init'], { cliRoot, cwd: tempWorkspace });

    await runCli(['start', 'feature', 'alpha', '--no-git'], { cliRoot, cwd: tempWorkspace });
    await runCli(['start', 'feature', 'beta', '--no-git'], { cliRoot, cwd: tempWorkspace });

    const alphaDir = await getTaskDir('alpha');

    const result = await runCli(['implement', alphaDir], { cliRoot, cwd: tempWorkspace });
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain(`Work ID:      ${alphaDir}`);
    expect(result.stdout).toContain('Context File:');
    expect(result.stdout).toContain('agent-context.json');
  });

  it('shows context for current work when no target given', async () => {
    tempWorkspace = await prepareProjectWorkspace(cliRoot, workspaceName);
    await runCli(['init'], { cliRoot, cwd: tempWorkspace });

    await runCli(['start', 'feature', 'gamma', '--no-git'], { cliRoot, cwd: tempWorkspace });
    const gammaDir = await getTaskDir('gamma');

    const result = await runCli(['implement'], { cliRoot, cwd: tempWorkspace });
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain(`Work ID:      ${gammaDir}`);
  });
});
