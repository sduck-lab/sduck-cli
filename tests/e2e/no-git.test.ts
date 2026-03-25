import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

import { runCli } from '../helpers/run-cli.js';
import { prepareProjectWorkspace, removeProjectWorkspace } from '../helpers/temp-workspace.js';

describe('sduck start --no-git', () => {
  const cliRoot = process.cwd();
  let tempWorkspace = '';
  const workspaceName = 'no-git-e2e';

  afterEach(async () => {
    await removeProjectWorkspace(cliRoot, workspaceName);
    tempWorkspace = '';
  });

  it('creates a task with null git fields in meta.yml', async () => {
    tempWorkspace = await prepareProjectWorkspace(cliRoot, workspaceName);
    await runCli(['init'], { cliRoot, cwd: tempWorkspace });

    const result = await runCli(['start', 'feature', 'no-git-task', '--no-git'], {
      cliRoot,
      cwd: tempWorkspace,
    });

    expect(result.exitCode).toBe(0);

    const entries = await readdir(join(tempWorkspace, '.sduck', 'sduck-workspace'));
    const taskDir = entries.find((entry) => entry.endsWith('-no-git-task'));

    expect(taskDir).toBeDefined();

    if (taskDir === undefined) {
      throw new Error('Expected task directory.');
    }

    const meta = await readFile(
      join(tempWorkspace, '.sduck', 'sduck-workspace', taskDir, 'meta.yml'),
      'utf8',
    );

    expect(meta).toContain('branch: null');
    expect(meta).toContain('base_branch: null');
    expect(meta).toContain('worktree_path: null');
  });
});
