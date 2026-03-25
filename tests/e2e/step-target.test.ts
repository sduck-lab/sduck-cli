import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

import { runCli } from '../helpers/run-cli.js';
import { prepareProjectWorkspace, removeProjectWorkspace } from '../helpers/temp-workspace.js';

describe('sduck step done <n> [target]', () => {
  const cliRoot = process.cwd();
  let tempWorkspace = '';
  const workspaceName = 'step-target-e2e';

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

  async function setupInProgressTask(slug: string): Promise<string> {
    await runCli(['start', 'feature', slug, '--no-git'], { cliRoot, cwd: tempWorkspace });
    await runCli(['spec', 'approve', slug], { cliRoot, cwd: tempWorkspace });

    const taskDir = await getTaskDir(slug);
    const taskRoot = join(tempWorkspace, '.sduck', 'sduck-workspace', taskDir);

    await writeFile(
      join(taskRoot, 'plan.md'),
      '# Plan\n\n## Step 1. First\n\n## Step 2. Second\n\n## Step 3. Third\n',
      'utf8',
    );
    await runCli(['plan', 'approve', slug], { cliRoot, cwd: tempWorkspace });

    return taskDir;
  }

  it('marks step for explicit target work', async () => {
    tempWorkspace = await prepareProjectWorkspace(cliRoot, workspaceName);
    await runCli(['init'], { cliRoot, cwd: tempWorkspace });

    const taskDirA = await setupInProgressTask('step-target-a');
    const metaPathA = join(tempWorkspace, '.sduck', 'sduck-workspace', taskDirA, 'meta.yml');

    const result = await runCli(['step', 'done', '1', taskDirA], { cliRoot, cwd: tempWorkspace });
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('Step 1 completed.');

    const meta = await readFile(metaPathA, 'utf8');
    expect(meta).toContain('completed: [1]');
  });
});
