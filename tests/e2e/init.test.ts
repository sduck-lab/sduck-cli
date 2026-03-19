import { mkdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

import { runCli } from '../helpers/run-cli.js';
import { createTempWorkspace, removeTempWorkspace } from '../helpers/temp-workspace.js';

describe('sduck init', () => {
  const cliRoot = process.cwd();
  let tempWorkspace = '';

  afterEach(async () => {
    if (tempWorkspace !== '') {
      await removeTempWorkspace(tempWorkspace);
    }
  });

  it('creates the default assets and workspace directories', async () => {
    tempWorkspace = await createTempWorkspace();

    const result = await runCli(['init'], {
      cliRoot,
      cwd: tempWorkspace,
    });

    await expect(stat(join(tempWorkspace, 'sduck-assets'))).resolves.toBeDefined();
    await expect(stat(join(tempWorkspace, 'sduck-workspace'))).resolves.toBeDefined();
    await expect(
      stat(join(tempWorkspace, 'sduck-assets', 'spec-evaluation.yml')),
    ).resolves.toBeDefined();
    await expect(
      stat(join(tempWorkspace, 'sduck-assets', 'spec-feature.md')),
    ).resolves.toBeDefined();

    expect(result.exitCode).toBe(0);
    expect(result.stderr).toBe('');
    expect(result.stdout).toContain('| created');
  });

  it('keeps existing files in safe mode and restores them in force mode', async () => {
    tempWorkspace = await createTempWorkspace();

    await runCli(['init'], {
      cliRoot,
      cwd: tempWorkspace,
    });

    const targetEvaluationAssetPath = join(tempWorkspace, 'sduck-assets', 'spec-evaluation.yml');
    const sourceEvaluationAssetPath = join(cliRoot, 'sduck-assets', 'spec-evaluation.yml');
    const targetAssetPath = join(tempWorkspace, 'sduck-assets', 'spec-feature.md');
    const sourceAssetPath = join(cliRoot, 'sduck-assets', 'spec-feature.md');

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
    tempWorkspace = await createTempWorkspace();

    await mkdir(join(tempWorkspace, 'sduck-assets', 'spec-build.md'), { recursive: true });

    const result = await runCli(['init'], {
      cliRoot,
      cwd: tempWorkspace,
    });

    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain('type-conflict');
  });

  it('recovers a missing asset file on rerun', async () => {
    tempWorkspace = await createTempWorkspace();

    await runCli(['init'], {
      cliRoot,
      cwd: tempWorkspace,
    });

    const targetAssetPath = join(tempWorkspace, 'sduck-assets', 'spec-evaluation.yml');

    await rm(targetAssetPath);

    const result = await runCli(['init'], {
      cliRoot,
      cwd: tempWorkspace,
    });

    await expect(stat(targetAssetPath)).resolves.toBeDefined();
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('sduck-assets/spec-evaluation.yml');
  });
});
