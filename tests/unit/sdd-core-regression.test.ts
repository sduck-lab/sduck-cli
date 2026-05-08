import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

import { runDoneWorkflow, loadDoneTargets } from '../../src/core/done.js';
import { initProject } from '../../src/core/init.js';
import { approvePlans, loadPlanApprovalCandidates } from '../../src/core/plan-approve.js';
import { runReviewReadyWorkflow } from '../../src/core/review-ready.js';
import { approveSpecs, loadSpecApprovalCandidates } from '../../src/core/spec-approve.js';
import { startTask } from '../../src/core/start.js';
import { readCurrentWorkId } from '../../src/core/state.js';
import { markStepCompleted } from '../../src/core/step.js';
import { createTempWorkspace, removeTempWorkspace } from '../helpers/temp-workspace.js';

describe('SDD core regression Interface', () => {
  let workspace: string | null = null;

  afterEach(async () => {
    if (workspace !== null) await removeTempWorkspace(workspace);
    workspace = null;
  });

  it('preserves the no-git lifecycle from start through done', async () => {
    workspace = await createTempWorkspace('sdd-core-');
    await initProject({ agents: [], force: false }, workspace);

    const started = await startTask(
      'refactor',
      'architecture-deepening',
      workspace,
      new Date('2026-05-07T04:36:00Z'),
      { noGit: true },
    );

    const taskPath = join(workspace, started.workspacePath);
    const metaPath = join(taskPath, 'meta.yml');
    const specPath = join(taskPath, 'spec.md');
    const planPath = join(taskPath, 'plan.md');
    const agentContextPath = join(taskPath, 'agent-context.json');

    expect(started.status).toBe('PENDING_SPEC_APPROVAL');
    expect(await readCurrentWorkId(workspace)).toBe(started.workspaceId);
    expect(await readFile(planPath, 'utf8')).toBe('');

    const initialMeta = await readFile(metaPath, 'utf8');
    expect(initialMeta).toContain(`id: ${started.workspaceId}`);
    expect(initialMeta).toContain('status: PENDING_SPEC_APPROVAL');
    expect(initialMeta).toContain('branch: null');
    expect(initialMeta).toContain('base_branch: null');
    expect(initialMeta).toContain('worktree_path: null');

    const initialAgentContext = JSON.parse(await readFile(agentContextPath, 'utf8')) as {
      id: string;
      status: string;
      worktreePath: string | null;
    };
    expect(initialAgentContext).toMatchObject({
      id: started.workspaceId,
      status: 'PENDING_SPEC_APPROVAL',
      worktreePath: null,
    });

    const specCandidates = await loadSpecApprovalCandidates(workspace, {});
    expect(specCandidates).toHaveLength(1);
    expect(specCandidates[0]?.id).toBe(started.workspaceId);

    await approveSpecs(workspace, specCandidates, '2026-05-07T04:40:00Z');
    expect(await readFile(metaPath, 'utf8')).toContain('status: SPEC_APPROVED');

    await writeFile(
      planPath,
      [
        '# Plan',
        '',
        '## Step 1. Preserve current Interface',
        '',
        '## Step 2. Validate current Adapter',
      ].join('\n'),
      'utf8',
    );

    const planCandidates = await loadPlanApprovalCandidates(workspace, {});
    expect(planCandidates).toHaveLength(1);
    const planResult = await approvePlans(workspace, planCandidates, '2026-05-07T04:41:00Z');
    expect(planResult.failed).toEqual([]);
    expect(planResult.succeeded[0]).toMatchObject({ steps: 2, taskId: started.workspaceId });

    const firstStep = await markStepCompleted(
      workspace,
      1,
      undefined,
      new Date('2026-05-07T04:42:00Z'),
    );
    expect(firstStep).toMatchObject({
      alreadyCompleted: false,
      completed: [1],
      stepNumber: 1,
      total: 2,
      workId: started.workspaceId,
    });

    await markStepCompleted(workspace, 2, undefined, new Date('2026-05-07T04:43:00Z'));
    expect(await readFile(metaPath, 'utf8')).toContain('  completed: [1, 2]');

    const checkedSpec = (await readFile(specPath, 'utf8')).replaceAll('- [ ]', '- [x]');
    await writeFile(specPath, checkedSpec, 'utf8');

    const reviewReady = await runReviewReadyWorkflow(
      workspace,
      undefined,
      new Date('2026-05-07T04:44:00Z'),
    );
    expect(reviewReady.workId).toBe(started.workspaceId);
    expect(await readFile(join(taskPath, 'review.md'), 'utf8')).toContain(
      `# Review: ${started.workspaceId}`,
    );

    const doneTargets = await loadDoneTargets(workspace, {});
    expect(doneTargets).toHaveLength(1);
    const done = await runDoneWorkflow(workspace, doneTargets, '2026-05-07T04:50:00Z');
    expect(done.failed).toEqual([]);
    expect(done.succeeded[0]).toMatchObject({ taskId: started.workspaceId });

    expect(await readCurrentWorkId(workspace)).toBeNull();
    const doneMeta = await readFile(metaPath, 'utf8');
    expect(doneMeta).toContain('status: DONE');
    expect(doneMeta).toContain('completed_at: 2026-05-07T04:50:00Z');

    const finalAgentContext = JSON.parse(await readFile(agentContextPath, 'utf8')) as {
      status: string;
    };
    expect(finalAgentContext.status).toBe('DONE');
  });
});
