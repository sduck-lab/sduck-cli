import { mkdir, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { updateProject } from '../../src/core/update.js';

describe('updateProject', () => {
  const tmpDir = '/tmp/sduck-update-test';

  beforeEach(async () => {
    await mkdir(join(tmpDir, '.sduck', 'sduck-assets'), { recursive: true });
  });

  afterEach(async () => {
    await rm(tmpDir, { recursive: true, force: true });
  });

  it('returns didChange false when project version matches CLI version', async () => {
    const { CLI_VERSION } = await import('../../src/core/command-metadata.js');
    const { writeProjectVersion } = await import('../../src/core/version-file.js');

    await writeProjectVersion(tmpDir, CLI_VERSION);

    const result = await updateProject({ dryRun: false }, tmpDir);

    expect(result.didChange).toBe(false);
    expect(result.fromVersion).toBe(CLI_VERSION);
    expect(result.toVersion).toBe(CLI_VERSION);
    expect(result.summary.rows).toHaveLength(0);
  });

  it('returns didChange true when project version is different', async () => {
    const { writeProjectVersion } = await import('../../src/core/version-file.js');

    await writeProjectVersion(tmpDir, '0.1.0');

    const result = await updateProject({ dryRun: false }, tmpDir);

    expect(result.didChange).toBe(true);
    expect(result.fromVersion).toBe('0.1.0');
    expect(result.toVersion).toBeDefined();
  });

  it('returns didChange true when no version file exists', async () => {
    const result = await updateProject({ dryRun: false }, tmpDir);

    expect(result.didChange).toBe(true);
    expect(result.fromVersion).toBeNull();
  });

  it('does not change files in dry-run mode', async () => {
    const { writeProjectVersion } = await import('../../src/core/version-file.js');
    const { readProjectVersion } = await import('../../src/core/version-file.js');

    await writeProjectVersion(tmpDir, '0.1.0');

    const beforeVersion = await readProjectVersion(tmpDir);
    const result = await updateProject({ dryRun: true }, tmpDir);
    const afterVersion = await readProjectVersion(tmpDir);

    expect(result.didChange).toBe(true);
    expect(result.summary.warnings).toContain('Dry run — no files were changed.');
    expect(beforeVersion).toBe(afterVersion);
    expect(afterVersion).toBe('0.1.0');
  });

  it('throws an error when .sduck directory does not exist', async () => {
    const noSduckDir = '/tmp/sduck-update-no-sduck';

    await expect(updateProject({ dryRun: false }, noSduckDir)).rejects.toThrow(
      'No .sduck/ directory found',
    );
  });
});
