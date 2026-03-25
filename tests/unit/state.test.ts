import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

import { readCurrentWorkId, writeCurrentWorkId } from '../../src/core/state.js';
import { prepareProjectWorkspace, removeProjectWorkspace } from '../helpers/temp-workspace.js';

const cliRoot = process.cwd();
const workspaceName = 'state-unit';

describe('readCurrentWorkId', () => {
  afterEach(async () => {
    await removeProjectWorkspace(cliRoot, workspaceName);
  });

  it('returns null when state file does not exist', async () => {
    const projectRoot = await prepareProjectWorkspace(cliRoot, workspaceName);
    expect(await readCurrentWorkId(projectRoot)).toBeNull();
  });

  it('returns null when value is the string "null"', async () => {
    const projectRoot = await prepareProjectWorkspace(cliRoot, workspaceName);
    const sduckDir = join(projectRoot, '.sduck');
    await mkdir(sduckDir, { recursive: true });
    await writeFile(
      join(sduckDir, 'sduck-state.yml'),
      'current_work_id: null\nupdated_at: 2026-03-24T00:00:00Z\n',
      'utf8',
    );

    expect(await readCurrentWorkId(projectRoot)).toBeNull();
  });

  it('returns the work id when set', async () => {
    const projectRoot = await prepareProjectWorkspace(cliRoot, workspaceName);
    const sduckDir = join(projectRoot, '.sduck');
    await mkdir(sduckDir, { recursive: true });
    await writeFile(
      join(sduckDir, 'sduck-state.yml'),
      'current_work_id: 20260324-0100-feature-foo\nupdated_at: 2026-03-24T00:00:00Z\n',
      'utf8',
    );

    expect(await readCurrentWorkId(projectRoot)).toBe('20260324-0100-feature-foo');
  });
});

describe('writeCurrentWorkId', () => {
  afterEach(async () => {
    await removeProjectWorkspace(cliRoot, workspaceName);
  });

  it('writes and reads back a work id', async () => {
    const projectRoot = await prepareProjectWorkspace(cliRoot, workspaceName);
    const sduckDir = join(projectRoot, '.sduck');
    await mkdir(sduckDir, { recursive: true });

    const date = new Date('2026-03-24T01:00:00Z');
    await writeCurrentWorkId(projectRoot, '20260324-0100-feature-bar', date);

    expect(await readCurrentWorkId(projectRoot)).toBe('20260324-0100-feature-bar');
  });

  it('clears work id when null is passed', async () => {
    const projectRoot = await prepareProjectWorkspace(cliRoot, workspaceName);
    const sduckDir = join(projectRoot, '.sduck');
    await mkdir(sduckDir, { recursive: true });

    const date = new Date('2026-03-24T01:00:00Z');
    await writeCurrentWorkId(projectRoot, '20260324-0100-feature-bar', date);
    await writeCurrentWorkId(projectRoot, null, date);

    expect(await readCurrentWorkId(projectRoot)).toBeNull();
  });
});
