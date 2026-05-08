import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

import { writeCurrentWorkId } from '../../src/core/state.js';
import { createInitialTaskMeta, renderTaskMeta, type TaskMeta } from '../../src/core/task-meta.js';
import { resolveTaskTarget, resolveTaskTargets } from '../../src/core/task-target.js';
import { createTempWorkspace, removeTempWorkspace } from '../helpers/temp-workspace.js';

function makeMeta(id: string, slug: string, status: string): TaskMeta {
  return {
    ...createInitialTaskMeta({
      baseBranch: null,
      branch: null,
      createdAt: '2026-05-07T04:36:00Z',
      id,
      slug,
      type: 'refactor',
      updatedAt: '2026-05-07T04:36:00Z',
      worktreePath: null,
    }),
    status,
  };
}

async function writeWorkspaceTask(root: string, meta: TaskMeta): Promise<void> {
  const taskDir = join(root, '.sduck/sduck-workspace', meta.id);
  await mkdir(taskDir, { recursive: true });
  await writeFile(join(taskDir, 'meta.yml'), renderTaskMeta(meta), 'utf8');
}

async function writeArchiveTask(root: string, month: string, meta: TaskMeta): Promise<void> {
  const taskDir = join(root, '.sduck/sduck-archive', month, meta.id);
  await mkdir(taskDir, { recursive: true });
  await writeFile(join(taskDir, 'meta.yml'), renderTaskMeta(meta), 'utf8');
}

describe('task target Module', () => {
  let workspace: string | null = null;

  afterEach(async () => {
    if (workspace !== null) await removeTempWorkspace(workspace);
    workspace = null;
  });

  it('resolves exact id before slug', async () => {
    workspace = await createTempWorkspace('task-target-');
    await writeWorkspaceTask(workspace, makeMeta('target', 'id-task', 'IN_PROGRESS'));
    await writeWorkspaceTask(
      workspace,
      makeMeta('20260507-0001-refactor-target', 'target', 'DONE'),
    );

    const match = await resolveTaskTarget(workspace, {
      commandName: 'use',
      fallback: 'none',
      target: 'target',
    });

    expect(match.id).toBe('target');
  });

  it('rejects ambiguous slug for one target cardinality', async () => {
    workspace = await createTempWorkspace('task-target-');
    await writeWorkspaceTask(workspace, makeMeta('20260507-0001-refactor-same', 'same', 'DONE'));
    await writeWorkspaceTask(workspace, makeMeta('20260507-0002-refactor-same', 'same', 'DONE'));

    await expect(
      resolveTaskTarget(workspace, {
        commandName: 'clean',
        fallback: 'none',
        target: 'same',
      }),
    ).rejects.toThrow("Multiple works match slug 'same'");
  });

  it('supports current fallback and status filtering', async () => {
    workspace = await createTempWorkspace('task-target-');
    await writeWorkspaceTask(
      workspace,
      makeMeta('20260507-0001-refactor-current', 'current', 'IN_PROGRESS'),
    );
    await writeCurrentWorkId(workspace, '20260507-0001-refactor-current');

    const current = await resolveTaskTarget(workspace, {
      allowedStatuses: ['IN_PROGRESS'],
      commandName: 'review ready',
      fallback: 'current',
    });
    expect(current.slug).toBe('current');

    await expect(
      resolveTaskTarget(workspace, {
        allowedStatuses: ['DONE'],
        commandName: 'clean',
        fallback: 'current',
      }),
    ).rejects.toThrow('Expected: DONE');
  });

  it('supports all fallback for many targets', async () => {
    workspace = await createTempWorkspace('task-target-');
    await writeWorkspaceTask(workspace, makeMeta('20260507-0001-refactor-done', 'done', 'DONE'));
    await writeWorkspaceTask(
      workspace,
      makeMeta('20260507-0002-refactor-active', 'active', 'IN_PROGRESS'),
    );

    const doneTasks = await resolveTaskTargets(workspace, {
      allowedStatuses: ['DONE'],
      cardinality: 'many',
      commandName: 'clean',
      fallback: 'all',
    });

    expect(doneTasks.map((task) => task.id)).toEqual(['20260507-0001-refactor-done']);
  });

  it('includes archive tasks when requested', async () => {
    workspace = await createTempWorkspace('task-target-');
    await writeArchiveTask(
      workspace,
      '2026-05',
      makeMeta('20260507-0001-refactor-archived', 'archived', 'DONE'),
    );

    const archived = await resolveTaskTarget(workspace, {
      allowedStatuses: ['DONE'],
      commandName: 'clean',
      fallback: 'none',
      includeArchive: true,
      target: 'archived',
    });

    expect(archived.path).toBe(
      join('.sduck/sduck-archive', '2026-05', '20260507-0001-refactor-archived'),
    );
  });
});
