import { describe, expect, it } from 'vitest';

import {
  createWorkspaceId,
  formatUtcTimestamp,
  normalizeSlug,
  renderInitialMeta,
  validateSlug,
} from '../../src/core/start.js';

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

describe('renderInitialMeta', () => {
  it('renders the initial meta state', () => {
    const meta = renderInitialMeta({
      createdAt: '2026-03-19T02:43:39Z',
      id: '20260319-0243-feature-login',
      slug: 'login',
      type: 'feature',
    });

    expect(meta).toContain('status: PENDING_SPEC_APPROVAL');
    expect(meta).toContain('approved: false');
    expect(meta).toContain('completed: []');
  });
});
