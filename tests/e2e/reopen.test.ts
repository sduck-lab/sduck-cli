import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

import { runCli } from '../helpers/run-cli.js';
import { prepareProjectWorkspace, removeProjectWorkspace } from '../helpers/temp-workspace.js';

describe('sduck reopen', () => {
  const cliRoot = process.cwd();
  let tempWorkspace = '';
  const workspaceName = 'reopen-e2e';

  afterEach(async () => {
    await removeProjectWorkspace(cliRoot, workspaceName);
    tempWorkspace = '';
  });

  async function initRepo(): Promise<void> {
    await runCli(['init'], { cliRoot, cwd: tempWorkspace });
  }

  async function createDoneTask(
    id: string,
    completedAt: string,
    options?: { skipFiles?: boolean },
  ): Promise<void> {
    const taskDir = join(tempWorkspace, '.sduck', 'sduck-workspace', id);

    await mkdir(taskDir, { recursive: true });
    await writeFile(
      join(taskDir, 'meta.yml'),
      [
        `id: ${id}`,
        'type: feature',
        `slug: ${id.split('-').slice(2).join('-')}`,
        'created_at: 2026-03-01T00:00:00Z',
        '',
        'status: DONE',
        '',
        'spec:',
        '  approved: true',
        '  approved_at: 2026-03-01T00:01:00Z',
        '',
        'plan:',
        '  approved: true',
        '  approved_at: 2026-03-01T00:02:00Z',
        '',
        'steps:',
        '  total: 1',
        '  completed: [1]',
        '',
        `completed_at: ${completedAt}`,
        '',
      ].join('\n'),
      'utf8',
    );

    if (options?.skipFiles !== true) {
      await writeFile(join(taskDir, 'spec.md'), '# spec\n\n- [x] done\n', 'utf8');
      await writeFile(join(taskDir, 'plan.md'), '# Plan\n\n## Step 1. Do it\n', 'utf8');
    }
  }

  it('reopens a DONE task into PENDING_SPEC_APPROVAL with cycle 2', async () => {
    tempWorkspace = await prepareProjectWorkspace(cliRoot, workspaceName);
    await initRepo();
    await createDoneTask('20260323-0001-feature-alpha', '2026-03-23T10:00:00Z');

    const result = await runCli(['reopen', 'feature-alpha'], { cliRoot, cwd: tempWorkspace });

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('Reopened');
    expect(result.stdout).toContain('cycle 2');
    expect(result.stdout).toContain('PENDING_SPEC_APPROVAL');

    // Check meta.yml
    const metaContent = await readFile(
      join(tempWorkspace, '.sduck', 'sduck-workspace', '20260323-0001-feature-alpha', 'meta.yml'),
      'utf8',
    );

    expect(metaContent).toContain('cycle: 2');
    expect(metaContent).toContain('status: PENDING_SPEC_APPROVAL');
    expect(metaContent).toContain('approved: false');
    expect(metaContent).toContain('completed_at: null');

    // Check history
    const historyEntries = await readdir(
      join(tempWorkspace, '.sduck', 'sduck-workspace', '20260323-0001-feature-alpha', 'history'),
    );

    expect(historyEntries).toContain('1_spec.md');
    expect(historyEntries).toContain('1_plan.md');

    // Working copies still exist
    const specContent = await readFile(
      join(tempWorkspace, '.sduck', 'sduck-workspace', '20260323-0001-feature-alpha', 'spec.md'),
      'utf8',
    );

    expect(specContent).toContain('# spec');
  });

  it('supports second reopen (cycle 2 → 3)', async () => {
    tempWorkspace = await prepareProjectWorkspace(cliRoot, workspaceName);
    await initRepo();
    await createDoneTask('20260323-0001-feature-alpha', '2026-03-23T10:00:00Z');

    // First reopen
    await runCli(['reopen', 'feature-alpha'], { cliRoot, cwd: tempWorkspace });

    // Simulate completing cycle 2: update meta to DONE with cycle: 2
    const taskDir = join(tempWorkspace, '.sduck', 'sduck-workspace', '20260323-0001-feature-alpha');
    const metaPath = join(taskDir, 'meta.yml');
    let meta = await readFile(metaPath, 'utf8');

    meta = meta.replace('status: PENDING_SPEC_APPROVAL', 'status: DONE');
    meta = meta.replace('approved: false', 'approved: true');
    meta = meta.replace('completed_at: null', 'completed_at: 2026-03-23T12:00:00Z');
    await writeFile(metaPath, meta, 'utf8');

    // Update spec and plan for cycle 2
    await writeFile(join(taskDir, 'spec.md'), '# spec v2\n', 'utf8');
    await writeFile(join(taskDir, 'plan.md'), '# Plan v2\n', 'utf8');

    // Second reopen
    const result = await runCli(['reopen', 'feature-alpha'], { cliRoot, cwd: tempWorkspace });

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('cycle 3');

    const updatedMeta = await readFile(metaPath, 'utf8');

    expect(updatedMeta).toContain('cycle: 3');

    const historyEntries = await readdir(join(taskDir, 'history'));

    expect(historyEntries).toContain('1_spec.md');
    expect(historyEntries).toContain('1_plan.md');
    expect(historyEntries).toContain('2_spec.md');
    expect(historyEntries).toContain('2_plan.md');
  });

  it('rejects reopen on non-DONE task', async () => {
    tempWorkspace = await prepareProjectWorkspace(cliRoot, workspaceName);
    await initRepo();

    const taskDir = join(
      tempWorkspace,
      '.sduck',
      'sduck-workspace',
      '20260323-0001-feature-active',
    );

    await mkdir(taskDir, { recursive: true });
    await writeFile(
      join(taskDir, 'meta.yml'),
      [
        'id: 20260323-0001-feature-active',
        'type: feature',
        'slug: active',
        'created_at: 2026-03-23T00:00:00Z',
        '',
        'status: IN_PROGRESS',
        '',
        'spec:',
        '  approved: true',
        '  approved_at: 2026-03-23T00:01:00Z',
        '',
        'plan:',
        '  approved: true',
        '  approved_at: 2026-03-23T00:02:00Z',
        '',
        'steps:',
        '  total: 1',
        '  completed: []',
        '',
        'completed_at: null',
        '',
      ].join('\n'),
      'utf8',
    );

    const result = await runCli(['reopen', 'feature-active'], { cliRoot, cwd: tempWorkspace });

    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain('No DONE task');
  });

  it('prints error when no reopen candidates exist', async () => {
    tempWorkspace = await prepareProjectWorkspace(cliRoot, workspaceName);
    await initRepo();

    const result = await runCli(['reopen'], { cliRoot, cwd: tempWorkspace });

    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain('No DONE tasks found');
  });

  it('shows ambiguity error with candidate list for multiple DONE tasks', async () => {
    tempWorkspace = await prepareProjectWorkspace(cliRoot, workspaceName);
    await initRepo();
    await createDoneTask('20260323-0001-feature-alpha', '2026-03-23T10:00:00Z');
    await createDoneTask('20260323-0002-feature-beta', '2026-03-23T11:00:00Z');

    const result = await runCli(['reopen'], { cliRoot, cwd: tempWorkspace });

    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain('Multiple DONE tasks');
    expect(result.stderr).toContain('alpha');
    expect(result.stderr).toContain('beta');
  });

  it('keeps meta unchanged when history snapshot conflicts', async () => {
    tempWorkspace = await prepareProjectWorkspace(cliRoot, workspaceName);
    await initRepo();
    await createDoneTask('20260323-0001-feature-alpha', '2026-03-23T10:00:00Z');

    // Pre-create conflicting history file
    const historyDir = join(
      tempWorkspace,
      '.sduck',
      'sduck-workspace',
      '20260323-0001-feature-alpha',
      'history',
    );

    await mkdir(historyDir, { recursive: true });
    await writeFile(join(historyDir, '1_spec.md'), 'conflicting content', 'utf8');

    const metaBefore = await readFile(
      join(tempWorkspace, '.sduck', 'sduck-workspace', '20260323-0001-feature-alpha', 'meta.yml'),
      'utf8',
    );

    const result = await runCli(['reopen', 'feature-alpha'], { cliRoot, cwd: tempWorkspace });

    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain('History snapshot already exists');

    const metaAfter = await readFile(
      join(tempWorkspace, '.sduck', 'sduck-workspace', '20260323-0001-feature-alpha', 'meta.yml'),
      'utf8',
    );

    expect(metaAfter).toBe(metaBefore);
  });

  it('reopens DONE task even when spec.md and plan.md are missing', async () => {
    tempWorkspace = await prepareProjectWorkspace(cliRoot, workspaceName);
    await initRepo();
    await createDoneTask('20260323-0001-feature-alpha', '2026-03-23T10:00:00Z', {
      skipFiles: true,
    });

    const result = await runCli(['reopen', 'feature-alpha'], { cliRoot, cwd: tempWorkspace });

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('cycle 2');

    const metaContent = await readFile(
      join(tempWorkspace, '.sduck', 'sduck-workspace', '20260323-0001-feature-alpha', 'meta.yml'),
      'utf8',
    );

    expect(metaContent).toContain('cycle: 2');
    expect(metaContent).toContain('status: PENDING_SPEC_APPROVAL');

    // No history directory should be created
    const taskDir = join(tempWorkspace, '.sduck', 'sduck-workspace', '20260323-0001-feature-alpha');
    const entries = await readdir(taskDir);

    expect(entries).not.toContain('history');
  });
});
