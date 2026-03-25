import { describe, expect, it } from 'vitest';

import {
  createWorkspaceId,
  normalizeSlug,
  renderInitialMeta,
  validateSlug,
} from '../../src/core/start.js';
import { formatUtcDate, formatUtcTimestamp } from '../../src/utils/utc-date.js';

describe('normalizeSlug', () => {
  it('normalizes input to lowercase kebab-case', () => {
    expect(normalizeSlug('  Build_Login Task  ')).toBe('build-login-task');
  });
});

describe('validateSlug', () => {
  it('accepts a valid kebab-case slug', () => {
    expect(() => {
      validateSlug('feature-login');
    }).not.toThrow();
  });

  it('rejects an empty slug', () => {
    expect(() => {
      validateSlug('');
    }).toThrow('Invalid slug');
  });
});

describe('createWorkspaceId', () => {
  it('creates a UTC-based workspace id', () => {
    const date = new Date('2026-03-19T02:43:00Z');
    expect(createWorkspaceId(date, 'feature', 'login')).toBe('20260319-0243-feature-login');
  });
});

describe('formatUtcTimestamp', () => {
  it('formats timestamps with a trailing Z', () => {
    expect(formatUtcTimestamp(new Date('2026-03-19T02:43:39.123Z'))).toBe('2026-03-19T02:43:39Z');
  });
});

describe('formatUtcDate', () => {
  it('formats dates as YYYY-MM-DD in UTC', () => {
    expect(formatUtcDate(new Date('2026-03-19T02:43:39.123Z'))).toBe('2026-03-19');
  });
});

describe('renderInitialMeta', () => {
  it('renders the initial meta state', () => {
    const meta = renderInitialMeta({
      baseBranch: 'main',
      branch: 'work/feature/login',
      createdAt: '2026-03-19T02:43:39Z',
      id: '20260319-0243-feature-login',
      slug: 'login',
      type: 'feature',
      updatedAt: '2026-03-19T02:43:39Z',
      worktreePath: '.sduck-worktrees/20260319-0243-feature-login',
    });

    expect(meta).toContain('status: PENDING_SPEC_APPROVAL');
    expect(meta).toContain('approved: false');
    expect(meta).toContain('completed: []');
    expect(meta).toContain('branch: work/feature/login');
    expect(meta).toContain('base_branch: main');
    expect(meta).toContain('worktree_path: .sduck-worktrees/20260319-0243-feature-login');
    expect(meta).toContain('updated_at: 2026-03-19T02:43:39Z');
  });

  it('renders null fields for --no-git mode', () => {
    const meta = renderInitialMeta({
      baseBranch: null,
      branch: null,
      createdAt: '2026-03-19T02:43:39Z',
      id: '20260319-0243-feature-login',
      slug: 'login',
      type: 'feature',
      updatedAt: '2026-03-19T02:43:39Z',
      worktreePath: null,
    });

    expect(meta).toContain('branch: null');
    expect(meta).toContain('base_branch: null');
    expect(meta).toContain('worktree_path: null');
  });
});
