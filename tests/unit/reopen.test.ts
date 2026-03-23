import { mkdir, readdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

import {
  buildReopenedMeta,
  filterReopenCandidates,
  getCurrentCycle,
  resolveReopenTarget,
  snapshotHistoryFiles,
} from '../../src/core/reopen.js';
import { createTempWorkspace, removeTempWorkspace } from '../helpers/temp-workspace.js';

import type { WorkspaceTaskSummary } from '../../src/core/workspace.js';

function createTask(id: string, status: string, slug?: string): WorkspaceTaskSummary {
  const task: WorkspaceTaskSummary = {
    createdAt: '2026-03-23T00:00:00Z',
    id,
    path: `.sduck/sduck-workspace/${id}`,
    status,
  };

  if (slug !== undefined) {
    task.slug = slug;
  }

  return task;
}

describe('filterReopenCandidates', () => {
  it('keeps only DONE tasks', () => {
    const tasks = filterReopenCandidates([
      createTask('a', 'DONE', 'alpha'),
      createTask('b', 'IN_PROGRESS', 'beta'),
      createTask('c', 'DONE', 'gamma'),
    ]);

    expect(tasks.map((t) => t.id)).toEqual(['a', 'c']);
  });
});

describe('resolveReopenTarget', () => {
  const tasks = [
    createTask('20260323-0001-feature-alpha', 'DONE', 'alpha'),
    createTask('20260323-0002-feature-beta', 'DONE', 'beta'),
    createTask('20260323-0003-feature-gamma', 'IN_PROGRESS', 'gamma'),
  ];

  it('returns the task on id exact match', () => {
    const result = resolveReopenTarget(tasks, '20260323-0001-feature-alpha');
    expect(result.id).toBe('20260323-0001-feature-alpha');
  });

  it('returns the task on slug exact match', () => {
    const result = resolveReopenTarget(tasks, 'beta');
    expect(result.id).toBe('20260323-0002-feature-beta');
  });

  it('throws on no match', () => {
    expect(() => resolveReopenTarget(tasks, 'nonexistent')).toThrow('No DONE task found matching');
  });

  it('throws on multiple match when target not specified', () => {
    expect(() => resolveReopenTarget(tasks)).toThrow('Multiple DONE tasks found');
  });

  it('auto-selects when target not specified and only one DONE task', () => {
    const singleDone = [
      createTask('20260323-0001-feature-alpha', 'DONE', 'alpha'),
      createTask('20260323-0003-feature-gamma', 'IN_PROGRESS', 'gamma'),
    ];
    const result = resolveReopenTarget(singleDone);
    expect(result.id).toBe('20260323-0001-feature-alpha');
  });

  it('throws when no DONE tasks exist', () => {
    const noDone = [createTask('20260323-0003-feature-gamma', 'IN_PROGRESS', 'gamma')];
    expect(() => resolveReopenTarget(noDone)).toThrow('No DONE tasks found');
  });

  it('includes candidate list in multiple match error', () => {
    expect(() => resolveReopenTarget(tasks)).toThrow('alpha');
  });
});

describe('getCurrentCycle', () => {
  it('returns 1 when cycle field is missing', () => {
    const meta = 'id: test\nstatus: DONE\n';
    expect(getCurrentCycle(meta)).toBe(1);
  });

  it('parses cycle field', () => {
    const meta = 'id: test\ncycle: 3\nstatus: DONE\n';
    expect(getCurrentCycle(meta)).toBe(3);
  });
});

describe('buildReopenedMeta', () => {
  const baseMeta = [
    'id: 20260323-0001-feature-alpha',
    'type: feature',
    'slug: alpha',
    'created_at: 2026-03-23T00:00:00Z',
    '',
    'status: DONE',
    '',
    'spec:',
    '  approved: true',
    '  approved_at: 2026-03-23T00:01:00Z',
    '',
    'plan:',
    '  approved: true',
    '  approved_at: 2026-03-23T00:02:00Z',
    '',
    'steps:',
    '  total: 3',
    '  completed: [1, 2, 3]',
    '',
    'completed_at: 2026-03-23T01:00:00Z',
    '',
  ].join('\n');

  it('inserts cycle field and resets all fields when cycle is missing', () => {
    const result = buildReopenedMeta(baseMeta, 2);

    expect(result).toContain('cycle: 2');
    expect(result).toContain('status: PENDING_SPEC_APPROVAL');
    expect(result).toContain('approved: false');
    expect(result).toContain('approved_at: null');
    expect(result).toContain('total: null');
    expect(result).toContain('completed: []');
    expect(result).toContain('completed_at: null');
  });

  it('updates existing cycle field', () => {
    const metaWithCycle = baseMeta.replace('status: DONE', 'cycle: 2\n\nstatus: DONE');
    const result = buildReopenedMeta(metaWithCycle, 3);

    expect(result).toContain('cycle: 3');
    expect(result).not.toContain('cycle: 2');
  });

  it('resets all approval and step fields', () => {
    const result = buildReopenedMeta(baseMeta, 2);

    expect(result).not.toContain('approved: true');
    expect(result).not.toContain('total: 3');
    expect(result).not.toContain('completed: [1, 2, 3]');
    expect(result).not.toContain('completed_at: 2026-03-23T01:00:00Z');
  });

  it('preserves id, type, slug, created_at', () => {
    const result = buildReopenedMeta(baseMeta, 2);

    expect(result).toContain('id: 20260323-0001-feature-alpha');
    expect(result).toContain('type: feature');
    expect(result).toContain('slug: alpha');
    expect(result).toContain('created_at: 2026-03-23T00:00:00Z');
  });
});

describe('snapshotHistoryFiles', () => {
  let tempDir = '';

  afterEach(async () => {
    if (tempDir !== '') {
      await removeTempWorkspace(tempDir);
      tempDir = '';
    }
  });

  it('creates history directory and copies files', async () => {
    tempDir = await createTempWorkspace('reopen-snap-');
    await writeFile(join(tempDir, 'spec.md'), '# Spec', 'utf8');
    await writeFile(join(tempDir, 'plan.md'), '# Plan', 'utf8');

    const result = await snapshotHistoryFiles(tempDir, 1);

    expect(result).toHaveLength(2);

    const historyEntries = await readdir(join(tempDir, 'history'));

    expect(historyEntries).toContain('1_spec.md');
    expect(historyEntries).toContain('1_plan.md');
  });

  it('throws on conflict', async () => {
    tempDir = await createTempWorkspace('reopen-conflict-');
    await writeFile(join(tempDir, 'spec.md'), '# Spec', 'utf8');
    await mkdir(join(tempDir, 'history'), { recursive: true });
    await writeFile(join(tempDir, 'history', '1_spec.md'), 'old', 'utf8');

    await expect(snapshotHistoryFiles(tempDir, 1)).rejects.toThrow(
      'History snapshot already exists',
    );
  });

  it('copies only spec.md when plan.md is missing', async () => {
    tempDir = await createTempWorkspace('reopen-noplan-');
    await writeFile(join(tempDir, 'spec.md'), '# Spec', 'utf8');

    const result = await snapshotHistoryFiles(tempDir, 1);

    expect(result).toHaveLength(1);

    const historyEntries = await readdir(join(tempDir, 'history'));

    expect(historyEntries).toContain('1_spec.md');
    expect(historyEntries).not.toContain('1_plan.md');
  });

  it('returns empty array when no files exist', async () => {
    tempDir = await createTempWorkspace('reopen-empty-');

    const result = await snapshotHistoryFiles(tempDir, 1);

    expect(result).toEqual([]);
  });
});
