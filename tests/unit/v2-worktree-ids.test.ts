import { execFileSync } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

import { createTempWorkspace, removeTempWorkspace } from '../helpers/temp-workspace.js';

function git(cwd: string, args: string[]): string {
  return execFileSync('git', args, { cwd, encoding: 'utf8' }).trim();
}

async function submitOneDecision(worktree: string, title: string): Promise<void> {
  const { createTask } = await import('../../src/core/v2/task.js');
  const { recordGrillMeStarted } = await import('../../src/core/v2/grill.js');
  const { submitDraft } = await import('../../src/core/v2/draft.js');
  const { confirmBrief } = await import('../../src/core/v2/brief.js');

  const task = createTask(worktree, title);
  recordGrillMeStarted(worktree);
  submitDraft(
    worktree,
    JSON.stringify({
      schemaVersion: 'v2alpha1',
      taskId: task.id,
      decisions: [{ title, kind: 'EXPLICIT', summary: title, confidence: 1 }],
      questions: [],
      evidence: [],
      expectedScope: [],
      avoidScope: [],
    }),
  );
  confirmBrief(worktree);
}

describe('cross-worktree id collision', () => {
  let root: string | null = null;

  afterEach(async () => {
    if (root !== null) await removeTempWorkspace(root);
    root = null;
  });

  it('never hands the same DEC- number to two worktrees branched from the same committed base', async () => {
    root = await createTempWorkspace('v2-worktree-ids-');
    const mainWorktree = join(root, 'main');
    const linkedWorktree = join(root, 'linked');
    await mkdir(mainWorktree, { recursive: true });

    git(mainWorktree, ['init', '-q', '-b', 'main']);
    git(mainWorktree, ['config', 'user.email', 'test@example.com']);
    git(mainWorktree, ['config', 'user.name', 'Test']);

    const { initDecisionWorkspace } = await import('../../src/core/v2/workspace.js');
    const { loadSourceBundle } = await import('../../src/core/v2/source-store.js');

    initDecisionWorkspace(mainWorktree);
    await submitOneDecision(mainWorktree, 'Base decision');
    const baseId = loadSourceBundle(mainWorktree).decisions[0]?.id;
    expect(baseId).toBeDefined();

    // Commit the base so a linked worktree branches from a state that already has DEC- 0001.
    git(mainWorktree, ['add', '-A']);
    git(mainWorktree, ['commit', '-q', '-m', 'base']);
    git(mainWorktree, ['worktree', 'add', '-q', '-b', 'linked-branch', linkedWorktree]);

    // Both worktrees now see the same single committed decision locally, but each has its own
    // independent, uncommitted `.decision/` state from here on -- exactly the collision scenario:
    // without the shared cross-worktree counter, both would compute "local max (1) + 1 = DEC-0002".
    await submitOneDecision(mainWorktree, 'Main worktree decision');
    await submitOneDecision(linkedWorktree, 'Linked worktree decision');

    const mainNewIds = loadSourceBundle(mainWorktree)
      .decisions.map((decision) => decision.id)
      .filter((id) => id !== baseId);
    const linkedNewIds = loadSourceBundle(linkedWorktree)
      .decisions.map((decision) => decision.id)
      .filter((id) => id !== baseId);

    expect(mainNewIds).toHaveLength(1);
    expect(linkedNewIds).toHaveLength(1);
    expect(mainNewIds[0]).not.toBe(linkedNewIds[0]);
  });
});
