import { execFile, execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdir, readFile, rm, unlink, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { promisify } from 'node:util';
import { afterEach, describe, expect, it } from 'vitest';

import {
  runStatusCommand,
  runRetrospectiveCaptureCommand,
  runWorkflowDisableCommand,
  runWorkflowEnableCommand,
  runWorkflowStatusCommand,
  runWorkCommand,
} from '../../src/commands/v2/index.js';
import { confirmBrief } from '../../src/core/v2/brief.js';
import { buildContextIndex, getContextPack } from '../../src/core/v2/context.js';
import { submitDraft } from '../../src/core/v2/draft.js';
import { recordGrillMeStarted } from '../../src/core/v2/grill.js';
import { policyPath } from '../../src/core/v2/paths.js';
import { getWorkflowStatus, readDecisionWorkspacePolicy } from '../../src/core/v2/policy.js';
import { recall } from '../../src/core/v2/recall.js';
import {
  retrospectiveMarkerPublicationLockPath,
  retrospectivePendingMarkerPath,
} from '../../src/core/v2/retrospective.js';
import { loadSourceBundle, sourceFingerprint } from '../../src/core/v2/source-store.js';
import { getCurrentTaskId } from '../../src/core/v2/state.js';
import { buildStatusView } from '../../src/core/v2/status.js';
import { createTask, setTerminalStatus } from '../../src/core/v2/task.js';
import { createImplementationTrace } from '../../src/core/v2/trace.js';
import { initDecisionWorkspace } from '../../src/core/v2/workspace.js';
import { runCli } from '../helpers/run-cli.js';
import { createTempWorkspace, removeTempWorkspace } from '../helpers/temp-workspace.js';

function isolatedGitEnv(): NodeJS.ProcessEnv {
  const env: NodeJS.ProcessEnv = {
    ...process.env,
    GIT_AUTHOR_NAME: 'test',
    GIT_AUTHOR_EMAIL: 'test@example.com',
    GIT_COMMITTER_NAME: 'test',
    GIT_COMMITTER_EMAIL: 'test@example.com',
  };
  delete env['GIT_DIR'];
  delete env['GIT_WORK_TREE'];
  delete env['GIT_INDEX_FILE'];
  delete env['GIT_PREFIX'];
  return env;
}

const execFileAsync = promisify(execFile);

async function delay(milliseconds: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function commitSha(root: string, ref = 'HEAD'): string {
  return execFileSync('git', ['rev-parse', ref], {
    cwd: root,
    env: isolatedGitEnv(),
    encoding: 'utf8',
  }).trim();
}

function firstParentSha(root: string, commit = commitSha(root)): string | null {
  const output = execFileSync('git', ['rev-list', '--parents', '-n', '1', commit], {
    cwd: root,
    env: isolatedGitEnv(),
    encoding: 'utf8',
  }).trim();
  return output.split(/\s+/)[1] ?? null;
}

async function writeRetrospectiveMarker(
  root: string,
  commitShaValue = commitSha(root),
  parentShaValue: string | null = firstParentSha(root, commitShaValue),
): Promise<string> {
  const markerPath = retrospectivePendingMarkerPath(root);
  await writeFile(
    markerPath,
    `${JSON.stringify(
      { commitSha: commitShaValue, parentSha: parentShaValue, createdAt: new Date().toISOString() },
      null,
      2,
    )}\n`,
  );
  return markerPath;
}

describe('v2 decision task lifecycle', () => {
  let workspace: string | null = null;

  afterEach(async () => {
    if (workspace !== null) await removeTempWorkspace(workspace);
    workspace = null;
  });

  it('promotes a README-style default DRAFT decision so trace keeps it', async () => {
    workspace = await createTempWorkspace('v2-lifecycle-draft-');
    execFileSync('git', ['init'], { cwd: workspace, env: isolatedGitEnv() });
    await mkdir(join(workspace, 'src'), { recursive: true });
    await writeFile(join(workspace, 'src', 'retry.ts'), 'export const retries = 1;\n');
    execFileSync('git', ['add', 'src'], { cwd: workspace, env: isolatedGitEnv() });
    execFileSync('git', ['commit', '-m', 'baseline'], {
      cwd: workspace,
      env: isolatedGitEnv(),
    });

    initDecisionWorkspace(workspace);
    const task = createTask(workspace, 'add payment retry support');
    recordGrillMeStarted(workspace);
    submitDraft(
      workspace,
      JSON.stringify({
        schemaVersion: 'v2alpha1',
        taskId: task.id,
        decisions: [
          {
            id: 'DEC-retry-policy',
            title: 'Retry policy',
            kind: 'INFERRED',
            summary: 'Use exponential backoff with jitter.',
            appliesTo: ['src/retry.ts'],
          },
        ],
        questions: [],
        evidence: [],
      }),
    );

    expect(buildStatusView(workspace).task?.status).toBe('BRIEF_READY');
    const snapshot = confirmBrief(workspace);
    expect(snapshot.snapshot.decisions.INFERRED[0]?.status).toBe('CONFIRMED');

    await writeFile(join(workspace, 'src', 'retry.ts'), 'export const retries = 3;\n');
    const { trace } = createImplementationTrace(workspace);
    expect(trace.decisionIds).toContain('DEC-retry-policy');
  });

  it('keeps pre-policy workspaces and tasks permissive', async () => {
    workspace = await createTempWorkspace('v2-lifecycle-pre-policy-');
    const root = workspace;
    initDecisionWorkspace(root);
    await unlink(join(root, '.decision', 'policy.json'));
    const task = createTask(root, 'legacy permissive task');

    submitDraft(
      root,
      JSON.stringify({
        schemaVersion: 'v2alpha1',
        taskId: task.id,
        decisions: [
          {
            id: 'DEC-legacy-permissive',
            title: 'Legacy permissive',
            kind: 'EXPLICIT',
            summary: 'Pre-policy tasks do not require grill-me.',
          },
        ],
      }),
    );

    expect(buildStatusView(root).indicators).toMatchObject({
      grillMeRequired: false,
      grillMeStarted: false,
    });
    expect(confirmBrief(root).snapshot.task.id).toBe(task.id);
  });

  it('writes policy for empty or partial initializations', async () => {
    workspace = await createTempWorkspace('v2-lifecycle-policy-init-');
    const root = workspace;
    await mkdir(join(root, '.decision'), { recursive: true });

    initDecisionWorkspace(root);
    expect(existsSync(policyPath(root))).toBe(true);
    expect(readDecisionWorkspacePolicy(root)).toMatchObject({ workflowEnabled: true });

    await unlink(policyPath(root));
    initDecisionWorkspace(root);
    expect(existsSync(policyPath(root))).toBe(true);
  });

  it('defaults missing workflow policy to enabled and rejects malformed values', async () => {
    workspace = await createTempWorkspace('v2-lifecycle-workflow-policy-');
    const root = workspace;
    initDecisionWorkspace(root);

    await writeFile(
      policyPath(root),
      `${JSON.stringify({ schemaVersion: 'v2alpha1', requireGrillMe: true }, null, 2)}\n`,
    );
    expect(getWorkflowStatus(root)).toMatchObject({ enabled: true, initialized: true });

    await writeFile(
      policyPath(root),
      `${JSON.stringify(
        { schemaVersion: 'v2alpha1', requireGrillMe: true, workflowEnabled: 'no' },
        null,
        2,
      )}\n`,
    );
    expect(() => readDecisionWorkspacePolicy(root)).toThrow(/POLICY_INVALID/);
  });

  it('reports workflow status before init and toggles new work creation only', async () => {
    workspace = await createTempWorkspace('v2-lifecycle-workflow-toggle-');
    const root = workspace;

    expect(runWorkflowStatusCommand(root, false).stdout).toContain('Workflow: enabled');
    expect(JSON.parse(runWorkflowStatusCommand(root, true).stdout) as unknown).toMatchObject({
      enabled: true,
      initialized: false,
    });

    expect(runWorkflowDisableCommand(root, false).stdout).toContain('Workflow disabled.');
    expect(JSON.parse(runWorkflowStatusCommand(root, true).stdout) as unknown).toMatchObject({
      enabled: false,
      initialized: true,
    });
    const blocked = runWorkCommand(root, 'blocked while disabled');
    expect(blocked.exitCode).toBe(1);
    expect(blocked.stderr).toContain('Decision workflow is disabled');
    expect(blocked.stderr).toContain('sduck workflow enable');
    expect(runStatusCommand(root, false).exitCode).toBe(0);

    expect(runWorkflowEnableCommand(root, false).stdout).toContain('Workflow enabled.');
    const started = runWorkCommand(root, 'allowed after enable');
    expect(started.exitCode).toBe(0);
  });

  it('installs the retrospective hook only on disabled workflow and preserves existing hooks', async () => {
    workspace = await createTempWorkspace('v2-lifecycle-workflow-hook-');
    const root = workspace;
    execFileSync('git', ['init'], { cwd: root, env: isolatedGitEnv() });
    initDecisionWorkspace(root);
    const hookPath = execFileSync('git', ['rev-parse', '--git-path', 'hooks/post-commit'], {
      cwd: root,
      env: isolatedGitEnv(),
      encoding: 'utf8',
    }).trim();
    const absoluteHookPath = join(root, hookPath);

    expect(existsSync(absoluteHookPath)).toBe(false);
    const disabled = runWorkflowDisableCommand(root, false);
    expect(disabled.exitCode).toBe(0);
    expect(disabled.stdout).toContain('Workflow disabled.');
    expect(disabled.stdout).not.toContain('Kept existing Git post-commit hook');
    expect(await readFile(absoluteHookPath, 'utf8')).toContain(
      'sduck managed retrospective post-commit hook',
    );

    expect(runWorkflowEnableCommand(root, false).exitCode).toBe(0);
    expect(runWorkflowDisableCommand(root, false).stdout).toContain(
      'Kept existing Git post-commit hook',
    );
    expect(runWorkflowEnableCommand(root, false).exitCode).toBe(0);
    await writeFile(absoluteHookPath, '#!/bin/sh\nexit 0\n');
    const userHookDisable = runWorkflowDisableCommand(root, false);
    expect(userHookDisable.exitCode).toBe(0);
    expect(userHookDisable.stdout).toContain(
      'Kept existing Git post-commit hook; sduck installs the managed retrospective marker hook only when the hook path is absent.',
    );
    expect(await readFile(absoluteHookPath, 'utf8')).toBe('#!/bin/sh\nexit 0\n');
  });

  it('rejects workflow enable while a retrospective marker is pending', async () => {
    workspace = await createTempWorkspace('v2-lifecycle-workflow-pending-enable-');
    const root = workspace;
    execFileSync('git', ['init'], { cwd: root, env: isolatedGitEnv() });
    await writeFile(join(root, 'tracked.ts'), 'export const tracked = 1;\n');
    execFileSync('git', ['add', 'tracked.ts'], { cwd: root, env: isolatedGitEnv() });
    execFileSync('git', ['commit', '-m', 'baseline'], { cwd: root, env: isolatedGitEnv() });
    initDecisionWorkspace(root);
    expect(runWorkflowDisableCommand(root, false).exitCode).toBe(0);
    await writeRetrospectiveMarker(root);

    const enabled = runWorkflowEnableCommand(root, false);

    expect(enabled.exitCode).toBe(1);
    expect(enabled.stderr).toContain('Cannot enable decision workflow');
    expect(getWorkflowStatus(root)).toMatchObject({ enabled: false });
  });

  it('keeps the managed hook quiet during the policy enable transition barrier', async () => {
    workspace = await createTempWorkspace('v2-lifecycle-workflow-enable-barrier-');
    const root = workspace;
    execFileSync('git', ['init'], { cwd: root, env: isolatedGitEnv() });
    await writeFile(join(root, 'tracked.ts'), 'export const tracked = 1;\n');
    execFileSync('git', ['add', 'tracked.ts'], { cwd: root, env: isolatedGitEnv() });
    execFileSync('git', ['commit', '-m', 'baseline'], { cwd: root, env: isolatedGitEnv() });
    initDecisionWorkspace(root);
    expect(runWorkflowDisableCommand(root, false).exitCode).toBe(0);
    const hookPath = execFileSync('git', ['rev-parse', '--git-path', 'hooks/post-commit'], {
      cwd: root,
      env: isolatedGitEnv(),
      encoding: 'utf8',
    }).trim();
    const absoluteHookPath = join(root, hookPath);
    await writeFile(
      policyPath(root),
      `${JSON.stringify(
        {
          schemaVersion: 'v2alpha1',
          requireGrillMe: true,
          workflowEnabled: false,
          retrospectiveHookState: 'enabling',
        },
        null,
        2,
      )}\n`,
    );

    execFileSync('sh', [absoluteHookPath], { cwd: root, env: isolatedGitEnv() });

    expect(existsSync(retrospectivePendingMarkerPath(root))).toBe(false);
    const enabled = runWorkflowEnableCommand(root, false);
    expect(enabled.exitCode).toBe(0);
    expect(JSON.parse(await readFile(policyPath(root), 'utf8'))).not.toHaveProperty(
      'retrospectiveHookState',
    );
  });

  it('makes an in-flight hook re-read enabled policy under the shared marker lock', async () => {
    workspace = await createTempWorkspace('v2-lifecycle-workflow-hook-lock-reread-');
    const root = workspace;
    execFileSync('git', ['init'], { cwd: root, env: isolatedGitEnv() });
    await writeFile(join(root, 'tracked.ts'), 'export const tracked = 1;\n');
    execFileSync('git', ['add', 'tracked.ts'], { cwd: root, env: isolatedGitEnv() });
    execFileSync('git', ['commit', '-m', 'baseline'], { cwd: root, env: isolatedGitEnv() });
    initDecisionWorkspace(root);
    expect(runWorkflowDisableCommand(root, false).exitCode).toBe(0);
    const hookPath = execFileSync('git', ['rev-parse', '--git-path', 'hooks/post-commit'], {
      cwd: root,
      env: isolatedGitEnv(),
      encoding: 'utf8',
    }).trim();
    const absoluteHookPath = join(root, hookPath);
    const lockPath = retrospectiveMarkerPublicationLockPath(root);
    await mkdir(lockPath, { recursive: false });
    await writeFile(
      join(lockPath, 'owner.json'),
      `${JSON.stringify({ pid: process.pid, token: 'test-held-publication-lock' })}\n`,
    );

    const hook = execFileAsync('sh', [absoluteHookPath], { cwd: root, env: isolatedGitEnv() });
    await delay(250);
    await writeFile(
      policyPath(root),
      `${JSON.stringify({ schemaVersion: 'v2alpha1', requireGrillMe: true, workflowEnabled: true }, null, 2)}\n`,
    );
    await rm(lockPath, { recursive: true, force: true });
    await hook;

    expect(existsSync(retrospectivePendingMarkerPath(root))).toBe(false);
    expect(getWorkflowStatus(root)).toMatchObject({ enabled: true });
  });

  it('rejects enable when a locked in-flight publication lands before the transition', async () => {
    workspace = await createTempWorkspace('v2-lifecycle-workflow-lock-published-marker-');
    const root = workspace;
    execFileSync('git', ['init'], { cwd: root, env: isolatedGitEnv() });
    await writeFile(join(root, 'tracked.ts'), 'export const tracked = 1;\n');
    execFileSync('git', ['add', 'tracked.ts'], { cwd: root, env: isolatedGitEnv() });
    execFileSync('git', ['commit', '-m', 'baseline'], { cwd: root, env: isolatedGitEnv() });
    initDecisionWorkspace(root);
    expect(runWorkflowDisableCommand(root, false).exitCode).toBe(0);
    const lockPath = retrospectiveMarkerPublicationLockPath(root);
    await mkdir(lockPath, { recursive: false });
    await writeFile(
      join(lockPath, 'owner.json'),
      `${JSON.stringify({ pid: process.pid, token: 'test-held-publication-lock' })}\n`,
    );

    const enable = runCli(['workflow', 'enable'], { cliRoot: process.cwd(), cwd: root });
    await delay(250);
    await writeRetrospectiveMarker(root);
    await rm(lockPath, { recursive: true, force: true });
    const enabled = await enable;

    expect(enabled.exitCode).toBe(1);
    expect(`${enabled.stdout}\n${enabled.stderr}`).toContain('Cannot enable decision workflow');
    expect(getWorkflowStatus(root)).toMatchObject({ enabled: false });
    expect(existsSync(retrospectivePendingMarkerPath(root))).toBe(true);
  });

  it('clears a stale shared marker lock before enabling workflow', async () => {
    workspace = await createTempWorkspace('v2-lifecycle-workflow-stale-marker-lock-');
    const root = workspace;
    execFileSync('git', ['init'], { cwd: root, env: isolatedGitEnv() });
    initDecisionWorkspace(root);
    expect(runWorkflowDisableCommand(root, false).exitCode).toBe(0);
    const lockPath = retrospectiveMarkerPublicationLockPath(root);
    await mkdir(lockPath, { recursive: false });
    await writeFile(
      join(lockPath, 'owner.json'),
      `${JSON.stringify({ pid: 999_999_999, token: 'stale-owner' })}\n`,
    );

    const enabled = runWorkflowEnableCommand(root, false);

    expect(enabled.exitCode).toBe(0);
    expect(enabled.stdout).toContain('Workflow enabled.');
    expect(existsSync(lockPath)).toBe(false);
  });

  it('disables workflow with an advisory when safe hook installation cannot complete', async () => {
    workspace = await createTempWorkspace('v2-lifecycle-workflow-hook-fail-advisory-');
    const root = workspace;
    execFileSync('git', ['init'], { cwd: root, env: isolatedGitEnv() });
    initDecisionWorkspace(root);
    await rm(join(root, '.git', 'hooks'), { recursive: true, force: true });
    await writeFile(join(root, '.git', 'hooks'), 'not a directory\n');

    const disabled = runWorkflowDisableCommand(root, false);

    expect(disabled.exitCode).toBe(0);
    expect(disabled.stdout).toContain('Workflow disabled.');
    expect(disabled.stdout).toContain(
      'Could not install managed retrospective Git post-commit hook after disabling workflow',
    );
    expect(getWorkflowStatus(root)).toMatchObject({ enabled: false });
  });

  it('rejects workflow toggle while OPEN, BRIEF_READY, or CONFIRMED tasks are active', async () => {
    workspace = await createTempWorkspace('v2-lifecycle-workflow-active-');
    const root = workspace;
    initDecisionWorkspace(root);

    const openTask = createTask(root, 'open active');
    const openToggle = runWorkflowDisableCommand(root, false);
    expect(openToggle.exitCode).toBe(1);
    expect(openToggle.stderr).toContain('Cannot change workflow mode');
    expect(openToggle.stderr).toContain(openTask.id);
    setTerminalStatus(root, 'ABANDONED');

    const briefReadyTask = createTask(root, 'brief ready active');
    recordGrillMeStarted(root);
    submitDraft(
      root,
      JSON.stringify({
        schemaVersion: 'v2alpha1',
        taskId: briefReadyTask.id,
        decisions: [{ id: 'DEC-ready', title: 'Ready', kind: 'EXPLICIT', summary: 'Ready.' }],
      }),
    );
    expect(buildStatusView(root).task?.status).toBe('BRIEF_READY');
    expect(runWorkflowDisableCommand(root, false).stderr).toContain('Cannot change workflow mode');
    setTerminalStatus(root, 'ABANDONED');

    const confirmedTask = createTask(root, 'confirmed active');
    recordGrillMeStarted(root);
    submitDraft(
      root,
      JSON.stringify({
        schemaVersion: 'v2alpha1',
        taskId: confirmedTask.id,
        decisions: [
          { id: 'DEC-confirmed', title: 'Confirmed', kind: 'EXPLICIT', summary: 'Confirmed.' },
        ],
      }),
    );
    confirmBrief(root);
    expect(buildStatusView(root).task?.status).toBe('CONFIRMED');
    expect(runWorkflowDisableCommand(root, false).stderr).toContain('Cannot change workflow mode');
    setTerminalStatus(root, 'ABANDONED');

    expect(runWorkflowDisableCommand(root, false).exitCode).toBe(0);
    expect(runStatusCommand(root, false).exitCode).toBe(0);
  });

  it('preserves disabled workflow policy across init', async () => {
    workspace = await createTempWorkspace('v2-lifecycle-workflow-preserve-');
    const root = workspace;

    expect(runWorkflowDisableCommand(root, false).exitCode).toBe(0);
    initDecisionWorkspace(root);
    expect(getWorkflowStatus(root)).toMatchObject({ enabled: false, initialized: true });
  });

  it('serializes concurrent init/work and workflow disable without enabled overwrite', async () => {
    const cliRoot = process.cwd();
    workspace = await createTempWorkspace('v2-lifecycle-workflow-race-');
    const root = workspace;
    const lockPath = join(root, '.decision', 'workspace.lock');
    await mkdir(lockPath, { recursive: true });
    await writeFile(
      join(lockPath, 'owner.json'),
      `${JSON.stringify({ pid: process.pid, token: 'test-held-lock' })}\n`,
      'utf8',
    );

    const workPromise = runCli(['work', 'race'], { cliRoot, cwd: root });
    const disablePromise = runCli(['workflow', 'disable'], { cliRoot, cwd: root });
    await delay(250);

    for (let observation = 0; observation < 5; observation += 1) {
      if (existsSync(policyPath(root))) {
        const policyDuringContent = await readFile(policyPath(root), 'utf8');
        expect(() => JSON.parse(policyDuringContent) as unknown).not.toThrow();
      }
      await delay(20);
    }

    await rm(lockPath, { force: true, recursive: true });
    const [work, disable] = await Promise.all([workPromise, disablePromise]);
    const policy = JSON.parse(await readFile(policyPath(root), 'utf8')) as {
      workflowEnabled?: boolean;
    };
    const status = await runCli(['status', '--json'], { cliRoot, cwd: root });
    const statusView = JSON.parse(status.stdout) as {
      task: { id: string; status: string } | null;
    };

    if (disable.exitCode === 0) {
      expect(work.exitCode, `${work.stdout}\n${work.stderr}`).toBe(1);
      expect(work.stderr).toContain('Decision workflow is disabled');
      expect(policy.workflowEnabled).toBe(false);
      expect(statusView.task).toBeNull();
    } else {
      expect(work.exitCode, `${work.stdout}\n${work.stderr}`).toBe(0);
      expect(disable.stderr).toContain('Cannot change workflow mode');
      expect(policy.workflowEnabled).toBe(true);
      expect(statusView.task).toMatchObject({ status: 'OPEN' });
    }
  }, 15_000);

  it('captures a retrospective draft only while disabled and leaves ordinary work blocked', async () => {
    workspace = await createTempWorkspace('v2-retrospective-capture-');
    const root = workspace;
    execFileSync('git', ['init'], { cwd: root, env: isolatedGitEnv() });
    await writeFile(join(root, 'tracked.ts'), 'export const tracked = 1;\n');
    execFileSync('git', ['add', 'tracked.ts'], { cwd: root, env: isolatedGitEnv() });
    execFileSync('git', ['commit', '-m', 'baseline'], { cwd: root, env: isolatedGitEnv() });
    await writeFile(join(root, 'tracked.ts'), 'export const tracked = 2;\n');
    execFileSync('git', ['commit', '-am', 'change'], { cwd: root, env: isolatedGitEnv() });
    initDecisionWorkspace(root);
    const markerPath = await writeRetrospectiveMarker(root);
    const draft = JSON.stringify({
      schemaVersion: 'v2alpha1',
      implementationPlan: ['Implementation already landed.'],
      verificationPlan: ['Captured retrospectively.'],
      expectedScope: ['tracked.ts'],
      decisions: [
        {
          id: 'DEC-retro',
          title: 'Retrospective decision',
          kind: 'EXPLICIT',
          status: 'CONFIRMED',
          summary: 'Keep the tracked change.',
          appliesTo: ['tracked.ts'],
        },
      ],
      evidence: [
        { id: 'EVD-retro', sourceType: 'CODE', sourceRef: 'tracked.ts', summary: 'Diff.' },
      ],
    });

    const enabled = runRetrospectiveCaptureCommand(root, draft);
    expect(enabled.exitCode).toBe(1);
    expect(enabled.stderr).toContain('requires workflow to be disabled');
    expect(existsSync(markerPath)).toBe(true);

    expect(runWorkflowDisableCommand(root, false).exitCode).toBe(0);
    const work = runWorkCommand(root, 'ordinary work remains blocked');
    expect(work.exitCode).toBe(1);
    expect(work.stderr).toContain('Decision workflow is disabled');

    const captured = runRetrospectiveCaptureCommand(root, draft);
    expect(captured.exitCode).toBe(0);
    expect(captured.stdout).toContain('Retrospective capture recorded.');
    expect(existsSync(markerPath)).toBe(false);
    expect(getCurrentTaskId(root)).toBeNull();
    const bundle = loadSourceBundle(root);
    const task = bundle.tasks.find((item) => item.retrospective === true);
    expect(task).toMatchObject({ status: 'CLOSED', expectedScope: ['tracked.ts'] });
    expect(bundle.decisions.find((item) => item.id === 'DEC-retro')).toMatchObject({
      status: 'DRAFT',
      taskId: task?.id,
    });
    expect(bundle.evidence.some((item) => item.sourceRef === `git:${commitSha(root)}`)).toBe(true);
    expect(bundle.events.map((item) => item.type)).toEqual(
      expect.arrayContaining([
        'TASK_CREATED',
        'DRAFT_SUBMITTED',
        'RETROSPECTIVE_CAPTURED',
        'TASK_CLOSED',
      ]),
    );
    const event = bundle.events.find((item) => item.type === 'RETROSPECTIVE_CAPTURED');
    expect(event?.payload).toMatchObject({ commitSha: commitSha(root) });
  });

  it('rejects retrospective capture with active tasks or submitted questions', async () => {
    workspace = await createTempWorkspace('v2-retrospective-reject-');
    const root = workspace;
    execFileSync('git', ['init'], { cwd: root, env: isolatedGitEnv() });
    await writeFile(join(root, 'tracked.ts'), 'export const tracked = 1;\n');
    execFileSync('git', ['add', 'tracked.ts'], { cwd: root, env: isolatedGitEnv() });
    execFileSync('git', ['commit', '-m', 'baseline'], { cwd: root, env: isolatedGitEnv() });
    await writeFile(join(root, 'tracked.ts'), 'export const tracked = 2;\n');
    execFileSync('git', ['commit', '-am', 'change'], { cwd: root, env: isolatedGitEnv() });
    initDecisionWorkspace(root);
    const active = createTask(root, 'active despite disabled via core');
    await writeFile(
      policyPath(root),
      `${JSON.stringify({ schemaVersion: 'v2alpha1', requireGrillMe: true, workflowEnabled: false }, null, 2)}\n`,
    );
    const markerPath = await writeRetrospectiveMarker(root);
    const activeResult = runRetrospectiveCaptureCommand(
      root,
      JSON.stringify({ schemaVersion: 'v2alpha1', decisions: [] }),
    );
    expect(activeResult.exitCode).toBe(1);
    expect(activeResult.stderr).toContain(active.id);
    expect(existsSync(markerPath)).toBe(true);
    setTerminalStatus(root, 'ABANDONED');

    const withQuestion = runRetrospectiveCaptureCommand(
      root,
      JSON.stringify({
        schemaVersion: 'v2alpha1',
        questions: [{ id: 'Q-retro', text: 'No?', recommendedAnswer: 'No' }],
      }),
    );
    expect(withQuestion.exitCode).toBe(1);
    expect(withQuestion.stderr).toContain('does not accept submitted questions');
    expect(existsSync(markerPath)).toBe(true);
  });

  it('validates retrospective marker schema and Git identity before mutation', async () => {
    workspace = await createTempWorkspace('v2-retrospective-git-identity-');
    const root = workspace;
    execFileSync('git', ['init'], { cwd: root, env: isolatedGitEnv() });
    await writeFile(join(root, 'tracked.ts'), 'export const tracked = 1;\n');
    execFileSync('git', ['add', 'tracked.ts'], { cwd: root, env: isolatedGitEnv() });
    execFileSync('git', ['commit', '-m', 'root'], { cwd: root, env: isolatedGitEnv() });
    const rootCommit = commitSha(root);
    await writeFile(join(root, 'tracked.ts'), 'export const tracked = 2;\n');
    execFileSync('git', ['commit', '-am', 'second'], { cwd: root, env: isolatedGitEnv() });
    const secondCommit = commitSha(root);
    await writeFile(join(root, 'tracked.ts'), 'export const tracked = 3;\n');
    execFileSync('git', ['commit', '-am', 'third'], { cwd: root, env: isolatedGitEnv() });
    const thirdCommit = commitSha(root);
    initDecisionWorkspace(root);
    expect(runWorkflowDisableCommand(root, false).exitCode).toBe(0);
    const draft = JSON.stringify({ schemaVersion: 'v2alpha1', decisions: [] });
    const markerPath = retrospectivePendingMarkerPath(root);

    await writeFile(
      markerPath,
      `${JSON.stringify({ commit: thirdCommit, parent: secondCommit, timestamp: new Date().toISOString() })}\n`,
    );
    const oldSchema = runRetrospectiveCaptureCommand(root, draft);
    expect(oldSchema.exitCode).toBe(1);
    expect(oldSchema.stderr).toContain('expected commitSha,parentSha,createdAt');
    expect(existsSync(markerPath)).toBe(true);

    await writeRetrospectiveMarker(root, 'a'.repeat(40), null);
    const missingCommit = runRetrospectiveCaptureCommand(root, draft);
    expect(missingCommit.exitCode).toBe(1);
    expect(missingCommit.stderr).toContain('commitSha does not exist');
    expect(existsSync(markerPath)).toBe(true);

    await writeRetrospectiveMarker(root, thirdCommit, 'b'.repeat(40));
    const missingParent = runRetrospectiveCaptureCommand(root, draft);
    expect(missingParent.exitCode).toBe(1);
    expect(missingParent.stderr).toContain('parentSha does not exist');
    expect(existsSync(markerPath)).toBe(true);

    await writeRetrospectiveMarker(root, thirdCommit, rootCommit);
    const wrongParent = runRetrospectiveCaptureCommand(root, draft);
    expect(wrongParent.exitCode).toBe(1);
    expect(wrongParent.stderr).toContain('not the first parent');
    expect(existsSync(markerPath)).toBe(true);

    await writeRetrospectiveMarker(root, thirdCommit, null);
    const missingParentForNonRoot = runRetrospectiveCaptureCommand(root, draft);
    expect(missingParentForNonRoot.exitCode).toBe(1);
    expect(missingParentForNonRoot.stderr).toContain('parentSha is required');
    expect(existsSync(markerPath)).toBe(true);

    await writeRetrospectiveMarker(root, rootCommit, null);
    const rootCapture = runRetrospectiveCaptureCommand(root, draft);
    expect(rootCapture.exitCode).toBe(0);
    expect(existsSync(markerPath)).toBe(false);
  });

  it('returns existing retrospective capture for duplicate marker commits and clears marker', async () => {
    workspace = await createTempWorkspace('v2-retrospective-duplicate-');
    const root = workspace;
    execFileSync('git', ['init'], { cwd: root, env: isolatedGitEnv() });
    await writeFile(join(root, 'tracked.ts'), 'export const tracked = 1;\n');
    execFileSync('git', ['add', 'tracked.ts'], { cwd: root, env: isolatedGitEnv() });
    execFileSync('git', ['commit', '-m', 'baseline'], { cwd: root, env: isolatedGitEnv() });
    await writeFile(join(root, 'tracked.ts'), 'export const tracked = 2;\n');
    execFileSync('git', ['commit', '-am', 'change'], { cwd: root, env: isolatedGitEnv() });
    initDecisionWorkspace(root);
    expect(runWorkflowDisableCommand(root, false).exitCode).toBe(0);
    const markerPath = await writeRetrospectiveMarker(root);
    const draft = JSON.stringify({
      schemaVersion: 'v2alpha1',
      decisions: [{ id: 'DEC-once', title: 'Once', kind: 'EXPLICIT', summary: 'Once.' }],
    });
    const first = runRetrospectiveCaptureCommand(root, draft);
    expect(first.exitCode).toBe(0);
    const firstEventCount = loadSourceBundle(root).events.filter(
      (item) => item.type === 'RETROSPECTIVE_CAPTURED',
    ).length;
    await writeRetrospectiveMarker(root);

    const second = runRetrospectiveCaptureCommand(root, draft);

    expect(second.exitCode).toBe(0);
    expect(second.stdout).toContain('Duplicate: true');
    expect(existsSync(markerPath)).toBe(false);
    const bundle = loadSourceBundle(root);
    expect(bundle.events.filter((item) => item.type === 'RETROSPECTIVE_CAPTURED')).toHaveLength(
      firstEventCount,
    );
    expect(bundle.decisions.filter((item) => item.id === 'DEC-once')).toHaveLength(1);
  });

  it('keeps no-marker policy-required tasks on legacy started gate', async () => {
    workspace = await createTempWorkspace('v2-lifecycle-policy-snapshot-');
    const root = workspace;
    initDecisionWorkspace(root);
    const task = createTask(root, 'snapshot remains required');
    await writeFile(
      policyPath(root),
      `${JSON.stringify({ schemaVersion: 'v2alpha1', requireGrillMe: false }, null, 2)}\n`,
    );
    await unlink(policyPath(root));
    expect(() =>
      submitDraft(
        root,
        JSON.stringify({
          schemaVersion: 'v2alpha1',
          taskId: task.id,
          decisions: [
            {
              id: 'DEC-snapshot-required',
              title: 'Snapshot required',
              kind: 'EXPLICIT',
              summary: 'Workspace policy changes do not alter this task.',
            },
          ],
        }),
      ),
    ).toThrow(/GRILL_ME_REQUIRED/);
    recordGrillMeStarted(root);

    expect(
      submitDraft(
        root,
        JSON.stringify({
          schemaVersion: 'v2alpha1',
          taskId: task.id,
          decisions: [
            {
              id: 'DEC-snapshot-required',
              title: 'Snapshot required',
              kind: 'EXPLICIT',
              summary: 'Workspace policy changes do not alter this task.',
            },
          ],
        }),
      ).decisions,
    ).toBe(1);
  });

  it('keeps stored no-marker tasks legacy but makes new CLI work guided without policy', async () => {
    workspace = await createTempWorkspace('v2-lifecycle-legacy-work-');
    const root = workspace;
    initDecisionWorkspace(root);
    const historical = createTask(root, 'historical source before policy deletion');
    const historicalPath = join(
      root,
      '.decision',
      'exports',
      'markdown',
      'tasks',
      `${historical.id}.md`,
    );
    const historicalBefore = await readFile(historicalPath, 'utf8');
    await unlink(policyPath(root));
    expect(buildStatusView(root).indicators.grillMeRequired).toBe(false);

    const result = runWorkCommand(root, 'new work in legacy workspace');

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('sduck grill complete --reason');
    expect(buildStatusView(root).indicators.grillMeRequired).toBe(true);
    expect(await readFile(historicalPath, 'utf8')).toBe(historicalBefore);
  });

  it('rejects confirm with an open question without changing canonical source', async () => {
    workspace = await createTempWorkspace('v2-lifecycle-question-');
    const root = workspace;
    initDecisionWorkspace(root);
    const task = createTask(root, 'choose retry limit');
    recordGrillMeStarted(root);
    submitDraft(
      root,
      JSON.stringify({
        schemaVersion: 'v2alpha1',
        taskId: task.id,
        decisions: [
          {
            id: 'DEC-retry-limit',
            title: 'Retry limit',
            kind: 'OPEN',
            summary: 'The retry limit is unresolved.',
          },
        ],
        questions: [
          {
            id: 'Q-retry-limit',
            decisionId: 'DEC-retry-limit',
            text: 'How many retries?',
            recommendedAnswer: 'Three retries',
          },
        ],
        evidence: [],
      }),
    );

    expect(buildStatusView(root).task?.status).toBe('OPEN');
    const taskPath = join(root, '.decision', 'exports', 'markdown', 'tasks', `${task.id}.md`);
    const beforeFingerprint = sourceFingerprint(root);
    const beforeTask = await readFile(taskPath, 'utf8');

    expect(() => confirmBrief(root)).toThrow(/CONFIRM_OPEN_QUESTIONS/);
    expect(sourceFingerprint(root)).toBe(beforeFingerprint);
    expect(await readFile(taskPath, 'utf8')).toBe(beforeTask);
  });

  it('keeps an unresolved conflict OPEN and rejects confirmation', async () => {
    workspace = await createTempWorkspace('v2-lifecycle-conflict-');
    const root = workspace;
    initDecisionWorkspace(root);
    const task = createTask(root, 'resolve storage conflict');
    recordGrillMeStarted(root);
    submitDraft(
      root,
      JSON.stringify({
        schemaVersion: 'v2alpha1',
        decisions: [
          {
            id: 'DEC-storage-conflict',
            title: 'Storage conflict',
            kind: 'CONFLICT',
            summary: 'The code and ADR disagree.',
          },
        ],
        questions: [],
        evidence: [],
      }),
    );

    expect(buildStatusView(root).task?.status).toBe('OPEN');
    const beforeFingerprint = sourceFingerprint(root);
    expect(() => confirmBrief(root)).toThrow(/CONFIRM_UNRESOLVED_DECISIONS/);
    expect(sourceFingerprint(root)).toBe(beforeFingerprint);
    expect(buildStatusView(root).task?.id).toBe(task.id);
  });

  it('rejects invalid close transitions and clears current task after a valid close', async () => {
    workspace = await createTempWorkspace('v2-lifecycle-close-');
    const root = workspace;
    initDecisionWorkspace(root);
    const task = createTask(root, 'close lifecycle');
    const beforeFingerprint = sourceFingerprint(root);

    expect(() => setTerminalStatus(root, 'CLOSED')).toThrow(/TASK_STATUS_NOT_ALLOWED/);
    expect(sourceFingerprint(root)).toBe(beforeFingerprint);
    expect(getCurrentTaskId(root)).toBe(task.id);
    recordGrillMeStarted(root);

    submitDraft(
      root,
      JSON.stringify({
        schemaVersion: 'v2alpha1',
        decisions: [
          {
            title: 'Close decision',
            kind: 'EXPLICIT',
            summary: 'The task is ready to close.',
          },
        ],
      }),
    );
    confirmBrief(root);
    expect(setTerminalStatus(root, 'CLOSED').status).toBe('CLOSED');
    expect(getCurrentTaskId(root)).toBeNull();
  });

  it('resumes a previous non-terminal task by ID', async () => {
    workspace = await createTempWorkspace('v2-lifecycle-resume-');
    const root = workspace;
    initDecisionWorkspace(root);
    const previous = createTask(root, 'previous task');
    const current = createTask(root, 'current task');
    expect(getCurrentTaskId(root)).toBe(current.id);

    const result = await runCli(['resume', previous.id], { cliRoot: process.cwd(), cwd: root });

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain(previous.id);
    expect(getCurrentTaskId(root)).toBe(previous.id);
    expect(buildStatusView(root).task?.id).toBe(previous.id);
  });

  it('traces committed and uncommitted implementation files since confirm without harness noise', async () => {
    workspace = await createTempWorkspace('v2-trace-baseline-');
    const root = workspace;
    execFileSync('git', ['init'], { cwd: root, env: isolatedGitEnv() });
    await mkdir(join(root, 'src'), { recursive: true });
    await writeFile(join(root, 'src', 'committed.ts'), 'export const committed = 1;\n');
    await writeFile(join(root, 'src', 'working.ts'), 'export const working = 1;\n');
    execFileSync('git', ['add', 'src'], { cwd: root, env: isolatedGitEnv() });
    execFileSync('git', ['commit', '-m', 'baseline'], { cwd: root, env: isolatedGitEnv() });
    initDecisionWorkspace(root);
    const task = createTask(root, 'trace baseline');
    recordGrillMeStarted(root);
    submitDraft(
      root,
      JSON.stringify({
        schemaVersion: 'v2alpha1',
        taskId: task.id,
        decisions: [
          {
            id: 'DEC-trace-baseline',
            title: 'Trace source files',
            kind: 'EXPLICIT',
            summary: 'Only implementation files belong in trace.',
            appliesTo: ['src/**'],
          },
        ],
      }),
    );
    confirmBrief(root);

    await writeFile(join(root, 'src', 'committed.ts'), 'export const committed = 2;\n');
    execFileSync('git', ['add', 'src/committed.ts'], { cwd: root, env: isolatedGitEnv() });
    execFileSync('git', ['commit', '-m', 'implementation commit'], {
      cwd: root,
      env: isolatedGitEnv(),
    });
    await writeFile(join(root, 'src', 'working.ts'), 'export const working = 2;\n');
    await mkdir(join(root, 'newdir'), { recursive: true });
    await writeFile(join(root, 'newdir', 'new.ts'), 'export const added = true;\n');
    await mkdir(join(root, '.sduck'), { recursive: true });
    await writeFile(join(root, '.sduck', 'noise.txt'), 'noise\n');
    await writeFile(join(root, '.decision', 'noise.txt'), 'noise\n');
    await mkdir(join(root, 'dist'), { recursive: true });
    await writeFile(join(root, 'dist', 'generated.js'), 'generated\n');

    const { filesChanged } = createImplementationTrace(root);

    expect(filesChanged).toEqual(['newdir/new.ts', 'src/committed.ts', 'src/working.ts']);
  });

  it('builds context from Git-visible file content and ignores gitignored matches', async () => {
    workspace = await createTempWorkspace('v2-context-content-');
    const root = workspace;
    execFileSync('git', ['init'], { cwd: root, env: isolatedGitEnv() });
    await mkdir(join(root, 'src'), { recursive: true });
    await mkdir(join(root, 'ignored'), { recursive: true });
    await writeFile(join(root, '.gitignore'), 'ignored/\n');
    await writeFile(
      join(root, 'src', 'settings.ts'),
      '// Payment retry policy uses exponential backoff.\nexport const retries = 3;\n',
    );
    await writeFile(
      join(root, 'ignored', 'payment-retry-secret.ts'),
      'export const ignored = true;\n',
    );
    initDecisionWorkspace(root);
    const task = createTask(root, 'payment retry policy');

    const context = buildContextIndex(root, task);

    const contentMatch = context.find((item) => item.sourceRef === 'src/settings.ts');
    expect(contentMatch?.summary).toContain('Payment retry policy uses exponential backoff');
    expect(context.some((item) => item.sourceRef.includes('ignored/'))).toBe(false);
  });

  it('exposes only confirmed decisions from non-abandoned tasks in recall and context', async () => {
    workspace = await createTempWorkspace('v2-memory-visibility-');
    const root = workspace;
    initDecisionWorkspace(root);
    createTask(root, 'visibility source');
    recordGrillMeStarted(root);
    submitDraft(
      root,
      JSON.stringify({
        schemaVersion: 'v2alpha1',
        decisions: [
          {
            id: 'DEC-visible',
            title: 'Visibility confirmed',
            kind: 'EXPLICIT',
            status: 'CONFIRMED',
            summary: 'visibility memory',
          },
          {
            id: 'DEC-draft-hidden',
            title: 'Visibility draft',
            kind: 'INFERRED',
            status: 'DRAFT',
            summary: 'visibility memory',
          },
          {
            id: 'DEC-rejected-hidden',
            title: 'Visibility rejected',
            kind: 'INFERRED',
            status: 'REJECTED',
            summary: 'visibility memory',
          },
          {
            id: 'DEC-superseded-hidden',
            title: 'Visibility superseded',
            kind: 'INFERRED',
            status: 'SUPERSEDED',
            summary: 'visibility memory',
          },
        ],
      }),
    );
    createTask(root, 'abandoned visibility source');
    recordGrillMeStarted(root);
    submitDraft(
      root,
      JSON.stringify({
        schemaVersion: 'v2alpha1',
        decisions: [
          {
            id: 'DEC-abandoned-hidden',
            title: 'Visibility abandoned',
            kind: 'EXPLICIT',
            status: 'CONFIRMED',
            summary: 'visibility memory',
          },
        ],
      }),
    );
    setTerminalStatus(root, 'ABANDONED');
    const current = createTask(root, 'reuse visibility memory');
    recordGrillMeStarted(root);
    await mkdir(join(root, '.decision', 'exports', 'graphify'), { recursive: true });
    await writeFile(
      join(root, '.decision', 'exports', 'graphify', 'decision-graph.json'),
      JSON.stringify({
        nodes: [
          { id: 'DEC-draft-hidden', type: 'decision' },
          { id: 'DEC-abandoned-hidden', type: 'decision' },
          { id: 'src/visibility.ts', type: 'file' },
        ],
        links: [
          {
            source: 'DEC-draft-hidden',
            target: 'src/visibility.ts',
            relation: 'APPLIES_TO',
          },
          {
            source: 'DEC-abandoned-hidden',
            target: 'src/visibility.ts',
            relation: 'APPLIES_TO',
          },
        ],
      }),
    );
    submitDraft(
      root,
      JSON.stringify({
        schemaVersion: 'v2alpha1',
        taskId: current.id,
        expectedScope: ['src/visibility.ts'],
      }),
    );
    buildContextIndex(root, current);

    expect(recall(root, 'visibility').decisions.map((decision) => decision.id)).toEqual([
      'DEC-visible',
    ]);
    expect(getContextPack(root).priorDecisions.map((decision) => decision.id)).toEqual([
      'DEC-visible',
    ]);
    expect(
      getContextPack(root).items.some((item) =>
        ['DEC-draft-hidden', 'DEC-abandoned-hidden'].includes(item.sourceRef),
      ),
    ).toBe(false);
  });

  it('requires resume before answering a question from a previous task', async () => {
    workspace = await createTempWorkspace('v2-lifecycle-answer-current-');
    const root = workspace;
    initDecisionWorkspace(root);
    const previous = createTask(root, 'previous task question');
    recordGrillMeStarted(root);
    submitDraft(
      root,
      JSON.stringify({
        schemaVersion: 'v2alpha1',
        taskId: previous.id,
        decisions: [
          {
            id: 'DEC-previous-open',
            title: 'Previous choice',
            kind: 'OPEN',
            summary: 'This answer belongs to the previous task.',
          },
        ],
        questions: [
          {
            id: 'Q-previous',
            decisionId: 'DEC-previous-open',
            text: 'Choose for the previous task?',
            recommendedAnswer: 'Previous answer',
          },
        ],
      }),
    );
    createTask(root, 'current task');
    const beforeFingerprint = sourceFingerprint(root);

    const result = await runCli(['answer', 'Q-previous', '--option', '1'], {
      cliRoot: process.cwd(),
      cwd: root,
    });

    expect(result.exitCode).toBe(1);
    expect(`${result.stdout}\n${result.stderr}`).toMatch(/does not belong to current task/i);
    expect(sourceFingerprint(root)).toBe(beforeFingerprint);
  });
});
