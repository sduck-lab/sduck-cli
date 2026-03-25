import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

import { resolveCleanCandidates } from '../../src/core/clean.js';
import { prepareProjectWorkspace, removeProjectWorkspace } from '../helpers/temp-workspace.js';

const cliRoot = process.cwd();
const workspaceName = 'clean-unit';

function buildMeta(id: string, status: string, slug: string): string {
  return [
    `id: ${id}`,
    `slug: ${slug}`,
    `type: feature`,
    `status: ${status}`,
    `created_at: 2026-03-24T00:00:00Z`,
    `updated_at: 2026-03-24T00:00:00Z`,
    `branch: null`,
    `base_branch: null`,
    `worktree_path: null`,
    'spec:',
    '  approved: true',
    '  approved_at: 2026-03-24T00:00:00Z',
    'plan:',
    '  approved: true',
    '  approved_at: 2026-03-24T00:00:00Z',
    'steps:',
    '  total: 1',
    '  completed: [1]',
  ].join('\n');
}

async function setupWorkspaceTask(
  projectRoot: string,
  id: string,
  status: string,
  slug: string,
): Promise<void> {
  const taskDir = join(projectRoot, '.sduck', 'sduck-workspace', id);
  await mkdir(taskDir, { recursive: true });
  await writeFile(join(taskDir, 'meta.yml'), buildMeta(id, status, slug), 'utf8');
}

describe('resolveCleanCandidates', () => {
  afterEach(async () => {
    await removeProjectWorkspace(cliRoot, workspaceName);
  });

  it('returns only DONE and ABANDONED tasks when no target specified', async () => {
    const projectRoot = await prepareProjectWorkspace(cliRoot, workspaceName);
    await setupWorkspaceTask(projectRoot, '20260324-0100-feature-done', 'DONE', 'done');
    await setupWorkspaceTask(
      projectRoot,
      '20260324-0200-feature-abandoned',
      'ABANDONED',
      'abandoned',
    );
    await setupWorkspaceTask(projectRoot, '20260324-0300-feature-active', 'IN_PROGRESS', 'active');

    const candidates = await resolveCleanCandidates(projectRoot);

    const ids = candidates.map((c) => c.id);
    expect(ids).toContain('20260324-0100-feature-done');
    expect(ids).toContain('20260324-0200-feature-abandoned');
    expect(ids).not.toContain('20260324-0300-feature-active');
  });

  it('excludes IN_PROGRESS tasks from clean candidates', async () => {
    const projectRoot = await prepareProjectWorkspace(cliRoot, workspaceName);
    await setupWorkspaceTask(projectRoot, '20260324-0100-feature-wip', 'IN_PROGRESS', 'wip');

    const candidates = await resolveCleanCandidates(projectRoot);
    expect(candidates).toEqual([]);
  });

  it('resolves a specific target by id', async () => {
    const projectRoot = await prepareProjectWorkspace(cliRoot, workspaceName);
    await setupWorkspaceTask(projectRoot, '20260324-0100-feature-target', 'DONE', 'target');

    const candidates = await resolveCleanCandidates(projectRoot, '20260324-0100-feature-target');
    expect(candidates).toHaveLength(1);
    expect(candidates[0]?.id).toBe('20260324-0100-feature-target');
  });

  it('throws when target is IN_PROGRESS', async () => {
    const projectRoot = await prepareProjectWorkspace(cliRoot, workspaceName);
    await setupWorkspaceTask(projectRoot, '20260324-0100-feature-active', 'IN_PROGRESS', 'active');

    await expect(
      resolveCleanCandidates(projectRoot, '20260324-0100-feature-active'),
    ).rejects.toThrow('Only DONE or ABANDONED works can be cleaned');
  });
});
