import { access } from 'node:fs/promises';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

import packageMetadata from '../../package.json' with { type: 'json' };
import { copyFixture } from '../helpers/fixture.js';
import { runCli } from '../helpers/run-cli.js';
import { createTempWorkspace, removeTempWorkspace } from '../helpers/temp-workspace.js';

describe('CLI preview command', () => {
  let tempWorkspace = '';

  afterEach(async () => {
    if (tempWorkspace !== '') {
      await removeTempWorkspace(tempWorkspace);
    }
  });

  it('runs the real CLI and works with fixture files in a temp workspace', async () => {
    tempWorkspace = await createTempWorkspace();

    const copiedFixture = await copyFixture('sample-workspace', tempWorkspace);

    await expect(access(join(copiedFixture, 'README.md'))).resolves.toBeUndefined();

    const result = await runCli(['preview', 'Bootstrap Ready'], {
      cliRoot: process.cwd(),
      cwd: process.cwd(),
    });

    expect(result.exitCode).toBe(0);
    expect(result.stderr).toBe('');
    expect(result.stdout.trim()).toBe('bootstrap-ready');
  });

  it('prints the package version through the real CLI', async () => {
    const result = await runCli(['--version'], {
      cliRoot: process.cwd(),
      cwd: process.cwd(),
    });

    expect(result.exitCode).toBe(0);
    expect(result.stderr).toBe('');
    expect(result.stdout.trim()).toBe(packageMetadata.version);
  });
});
