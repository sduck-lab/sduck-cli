import { mkdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

import { runCli } from '../helpers/run-cli.js';
import { prepareProjectWorkspace, removeProjectWorkspace } from '../helpers/temp-workspace.js';

describe('sduck init', () => {
  const cliRoot = process.cwd();
  let tempWorkspace = '';
  const workspaceName = 'init-e2e';

  afterEach(async () => {
    await removeProjectWorkspace(cliRoot, workspaceName);
    tempWorkspace = '';
  });

  it('creates the default assets and workspace directories', async () => {
    tempWorkspace = await prepareProjectWorkspace(cliRoot, workspaceName);

    const result = await runCli(['init'], {
      cliRoot,
      cwd: tempWorkspace,
    });

    await expect(stat(join(tempWorkspace, '.sduck'))).resolves.toBeDefined();
    await expect(stat(join(tempWorkspace, '.sduck', 'sduck-assets'))).resolves.toBeDefined();
    await expect(stat(join(tempWorkspace, '.sduck', 'sduck-workspace'))).resolves.toBeDefined();
    await expect(
      stat(join(tempWorkspace, '.sduck', 'sduck-assets', 'eval', 'spec.yml')),
    ).resolves.toBeDefined();
    await expect(
      stat(join(tempWorkspace, '.sduck', 'sduck-assets', 'eval', 'task.yml')),
    ).resolves.toBeDefined();
    await expect(
      stat(join(tempWorkspace, '.sduck', 'sduck-assets', 'types', 'feature.md')),
    ).resolves.toBeDefined();

    expect(result.exitCode).toBe(0);
    expect(result.stderr).toBe('');
    expect(result.stdout).toContain('| created');
  });

  it('keeps existing files in safe mode and restores them in force mode', async () => {
    tempWorkspace = await prepareProjectWorkspace(cliRoot, workspaceName);

    await runCli(['init'], {
      cliRoot,
      cwd: tempWorkspace,
    });

    const targetEvaluationAssetPath = join(
      tempWorkspace,
      '.sduck',
      'sduck-assets',
      'eval',
      'spec.yml',
    );
    const sourceEvaluationAssetPath = join(cliRoot, '.sduck', 'sduck-assets', 'eval', 'spec.yml');
    const targetAssetPath = join(tempWorkspace, '.sduck', 'sduck-assets', 'types', 'feature.md');
    const sourceAssetPath = join(cliRoot, '.sduck', 'sduck-assets', 'types', 'feature.md');

    await writeFile(targetEvaluationAssetPath, 'version: custom\n', 'utf8');
    await writeFile(targetAssetPath, '# custom template\n', 'utf8');

    const safeResult = await runCli(['init'], {
      cliRoot,
      cwd: tempWorkspace,
    });

    expect(await readFile(targetEvaluationAssetPath, 'utf8')).toBe('version: custom\n');
    expect(await readFile(targetAssetPath, 'utf8')).toBe('# custom template\n');
    expect(safeResult.stdout).toContain('| kept');

    const forceResult = await runCli(['init', '--force'], {
      cliRoot,
      cwd: tempWorkspace,
    });

    expect(await readFile(targetEvaluationAssetPath, 'utf8')).toBe(
      await readFile(sourceEvaluationAssetPath, 'utf8'),
    );
    expect(await readFile(targetAssetPath, 'utf8')).toBe(await readFile(sourceAssetPath, 'utf8'));
    expect(forceResult.stdout).toContain('| overwritten');
  });

  it('fails when an asset path is occupied by a directory', async () => {
    tempWorkspace = await prepareProjectWorkspace(cliRoot, workspaceName);

    await mkdir(join(tempWorkspace, '.sduck', 'sduck-assets', 'types', 'build.md'), {
      recursive: true,
    });

    const result = await runCli(['init'], {
      cliRoot,
      cwd: tempWorkspace,
    });

    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain('type-conflict');
  });

  it('recovers a missing asset file on rerun', async () => {
    tempWorkspace = await prepareProjectWorkspace(cliRoot, workspaceName);

    await runCli(['init'], {
      cliRoot,
      cwd: tempWorkspace,
    });

    const targetAssetPath = join(tempWorkspace, '.sduck', 'sduck-assets', 'eval', 'spec.yml');

    await rm(targetAssetPath);

    const result = await runCli(['init'], {
      cliRoot,
      cwd: tempWorkspace,
    });

    await expect(stat(targetAssetPath)).resolves.toBeDefined();
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('.sduck/sduck-assets/eval/spec.yml');
  });
});
