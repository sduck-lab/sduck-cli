import { readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

import { runCli } from '../helpers/run-cli.js';
import { prepareProjectWorkspace, removeProjectWorkspace } from '../helpers/temp-workspace.js';

describe('sduck update', () => {
  const cliRoot = process.cwd();
  let tempWorkspace = '';
  const workspaceName = 'update-e2e';

  afterEach(async () => {
    await removeProjectWorkspace(cliRoot, workspaceName);
    tempWorkspace = '';
  });

  it('reports already up to date after init', async () => {
    tempWorkspace = await prepareProjectWorkspace(cliRoot, workspaceName);

    await runCli(['init', '--agents', 'claude-code'], { cliRoot, cwd: tempWorkspace });

    const result = await runCli(['update'], { cliRoot, cwd: tempWorkspace });

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('already up to date');
  });

  it('updates assets when version file is set to an older version', async () => {
    tempWorkspace = await prepareProjectWorkspace(cliRoot, workspaceName);

    await runCli(['init', '--agents', 'claude-code'], { cliRoot, cwd: tempWorkspace });

    const versionPath = join(tempWorkspace, '.sduck', 'sduck-assets', '.sduck-version');

    await writeFile(versionPath, '0.1.0\n', 'utf8');

    const result = await runCli(['update'], { cliRoot, cwd: tempWorkspace });

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('v0.1.0');
    expect(result.stdout).toContain('overwritten');

    const updatedVersion = (await readFile(versionPath, 'utf8')).trim();

    expect(updatedVersion).not.toBe('0.1.0');
  });

  it('updates assets when no version file exists', async () => {
    tempWorkspace = await prepareProjectWorkspace(cliRoot, workspaceName);

    await runCli(['init', '--agents', 'claude-code'], { cliRoot, cwd: tempWorkspace });

    const versionPath = join(tempWorkspace, '.sduck', 'sduck-assets', '.sduck-version');

    await rm(versionPath);

    const result = await runCli(['update'], { cliRoot, cwd: tempWorkspace });

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('Updated sduck assets');

    const updatedVersion = (await readFile(versionPath, 'utf8')).trim();

    expect(updatedVersion).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it('preserves user content outside managed blocks in CLAUDE.md', async () => {
    tempWorkspace = await prepareProjectWorkspace(cliRoot, workspaceName);

    await runCli(['init', '--agents', 'claude-code'], { cliRoot, cwd: tempWorkspace });

    const claudePath = join(tempWorkspace, 'CLAUDE.md');
    const originalContent = await readFile(claudePath, 'utf8');

    const userSection = '\n\n# My Custom Project Rules\n\nThis should be preserved.\n';

    await writeFile(claudePath, originalContent + userSection, 'utf8');

    const versionPath = join(tempWorkspace, '.sduck', 'sduck-assets', '.sduck-version');

    await writeFile(versionPath, '0.1.0\n', 'utf8');

    const result = await runCli(['update'], { cliRoot, cwd: tempWorkspace });

    expect(result.exitCode).toBe(0);

    const updatedContent = await readFile(claudePath, 'utf8');

    expect(updatedContent).toContain('# My Custom Project Rules');
    expect(updatedContent).toContain('This should be preserved.');
    expect(updatedContent).toContain('<!-- sduck:begin -->');
    expect(updatedContent).toContain('<!-- sduck:end -->');
  });

  it('fails with a helpful message when .sduck directory does not exist', async () => {
    tempWorkspace = await prepareProjectWorkspace(cliRoot, workspaceName);

    const result = await runCli(['update'], { cliRoot, cwd: tempWorkspace });

    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain('No .sduck/ directory found');
    expect(result.stderr).toContain('sduck init');
  });

  it('dry-run shows update plan without changing files', async () => {
    tempWorkspace = await prepareProjectWorkspace(cliRoot, workspaceName);

    await runCli(['init', '--agents', 'claude-code'], { cliRoot, cwd: tempWorkspace });

    const versionPath = join(tempWorkspace, '.sduck', 'sduck-assets', '.sduck-version');

    await writeFile(versionPath, '0.1.0\n', 'utf8');

    const versionBefore = await readFile(versionPath, 'utf8');

    const result = await runCli(['update', '--dry-run'], { cliRoot, cwd: tempWorkspace });

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('v0.1.0');
    expect(result.stdout).toContain('Dry run');

    const versionAfter = await readFile(versionPath, 'utf8');

    expect(versionBefore).toBe(versionAfter);
  });
});
