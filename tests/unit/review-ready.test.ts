import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

import { resolveReviewTarget, runReviewReadyWorkflow } from '../../src/core/review-ready.js';
import { writeCurrentWorkId } from '../../src/core/state.js';
import { prepareProjectWorkspace, removeProjectWorkspace } from '../helpers/temp-workspace.js';

const cliRoot = process.cwd();
const workspaceName = 'review-ready-unit';

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
  await writeFile(join(taskDir, 'spec.md'), '# Spec', 'utf8');
  await writeFile(join(taskDir, 'plan.md'), '## Step 1. Do stuff', 'utf8');
}

describe('resolveReviewTarget', () => {
  afterEach(async () => {
    await removeProjectWorkspace(cliRoot, workspaceName);
  });

  it('rejects a non-IN_PROGRESS task', async () => {
    const projectRoot = await prepareProjectWorkspace(cliRoot, workspaceName);
    await setupWorkspaceTask(projectRoot, '20260324-0100-feature-foo', 'DONE', 'foo');

    await expect(resolveReviewTarget(projectRoot, '20260324-0100-feature-foo')).rejects.toThrow(
      'expected IN_PROGRESS',
    );
  });

  it('falls back to current work when no target is given', async () => {
    const projectRoot = await prepareProjectWorkspace(cliRoot, workspaceName);
    await setupWorkspaceTask(projectRoot, '20260324-0100-feature-bar', 'IN_PROGRESS', 'bar');

    const sduckDir = join(projectRoot, '.sduck');
    await mkdir(sduckDir, { recursive: true });
    await writeCurrentWorkId(projectRoot, '20260324-0100-feature-bar');

    const result = await resolveReviewTarget(projectRoot);
    expect(result.id).toBe('20260324-0100-feature-bar');
  });
});

describe('runReviewReadyWorkflow', () => {
  afterEach(async () => {
    await removeProjectWorkspace(cliRoot, workspaceName);
  });

  it('does not overwrite existing review.md', async () => {
    const projectRoot = await prepareProjectWorkspace(cliRoot, workspaceName);
    const taskId = '20260324-0100-feature-keep';
    await setupWorkspaceTask(projectRoot, taskId, 'IN_PROGRESS', 'keep');

    const reviewPath = join(projectRoot, '.sduck', 'sduck-workspace', taskId, 'review.md');
    await writeFile(reviewPath, '# Custom review content', 'utf8');

    const date = new Date('2026-03-24T02:00:00Z');
    await runReviewReadyWorkflow(projectRoot, taskId, date);

    const content = await readFile(reviewPath, 'utf8');
    expect(content).toBe('# Custom review content');

    // But status should still change
    const metaContent = await readFile(
      join(projectRoot, '.sduck', 'sduck-workspace', taskId, 'meta.yml'),
      'utf8',
    );
    expect(metaContent).toContain('status: REVIEW_READY');
  });
});
