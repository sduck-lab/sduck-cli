import { readFile, readdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

import { runCli } from '../helpers/run-cli.js';
import { prepareProjectWorkspace, removeProjectWorkspace } from '../helpers/temp-workspace.js';

describe('sduck step done', () => {
  const cliRoot = process.cwd();
  let tempWorkspace = '';
  const workspaceName = 'step-e2e';

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

  it('marks a step as completed in meta.yml', async () => {
    tempWorkspace = await prepareProjectWorkspace(cliRoot, workspaceName);
    await runCli(['init'], { cliRoot, cwd: tempWorkspace });

    const taskDir = await setupInProgressTask('step-test');
    const metaPath = join(tempWorkspace, '.sduck', 'sduck-workspace', taskDir, 'meta.yml');

    const result = await runCli(['step', 'done', '1'], { cliRoot, cwd: tempWorkspace });
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('Step 1 completed.');
    expect(result.stdout).toContain('(1/3)');

    const meta = await readFile(metaPath, 'utf8');
    expect(meta).toContain('completed: [1]');
  });

  it('marks multiple steps sequentially', { timeout: 15000 }, async () => {
    tempWorkspace = await prepareProjectWorkspace(cliRoot, workspaceName);
    await runCli(['init'], { cliRoot, cwd: tempWorkspace });

    const taskDir = await setupInProgressTask('step-seq');
    const metaPath = join(tempWorkspace, '.sduck', 'sduck-workspace', taskDir, 'meta.yml');

    await runCli(['step', 'done', '1'], { cliRoot, cwd: tempWorkspace });
    await runCli(['step', 'done', '2'], { cliRoot, cwd: tempWorkspace });
    const result = await runCli(['step', 'done', '3'], { cliRoot, cwd: tempWorkspace });

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('(3/3)');

    const meta = await readFile(metaPath, 'utf8');
    expect(meta).toContain('completed: [1, 2, 3]');
  });

  it('is idempotent for already completed step', async () => {
    tempWorkspace = await prepareProjectWorkspace(cliRoot, workspaceName);
    await runCli(['init'], { cliRoot, cwd: tempWorkspace });

    await setupInProgressTask('step-idem');

    await runCli(['step', 'done', '1'], { cliRoot, cwd: tempWorkspace });
    const result = await runCli(['step', 'done', '1'], { cliRoot, cwd: tempWorkspace });

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('already completed');
  });

  it('rejects step out of range', async () => {
    tempWorkspace = await prepareProjectWorkspace(cliRoot, workspaceName);
    await runCli(['init'], { cliRoot, cwd: tempWorkspace });

    await setupInProgressTask('step-range');

    const result = await runCli(['step', 'done', '0'], { cliRoot, cwd: tempWorkspace });
    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain('out of range');
  });

  it('rejects step before plan approval', async () => {
    tempWorkspace = await prepareProjectWorkspace(cliRoot, workspaceName);
    await runCli(['init'], { cliRoot, cwd: tempWorkspace });

    await runCli(['start', 'feature', 'step-noapprove', '--no-git'], {
      cliRoot,
      cwd: tempWorkspace,
    });

    const result = await runCli(['step', 'done', '1'], { cliRoot, cwd: tempWorkspace });
    expect(result.exitCode).toBe(1);
  });
});
