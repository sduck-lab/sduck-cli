import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

import { runCli } from '../helpers/run-cli.js';
import { prepareProjectWorkspace, removeProjectWorkspace } from '../helpers/temp-workspace.js';

describe('sduck start', () => {
  const cliRoot = process.cwd();
  let tempWorkspace = '';
  const workspaceName = 'start-e2e';

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

  it('creates a feature task workspace with meta, spec, and plan', async () => {
    tempWorkspace = await prepareProjectWorkspace(cliRoot, workspaceName);
    await initRepo();

    const before = new Set(await readdir(join(tempWorkspace, '.sduck', 'sduck-workspace')));
    const result = await runCli(['start', 'feature', 'Login Flow'], {
      cliRoot,
      cwd: tempWorkspace,
    });
    const after = await readdir(join(tempWorkspace, '.sduck', 'sduck-workspace'));
    const created = after.find((entry) => !before.has(entry));

    expect(result.exitCode).toBe(0);
    expect(created).toBeDefined();
    expect(result.stdout).toContain('상태: PENDING_SPEC_APPROVAL');

    if (created === undefined) {
      throw new Error('Expected created workspace entry.');
    }

    const workspacePath = join(tempWorkspace, '.sduck', 'sduck-workspace', created);
    const meta = await readFile(join(workspacePath, 'meta.yml'), 'utf8');
    const spec = await readFile(join(workspacePath, 'spec.md'), 'utf8');
    const plan = await readFile(join(workspacePath, 'plan.md'), 'utf8');

    expect(meta).toContain(`id: ${created}`);
    expect(spec).toContain('# [feature] login flow');
    expect(plan).toBe('');
  });

  it('uses the build type template from the types directory', async () => {
    tempWorkspace = await prepareProjectWorkspace(cliRoot, workspaceName);
    await initRepo();

    const before = new Set(await readdir(join(tempWorkspace, '.sduck', 'sduck-workspace')));
    const result = await runCli(['start', 'build', 'bootstrap'], {
      cliRoot,
      cwd: tempWorkspace,
    });
    const after = await readdir(join(tempWorkspace, '.sduck', 'sduck-workspace'));
    const created = after.find((entry) => !before.has(entry));

    expect(result.exitCode).toBe(0);

    if (created === undefined) {
      throw new Error('Expected created workspace entry.');
    }

    const spec = await readFile(
      join(tempWorkspace, '.sduck', 'sduck-workspace', created, 'spec.md'),
      'utf8',
    );
    expect(spec).toContain('# [build] bootstrap');
  });

  it('rejects an unsupported type', async () => {
    tempWorkspace = await prepareProjectWorkspace(cliRoot, workspaceName);
    await initRepo();

    const result = await runCli(['start', 'unknown', 'task'], {
      cliRoot,
      cwd: tempWorkspace,
    });

    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain('Unsupported type');
  });

  it('rejects when an active task already exists', async () => {
    tempWorkspace = await prepareProjectWorkspace(cliRoot, workspaceName);
    await initRepo();
    await mkdir(join(tempWorkspace, '.sduck', 'sduck-workspace', '20260319-0000-feature-existing'));
    await writeFile(
      join(
        tempWorkspace,
        '.sduck',
        'sduck-workspace',
        '20260319-0000-feature-existing',
        'meta.yml',
      ),
      ['id: 20260319-0000-feature-existing', 'status: PENDING_SPEC_APPROVAL', ''].join('\n'),
      'utf8',
    );

    const result = await runCli(['start', 'feature', 'login'], {
      cliRoot,
      cwd: tempWorkspace,
    });

    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain('Active task exists');
  });
});
