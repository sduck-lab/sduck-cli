import { describe, expect, it } from 'vitest';

import { renderAgentContext } from '../../src/core/agent-context.js';
import { type ParsedMeta } from '../../src/core/workspace.js';

const PROJECT_ROOT = '/tmp/test-project';

function makeMeta(overrides: Partial<ParsedMeta> = {}): ParsedMeta {
  return {
    baseBranch: 'main',
    branch: 'work/feature/test',
    createdAt: '2026-03-25T01:00:00Z',
    id: '20260325-0100-feature-test',
    slug: 'test',
    status: 'IN_PROGRESS',
    type: 'feature',
    updatedAt: '2026-03-25T02:00:00Z',
    worktreePath: '.sduck-worktrees/20260325-0100-feature-test',
    ...overrides,
  };
}

const NORMAL_META_CONTENT = `id: 20260325-0100-feature-test
type: feature
slug: test
created_at: 2026-03-25T01:00:00Z
updated_at: 2026-03-25T02:00:00Z

branch: work/feature/test
base_branch: main
worktree_path: .sduck-worktrees/20260325-0100-feature-test

status: IN_PROGRESS

spec:
  approved: true
  approved_at: 2026-03-25T01:30:00Z

plan:
  approved: true
  approved_at: 2026-03-25T02:00:00Z

steps:
  total: 3
  completed: [1, 2]

completed_at: null
`;

describe('renderAgentContext', () => {
  it('includes all required fields for a normal work', () => {
    const meta = makeMeta();
    const ctx = renderAgentContext(meta, PROJECT_ROOT, NORMAL_META_CONTENT);

    expect(ctx.id).toBe('20260325-0100-feature-test');
    expect(ctx.type).toBe('feature');
    expect(ctx.slug).toBe('test');
    expect(ctx.status).toBe('IN_PROGRESS');
    expect(ctx.branch).toBe('work/feature/test');
    expect(ctx.baseBranch).toBe('main');
    expect(ctx.worktreePath).toBe('.sduck-worktrees/20260325-0100-feature-test');
    expect(ctx.worktreeAbsolutePath).toBe(
      `${PROJECT_ROOT}/.sduck-worktrees/20260325-0100-feature-test`,
    );
    expect(ctx.workspacePath).toContain('20260325-0100-feature-test');
    expect(ctx.workspaceAbsolutePath).toContain('20260325-0100-feature-test');
    expect(ctx.specPath).toContain('spec.md');
    expect(ctx.planPath).toContain('plan.md');
    expect(ctx.reviewPath).toContain('review.md');
    expect(ctx.createdAt).toBe('2026-03-25T01:00:00Z');
    expect(ctx.updatedAt).toBe('2026-03-25T02:00:00Z');
  });

  it('sets worktreePath and worktreeAbsolutePath to null for --no-git work', () => {
    const meta = makeMeta();
    delete meta.branch;
    delete meta.baseBranch;
    delete meta.worktreePath;
    const ctx = renderAgentContext(meta, PROJECT_ROOT, NORMAL_META_CONTENT);

    expect(ctx.worktreePath).toBeNull();
    expect(ctx.worktreeAbsolutePath).toBeNull();
    expect(ctx.branch).toBeNull();
    expect(ctx.baseBranch).toBeNull();
  });

  it('parses steps correctly', () => {
    const meta = makeMeta();
    const ctx = renderAgentContext(meta, PROJECT_ROOT, NORMAL_META_CONTENT);

    expect(ctx.steps.total).toBe(3);
    expect(ctx.steps.completed).toEqual([1, 2]);
  });

  it('parses specApproved and planApproved correctly', () => {
    const meta = makeMeta();
    const ctx = renderAgentContext(meta, PROJECT_ROOT, NORMAL_META_CONTENT);

    expect(ctx.specApproved).toBe(true);
    expect(ctx.planApproved).toBe(true);
  });

  it('handles spec not approved', () => {
    const meta = makeMeta();
    const content = NORMAL_META_CONTENT.replace(
      'spec:\n  approved: true',
      'spec:\n  approved: false',
    );
    const ctx = renderAgentContext(meta, PROJECT_ROOT, content);

    expect(ctx.specApproved).toBe(false);
    expect(ctx.planApproved).toBe(true);
  });

  it('handles null steps total', () => {
    const meta = makeMeta();
    const content = NORMAL_META_CONTENT.replace('  total: 3', '  total: null').replace(
      '  completed: [1, 2]',
      '  completed: []',
    );
    const ctx = renderAgentContext(meta, PROJECT_ROOT, content);

    expect(ctx.steps.total).toBeNull();
    expect(ctx.steps.completed).toEqual([]);
  });
});
