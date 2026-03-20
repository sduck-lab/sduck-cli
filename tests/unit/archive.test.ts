import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

import {
  deriveArchiveMonth,
  extractCompletedAt,
  filterArchiveCandidates,
  isAlreadyArchived,
  loadArchiveTargets,
} from '../../src/core/archive.js';
import { prepareProjectWorkspace, removeProjectWorkspace } from '../helpers/temp-workspace.js';

import type { WorkspaceTaskSummary } from '../../src/core/workspace.js';

describe('archive core', () => {
  const cliRoot = process.cwd();
  let tempWorkspace = '';
  const workspaceName = 'archive-unit';

  afterEach(async () => {
    if (tempWorkspace !== '') {
      await removeProjectWorkspace(cliRoot, workspaceName);
      tempWorkspace = '';
    }
  });

  describe('filterArchiveCandidates', () => {
    it('returns only DONE tasks', () => {
      const tasks: WorkspaceTaskSummary[] = [
        { id: 'task-1', path: 'p1', status: 'DONE' },
        { id: 'task-2', path: 'p2', status: 'IN_PROGRESS' },
        { id: 'task-3', path: 'p3', status: 'PENDING_SPEC_APPROVAL' },
        { id: 'task-4', path: 'p4', status: 'DONE' },
      ];

      const result = filterArchiveCandidates(tasks);

      expect(result).toHaveLength(2);
      expect(result.map((t) => t.id)).toEqual(['task-1', 'task-4']);
    });
  });

  describe('extractCompletedAt', () => {
    it('extracts a valid timestamp', () => {
      const meta = 'status: DONE\n\ncompleted_at: 2026-03-19T13:30:37Z\n';

      expect(extractCompletedAt(meta)).toBe('2026-03-19T13:30:37Z');
    });

    it('returns null for null value', () => {
      const meta = 'status: DONE\n\ncompleted_at: null\n';

      expect(extractCompletedAt(meta)).toBeNull();
    });
  });

  describe('deriveArchiveMonth', () => {
    it('extracts YYYY-MM from a timestamp', () => {
      expect(deriveArchiveMonth('2026-03-19T13:30:37Z')).toBe('2026-03');
    });

    it('handles different months', () => {
      expect(deriveArchiveMonth('2025-12-01T00:00:00Z')).toBe('2025-12');
    });
  });

  describe('isAlreadyArchived', () => {
    it('returns true when the folder exists', async () => {
      tempWorkspace = await prepareProjectWorkspace(cliRoot, workspaceName);
      const archivePath = join(tempWorkspace, 'archive');
      const taskDir = 'task-1';

      await mkdir(join(archivePath, taskDir), { recursive: true });

      expect(await isAlreadyArchived(archivePath, taskDir)).toBe(true);
    });

    it('returns false when the folder does not exist', async () => {
      tempWorkspace = await prepareProjectWorkspace(cliRoot, workspaceName);
      const archivePath = join(tempWorkspace, 'archive');

      await mkdir(archivePath, { recursive: true });

      expect(await isAlreadyArchived(archivePath, 'missing-task')).toBe(false);
    });
  });

  describe('loadArchiveTargets with keep', () => {
    async function createDoneTask(root: string, id: string, completedAt: string): Promise<void> {
      const slug = id.split('-').slice(2).join('-');
      const taskDir = join(root, '.sduck', 'sduck-workspace', id);

      await mkdir(taskDir, { recursive: true });
      await writeFile(
        join(taskDir, 'meta.yml'),
        [
          `id: ${id}`,
          'type: feature',
          `slug: ${slug}`,
          'created_at: 2026-03-01T00:00:00Z',
          '',
          'status: DONE',
          '',
          'spec:',
          '  approved: true',
          '  approved_at: 2026-03-01T00:01:00Z',
          '',
          'plan:',
          '  approved: true',
          '  approved_at: 2026-03-01T00:02:00Z',
          '',
          'steps:',
          '  total: 1',
          '  completed: [1]',
          '',
          `completed_at: ${completedAt}`,
          '',
        ].join('\n'),
        'utf8',
      );
      await writeFile(join(taskDir, 'spec.md'), '# spec', 'utf8');
      await writeFile(join(taskDir, 'plan.md'), '# plan', 'utf8');
    }

    it('returns all DONE tasks when keep is 0', async () => {
      tempWorkspace = await prepareProjectWorkspace(cliRoot, workspaceName);
      await createDoneTask(tempWorkspace, '20260301-0001-feature-a', '2026-03-01T10:00:00Z');
      await createDoneTask(tempWorkspace, '20260302-0002-feature-b', '2026-03-02T10:00:00Z');
      await createDoneTask(tempWorkspace, '20260303-0003-feature-c', '2026-03-03T10:00:00Z');

      const targets = await loadArchiveTargets(tempWorkspace, { keep: 0 });

      expect(targets).toHaveLength(3);
    });

    it('keeps the most recent N tasks when keep > 0', async () => {
      tempWorkspace = await prepareProjectWorkspace(cliRoot, workspaceName);
      await createDoneTask(tempWorkspace, '20260301-0001-feature-a', '2026-03-01T10:00:00Z');
      await createDoneTask(tempWorkspace, '20260302-0002-feature-b', '2026-03-02T10:00:00Z');
      await createDoneTask(tempWorkspace, '20260303-0003-feature-c', '2026-03-03T10:00:00Z');

      const targets = await loadArchiveTargets(tempWorkspace, { keep: 1 });

      expect(targets).toHaveLength(2);
      expect(targets.map((t) => t.id)).toEqual([
        '20260301-0001-feature-a',
        '20260302-0002-feature-b',
      ]);
    });
  });
});
