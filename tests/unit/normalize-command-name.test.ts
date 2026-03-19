import { describe, expect, it } from 'vitest';

import { normalizeCommandName } from '../../src/core/command-metadata.js';

describe('normalizeCommandName', () => {
  it('normalizes whitespace and casing', () => {
    expect(normalizeCommandName('  Build   Sduck CLI  ')).toBe('build-sduck-cli');
  });

  it('preserves existing separators while lowercasing', () => {
    expect(normalizeCommandName('feature-login')).toBe('feature-login');
  });
});
