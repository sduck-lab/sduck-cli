import { access, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

import { runReopenCommand } from '../../src/commands/reopen.js';
import { runDoneWorkflow, loadDoneTargets } from '../../src/core/done.js';
import { initProject } from '../../src/core/init.js';
import { approvePlans, loadPlanApprovalCandidates } from '../../src/core/plan-approve.js';
import { runReviewReadyWorkflow } from '../../src/core/review-ready.js';
import { approveSpecs, loadSpecApprovalCandidates } from '../../src/core/spec-approve.js';
import { startTask } from '../../src/core/start.js';
import { readCurrentWorkId } from '../../src/core/state.js';
import { markStepCompleted } from '../../src/core/step.js';
import { updateProject } from '../../src/core/update.js';
import { writeProjectVersion } from '../../src/core/version-file.js';
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
    await access(
      join(
        workspace,
        '.sduck',
        'sduck-assets',
        'agent-rules',
        'skills',
        'sduck-codebase-decisions',
        'SKILL.md',
      ),
    );

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

  it('ignores workspace state so the project root stays the only state owner', async () => {
    workspace = await createTempWorkspace('sdd-gitignore-');
    await initProject({ agents: [], force: false }, workspace);
    await startTask('fix', 'state-owner', workspace, new Date('2026-07-07T11:00:00Z'), {
      noGit: true,
    });

    const gitignore = await readFile(join(workspace, '.gitignore'), 'utf8');
    expect(gitignore).toContain('.sduck-worktrees/');
    expect(gitignore).toContain('.sduck/sduck-state.yml');
    expect(gitignore).toContain('.sduck/sduck-workspace/');
    expect(gitignore).toContain('.sduck/sduck-archive/');

    // Entries must not be duplicated on a second start.
    await startTask('fix', 'state-owner-two', workspace, new Date('2026-07-07T11:05:00Z'), {
      noGit: true,
    });
    const second = await readFile(join(workspace, '.gitignore'), 'utf8');
    expect(second.split('\n').filter((line) => line === '.sduck/sduck-workspace/')).toHaveLength(1);
  });

  it('reports the actual transitioned status when reopening tasks', async () => {
    workspace = await createTempWorkspace('sdd-reopen-');
    await initProject({ agents: [], force: false }, workspace);

    const started = await startTask(
      'fix',
      'reopen-status-output',
      workspace,
      new Date('2026-07-07T10:00:00Z'),
      { noGit: true },
    );

    const taskPath = join(workspace, started.workspacePath);
    const metaPath = join(taskPath, 'meta.yml');
    const specPath = join(taskPath, 'spec.md');
    const planPath = join(taskPath, 'plan.md');

    await approveSpecs(workspace, await loadSpecApprovalCandidates(workspace, {}), '2026-07-07T10:01:00Z');
    await writeFile(planPath, ['# Plan', '', '## Step 1. Fix it'].join('\n'), 'utf8');
    await approvePlans(workspace, await loadPlanApprovalCandidates(workspace, {}), '2026-07-07T10:02:00Z');
    await markStepCompleted(workspace, 1, undefined, new Date('2026-07-07T10:03:00Z'));
    const checkedSpec = (await readFile(specPath, 'utf8')).replaceAll('- [ ]', '- [x]');
    await writeFile(specPath, checkedSpec, 'utf8');
    await runReviewReadyWorkflow(workspace, undefined, new Date('2026-07-07T10:04:00Z'));

    // REVIEW_READY → reopen transitions to IN_PROGRESS; output must match the file.
    const reopenFromReview = await runReopenCommand({}, workspace);
    expect(reopenFromReview.exitCode).toBe(0);
    expect(reopenFromReview.stdout).toContain('IN_PROGRESS');
    expect(reopenFromReview.stdout).not.toContain('PENDING_SPEC_APPROVAL');
    expect(await readFile(metaPath, 'utf8')).toContain('status: IN_PROGRESS');

    // Drive the task to DONE, then reopen → PENDING_SPEC_APPROVAL.
    await runReviewReadyWorkflow(workspace, undefined, new Date('2026-07-07T10:05:00Z'));
    await runDoneWorkflow(workspace, await loadDoneTargets(workspace, {}), '2026-07-07T10:06:00Z');
    expect(await readFile(metaPath, 'utf8')).toContain('status: DONE');

    const reopenFromDone = await runReopenCommand({}, workspace);
    expect(reopenFromDone.exitCode).toBe(0);
    expect(reopenFromDone.stdout).toContain('PENDING_SPEC_APPROVAL');
    expect(await readFile(metaPath, 'utf8')).toContain('status: PENDING_SPEC_APPROVAL');
  });

  it('refreshes existing generated agent rules during update', async () => {
    workspace = await createTempWorkspace('sdd-update-');
    await initProject({ agents: ['claude-code'], force: false }, workspace);

    const claudeRulesPath = join(workspace, 'CLAUDE.md');
    const staleRules = (await readFile(claudeRulesPath, 'utf8'))
      .replaceAll('codebase-decisions', 'legacy-decisions')
      .replaceAll(
        '.sduck/sduck-assets/agent-rules/skills/codebase-decisions/SKILL.md',
        '.sduck/sduck-assets/agent-rules/skills/legacy-decisions/SKILL.md',
      );

    await writeFile(claudeRulesPath, staleRules, 'utf8');
    await writeProjectVersion(workspace, '0.0.0');

    const result = await updateProject({ dryRun: false }, workspace);

    expect(result.didChange).toBe(true);
    const refreshedRules = await readFile(claudeRulesPath, 'utf8');
    expect(refreshedRules).toContain('sduck-codebase-decisions');
    expect(refreshedRules).toContain(
      '.sduck/sduck-assets/agent-rules/skills/sduck-codebase-decisions/SKILL.md',
    );
    expect(refreshedRules).toContain('Primary workflow: v2 `.decision` decision briefing');
    expect(refreshedRules).toContain('Legacy SDD gated implementation rules');
  });

  it('writes OpenCode rules to AGENTS.md instead of AGENT.md', async () => {
    workspace = await createTempWorkspace('sdd-opencode-');
    await initProject({ agents: ['opencode'], force: false }, workspace);

    const opencodeRules = await readFile(join(workspace, 'AGENTS.md'), 'utf8');
    expect(opencodeRules).toContain('<!-- sduck:begin -->');
    expect(opencodeRules).toContain('Selected agents: OpenCode');
    await expect(access(join(workspace, 'AGENT.md'))).rejects.toThrow();
  });

  it('separates Codex and OpenCode root rule files', async () => {
    workspace = await createTempWorkspace('sdd-codex-opencode-');
    await initProject({ agents: ['codex', 'opencode'], force: false }, workspace);

    const codexRules = await readFile(join(workspace, 'AGENT.md'), 'utf8');
    const opencodeRules = await readFile(join(workspace, 'AGENTS.md'), 'utf8');

    expect(codexRules).toContain('<!-- sduck:begin -->');
    expect(codexRules).toContain('Selected agents: Codex');
    expect(codexRules).toContain('Codex Instructions');
    expect(codexRules).not.toContain('OpenCode Instructions');

    expect(opencodeRules).toContain('<!-- sduck:begin -->');
    expect(opencodeRules).toContain('Selected agents: OpenCode');
    expect(opencodeRules).toContain('OpenCode Instructions');
    expect(opencodeRules).not.toContain('Codex Instructions');
  });

  it('preserves AGENTS.md user content when force-refreshing OpenCode rules', async () => {
    workspace = await createTempWorkspace('sdd-opencode-preserve-');
    const agentsPath = join(workspace, 'AGENTS.md');
    await writeFile(
      agentsPath,
      [
        '# Project Agent Notes',
        '',
        'Keep this user-authored OpenCode guidance.',
        '',
        '<!-- sduck:begin -->',
        '# stale managed rules',
        '',
        'Selected agents: Legacy OpenCode',
        '',
        'Stale OpenCode Instructions',
        '<!-- sduck:end -->',
        '',
        'Keep this footer too.',
      ].join('\n'),
      'utf8',
    );

    await initProject({ agents: ['opencode'], force: true }, workspace);

    const opencodeRules = await readFile(agentsPath, 'utf8');
    expect(opencodeRules).toContain('Keep this user-authored OpenCode guidance.');
    expect(opencodeRules).toContain('Keep this footer too.');
    expect(opencodeRules).toContain('<!-- sduck:begin -->');
    expect(opencodeRules).toContain('Selected agents: OpenCode');
    expect(opencodeRules).toContain('OpenCode Instructions');
    expect(opencodeRules).not.toContain('Selected agents: Legacy OpenCode');
    expect(opencodeRules).not.toContain('Stale OpenCode Instructions');
  });
});
