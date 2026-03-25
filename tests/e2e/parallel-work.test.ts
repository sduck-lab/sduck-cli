import { readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

import { runCli } from '../helpers/run-cli.js';
import { prepareProjectWorkspace, removeProjectWorkspace } from '../helpers/temp-workspace.js';

describe('parallel work', () => {
  const cliRoot = process.cwd();
  let tempWorkspace = '';
  const workspaceName = 'parallel-work-e2e';

  afterEach(async () => {
    await removeProjectWorkspace(cliRoot, workspaceName);
    tempWorkspace = '';
  });

  it('creates two tasks in parallel (both workspace dirs exist)', async () => {
    tempWorkspace = await prepareProjectWorkspace(cliRoot, workspaceName);
    await runCli(['init'], { cliRoot, cwd: tempWorkspace });

    const resultA = await runCli(['start', 'feature', 'task-a', '--no-git'], {
      cliRoot,
      cwd: tempWorkspace,
    });
    const resultB = await runCli(['start', 'feature', 'task-b', '--no-git'], {
      cliRoot,
      cwd: tempWorkspace,
    });

    expect(resultA.exitCode).toBe(0);
    expect(resultB.exitCode).toBe(0);

    const entries = await readdir(join(tempWorkspace, '.sduck', 'sduck-workspace'));
    const taskADir = entries.find((entry) => entry.endsWith('-task-a'));
    const taskBDir = entries.find((entry) => entry.endsWith('-task-b'));

    expect(taskADir).toBeDefined();
    expect(taskBDir).toBeDefined();
  });
});
