import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

import { runCli } from '../helpers/run-cli.js';
import { prepareProjectWorkspace, removeProjectWorkspace } from '../helpers/temp-workspace.js';

describe('sduck fast-track', () => {
  const cliRoot = process.cwd();
  let tempWorkspace = '';
  const workspaceName = 'fast-track-e2e';

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

  it('creates a minimal spec and plan without auto-approving in non-interactive mode', async () => {
    tempWorkspace = await prepareProjectWorkspace(cliRoot, workspaceName);
    await initRepo();

    const before = new Set(await readdir(join(tempWorkspace, '.sduck', 'sduck-workspace')));
    const result = await runCli(['fast-track', 'feature', 'login-flow', '--no-git'], {
      cliRoot,
      cwd: tempWorkspace,
    });
    const after = await readdir(join(tempWorkspace, '.sduck', 'sduck-workspace'));
    const created = after.find((entry) => !before.has(entry));

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('fast-track task created');
    expect(result.stdout).toContain('상태: PENDING_SPEC_APPROVAL');

    if (created === undefined) {
      throw new Error('Expected created workspace entry.');
    }

    const taskRoot = join(tempWorkspace, '.sduck', 'sduck-workspace', created);
    const meta = await readFile(join(taskRoot, 'meta.yml'), 'utf8');
    const spec = await readFile(join(taskRoot, 'spec.md'), 'utf8');
    const plan = await readFile(join(taskRoot, 'plan.md'), 'utf8');

    expect(meta).toContain('status: PENDING_SPEC_APPROVAL');
    expect(spec).toContain('## 목표');
    expect(spec).toContain('- [ ] 핵심 동작이 구현된다');
    expect(plan).toContain('## Step 1. login flow 요구사항 반영');
  });

  it('allows the generated task to continue through normal approvals', async () => {
    tempWorkspace = await prepareProjectWorkspace(cliRoot, workspaceName);
    await initRepo();

    await runCli(['fast-track', 'feature', 'login-flow', '--no-git'], {
      cliRoot,
      cwd: tempWorkspace,
    });

    const specApproveResult = await runCli(['spec', 'approve', 'login-flow'], {
      cliRoot,
      cwd: tempWorkspace,
    });
    const planApproveResult = await runCli(['plan', 'approve', 'login-flow'], {
      cliRoot,
      cwd: tempWorkspace,
    });
    const entries = await readdir(join(tempWorkspace, '.sduck', 'sduck-workspace'));
    const created = entries.find((entry) => entry.endsWith('-login-flow'));

    if (created === undefined) {
      throw new Error('Expected created workspace entry.');
    }

    const meta = await readFile(
      join(tempWorkspace, '.sduck', 'sduck-workspace', created, 'meta.yml'),
      'utf8',
    );

    expect(specApproveResult.exitCode).toBe(0);
    expect(planApproveResult.exitCode).toBe(0);
    expect(meta).toContain('status: IN_PROGRESS');
    expect(meta).toContain('total: 2');
  });
});
