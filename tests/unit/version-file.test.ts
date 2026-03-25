import { mkdir, rm, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import {
  getProjectVersionPath,
  readProjectVersion,
  writeProjectVersion,
} from '../../src/core/version-file.js';

describe('getProjectVersionPath', () => {
  it('returns the correct path inside .sduck/sduck-assets', () => {
    const path = getProjectVersionPath('/tmp/project');

    expect(path).toBe('/tmp/project/.sduck/sduck-assets/.sduck-version');
  });
});

describe('readProjectVersion', () => {
  it('returns null when the version file does not exist', async () => {
    const version = await readProjectVersion('/tmp/nonexistent-project-xyz');

    expect(version).toBeNull();
  });
});

describe('writeProjectVersion', () => {
  it('writes the CLI version to the version file', async () => {
    const tmpDir = '/tmp/sduck-version-test-write';

    await mkdir(join(tmpDir, '.sduck', 'sduck-assets'), { recursive: true });

    try {
      await writeProjectVersion(tmpDir);
      const content = await readFile(getProjectVersionPath(tmpDir), 'utf8');

      expect(content.trim()).toMatch(/^\d+\.\d+\.\d+$/);
    } finally {
      await rm(tmpDir, { recursive: true, force: true });
    }
  });

  it('writes a custom version string', async () => {
    const tmpDir = '/tmp/sduck-version-test-custom';

    await mkdir(join(tmpDir, '.sduck', 'sduck-assets'), { recursive: true });

    try {
      await writeProjectVersion(tmpDir, '1.0.0');
      const content = await readFile(getProjectVersionPath(tmpDir), 'utf8');

      expect(content.trim()).toBe('1.0.0');
    } finally {
      await rm(tmpDir, { recursive: true, force: true });
    }
  });
});
