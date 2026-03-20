import { mkdir, readdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

import { getFsEntryKind } from '../../src/core/fs.js';
import { runCli } from '../helpers/run-cli.js';
import { prepareProjectWorkspace, removeProjectWorkspace } from '../helpers/temp-workspace.js';

describe('sduck archive', () => {
  const cliRoot = process.cwd();
  let tempWorkspace = '';
  const workspaceName = 'archive-e2e';

  afterEach(async () => {
    await removeProjectWorkspace(cliRoot, workspaceName);
    tempWorkspace = '';
  });

  async function initRepo(): Promise<void> {
    await runCli(['init'], { cliRoot, cwd: tempWorkspace });
  }

  async function createDoneTask(id: string, completedAt: string): Promise<void> {
    const taskDir = join(tempWorkspace, '.sduck', 'sduck-workspace', id);

    await mkdir(taskDir, { recursive: true });
    await writeFile(
      join(taskDir, 'meta.yml'),
      [
        `id: ${id}`,
        'type: feature',
        `slug: ${id.split('-').slice(2).join('-')}`,
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
    await writeFile(join(taskDir, 'spec.md'), '# spec\n\n- [x] done\n', 'utf8');
    await writeFile(join(taskDir, 'plan.md'), '# Plan\n\n## Step 1. Do it\n', 'utf8');
  }

  it('archives DONE tasks into monthly directories', async () => {
    tempWorkspace = await prepareProjectWorkspace(cliRoot, workspaceName);
    await initRepo();
    await createDoneTask('20260318-0001-feature-alpha', '2026-03-18T10:00:00Z');
    await createDoneTask('20260319-0002-feature-beta', '2026-03-19T10:00:00Z');

    const result = await runCli(['archive'], { cliRoot, cwd: tempWorkspace });

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('archived');
    expect(result.stdout).toContain('2026-03');

    const archiveMonth = join(tempWorkspace, '.sduck', 'sduck-archive', '2026-03');

    expect(await getFsEntryKind(archiveMonth)).toBe('directory');

    const archived = await readdir(archiveMonth);

    expect(archived).toContain('20260318-0001-feature-alpha');
    expect(archived).toContain('20260319-0002-feature-beta');

    const wsEntries = await readdir(join(tempWorkspace, '.sduck', 'sduck-workspace'));

    expect(wsEntries).not.toContain('20260318-0001-feature-alpha');
    expect(wsEntries).not.toContain('20260319-0002-feature-beta');
  });

  it('prints a message when there are no DONE tasks', async () => {
    tempWorkspace = await prepareProjectWorkspace(cliRoot, workspaceName);
    await initRepo();

    const result = await runCli(['archive'], { cliRoot, cwd: tempWorkspace });

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('아카이브 대상이 없습니다');
  });

  it('keeps the most recent N tasks with --keep', async () => {
    tempWorkspace = await prepareProjectWorkspace(cliRoot, workspaceName);
    await initRepo();
    await createDoneTask('20260301-0001-feature-first', '2026-03-01T10:00:00Z');
    await createDoneTask('20260310-0002-feature-second', '2026-03-10T10:00:00Z');
    await createDoneTask('20260319-0003-feature-third', '2026-03-19T10:00:00Z');

    const result = await runCli(['archive', '--keep', '1'], { cliRoot, cwd: tempWorkspace });

    expect(result.exitCode).toBe(0);

    const wsEntries = await readdir(join(tempWorkspace, '.sduck', 'sduck-workspace'));

    expect(wsEntries).toContain('20260319-0003-feature-third');
    expect(wsEntries).not.toContain('20260301-0001-feature-first');
    expect(wsEntries).not.toContain('20260310-0002-feature-second');

    const archiveEntries = await readdir(join(tempWorkspace, '.sduck', 'sduck-archive', '2026-03'));

    expect(archiveEntries).toContain('20260301-0001-feature-first');
    expect(archiveEntries).toContain('20260310-0002-feature-second');
  });

  it('skips tasks that are already archived', async () => {
    tempWorkspace = await prepareProjectWorkspace(cliRoot, workspaceName);
    await initRepo();
    await createDoneTask('20260318-0001-feature-dup', '2026-03-18T10:00:00Z');

    const existingArchive = join(
      tempWorkspace,
      '.sduck',
      'sduck-archive',
      '2026-03',
      '20260318-0001-feature-dup',
    );

    await mkdir(existingArchive, { recursive: true });
    await writeFile(join(existingArchive, 'meta.yml'), 'id: old', 'utf8');

    const result = await runCli(['archive'], { cliRoot, cwd: tempWorkspace });

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('skipped');

    const oldMeta = await import('node:fs/promises').then((fs) =>
      fs.readFile(join(existingArchive, 'meta.yml'), 'utf8'),
    );

    expect(oldMeta).toBe('id: old');
  });
});
