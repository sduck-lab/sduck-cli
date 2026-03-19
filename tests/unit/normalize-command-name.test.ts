import { describe, expect, it } from 'vitest';

import packageMetadata from '../../package.json' with { type: 'json' };
import { CLI_VERSION, normalizeCommandName } from '../../src/core/command-metadata.js';

describe('CLI_VERSION', () => {
  it('matches the package version', () => {
    expect(CLI_VERSION).toBe(packageMetadata.version);
  });
});

describe('normalizeCommandName', () => {
  it('normalizes whitespace and casing', () => {
    expect(normalizeCommandName('  Build   Sduck CLI  ')).toBe('build-sduck-cli');
  });

  it('preserves existing separators while lowercasing', () => {
    expect(normalizeCommandName('feature-login')).toBe('feature-login');
  });
});
