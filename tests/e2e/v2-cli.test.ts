import { execFileSync } from 'node:child_process';
import { readFile, unlink, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

import { openDatabase } from '../../src/core/v2/store.js';
import { runCli } from '../helpers/run-cli.js';
import { createTempWorkspace, removeTempWorkspace } from '../helpers/temp-workspace.js';

const supportsNodeSqlite = (() => {
  const [major = '0', minor = '0'] = process.versions.node.split('.');
  return Number(major) > 22 || (Number(major) === 22 && Number(minor) >= 13);
})();

const describeIfSqlite = supportsNodeSqlite ? describe : describe.skip;

function isolatedGitEnv(): NodeJS.ProcessEnv {
  const env: NodeJS.ProcessEnv = {
    ...process.env,
    GIT_AUTHOR_NAME: 't',
    GIT_AUTHOR_EMAIL: 't@example.com',
    GIT_COMMITTER_NAME: 't',
    GIT_COMMITTER_EMAIL: 't@example.com',
  };
  delete env['GIT_DIR'];
  delete env['GIT_WORK_TREE'];
  delete env['GIT_INDEX_FILE'];
  delete env['GIT_PREFIX'];
  return env;
}

interface BriefJson {
  openQuestionCount: number;
}

function parseBriefJson(stdout: string): BriefJson {
  const parsed = JSON.parse(stdout) as unknown;
  if (typeof parsed !== 'object' || parsed === null) {
    throw new Error('Invalid brief JSON');
  }
  const candidate = parsed as { openQuestionCount?: unknown };
  if (typeof candidate.openQuestionCount !== 'number') {
    throw new Error('Invalid brief JSON');
  }
  return { openQuestionCount: candidate.openQuestionCount };
}

describeIfSqlite('v2 CLI flow', () => {
  const cliRoot = process.cwd();
  let workspace: string | null = null;

  afterEach(async () => {
    if (workspace !== null) await removeTempWorkspace(workspace);
    workspace = null;
  });

  it('prints the exact package version', async () => {
    workspace = await createTempWorkspace('v2-cli-version-');

    const version = await runCli(['--version'], { cliRoot, cwd: workspace });
    const packageJson = JSON.parse(await readFile(join(cliRoot, 'package.json'), 'utf8')) as {
      version: string;
    };

    expect(version.exitCode).toBe(0);
    expect(packageJson.version).toBe('0.6.2');
    expect(version.stdout.trim()).toBe(packageJson.version);
    expect(version.stderr).toBe('');
  });

  it('keeps deferred CLI boundary commands unavailable', async () => {
    workspace = await createTempWorkspace('v2-cli-boundary-');

    const candidates = [
      ['mcp'],
      ['verify'],
      ['confirm', '--digest', 'sduck-brief-digest/v1:abc'],
      ['confirm', '--brief-digest', 'sduck-brief-digest/v1:abc'],
      ['prepare-confirmation'],
      ['digest-confirmation'],
      ['refresh-context'],
      ['context', 'refresh'],
    ];

    for (const args of candidates) {
      const result = await runCli(args, { cliRoot, cwd: workspace });
      const output = `${result.stdout}\n${result.stderr}`;

      expect(result.exitCode, args.join(' ')).not.toBe(0);
      expect(output, args.join(' ')).toMatch(/unknown (command|option)|error:/i);
    }
  }, 10_000);

  it('runs init, work, submit, answer, brief, confirm, trace, remember, recall, close', async () => {
    workspace = await createTempWorkspace('v2-cli-');
    execFileSync('git', ['init'], { cwd: workspace, env: isolatedGitEnv() });
    await writeFile(join(workspace, 'tracked.ts'), 'export const tracked = 1;\n');
    execFileSync('git', ['add', 'tracked.ts'], { cwd: workspace, env: isolatedGitEnv() });
    execFileSync('git', ['commit', '-m', 'initial'], { cwd: workspace, env: isolatedGitEnv() });

    const init = await runCli(['init'], { cliRoot, cwd: workspace });
    expect(init.exitCode).toBe(0);
    expect(init.stdout).toContain('Decision workspace initialized.');
    expect(init.stdout).toContain('Primary: .decision decision-briefing workspace.');
    expect(await readFile(join(workspace, 'CLAUDE.md'), 'utf8')).toContain('<!-- sduck:begin -->');
    expect(await readFile(join(workspace, 'CLAUDE.md'), 'utf8')).toContain(
      'Primary workflow: v2 `.decision` decision briefing',
    );
    const agentRules = await readFile(join(workspace, 'AGENTS.md'), 'utf8');
    expect(agentRules).toContain('<!-- sduck:begin -->');
    expect(agentRules).toContain('Selected agents: Codex, OpenCode');
    expect(agentRules).toContain('Codex Instructions');
    expect(agentRules).toContain('OpenCode Instructions');
    expect(await readFile(join(workspace, 'GEMINI.md'), 'utf8')).toContain('<!-- sduck:begin -->');
    const work = await runCli(['work', '--record-depth', 'LIGHTWEIGHT', 'payment retry 추가'], {
      cliRoot,
      cwd: workspace,
    });
    expect(work.stdout).toContain('Decision task started.');

    const context = await runCli(['context'], { cliRoot, cwd: workspace });
    expect(context.stdout).toContain('Agent grill-me prompt:');
    expect(context.stdout).toContain('Skill-backed checklist:');
    expect(context.stdout).toContain('Interview the user relentlessly');

    const contextJson = await runCli(['context', '--json'], { cliRoot, cwd: workspace });
    const parsedContext = JSON.parse(contextJson.stdout) as {
      grillMePrompt: string;
      grillMeChecklist: unknown;
    };
    expect(typeof parsedContext.grillMePrompt).toBe('string');
    expect(parsedContext.grillMePrompt).toContain('design tree');
    expect(Array.isArray(parsedContext.grillMeChecklist)).toBe(true);

    const status = await runCli(['status', '--json'], { cliRoot, cwd: workspace });
    const task = (
      JSON.parse(status.stdout) as {
        task: { id: string; recordDepth: 'FULL' | 'LIGHTWEIGHT' };
      }
    ).task;
    const taskId = task.id;
    expect(task.recordDepth).toBe('LIGHTWEIGHT');
    const grill = await runCli(['grill-me'], { cliRoot, cwd: workspace });
    expect(grill.exitCode).toBe(0);
    expect(grill.stdout).toContain('Grill-me already started.');
    const grillAgain = await runCli(['grill-me', '--json'], { cliRoot, cwd: workspace });
    expect(grillAgain.exitCode).toBe(0);
    expect(JSON.parse(grillAgain.stdout)).toMatchObject({
      taskId,
      recorded: false,
    });
    const prematureSubmit = await runCli(['submit', '--stdin'], {
      cliRoot,
      cwd: workspace,
      stdin: JSON.stringify({ schemaVersion: 'v2alpha1', taskId, decisions: [] }),
    });
    expect(prematureSubmit.exitCode).toBe(1);
    expect(`${prematureSubmit.stdout}\n${prematureSubmit.stderr}`).toContain('grill');
    const grillComplete = await runCli(
      ['grill', 'complete', '--reason', 'Shared understanding reached'],
      {
        cliRoot,
        cwd: workspace,
      },
    );
    expect(grillComplete.exitCode).toBe(0);
    expect(grillComplete.stdout).toContain('Grill completed');
    const draft = JSON.stringify({
      schemaVersion: 'v2alpha1',
      taskId,
      implementationPlan: ['Update tracked retry behavior.'],
      verificationPlan: ['Run focused CLI workflow assertions.'],
      decisions: [
        {
          id: 'DEC-tracked',
          title: 'Tracked file decision',
          kind: 'EXPLICIT',
          status: 'CONFIRMED',
          summary: 'Changes apply to tracked.ts.',
          appliesTo: ['tracked.ts'],
        },
        {
          id: 'DEC-unmapped',
          title: 'Unmapped decision',
          kind: 'EXPLICIT',
          status: 'CONFIRMED',
          summary: 'This decision points elsewhere.',
          appliesTo: ['src/not-present.ts'],
        },
      ],
      questions: [
        { id: 'Q1', text: 'retry 횟수는?', recommendedAnswer: '3회', options: ['추천안 사용'] },
      ],
      evidence: [],
    });
    const submit = await runCli(['submit', '--stdin'], { cliRoot, cwd: workspace, stdin: draft });
    expect(submit.stdout).toContain('Draft submitted');

    expect(
      (await runCli(['answer', 'Q1', '--option', '1'], { cliRoot, cwd: workspace })).stdout,
    ).toContain('Answer saved');
    expect((await runCli(['brief'], { cliRoot, cwd: workspace })).stdout).toContain(
      'Implementation Brief',
    );
    const briefBeforeRebuild = await runCli(['brief', '--json'], { cliRoot, cwd: workspace });
    expect(JSON.parse(briefBeforeRebuild.stdout)).toMatchObject({
      task: { id: taskId, recordDepth: 'LIGHTWEIGHT' },
    });
    expect((await runCli(['confirm'], { cliRoot, cwd: workspace })).stdout).toContain('confirmed');

    await writeFile(join(workspace, 'tracked.ts'), 'export const tracked = 2;\n');
    await writeFile(join(workspace, 'new-file.ts'), 'export const fresh = true;\n');
    const trace = await runCli(['trace', '--json'], { cliRoot, cwd: workspace });
    expect(trace.stdout).toContain('new-file.ts');
    const parsedTrace = JSON.parse(trace.stdout) as {
      trace: {
        id: string;
        decisionToCodeMap: { decisionId: string; reason?: string; score?: number }[];
        unmappedDecisions: { decisionId: string; reason: string; score: number }[];
      };
    };
    expect(parsedTrace.trace.decisionToCodeMap).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          decisionId: 'DEC-tracked',
          reason: 'matched by appliesTo exact path',
          score: 1,
        }),
      ]),
    );
    expect(parsedTrace.trace.unmappedDecisions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          decisionId: 'DEC-unmapped',
          reason: 'no strong relevance match',
        }),
      ]),
    );

    const evaluation = await runCli(['evaluate', '--check', 'unit=passed', '--json'], {
      cliRoot,
      cwd: workspace,
    });
    expect(evaluation.exitCode).toBe(0);
    expect(JSON.parse(evaluation.stdout)).toMatchObject({ traceId: parsedTrace.trace.id });

    await writeFile(join(workspace, 'tracked.ts'), 'export const tracked = 3;\n');
    const newerTrace = await runCli(['trace', '--json'], { cliRoot, cwd: workspace });
    const parsedNewerTrace = JSON.parse(newerTrace.stdout) as { trace: { id: string } };
    const rememberBeforeEvaluation = await runCli(['remember'], { cliRoot, cwd: workspace });
    expect(rememberBeforeEvaluation.stdout).toContain('sduck evaluate');
    const prematureClose = await runCli(['close'], { cliRoot, cwd: workspace });
    expect(prematureClose.exitCode).toBe(1);
    expect(`${prematureClose.stdout}\n${prematureClose.stderr}`).toContain(
      parsedNewerTrace.trace.id,
    );
    const newerEvaluation = await runCli(['evaluate', '--check', 'latest=recorded'], {
      cliRoot,
      cwd: workspace,
    });
    expect(newerEvaluation.exitCode).toBe(0);

    const graph = await runCli(['graph', 'show', taskId, '--depth', '2', '--json'], {
      cliRoot,
      cwd: workspace,
    });
    expect(graph.exitCode).toBe(0);
    const parsedGraph = JSON.parse(graph.stdout) as { nodes: { id: string }[]; edges: unknown[] };
    expect(parsedGraph.nodes.map((node) => node.id)).toEqual(
      [...parsedGraph.nodes.map((node) => node.id)].sort((a, b) => a.localeCompare(b)),
    );
    expect(parsedGraph.edges.length).toBeGreaterThan(0);
    for (const edge of parsedGraph.edges as { from: string; to: string }[]) {
      expect(parsedGraph.nodes.some((node) => node.id === edge.from)).toBe(true);
      expect(parsedGraph.nodes.some((node) => node.id === edge.to)).toBe(true);
    }
    const db = openDatabase(workspace);
    db.prepare(`DELETE FROM cache_metadata WHERE key = 'graph_projection_version'`).run();
    db.close();
    const upgradedGraph = await runCli(['graph', 'show', taskId, '--depth', '2', '--json'], {
      cliRoot,
      cwd: workspace,
    });
    expect(upgradedGraph.exitCode).toBe(0);
    expect(JSON.parse(upgradedGraph.stdout)).toEqual(parsedGraph);
    const unknownGraph = await runCli(['graph', 'show', 'TASK-does-not-exist', '--json'], {
      cliRoot,
      cwd: workspace,
    });
    expect(unknownGraph.exitCode).toBe(1);
    const invalidDepth = await runCli(['graph', 'show', taskId, '--depth', 'nope'], {
      cliRoot,
      cwd: workspace,
    });
    expect(invalidDepth.exitCode).toBe(1);

    expect((await runCli(['remember'], { cliRoot, cwd: workspace })).stdout).toContain(
      'decision-graph.json',
    );
    const exportedTrace = await readFile(
      join(
        workspace,
        '.decision',
        'exports',
        'markdown',
        'implementations',
        `${parsedTrace.trace.id}.md`,
      ),
      'utf8',
    );
    expect(exportedTrace).toContain('matched by appliesTo exact path');
    expect(exportedTrace).toContain('Unmapped decisions requiring review');

    await unlink(join(workspace, '.decision', 'db.sqlite'));
    const rebuild = await runCli(['rebuild'], { cliRoot, cwd: workspace });
    expect(rebuild.exitCode).toBe(0);
    expect(rebuild.stdout).toContain('Decision cache rebuilt.');
    expect(rebuild.stdout).toContain('Questions: 1');
    const briefAfterRebuild = await runCli(['brief', '--json'], { cliRoot, cwd: workspace });
    expect(JSON.parse(briefAfterRebuild.stdout)).toMatchObject({
      task: { id: taskId, recordDepth: 'LIGHTWEIGHT' },
      openQuestionCount: parseBriefJson(briefBeforeRebuild.stdout).openQuestionCount,
    });
    const statusAfterRebuild = await runCli(['status', '--json'], { cliRoot, cwd: workspace });
    expect(JSON.parse(statusAfterRebuild.stdout)).toMatchObject({
      indicators: { grillMeRequired: true, grillMeStarted: true, grillMeCompleted: true },
    });
    const graphAfterRebuild = await runCli(['graph', 'show', taskId, '--depth', '2', '--json'], {
      cliRoot,
      cwd: workspace,
    });
    expect(JSON.parse(graphAfterRebuild.stdout)).toEqual(parsedGraph);

    await unlink(join(workspace, '.decision', 'db.sqlite'));
    const autoStatus = await runCli(['status', '--json'], { cliRoot, cwd: workspace });
    expect(autoStatus.exitCode).toBe(0);
    expect(JSON.parse(autoStatus.stdout)).toMatchObject({ task: { id: taskId } });
    expect((await runCli(['recall', 'retry'], { cliRoot, cwd: workspace })).stdout).toContain(
      'Query',
    );
    expect((await runCli(['close'], { cliRoot, cwd: workspace })).stdout).toContain('closed');
    const gitignore = await readFile(join(workspace, '.gitignore'), 'utf8');
    expect(gitignore).toContain('.decision/db.sqlite');
    expect(gitignore).toContain('.decision/db.sqlite-*');
    expect(gitignore).toContain('.decision/state.json');
    expect(gitignore).toContain('.decision/exports/graphify/');
    expect(gitignore).not.toContain('.decision/exports/markdown/');
    const decisionGitStatus = execFileSync(
      'git',
      ['status', '--short', '--untracked-files=all', '--', '.decision'],
      { cwd: workspace, env: isolatedGitEnv(), encoding: 'utf8' },
    );
    expect(decisionGitStatus).toContain('.decision/exports/markdown/tasks/');
    expect(decisionGitStatus).toContain('.decision/exports/markdown/decisions/');
    expect(decisionGitStatus).not.toContain('db.sqlite');
    expect(decisionGitStatus).not.toContain('state.json');
    expect(decisionGitStatus).not.toContain('exports/graphify');
  }, 60_000);

  it('rejects invalid work record depth without creating a task', async () => {
    workspace = await createTempWorkspace('v2-cli-record-depth-invalid-');

    const invalid = await runCli(['work', '--record-depth', 'PARTIAL', 'invalid depth'], {
      cliRoot,
      cwd: workspace,
    });

    expect(invalid.exitCode).not.toBe(0);
    expect(`${invalid.stdout}\n${invalid.stderr}`).toContain(
      '--record-depth must be FULL or LIGHTWEIGHT',
    );
    const status = await runCli(['status', '--json'], { cliRoot, cwd: workspace });
    expect(status.exitCode).toBe(0);
    expect(JSON.parse(status.stdout)).toMatchObject({ task: null });
  });

  it('blocks submit and confirm before grill-me in a new required workspace', async () => {
    workspace = await createTempWorkspace('v2-cli-grill-required-');
    const init = await runCli(['init'], { cliRoot, cwd: workspace });
    expect(init.exitCode).toBe(0);
    await unlink(join(workspace, '.decision', 'policy.json'));
    const work = await runCli(['work', 'required grill gate'], { cliRoot, cwd: workspace });
    expect(work.exitCode).toBe(0);
    const taskId = (
      JSON.parse((await runCli(['status', '--json'], { cliRoot, cwd: workspace })).stdout) as {
        task: { id: string };
      }
    ).task.id;
    const draft = JSON.stringify({
      schemaVersion: 'v2alpha1',
      taskId,
      implementationPlan: ['Implement gated path.'],
      verificationPlan: ['Verify guided gates.'],
      decisions: [{ id: 'DEC-gated', title: 'Gated', kind: 'EXPLICIT', summary: 'Blocked.' }],
    });

    const submit = await runCli(['submit', '--stdin'], { cliRoot, cwd: workspace, stdin: draft });
    expect(submit.exitCode).toBe(1);
    expect(`${submit.stdout}\n${submit.stderr}`).toContain('sduck grill-me');
    const confirm = await runCli(['confirm'], { cliRoot, cwd: workspace });
    expect(confirm.exitCode).toBe(1);
    expect(`${confirm.stdout}\n${confirm.stderr}`).toContain('sduck grill-me');

    expect((await runCli(['grill-me'], { cliRoot, cwd: workspace })).exitCode).toBe(0);
    expect(
      (await runCli(['submit', '--stdin'], { cliRoot, cwd: workspace, stdin: draft })).exitCode,
    ).toBe(1);
    expect(
      (await runCli(['grill', 'complete', '--reason', 'Ready'], { cliRoot, cwd: workspace }))
        .exitCode,
    ).toBe(0);
    expect(
      (await runCli(['submit', '--stdin'], { cliRoot, cwd: workspace, stdin: draft })).exitCode,
    ).toBe(0);
    expect((await runCli(['confirm'], { cliRoot, cwd: workspace })).exitCode).toBe(0);
  }, 10_000);

  it('manages the retrospective hook through workflow disable without replacing user hooks', async () => {
    workspace = await createTempWorkspace('v2-cli-workflow-hook-');
    execFileSync('git', ['init'], { cwd: workspace, env: isolatedGitEnv() });
    const hookPath = execFileSync('git', ['rev-parse', '--git-path', 'hooks/post-commit'], {
      cwd: workspace,
      env: isolatedGitEnv(),
      encoding: 'utf8',
    }).trim();
    const absoluteHookPath = join(workspace, hookPath);

    expect((await runCli(['init'], { cliRoot, cwd: workspace })).exitCode).toBe(0);
    await expect(readFile(absoluteHookPath, 'utf8')).rejects.toThrow();
    const disable = await runCli(['workflow', 'disable'], { cliRoot, cwd: workspace });
    expect(disable.exitCode).toBe(0);
    expect(await readFile(absoluteHookPath, 'utf8')).toContain(
      'sduck managed retrospective post-commit hook',
    );
    expect((await runCli(['workflow', 'enable'], { cliRoot, cwd: workspace })).exitCode).toBe(0);

    await writeFile(absoluteHookPath, '#!/bin/sh\nexit 0\n');
    const userHook = await runCli(['workflow', 'disable'], { cliRoot, cwd: workspace });
    expect(userHook.exitCode).toBe(0);
    expect(userHook.stdout).toContain('Kept existing Git post-commit hook');
    expect(await readFile(absoluteHookPath, 'utf8')).toBe('#!/bin/sh\nexit 0\n');
  });
});
