import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { markStepCompleted, parseStepsBlock, updateStepsCompleted } from '../../src/core/step.js';

describe('parseStepsBlock', () => {
  it('parses total and completed correctly', () => {
    const meta = 'steps:\n  total: 5\n  completed: [1, 2, 3]';
    const result = parseStepsBlock(meta);
    expect(result.total).toBe(5);
    expect(result.completed).toEqual([1, 2, 3]);
  });

  it('returns null total when value is null', () => {
    const meta = 'steps:\n  total: null\n  completed: []';
    const result = parseStepsBlock(meta);
    expect(result.total).toBeNull();
    expect(result.completed).toEqual([]);
  });

  it('returns empty array for empty completed', () => {
    const meta = 'steps:\n  total: 3\n  completed: []';
    const result = parseStepsBlock(meta);
    expect(result.completed).toEqual([]);
  });

  it('throws when steps block is missing', () => {
    expect(() => parseStepsBlock('id: test\nstatus: IN_PROGRESS')).toThrow(
      'missing a valid steps block',
    );
  });
});

describe('updateStepsCompleted', () => {
  const baseMeta = [
    'id: test-work',
    'status: IN_PROGRESS',
    'updated_at: 2026-03-25T00:00:00Z',
    '',
    'steps:',
    '  total: 3',
    '  completed: []',
  ].join('\n');

  it('updates completed array with sorted values', () => {
    const result = updateStepsCompleted(baseMeta, [3, 1, 2], new Date('2026-03-25T01:00:00Z'));
    expect(result).toContain('completed: [1, 2, 3]');
  });

  it('handles empty array', () => {
    const result = updateStepsCompleted(baseMeta, [], new Date('2026-03-25T01:00:00Z'));
    expect(result).toContain('completed: []');
  });

  it('updates updated_at timestamp', () => {
    const result = updateStepsCompleted(baseMeta, [1], new Date('2026-03-25T01:00:00Z'));
    expect(result).toContain('updated_at: 2026-03-25T01:00:00Z');
    expect(result).not.toContain('updated_at: 2026-03-25T00:00:00Z');
  });
});

describe('markStepCompleted', () => {
  let tempDir: string;

  const metaContent = [
    'id: test-work',
    'type: feature',
    'slug: test',
    'created_at: 2026-03-25T00:00:00Z',
    'updated_at: 2026-03-25T00:00:00Z',
    '',
    'branch: null',
    'base_branch: null',
    'worktree_path: null',
    '',
    'status: IN_PROGRESS',
    '',
    'spec:',
    '  approved: true',
    '  approved_at: 2026-03-25T00:00:00Z',
    '',
    'plan:',
    '  approved: true',
    '  approved_at: 2026-03-25T00:00:00Z',
    '',
    'steps:',
    '  total: 3',
    '  completed: []',
    '',
    'completed_at: null',
  ].join('\n');

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'sduck-step-test-'));
    const workDir = join(tempDir, '.sduck', 'sduck-workspace', 'test-work');
    await mkdir(workDir, { recursive: true });
    await writeFile(join(workDir, 'meta.yml'), metaContent, 'utf8');
    // state file
    const sduckDir = join(tempDir, '.sduck');
    await writeFile(
      join(sduckDir, 'sduck-state.yml'),
      'current_work_id: test-work\nupdated_at: 2026-03-25T00:00:00Z\n',
      'utf8',
    );
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  it('marks a step as completed', async () => {
    const result = await markStepCompleted(tempDir, 1);
    expect(result.alreadyCompleted).toBe(false);
    expect(result.completed).toEqual([1]);
    expect(result.total).toBe(3);
  });

  it('is idempotent for already completed step', async () => {
    await markStepCompleted(tempDir, 1);
    const result = await markStepCompleted(tempDir, 1);
    expect(result.alreadyCompleted).toBe(true);
    expect(result.completed).toEqual([1]);
  });

  it('rejects step 0', async () => {
    await expect(markStepCompleted(tempDir, 0)).rejects.toThrow('out of range (1-3)');
  });

  it('rejects step exceeding total', async () => {
    await expect(markStepCompleted(tempDir, 4)).rejects.toThrow('out of range (1-3)');
  });

  it('rejects when total is null', async () => {
    const workDir = join(tempDir, '.sduck', 'sduck-workspace', 'test-work');
    await writeFile(
      join(workDir, 'meta.yml'),
      metaContent.replace('total: 3', 'total: null'),
      'utf8',
    );
    await expect(markStepCompleted(tempDir, 1)).rejects.toThrow('Steps not initialized');
  });

  it('rejects when status is not IN_PROGRESS', async () => {
    const workDir = join(tempDir, '.sduck', 'sduck-workspace', 'test-work');
    await writeFile(
      join(workDir, 'meta.yml'),
      metaContent.replace('status: IN_PROGRESS', 'status: PENDING_PLAN_APPROVAL'),
      'utf8',
    );
    await expect(markStepCompleted(tempDir, 1)).rejects.toThrow('PENDING_PLAN_APPROVAL');
  });
});
