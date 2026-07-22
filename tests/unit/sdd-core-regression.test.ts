import { execFileSync } from 'node:child_process';
import { access, mkdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { isAbsolute, join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

import { runReopenCommand } from '../../src/commands/reopen.js';
import { SUPPORTED_AGENTS, type SupportedAgentId } from '../../src/core/agent-rules.js';
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
import { runCli } from '../helpers/run-cli.js';
import { createTempWorkspace, removeTempWorkspace } from '../helpers/temp-workspace.js';

const TASK_EVAL_LABELS = [
  'spec alignment',
  'plan alignment',
  'implementation quality',
  'test completeness',
  'documentation quality',
  'maintainability',
] as const;

const CANONICAL_TEMPLATE_SEQUENCE =
  '`sduck work` → `sduck context` → `sduck grill complete --reason "..."` → `sduck submit --stdin` → `sduck ask`/`sduck answer` → `sduck brief`/`sduck confirm` → implementation activity → `sduck trace` → `sduck evaluate` → `sduck remember`/`sduck recall` → `sduck close`';

const USER_INTERACTION_MODEL_MARKER = '## User-facing interaction model';

const INTERNAL_COMMANDS_MARKER =
  'Treat `sduck work`, `sduck context`, `sduck grill complete`, `sduck submit`, `sduck brief`, `sduck confirm`, `sduck trace`, `sduck evaluate`, and `sduck remember` as internal agent operations';

const INSTALLED_AGENT_RULE_PATHS: Record<SupportedAgentId, string> = {
  'claude-code': 'CLAUDE.md',
  codex: 'AGENTS.md',
  opencode: 'AGENTS.md',
  'gemini-cli': 'GEMINI.md',
  cursor: join('.cursor', 'rules', 'sduck-core.mdc'),
  antigravity: join('.agents', 'rules', 'sduck-core.md'),
};

function expectInOrder(content: string, labels: readonly string[]): void {
  let cursor = -1;
  for (const label of labels) {
    const next = content.indexOf(label, cursor + 1);
    expect(next, label).toBeGreaterThan(cursor);
    cursor = next;
  }
}

async function writeReviewEvidence(taskPath: string, workId: string): Promise<void> {
  await writeFile(
    join(taskPath, 'review.md'),
    [
      `# Review: ${workId}`,
      '',
      '## 변경 요약',
      '',
      '- Public workflow behavior implemented and verified.',
      '',
      '## 테스트 결과',
      '',
      '- `npm run test:unit` passed with exit 0.',
      '',
      '## 리뷰 체크리스트',
      '',
      '- [x] 코드 품질 확인',
      '- [x] 테스트 통과 확인',
      '- [x] 문서 업데이트 확인',
      '',
      '## Task evaluation',
      '',
      ...TASK_EVAL_LABELS.map((label) => `- ${label}: 5 — Verified by the unit workflow.`),
      '',
    ].join('\n'),
  );
}

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
    await access(
      join(
        workspace,
        '.sduck',
        'sduck-assets',
        'agent-rules',
        'skills',
        'sduck-retrospective-capture',
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
    await writeReviewEvidence(taskPath, started.workspaceId);

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

    await approveSpecs(
      workspace,
      await loadSpecApprovalCandidates(workspace, {}),
      '2026-07-07T10:01:00Z',
    );
    await writeFile(planPath, ['# Plan', '', '## Step 1. Fix it'].join('\n'), 'utf8');
    await approvePlans(
      workspace,
      await loadPlanApprovalCandidates(workspace, {}),
      '2026-07-07T10:02:00Z',
    );
    await markStepCompleted(workspace, 1, undefined, new Date('2026-07-07T10:03:00Z'));
    const checkedSpec = (await readFile(specPath, 'utf8')).replaceAll('- [ ]', '- [x]');
    await writeFile(specPath, checkedSpec, 'utf8');
    await runReviewReadyWorkflow(workspace, undefined, new Date('2026-07-07T10:04:00Z'));
    await writeReviewEvidence(taskPath, started.workspaceId);

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
    expect(refreshedRules).toContain('sduck-retrospective-capture');
    expect(refreshedRules).toContain(
      '.sduck/sduck-assets/agent-rules/skills/sduck-codebase-decisions/SKILL.md',
    );
    expect(refreshedRules).toContain(
      '.sduck/sduck-assets/agent-rules/skills/sduck-retrospective-capture/SKILL.md',
    );
    expect(refreshedRules).toContain('Primary workflow: v2 `.decision` decision briefing');
    expect(refreshedRules).toContain(
      'work -> context -> grill complete -> submit -> ask/answer -> brief/confirm',
    );
    expect(refreshedRules).toContain('Legacy SDD gated implementation rules');
    expect(refreshedRules).toContain(USER_INTERACTION_MODEL_MARKER);
    expect(refreshedRules).toContain(INTERNAL_COMMANDS_MARKER);
  });

  it('installs every supported agent rule and decision inventory skill with the canonical v2 gate sequence', async () => {
    for (const agent of SUPPORTED_AGENTS) {
      workspace = await createTempWorkspace(`sdd-agent-${agent.id}-`);
      await initProject({ agents: [agent.id], force: false }, workspace);

      const installedRulePath = INSTALLED_AGENT_RULE_PATHS[agent.id];
      const installedRule = await readFile(join(workspace, installedRulePath), 'utf8');
      expect(installedRule, agent.id).toContain(CANONICAL_TEMPLATE_SEQUENCE);
      expect(installedRule, agent.id).toContain(USER_INTERACTION_MODEL_MARKER);
      expect(installedRule, agent.id).toContain(INTERNAL_COMMANDS_MARKER);
      expect(installedRule, agent.id).toContain(
        'Users normally should not be asked to run lifecycle commands themselves.',
      );
      expect(installedRule, agent.id).toContain('Implement this direction?');
      expect(installedRule, agent.id).toContain(
        'New policy-required tasks must record `sduck grill complete --reason "..."` before `submit` or `confirm`, including small work.',
      );
      expect(installedRule, agent.id).toContain('Installed rules are canonical English');

      const installedSkill = await readFile(
        join(
          workspace,
          '.sduck',
          'sduck-assets',
          'agent-rules',
          'skills',
          'sduck-codebase-decisions',
          'SKILL.md',
        ),
        'utf8',
      );
      expectInOrder(installedSkill, [
        'sduck work "Codebase decision inventory"',
        'sduck context',
        'sduck grill complete --reason',
        'sduck context add "src/**"',
        'sduck submit --stdin < draft.md',
        'sduck ask',
        'sduck answer QUESTION-1 --option 1',
        'sduck brief',
        'sduck confirm',
        'sduck trace',
        'sduck evaluate --check',
        'sduck remember',
        'sduck recall "architecture decisions"',
        'sduck close',
      ]);
      expect(installedSkill, agent.id).toContain(
        'Run `sduck remember` only after the brief has been confirmed and the implementation trace has been recorded and evaluated.',
      );

      const retrospectiveSkill = await readFile(
        join(
          workspace,
          '.sduck',
          'sduck-assets',
          'agent-rules',
          'skills',
          'sduck-retrospective-capture',
          'SKILL.md',
        ),
        'utf8',
      );
      expect(retrospectiveSkill, agent.id).toContain('name: sduck-retrospective-capture');
      expectInOrder(retrospectiveSkill, [
        'sduck work "Retrospective decision capture"',
        'sduck context',
        'sduck grill complete --reason',
        'sduck submit --stdin < draft.md',
        'sduck brief',
        'sduck confirm',
        'sduck trace --base <base>',
        'sduck evaluate --check "retrospective review=completed" --limitation "No automated checks were run"',
        'sduck remember',
        'sduck close',
      ]);
      expect(retrospectiveSkill, agent.id).toContain(
        'Do not ask users to paste or upload transcripts.',
      );
      expect(retrospectiveSkill, agent.id).toContain(
        'overrides the confirm baseline and records changed files, not proof of rationale',
      );
      expect(retrospectiveSkill, agent.id).toContain('an active LLM handoff alone is not enough');
      expect(retrospectiveSkill, agent.id).toContain(
        'Evaluation records checks performed and limitations; it does not run commands.',
      );

      if (agent.id === 'claude-code') {
        await access(join(workspace, '.claude', 'skills', 'sduck-codebase-decisions.md'));
        await access(join(workspace, '.claude', 'skills', 'sduck-retrospective-capture.md'));
      }

      await removeTempWorkspace(workspace);
      workspace = null;
    }

    const root = process.cwd();
    const core = await readFile(join(root, '.sduck/sduck-assets/agent-rules/core.md'), 'utf8');
    expect(core).toContain(
      'work -> context -> grill complete -> submit -> ask/answer -> brief/confirm -> implementation activity -> trace -> evaluate -> remember/recall -> close',
    );
    expect(core).toContain(USER_INTERACTION_MODEL_MARKER);
    expect(core).toContain(INTERNAL_COMMANDS_MARKER);
    expect(core).toContain('sduck-retrospective-capture');

    const agents = await readFile(join(root, 'AGENTS.md'), 'utf8');
    const claude = await readFile(join(root, 'CLAUDE.md'), 'utf8');
    expect(agents).toContain(USER_INTERACTION_MODEL_MARKER);
    expect(agents).toContain(INTERNAL_COMMANDS_MARKER);
    expect(claude).toContain(USER_INTERACTION_MODEL_MARKER);
    expect(claude).toContain(INTERNAL_COMMANDS_MARKER);
    for (const command of [
      'sduck start',
      'sduck fast-track',
      'sduck spec approve',
      'sduck plan approve',
      'sduck step done',
      'sduck review ready',
      'sduck done',
      'sduck use',
      'sduck implement',
      'sduck clean',
      'sduck reopen',
      'sduck archive',
      'sduck update',
      'sduck abandon <target>',
    ]) {
      expect(core).toContain(command);
    }
  });

  it('documents corrected Phase 3 storage, locale, and malformed-source facts', async () => {
    const root = process.cwd();
    const readme = await readFile(join(root, 'README.md'), 'utf8');
    const readmeKo = await readFile(join(root, 'README.ko.md'), 'utf8');
    for (const content of [readme, readmeKo]) {
      expect(content).toContain('.decision/workspace.lock/');
      expect(content).toContain('.decision/exports/graphify/');
      expect(content).toContain('.decision/.commit-*.json');
      expect(content).toContain('%APPDATA%\\\\sduck\\\\config.json');
      expect(content).toContain('~/AppData/Roaming/sduck/config.json');
      expect(content).not.toContain('.decision/locks/');
      expect(content).not.toContain('.decision/exports/graph/');
    }
    expect(readme).toContain(
      '`sduck work` automatically records the grill start; agents review context and converse before `sduck grill complete --reason "..."`.',
    );
    expect(readme).toContain('Most users interact with sduck through their coding agent');
    expect(readme).toContain('ask “Implement this direction?”');
    expect(readmeKo).toContain(
      '대부분의 사용자는 lifecycle command를 직접 실행하기보다 coding agent를 통해 sduck을 사용합니다.',
    );
    expect(readmeKo).toContain('“이 방향으로 구현할까요?”');
    expect(readmeKo).toContain(
      '`sduck work`가 grill start를 자동 기록합니다. agent는 context를 검토하고 대화한 뒤 `sduck grill complete --reason "..."`를 기록합니다.',
    );

    const useCases = await readFile(join(root, 'docs/use-cases.md'), 'utf8');
    expect(useCases).toContain('malformed canonical source는 수동으로 수정한다');
    expect(useCases).toContain('`sduck doctor --repair`는 malformed source를 자동 수정하지 않는다');
    expect(useCases).toContain('Git은 빈 디렉터리를 추적하지 않는다');
    expect(useCases).toContain(
      '`.decision/policy.json`은 init 직후 추적 대상이고, canonical 결정 문서는 generated content가 생긴 뒤 add/commit할 때 추적된다',
    );
    expect(useCases).not.toContain('"Decision workspace is busy"');

    const pilot = await readFile(join(root, 'docs/pilot-evaluation.md'), 'utf8');
    expect(pilot).toContain('실행한 command, exit status, 분류한 failure reason');
    expect(pilot).not.toContain('CLI 실패 코드');
  });

  it('writes OpenCode rules to AGENTS.md instead of AGENT.md', async () => {
    workspace = await createTempWorkspace('sdd-opencode-');
    await initProject({ agents: ['opencode'], force: false }, workspace);

    const opencodeRules = await readFile(join(workspace, 'AGENTS.md'), 'utf8');
    expect(opencodeRules).toContain('<!-- sduck:begin -->');
    expect(opencodeRules).toContain('Selected agents: OpenCode');
    await expect(access(join(workspace, 'AGENT.md'))).rejects.toThrow();
  });

  it('merges Codex and OpenCode rules into the official AGENTS.md file', async () => {
    workspace = await createTempWorkspace('sdd-codex-opencode-');
    await initProject({ agents: ['codex', 'opencode'], force: false }, workspace);

    const rules = await readFile(join(workspace, 'AGENTS.md'), 'utf8');

    expect(rules).toContain('<!-- sduck:begin -->');
    expect(rules).toContain('Selected agents: Codex, OpenCode');
    expect(rules).toContain('Codex Instructions');
    expect(rules).toContain('OpenCode Instructions');
    expect(rules).toContain('New policy-required tasks must record `sduck grill complete');
    expect(rules).toContain('Installed rules are canonical English');
    await expect(access(join(workspace, 'AGENT.md'))).rejects.toThrow();
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

  it('scopes the advisory Claude hook to current_work_id and allows completion evidence edits', async () => {
    workspace = await createTempWorkspace('sdd-hook-current-');
    const root = workspace;
    await initProject({ agents: ['claude-code'], force: false }, root);
    const workspaceRoot = join(root, '.sduck', 'sduck-workspace');
    const currentId = '20260710-1000-fix-current';
    const otherId = '20260710-1100-fix-other';
    await mkdir(join(workspaceRoot, currentId), { recursive: true });
    await mkdir(join(workspaceRoot, otherId), { recursive: true });
    await writeFile(
      join(root, '.sduck', 'sduck-state.yml'),
      `current_work_id: ${currentId}\nupdated_at: 2026-07-10T10:00:00Z\n`,
    );
    await writeFile(join(workspaceRoot, currentId, 'meta.yml'), 'status: IN_PROGRESS\n');
    await writeFile(join(workspaceRoot, otherId, 'meta.yml'), 'status: REVIEW_READY\n');
    const hook = join(root, '.claude', 'hooks', 'sdd-guard.sh');

    expect(() =>
      execFileSync('bash', [hook], {
        cwd: root,
        input: JSON.stringify({ cwd: root, tool_input: { file_path: join(root, 'src', 'x.ts') } }),
      }),
    ).not.toThrow();
    expect(() =>
      execFileSync('bash', [hook], {
        cwd: root,
        input: JSON.stringify({
          cwd: root,
          tool_input: {
            file_path: join(workspaceRoot, currentId, 'spec.md'),
            old_string: '- [ ] verified',
            new_string: '- [x] verified',
          },
        }),
      }),
    ).not.toThrow();
  });

  it('installs a safe executable Git post-commit marker hook', async () => {
    workspace = await createTempWorkspace('sdd-post-commit-');
    const root = workspace;
    execFileSync('git', ['init'], { cwd: root });
    execFileSync('git', ['config', 'user.name', 'Team Member'], { cwd: root });
    execFileSync('git', ['config', 'user.email', 'team@example.test'], { cwd: root });

    const assetHook = await readFile(
      join(
        process.cwd(),
        '.sduck',
        'sduck-assets',
        'agent-rules',
        'hooks',
        'sduck-retrospective-post-commit.sh',
      ),
      'utf8',
    );
    expect(assetHook).toContain('sduck-retrospective-pending.json');
    expect(assetHook).not.toMatch(/(^|[;&|])\s*sduck\s/);
    expect(assetHook).not.toMatch(/\b(curl|wget|nc|ssh|node|python|osascript)\b/);
    expect(assetHook).not.toMatch(/\b(LLM|openai|anthropic|claude|gemini)\b/i);

    const enabledInit = await initProject({ agents: [], force: false }, root);
    expect(enabledInit.summary.created).not.toContain('git-hooks/post-commit');
    expect(enabledInit.summary.warnings).not.toContain(
      expect.stringContaining('post-commit hook install'),
    );

    await mkdir(join(root, '.decision'), { recursive: true });
    await writeFile(
      join(root, '.decision', 'policy.json'),
      `${JSON.stringify({ schemaVersion: 'v2alpha1', requireGrillMe: true, workflowEnabled: false }, null, 2)}\n`,
    );
    const init = await initProject({ agents: [], force: false }, root);
    expect(init.summary.created).toContain('git-hooks/post-commit');
    const hookPath = execFileSync('git', ['rev-parse', '--git-path', 'hooks/post-commit'], {
      cwd: root,
      encoding: 'utf8',
    }).trim();
    const hookAbsolutePath = isAbsolute(hookPath) ? hookPath : join(root, hookPath);
    expect((await stat(hookAbsolutePath)).mode & 0o111).not.toBe(0);
    expect(await readFile(hookAbsolutePath, 'utf8')).toContain('sduck-retrospective-pending.json');

    await writeFile(
      join(root, '.decision', 'policy.json'),
      `${JSON.stringify({ schemaVersion: 'v2alpha1', requireGrillMe: true, workflowEnabled: true }, null, 2)}\n`,
    );
    await writeFile(join(root, 'README.md'), '# temp\n');
    execFileSync('git', ['add', 'README.md'], { cwd: root });
    execFileSync('git', ['commit', '-m', 'initial'], { cwd: root });
    const markerPath = execFileSync(
      'git',
      ['rev-parse', '--git-path', 'sduck-retrospective-pending.json'],
      { cwd: root, encoding: 'utf8' },
    ).trim();
    const markerAbsolutePath = isAbsolute(markerPath) ? markerPath : join(root, markerPath);
    await expect(access(markerAbsolutePath)).rejects.toThrow();

    await writeFile(
      join(root, '.decision', 'policy.json'),
      `${JSON.stringify({ schemaVersion: 'v2alpha1', requireGrillMe: true, workflowEnabled: false }, null, 2)}\n`,
    );
    await writeFile(join(root, 'README.md'), '# temp 2\n');
    execFileSync('git', ['add', 'README.md'], { cwd: root });
    execFileSync('git', ['commit', '-m', 'change'], { cwd: root });
    const marker = JSON.parse(await readFile(markerAbsolutePath, 'utf8')) as {
      commitSha: string;
      parentSha: string | null;
      createdAt: string;
    };
    expect(marker.commitSha).toMatch(/^[0-9a-f]{40}$/);
    expect(marker.parentSha).toMatch(/^[0-9a-f]{40}$/);
    expect(marker.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);

    await writeFile(hookAbsolutePath, '#!/bin/sh\nexit 0\n');
    const safeRerun = await initProject({ agents: [], force: false }, root);
    expect(safeRerun.summary.kept).toContain('git-hooks/post-commit');
    expect(await readFile(hookAbsolutePath, 'utf8')).toBe('#!/bin/sh\nexit 0\n');

    const forceRerun = await initProject({ agents: [], force: true }, root);
    expect(forceRerun.summary.kept).toContain('git-hooks/post-commit');
    expect(await readFile(hookAbsolutePath, 'utf8')).toBe('#!/bin/sh\nexit 0\n');

    await rm(hookAbsolutePath, { recursive: true, force: true });
    await mkdir(hookAbsolutePath, { recursive: true });
    const nonFileRerun = await initProject({ agents: [], force: true }, root);
    expect(nonFileRerun.summary.kept).toContain('git-hooks/post-commit');
    expect(nonFileRerun.summary.structuredWarnings).toEqual(
      expect.arrayContaining([expect.objectContaining({ code: 'kept-existing-non-file-hook' })]),
    );
  });

  it('captures the real installed post-commit hook marker through the CLI retrospective path', async () => {
    workspace = await createTempWorkspace('sdd-post-commit-capture-');
    const root = workspace;
    const cliRoot = process.cwd();
    execFileSync('git', ['init'], { cwd: root });
    execFileSync('git', ['config', 'user.name', 'Team Member'], { cwd: root });
    execFileSync('git', ['config', 'user.email', 'team@example.test'], { cwd: root });

    const init = await runCli(['init'], { cliRoot, cwd: root });
    expect(init.exitCode).toBe(0);
    const disableForHook = await runCli(['workflow', 'disable'], { cliRoot, cwd: root });
    expect(disableForHook.exitCode).toBe(0);
    const hookPath = execFileSync('git', ['rev-parse', '--git-path', 'hooks/post-commit'], {
      cwd: root,
      encoding: 'utf8',
    }).trim();
    const hookAbsolutePath = isAbsolute(hookPath) ? hookPath : join(root, hookPath);
    expect(await readFile(hookAbsolutePath, 'utf8')).toContain('sduck-retrospective-pending.json');

    await writeFile(join(root, 'tracked.ts'), 'export const tracked = 1;\n');
    execFileSync('git', ['add', 'tracked.ts'], { cwd: root });
    execFileSync('git', ['commit', '-m', 'baseline'], { cwd: root });
    await writeFile(join(root, 'tracked.ts'), 'export const tracked = 2;\n');
    execFileSync('git', ['add', 'tracked.ts'], { cwd: root });
    execFileSync('git', ['commit', '-m', 'change'], { cwd: root });

    const markerPath = execFileSync(
      'git',
      ['rev-parse', '--git-path', 'sduck-retrospective-pending.json'],
      { cwd: root, encoding: 'utf8' },
    ).trim();
    const markerAbsolutePath = isAbsolute(markerPath) ? markerPath : join(root, markerPath);
    const marker = JSON.parse(await readFile(markerAbsolutePath, 'utf8')) as {
      commitSha: string;
      parentSha: string | null;
      createdAt: string;
    };
    expect(marker.commitSha).toMatch(/^[0-9a-f]{40}$/);
    expect(marker.parentSha).toMatch(/^[0-9a-f]{40}$/);
    expect(marker.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);

    const draft = JSON.stringify({
      schemaVersion: 'v2alpha1',
      expectedScope: ['tracked.ts'],
      implementationPlan: ['The commit from the installed post-commit hook already landed.'],
      verificationPlan: ['Run retrospective capture against the installed hook marker.'],
      decisions: [
        {
          id: 'DEC-installed-hook-marker',
          title: 'Accept installed hook marker schema',
          kind: 'INFERRED',
          summary: 'The real installed post-commit hook marker is compatible with capture.',
          appliesTo: ['tracked.ts'],
        },
      ],
      evidence: [
        {
          id: 'EVD-installed-hook-marker',
          sourceType: 'CODE',
          sourceRef: 'tracked.ts',
          summary: 'The second commit changed tracked.ts and produced the pending marker.',
        },
      ],
    });

    const captured = await runCli(['retrospective', 'capture', '--stdin'], {
      cliRoot,
      cwd: root,
      stdin: draft,
    });

    expect(captured.exitCode).toBe(0);
    expect(captured.stdout).toContain('Retrospective capture recorded.');
    await expect(access(markerAbsolutePath)).rejects.toThrow();
  });

  it('documents marker-driven retrospective guidance without promising hook-run LLMs', async () => {
    const root = process.cwd();
    const core = await readFile(join(root, '.sduck/sduck-assets/agent-rules/core.md'), 'utf8');
    expect(core).toContain('At the beginning of each response');
    expect(core).toContain('immediately after any commit you perform');
    expect(core).toContain('sduck-retrospective-pending.json');
    expect(core).toContain('never runs sduck, an LLM, or a network request');
    expect(core).toContain('best-effort basis');

    const skill = await readFile(
      join(root, '.sduck/sduck-assets/agent-rules/skills/sduck-retrospective-capture/SKILL.md'),
      'utf8',
    );
    expect(skill).toContain('sduck retrospective capture --stdin');
    expect(skill).toContain('`parent..commit` diff');
    expect(skill).toContain(
      'Do not run or mention `sduck work` for this disabled automation path.',
    );
    expect(skill).toContain('Never store transcript text');
    expect(skill).toContain('confirm the marker has been cleared');
  });

  it('rejects a non-contiguous legacy plan before changing task metadata', async () => {
    workspace = await createTempWorkspace('sdd-plan-gap-');
    const root = workspace;
    await initProject({ agents: [], force: false }, root);
    const started = await startTask(
      'fix',
      'reject-step-gap',
      root,
      new Date('2026-07-10T12:00:00Z'),
      { noGit: true },
    );
    await approveSpecs(root, await loadSpecApprovalCandidates(root, {}), '2026-07-10T12:01:00Z');
    const taskPath = join(root, started.workspacePath);
    const metaPath = join(taskPath, 'meta.yml');
    await writeFile(
      join(taskPath, 'plan.md'),
      ['# Plan', '', '## Step 1. First', '', '## Step 3. Missing second'].join('\n'),
    );
    const beforeMeta = await readFile(metaPath, 'utf8');

    const result = await approvePlans(
      root,
      await loadPlanApprovalCandidates(root, {}),
      '2026-07-10T12:02:00Z',
    );

    expect(result.succeeded).toEqual([]);
    expect(result.failed[0]?.note).toMatch(/Step 2.*누락|연속/);
    expect(await readFile(metaPath, 'utf8')).toBe(beforeMeta);
  });

  it('does not complete a task when review and evaluation contain only placeholders', async () => {
    workspace = await createTempWorkspace('sdd-review-evidence-');
    const root = workspace;
    await initProject({ agents: [], force: false }, root);
    const started = await startTask(
      'fix',
      'require-review-evidence',
      root,
      new Date('2026-07-10T13:00:00Z'),
      { noGit: true },
    );
    const taskPath = join(root, started.workspacePath);
    await approveSpecs(root, await loadSpecApprovalCandidates(root, {}), '2026-07-10T13:01:00Z');
    await writeFile(join(taskPath, 'plan.md'), '# Plan\n\n## Step 1. Verify evidence\n');
    await approvePlans(root, await loadPlanApprovalCandidates(root, {}), '2026-07-10T13:02:00Z');
    await markStepCompleted(root, 1, undefined, new Date('2026-07-10T13:03:00Z'));
    const specPath = join(taskPath, 'spec.md');
    await writeFile(specPath, (await readFile(specPath, 'utf8')).replaceAll('- [ ]', '- [x]'));
    await runReviewReadyWorkflow(root, undefined, new Date('2026-07-10T13:04:00Z'));
    const metaPath = join(taskPath, 'meta.yml');
    const beforeDone = await readFile(metaPath, 'utf8');

    const result = await runDoneWorkflow(
      root,
      await loadDoneTargets(root, {}),
      '2026-07-10T13:05:00Z',
    );

    expect(result.succeeded).toEqual([]);
    expect(result.failed[0]?.note).toMatch(/review.*evidence|placeholder/i);
    expect(await readFile(metaPath, 'utf8')).toBe(beforeDone);
  });

  it('uses the repository Git author in generated specs instead of a hardcoded person', async () => {
    workspace = await createTempWorkspace('sdd-spec-author-');
    const root = workspace;
    execFileSync('git', ['init'], { cwd: root });
    execFileSync('git', ['config', 'user.name', 'Team Member'], { cwd: root });
    await initProject({ agents: [], force: false }, root);
    const started = await startTask(
      'fix',
      'dynamic-author',
      root,
      new Date('2026-07-10T14:00:00Z'),
      { noGit: true },
    );

    const spec = await readFile(join(root, started.workspacePath, 'spec.md'), 'utf8');
    expect(spec).toContain('> **작성자:** Team Member');
  });
});
