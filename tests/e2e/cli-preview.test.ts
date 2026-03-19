import { access } from 'node:fs/promises';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

import packageMetadata from '../../package.json' with { type: 'json' };
import { copyFixture } from '../helpers/fixture.js';
import { runCli } from '../helpers/run-cli.js';
import { prepareProjectWorkspace, removeProjectWorkspace } from '../helpers/temp-workspace.js';

describe('CLI preview command', () => {
  const cliRoot = process.cwd();
  let tempWorkspace = '';
  const workspaceName = 'cli-preview-e2e';

  afterEach(async () => {
    await removeProjectWorkspace(cliRoot, workspaceName);
    tempWorkspace = '';
  });

  it('runs the real CLI and works with fixture files in a temp workspace', async () => {
    tempWorkspace = await prepareProjectWorkspace(cliRoot, workspaceName);

    const copiedFixture = await copyFixture('sample-workspace', tempWorkspace);

    await expect(access(join(copiedFixture, 'README.md'))).resolves.toBeUndefined();

    const result = await runCli(['preview', 'Bootstrap Ready'], {
      cliRoot,
      cwd: tempWorkspace,
    });

    expect(result.exitCode).toBe(0);
    expect(result.stderr).toBe('');
    expect(result.stdout.trim()).toBe('bootstrap-ready');
  });

  it('prints the package version through the real CLI', async () => {
    tempWorkspace = await prepareProjectWorkspace(cliRoot, workspaceName);

    const result = await runCli(['--version'], {
      cliRoot,
      cwd: tempWorkspace,
    });

    expect(result.exitCode).toBe(0);
    expect(result.stderr).toBe('');
    expect(result.stdout.trim()).toBe(packageMetadata.version);
  });
});
