import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

import { runCli } from '../helpers/run-cli.js';
import { prepareProjectWorkspace, removeProjectWorkspace } from '../helpers/temp-workspace.js';

describe('sduck done', () => {
  const cliRoot = process.cwd();
  let tempWorkspace = '';
  const workspaceName = 'done-e2e';

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

  async function getTaskDir(slug: string): Promise<string> {
    const entries = await readdir(join(tempWorkspace, '.sduck', 'sduck-workspace'));
    const taskDir = entries.find((entry) => entry.endsWith(`-${slug}`));

    if (taskDir === undefined) {
      throw new Error(`Expected created task directory for ${slug}.`);
    }

    return taskDir;
  }

  async function createReviewReadyTask(slug: string): Promise<string> {
    await runCli(['start', 'feature', slug, '--no-git'], { cliRoot, cwd: tempWorkspace });
    await runCli(['spec', 'approve', slug], { cliRoot, cwd: tempWorkspace });

    const taskDir = await getTaskDir(slug);
    const taskRoot = join(tempWorkspace, '.sduck', 'sduck-workspace', taskDir);

    await writeFile(join(taskRoot, 'plan.md'), '# Plan\n\n## Step 1. Finish task\n', 'utf8');
    await runCli(['plan', 'approve', slug], { cliRoot, cwd: tempWorkspace });

    // Mark steps complete then transition to REVIEW_READY
    await markCompletedSteps(taskDir, '1');
    await runCli(['review', 'ready', slug], { cliRoot, cwd: tempWorkspace });

    return taskDir;
  }

  async function createManualReviewReadyTask(slug: string): Promise<string> {
    const taskDir = `20260319-9999-feature-${slug}`;
    const taskRoot = join(tempWorkspace, '.sduck', 'sduck-workspace', taskDir);

    await mkdir(taskRoot, { recursive: true });
    await writeFile(
      join(taskRoot, 'meta.yml'),
      [
        `id: ${taskDir}`,
        'type: feature',
        `slug: ${slug}`,
        'created_at: 2026-03-19T09:00:00Z',
        'updated_at: 2026-03-19T09:00:00Z',
        '',
        'status: REVIEW_READY',
        '',
        'branch: null',
        'base_branch: null',
        'worktree_path: null',
        '',
        'spec:',
        '  approved: true',
        '  approved_at: 2026-03-19T09:01:00Z',
        '',
        'plan:',
        '  approved: true',
        '  approved_at: 2026-03-19T09:02:00Z',
        '',
        'steps:',
        '  total: 1',
        '  completed: [1]',
        '',
        'completed_at: null',
        '',
      ].join('\n'),
      'utf8',
    );
    await writeFile(join(taskRoot, 'spec.md'), '# [feature] demo\n\n- [x] AC1: complete\n', 'utf8');
    await writeFile(join(taskRoot, 'plan.md'), '# Plan\n\n## Step 1. Finish task\n', 'utf8');

    return taskDir;
  }

  async function markSpecChecklist(taskDir: string, checked: boolean): Promise<void> {
    const content = checked
      ? '# [feature] demo\n\n- [x] AC1: complete\n- [x] AC2: complete\n'
      : '# [feature] demo\n\n- [x] AC1: complete\n- [ ] AC2: pending\n';

    await writeFile(
      join(tempWorkspace, '.sduck', 'sduck-workspace', taskDir, 'spec.md'),
      content,
      'utf8',
    );
  }

  async function markCompletedSteps(taskDir: string, completed: string): Promise<void> {
    const metaPath = join(tempWorkspace, '.sduck', 'sduck-workspace', taskDir, 'meta.yml');
    const metaContent = await readFile(metaPath, 'utf8');
    const updatedMeta = metaContent.replace(
      /^ {2}completed:\s+\[.*\]$/m,
      `  completed: [${completed}]`,
    );

    await writeFile(metaPath, updatedMeta, 'utf8');
  }

  it('completes a REVIEW_READY task after validation', async () => {
    tempWorkspace = await prepareProjectWorkspace(cliRoot, workspaceName);
    await initRepo();
    const taskDir = await createReviewReadyTask('login');
    const metaPath = join(tempWorkspace, '.sduck', 'sduck-workspace', taskDir, 'meta.yml');

    await markSpecChecklist(taskDir, true);

    // Use explicit target since current work may not be set
    const result = await runCli(['done', 'login'], { cliRoot, cwd: tempWorkspace });
    const meta = await readFile(metaPath, 'utf8');

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('| success');
    expect(result.stdout).toContain('상태: DONE');
    expect(result.stdout).toContain('task eval 기준:');
    expect(meta).toContain('status: DONE');
    expect(meta).toMatch(/completed_at: 2026-|completed_at: 20\d\d-/);
  });

  it('fails when done is attempted on an IN_PROGRESS task', async () => {
    tempWorkspace = await prepareProjectWorkspace(cliRoot, workspaceName);
    await initRepo();

    await runCli(['start', 'feature', 'not-reviewed', '--no-git'], { cliRoot, cwd: tempWorkspace });
    await runCli(['spec', 'approve', 'not-reviewed'], { cliRoot, cwd: tempWorkspace });

    const taskDir = await getTaskDir('not-reviewed');
    const taskRoot = join(tempWorkspace, '.sduck', 'sduck-workspace', taskDir);

    await writeFile(join(taskRoot, 'plan.md'), '# Plan\n\n## Step 1. Finish task\n', 'utf8');
    await runCli(['plan', 'approve', 'not-reviewed'], { cliRoot, cwd: tempWorkspace });

    await markCompletedSteps(taskDir, '1');
    await markSpecChecklist(taskDir, true);

    const result = await runCli(['done', 'not-reviewed'], { cliRoot, cwd: tempWorkspace });

    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain('not in REVIEW_READY state');
  });

  it('completes with explicit target even with multiple REVIEW_READY tasks', async () => {
    tempWorkspace = await prepareProjectWorkspace(cliRoot, workspaceName);
    await initRepo();
    await createReviewReadyTask('login');
    const profileTask = await createManualReviewReadyTask('profile');

    await markSpecChecklist(profileTask, true);

    const result = await runCli(['done', 'profile'], { cliRoot, cwd: tempWorkspace });
    const profileMeta = await readFile(
      join(tempWorkspace, '.sduck', 'sduck-workspace', profileTask, 'meta.yml'),
      'utf8',
    );

    expect(result.exitCode).toBe(0);
    expect(profileMeta).toContain('status: DONE');
  });

  it('fails when steps are incomplete', async () => {
    tempWorkspace = await prepareProjectWorkspace(cliRoot, workspaceName);
    await initRepo();

    // Create a manual REVIEW_READY task with incomplete steps
    const taskDir = `20260319-9999-feature-steps-blocked`;
    const taskRoot = join(tempWorkspace, '.sduck', 'sduck-workspace', taskDir);

    await mkdir(taskRoot, { recursive: true });
    await writeFile(
      join(taskRoot, 'meta.yml'),
      [
        `id: ${taskDir}`,
        'type: feature',
        'slug: steps-blocked',
        'created_at: 2026-03-19T09:00:00Z',
        'updated_at: 2026-03-19T09:00:00Z',
        'status: REVIEW_READY',
        'branch: null',
        'base_branch: null',
        'worktree_path: null',
        'spec:',
        '  approved: true',
        '  approved_at: 2026-03-19T09:01:00Z',
        'plan:',
        '  approved: true',
        '  approved_at: 2026-03-19T09:02:00Z',
        'steps:',
        '  total: 1',
        '  completed: []',
        'completed_at: null',
      ].join('\n'),
      'utf8',
    );
    await writeFile(join(taskRoot, 'spec.md'), '# [feature] demo\n\n- [x] AC1: complete\n', 'utf8');
    await writeFile(join(taskRoot, 'plan.md'), '# Plan\n\n## Step 1. Finish task\n', 'utf8');

    const result = await runCli(['done', 'steps-blocked'], { cliRoot, cwd: tempWorkspace });

    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain('Missing steps: 1');
  });

  it('fails when the spec checklist is incomplete', async () => {
    tempWorkspace = await prepareProjectWorkspace(cliRoot, workspaceName);
    await initRepo();
    const taskDir = await createReviewReadyTask('spec-blocked');

    await markSpecChecklist(taskDir, false);

    const result = await runCli(['done', 'spec-blocked'], { cliRoot, cwd: tempWorkspace });

    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain('Spec checklist is incomplete');
    expect(result.stderr).toContain('AC2: pending');
  });

  it('fails when rerunning done for an already completed task', async () => {
    tempWorkspace = await prepareProjectWorkspace(cliRoot, workspaceName);
    await initRepo();
    const taskDir = await createReviewReadyTask('already-done');

    await markSpecChecklist(taskDir, true);

    const firstResult = await runCli(['done', 'already-done'], { cliRoot, cwd: tempWorkspace });
    const secondResult = await runCli(['done', 'already-done'], { cliRoot, cwd: tempWorkspace });

    expect(firstResult.exitCode).toBe(0);
    expect(secondResult.exitCode).toBe(1);
    expect(secondResult.stderr).toContain('is already DONE');
  });
});
