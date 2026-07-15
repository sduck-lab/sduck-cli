import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdir, readFile, unlink, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

import { runWorkCommand } from '../../src/commands/v2/index.js';
import { confirmBrief } from '../../src/core/v2/brief.js';
import { buildContextIndex, getContextPack } from '../../src/core/v2/context.js';
import { submitDraft } from '../../src/core/v2/draft.js';
import { recordGrillMeStarted } from '../../src/core/v2/grill.js';
import { policyPath } from '../../src/core/v2/paths.js';
import { recall } from '../../src/core/v2/recall.js';
import { sourceFingerprint } from '../../src/core/v2/source-store.js';
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

    await unlink(policyPath(root));
    initDecisionWorkspace(root);
    expect(existsSync(policyPath(root))).toBe(true);
  });

  it('uses the task-created policy snapshot even if workspace policy changes later', async () => {
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

  it('keeps a durable pre-existing no-policy workspace legacy and renders work accordingly', async () => {
    workspace = await createTempWorkspace('v2-lifecycle-legacy-work-');
    const root = workspace;
    initDecisionWorkspace(root);
    createTask(root, 'historical source before policy deletion');
    await unlink(policyPath(root));

    const result = runWorkCommand(root, 'new work in legacy workspace');

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('sduck grill-me (legacy/permissive)');
    expect(buildStatusView(root).indicators.grillMeRequired).toBe(false);
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
