import { stat, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

import { prepareProjectWorkspace, removeProjectWorkspace } from '../helpers/temp-workspace.js';

describe('prepareProjectWorkspace', () => {
  const cliRoot = process.cwd();
  const workspaceName = 'temp-workspace-unit';

  afterEach(async () => {
    await removeProjectWorkspace(cliRoot, workspaceName);
  });

  it('creates a repo-local test workspace under test/workspaces', async () => {
    const workspacePath = await prepareProjectWorkspace(cliRoot, workspaceName);

    await expect(stat(workspacePath)).resolves.toBeDefined();
    expect(workspacePath).toBe(join(cliRoot, 'test', 'workspaces', workspaceName));
  });

  it('cleans existing files before recreating the workspace', async () => {
    const workspacePath = await prepareProjectWorkspace(cliRoot, workspaceName);
    const markerPath = join(workspacePath, 'marker.txt');

    await writeFile(markerPath, 'leftover', 'utf8');
    await prepareProjectWorkspace(cliRoot, workspaceName);

    await expect(stat(markerPath)).rejects.toThrow();
  });
});
