import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

import { resolveUseTarget } from '../../src/core/use.js';
import { prepareProjectWorkspace, removeProjectWorkspace } from '../helpers/temp-workspace.js';

const cliRoot = process.cwd();
const workspaceName = 'use-unit';

function buildMeta(id: string, slug: string): string {
  return [
    `id: ${id}`,
    `slug: ${slug}`,
    `type: feature`,
    `status: IN_PROGRESS`,
    `created_at: 2026-03-24T00:00:00Z`,
    `updated_at: 2026-03-24T00:00:00Z`,
    `branch: null`,
    `base_branch: null`,
    `worktree_path: null`,
  ].join('\n');
}

async function setupWorkspaceTask(projectRoot: string, id: string, slug: string): Promise<void> {
  const taskDir = join(projectRoot, '.sduck', 'sduck-workspace', id);
  await mkdir(taskDir, { recursive: true });
  await writeFile(join(taskDir, 'meta.yml'), buildMeta(id, slug), 'utf8');
}

describe('resolveUseTarget', () => {
  afterEach(async () => {
    await removeProjectWorkspace(cliRoot, workspaceName);
  });

  it('resolves by id exact match', async () => {
    const projectRoot = await prepareProjectWorkspace(cliRoot, workspaceName);
    await setupWorkspaceTask(projectRoot, '20260324-0100-feature-foo', 'foo');

    const result = await resolveUseTarget(projectRoot, '20260324-0100-feature-foo');
    expect(result.id).toBe('20260324-0100-feature-foo');
  });

  it('resolves by slug exact match', async () => {
    const projectRoot = await prepareProjectWorkspace(cliRoot, workspaceName);
    await setupWorkspaceTask(projectRoot, '20260324-0100-feature-bar', 'bar');

    const result = await resolveUseTarget(projectRoot, 'bar');
    expect(result.id).toBe('20260324-0100-feature-bar');
  });

  it('throws on slug ambiguity', async () => {
    const projectRoot = await prepareProjectWorkspace(cliRoot, workspaceName);
    await setupWorkspaceTask(projectRoot, '20260324-0100-feature-dup', 'dup');
    await setupWorkspaceTask(projectRoot, '20260324-0200-feature-dup', 'dup');

    await expect(resolveUseTarget(projectRoot, 'dup')).rejects.toThrow(
      "Multiple works match slug 'dup'",
    );
  });

  it('throws when no work matches', async () => {
    const projectRoot = await prepareProjectWorkspace(cliRoot, workspaceName);

    await expect(resolveUseTarget(projectRoot, 'nonexistent')).rejects.toThrow(
      "No work matches 'nonexistent'",
    );
  });
});
