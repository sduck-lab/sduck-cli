import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

import { ensureGitignoreEntries } from '../../src/core/gitignore.js';
import { prepareProjectWorkspace, removeProjectWorkspace } from '../helpers/temp-workspace.js';

const cliRoot = process.cwd();
const workspaceName = 'gitignore-unit';

describe('ensureGitignoreEntries', () => {
  afterEach(async () => {
    await removeProjectWorkspace(cliRoot, workspaceName);
  });

  it('adds new entries to .gitignore', async () => {
    const projectRoot = await prepareProjectWorkspace(cliRoot, workspaceName);

    const result = await ensureGitignoreEntries(projectRoot, ['.sduck-worktrees/']);

    expect(result.added).toContain('.sduck-worktrees/');
    expect(result.skipped).toEqual([]);

    const content = await readFile(join(projectRoot, '.gitignore'), 'utf8');
    expect(content).toContain('.sduck-worktrees/');
  });

  it('skips entries that already exist', async () => {
    const projectRoot = await prepareProjectWorkspace(cliRoot, workspaceName);
    await writeFile(join(projectRoot, '.gitignore'), '.sduck-worktrees/\n', 'utf8');

    const result = await ensureGitignoreEntries(projectRoot, ['.sduck-worktrees/']);

    expect(result.added).toEqual([]);
    expect(result.skipped).toContain('.sduck-worktrees/');
  });

  it('appends to existing .gitignore content', async () => {
    const projectRoot = await prepareProjectWorkspace(cliRoot, workspaceName);
    await writeFile(join(projectRoot, '.gitignore'), 'node_modules/\n', 'utf8');

    await ensureGitignoreEntries(projectRoot, ['.sduck-worktrees/']);

    const content = await readFile(join(projectRoot, '.gitignore'), 'utf8');
    expect(content).toContain('node_modules/');
    expect(content).toContain('.sduck-worktrees/');
  });
});
