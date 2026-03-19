import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

import { runCli } from '../helpers/run-cli.js';
import { createTempWorkspace, removeTempWorkspace } from '../helpers/temp-workspace.js';

describe('sduck spec approve', () => {
  const cliRoot = process.cwd();
  let tempWorkspace = '';

  afterEach(async () => {
    if (tempWorkspace !== '') {
      await removeTempWorkspace(tempWorkspace);
    }
  });

  async function initRepo(): Promise<void> {
    await runCli(['init'], {
      cliRoot,
      cwd: tempWorkspace,
    });
  }

  it('approves a single pending task', async () => {
    tempWorkspace = await createTempWorkspace();
    await initRepo();
    await runCli(['start', 'feature', 'login'], { cliRoot, cwd: tempWorkspace });

    const result = await runCli(['spec', 'approve'], { cliRoot, cwd: tempWorkspace });
    const [taskDir] = await (
      await import('node:fs/promises')
    ).readdir(join(tempWorkspace, 'sduck-workspace'));

    if (taskDir === undefined) {
      throw new Error('Expected a created task directory.');
    }

    const meta = await readFile(
      join(tempWorkspace, 'sduck-workspace', taskDir, 'meta.yml'),
      'utf8',
    );

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('플랜 작성을 시작합니다');
    expect(meta).toContain('status: SPEC_APPROVED');
    expect(meta).toContain('approved: true');
  });

  it('approves an explicitly targeted task', async () => {
    tempWorkspace = await createTempWorkspace();
    await initRepo();
    await runCli(['start', 'feature', 'login'], { cliRoot, cwd: tempWorkspace });

    const [taskDir] = await (
      await import('node:fs/promises')
    ).readdir(join(tempWorkspace, 'sduck-workspace'));

    if (taskDir === undefined) {
      throw new Error('Expected a created task directory.');
    }

    const result = await runCli(['spec', 'approve', 'login'], { cliRoot, cwd: tempWorkspace });
    const meta = await readFile(
      join(tempWorkspace, 'sduck-workspace', taskDir, 'meta.yml'),
      'utf8',
    );

    expect(result.exitCode).toBe(0);
    expect(meta).toContain('status: SPEC_APPROVED');
  });

  it('fails when there are no approvable tasks', async () => {
    tempWorkspace = await createTempWorkspace();
    await initRepo();

    const result = await runCli(['spec', 'approve'], { cliRoot, cwd: tempWorkspace });

    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain('No matching tasks awaiting spec approval');
  });

  it('fails for already approved tasks', async () => {
    tempWorkspace = await createTempWorkspace();
    await initRepo();
    await mkdir(join(tempWorkspace, 'sduck-workspace', '20260319-0000-feature-login'));
    await writeFile(
      join(tempWorkspace, 'sduck-workspace', '20260319-0000-feature-login', 'meta.yml'),
      [
        'id: 20260319-0000-feature-login',
        'slug: login',
        'created_at: 2026-03-19T00:00:00Z',
        'status: SPEC_APPROVED',
        '',
      ].join('\n'),
      'utf8',
    );

    const result = await runCli(['spec', 'approve', 'login'], { cliRoot, cwd: tempWorkspace });

    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain('No matching tasks awaiting spec approval');
  });
});
