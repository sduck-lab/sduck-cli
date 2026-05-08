import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

import {
  allocateGitResource,
  cleanGitResource,
  describeGitResource,
  type GitResourceAdapter,
} from '../../src/core/git-resource.js';
import { createTempWorkspace, removeTempWorkspace } from '../helpers/temp-workspace.js';

function fakeAdapter(events: string[], merged: boolean): GitResourceAdapter {
  return {
    addWorktree(path, branch, base) {
      events.push(`add:${path}:${branch}:${base}`);
      return Promise.resolve();
    },
    deleteBranch(branch, force) {
      events.push(`delete:${branch}:${String(force)}`);
      return Promise.resolve();
    },
    getCurrentBranch() {
      events.push('current');
      return Promise.resolve('main');
    },
    isBranchMerged(branch, base) {
      events.push(`merged:${branch}:${base}`);
      return Promise.resolve(merged);
    },
    removeWorktree(path) {
      events.push(`remove:${path}`);
      return Promise.resolve();
    },
  };
}

describe('git resource Module', () => {
  let workspace: string | null = null;

  afterEach(async () => {
    if (workspace !== null) await removeTempWorkspace(workspace);
    workspace = null;
  });

  it('allocates a null descriptor for no-git work', async () => {
    workspace = await createTempWorkspace('git-resource-');
    const events: string[] = [];

    await expect(
      allocateGitResource(
        workspace,
        '20260507-0001-refactor-no-git',
        'refactor',
        'no-git',
        { noGit: true },
        fakeAdapter(events, true),
      ),
    ).resolves.toEqual({ baseBranch: null, branch: null, worktreePath: null });
    expect(events).toEqual([]);
  });

  it('plans branch names and worktree paths during allocation', async () => {
    workspace = await createTempWorkspace('git-resource-');
    const events: string[] = [];

    const descriptor = await allocateGitResource(
      workspace,
      '20260507-0001-refactor-arch',
      'refactor',
      'arch',
      {},
      fakeAdapter(events, true),
    );

    expect(descriptor).toEqual({
      baseBranch: 'main',
      branch: 'work/refactor/arch',
      worktreePath: '.sduck-worktrees/20260507-0001-refactor-arch',
    });
    expect(events).toEqual([
      'current',
      `add:${join(workspace, '.sduck-worktrees/20260507-0001-refactor-arch')}:work/refactor/arch:main`,
    ]);
  });

  it('cleans merged branches with existing worktrees', async () => {
    workspace = await createTempWorkspace('git-resource-');
    await mkdir(join(workspace, '.sduck-worktrees/task-1'), { recursive: true });
    const events: string[] = [];

    const result = await cleanGitResource(
      workspace,
      {
        baseBranch: 'main',
        branch: 'work/refactor/arch',
        id: 'task-1',
        worktreePath: '.sduck-worktrees/task-1',
      },
      { force: false },
      fakeAdapter(events, true),
    );

    expect(result).toMatchObject({
      branchDeleted: true,
      note: 'cleaned (merged)',
      worktreeRemoved: true,
    });
    expect(events).toEqual([
      'merged:work/refactor/arch:main',
      `remove:${join(workspace, '.sduck-worktrees/task-1')}`,
      'delete:work/refactor/arch:false',
    ]);
  });

  it('keeps unmerged branches unless forced', async () => {
    workspace = await createTempWorkspace('git-resource-');
    const events: string[] = [];

    const kept = await cleanGitResource(
      workspace,
      { baseBranch: 'main', branch: 'work/refactor/arch', id: 'task-1', worktreePath: null },
      { force: false },
      fakeAdapter(events, false),
    );
    expect(kept.branchDeleted).toBe(false);

    const forced = await cleanGitResource(
      workspace,
      { baseBranch: 'main', branch: 'work/refactor/arch', id: 'task-1', worktreePath: null },
      { force: true },
      fakeAdapter(events, false),
    );
    expect(forced).toMatchObject({ branchDeleted: true, note: 'cleaned (forced)' });
  });

  it('describes worktree views from descriptors', async () => {
    workspace = await createTempWorkspace('git-resource-');
    expect(describeGitResource(workspace, { worktreePath: '.sduck-worktrees/task-1' })).toEqual({
      worktreeAbsolutePath: join(workspace, '.sduck-worktrees/task-1'),
      worktreePath: '.sduck-worktrees/task-1',
    });
  });
});
