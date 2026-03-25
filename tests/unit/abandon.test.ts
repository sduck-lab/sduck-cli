import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

import { resolveAbandonTarget } from '../../src/core/abandon.js';
import { prepareProjectWorkspace, removeProjectWorkspace } from '../helpers/temp-workspace.js';

const cliRoot = process.cwd();
const workspaceName = 'abandon-unit';

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
    '  approved: false',
    '  approved_at: null',
    'plan:',
    '  approved: false',
    '  approved_at: null',
    'steps:',
    '  total: null',
    '  completed: []',
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

describe('resolveAbandonTarget', () => {
  afterEach(async () => {
    await removeProjectWorkspace(cliRoot, workspaceName);
  });

  it('resolves an IN_PROGRESS task by id', async () => {
    const projectRoot = await prepareProjectWorkspace(cliRoot, workspaceName);
    await setupWorkspaceTask(projectRoot, '20260324-0100-feature-foo', 'IN_PROGRESS', 'foo');

    const result = await resolveAbandonTarget(projectRoot, '20260324-0100-feature-foo');
    expect(result.id).toBe('20260324-0100-feature-foo');
  });

  it('resolves a PENDING_SPEC_APPROVAL task', async () => {
    const projectRoot = await prepareProjectWorkspace(cliRoot, workspaceName);
    await setupWorkspaceTask(
      projectRoot,
      '20260324-0100-feature-bar',
      'PENDING_SPEC_APPROVAL',
      'bar',
    );

    const result = await resolveAbandonTarget(projectRoot, '20260324-0100-feature-bar');
    expect(result.id).toBe('20260324-0100-feature-bar');
  });

  it('rejects a DONE task', async () => {
    const projectRoot = await prepareProjectWorkspace(cliRoot, workspaceName);
    await setupWorkspaceTask(projectRoot, '20260324-0100-feature-baz', 'DONE', 'baz');

    await expect(resolveAbandonTarget(projectRoot, '20260324-0100-feature-baz')).rejects.toThrow(
      'Only active works can be abandoned',
    );
  });

  it('rejects an ABANDONED task', async () => {
    const projectRoot = await prepareProjectWorkspace(cliRoot, workspaceName);
    await setupWorkspaceTask(projectRoot, '20260324-0100-feature-qux', 'ABANDONED', 'qux');

    await expect(resolveAbandonTarget(projectRoot, '20260324-0100-feature-qux')).rejects.toThrow(
      'Only active works can be abandoned',
    );
  });

  it('throws when no work matches', async () => {
    const projectRoot = await prepareProjectWorkspace(cliRoot, workspaceName);

    await expect(resolveAbandonTarget(projectRoot, 'nonexistent')).rejects.toThrow(
      "No work matches 'nonexistent'",
    );
  });
});
