import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

import { runCli } from '../helpers/run-cli.js';
import { prepareProjectWorkspace, removeProjectWorkspace } from '../helpers/temp-workspace.js';

describe('sduck plan approve', () => {
  const cliRoot = process.cwd();
  let tempWorkspace = '';
  const workspaceName = 'plan-approve-e2e';

  afterEach(async () => {
    await removeProjectWorkspace(cliRoot, workspaceName);
    tempWorkspace = '';
  });

  async function initRepo(): Promise<void> {
    await runCli(['init'], {
      cliRoot,
      cwd: tempWorkspace,
    });
  }

  async function createApprovedTask(slug: string, planContent: string): Promise<string> {
    await runCli(['start', 'feature', slug, '--no-git'], { cliRoot, cwd: tempWorkspace });
    await runCli(['spec', 'approve', slug], { cliRoot, cwd: tempWorkspace });

    const entries = await (
      await import('node:fs/promises')
    ).readdir(join(tempWorkspace, '.sduck', 'sduck-workspace'));
    const taskDir = entries.find((entry) => entry.endsWith(`-${slug}`));

    if (taskDir === undefined) {
      throw new Error('Expected created task directory.');
    }

    await writeFile(
      join(tempWorkspace, '.sduck', 'sduck-workspace', taskDir, 'plan.md'),
      planContent,
      'utf8',
    );

    return taskDir;
  }

  it('approves a valid plan and moves the task to IN_PROGRESS', async () => {
    tempWorkspace = await prepareProjectWorkspace(cliRoot, workspaceName);
    await initRepo();
    const taskDir = await createApprovedTask(
      'login',
      '# Plan\n\n## Step 1. First\n\n## Step 2. Second\n',
    );

    const result = await runCli(['plan', 'approve', 'login'], { cliRoot, cwd: tempWorkspace });
    const meta = await readFile(
      join(tempWorkspace, '.sduck', 'sduck-workspace', taskDir, 'meta.yml'),
      'utf8',
    );

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('| success');
    expect(result.stdout).toContain('상태: IN_PROGRESS → 작업을 시작합니다.');
    expect(meta).toContain('status: IN_PROGRESS');
    expect(meta).toContain('approved: true');
    expect(meta).toContain('total: 2');
  });

  it('fails when the plan has no valid titled steps', async () => {
    tempWorkspace = await prepareProjectWorkspace(cliRoot, workspaceName);
    await initRepo();
    await createApprovedTask('invalid-plan', '# Plan\n\nNo step headers at all.\n');

    const result = await runCli(['plan', 'approve', 'invalid-plan'], {
      cliRoot,
      cwd: tempWorkspace,
    });

    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain('invalid or missing Step headers');
  });

  it('supports explicit target approval', async () => {
    tempWorkspace = await prepareProjectWorkspace(cliRoot, workspaceName);
    await initRepo();
    const taskDir = await createApprovedTask('profile', '# Plan\n\n## Step 1. Profile\n');

    const result = await runCli(['plan', 'approve', 'profile'], { cliRoot, cwd: tempWorkspace });
    const meta = await readFile(
      join(tempWorkspace, '.sduck', 'sduck-workspace', taskDir, 'meta.yml'),
      'utf8',
    );

    expect(result.exitCode).toBe(0);
    expect(meta).toContain('status: IN_PROGRESS');
  });

  it('rejects suffix targets that are not exact ids or slugs', async () => {
    tempWorkspace = await prepareProjectWorkspace(cliRoot, workspaceName);
    await initRepo();
    await createApprovedTask('profile', '# Plan\n\n## Step 1. Profile\n');

    const result = await runCli(['plan', 'approve', 'feature-profile'], {
      cliRoot,
      cwd: tempWorkspace,
    });

    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain('No matching tasks awaiting plan approval');
  });

  it('fails for a task with invalid step headers via explicit target', async () => {
    tempWorkspace = await prepareProjectWorkspace(cliRoot, workspaceName);
    await initRepo();
    await createApprovedTask('failed-plan', '# Plan\n\n## Introduction\nNo step headers here.\n');

    const result = await runCli(['plan', 'approve', 'failed-plan'], {
      cliRoot,
      cwd: tempWorkspace,
    });

    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain('invalid or missing Step headers');
  });
});
