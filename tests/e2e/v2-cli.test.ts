import { execFileSync } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

import { resolveRepoLocalCliEntrypoint, runCli } from '../helpers/run-cli.js';
import { createTempWorkspace, removeTempWorkspace } from '../helpers/temp-workspace.js';

import type { ImpactResult } from '../../src/types/index.js';

interface StatusJson {
  task: {
    id: string;
  } | null;
}

interface ContextJson {
  grillMePrompt: string;
  grillMeChecklist: unknown[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function parseStatusJson(value: string): StatusJson {
  const parsed: unknown = JSON.parse(value);
  if (!isRecord(parsed)) {
    throw new TypeError('Expected status JSON with task.id.');
  }
  if (parsed['task'] === null) {
    return { task: null };
  }
  if (!isRecord(parsed['task']) || typeof parsed['task']['id'] !== 'string') {
    throw new TypeError('Expected status JSON with task.id.');
  }
  return { task: { id: parsed['task']['id'] } };
}

function requireStatusTaskId(value: string): string {
  const task = parseStatusJson(value).task;
  if (task === null) throw new TypeError('Expected current task.');
  return task.id;
}

function parseContextJson(value: string): ContextJson {
  const parsed: unknown = JSON.parse(value);
  if (
    !isRecord(parsed) ||
    typeof parsed['grillMePrompt'] !== 'string' ||
    !Array.isArray(parsed['grillMeChecklist'])
  ) {
    throw new TypeError('Expected context JSON with grillMePrompt and grillMeChecklist.');
  }
  return {
    grillMePrompt: parsed['grillMePrompt'],
    grillMeChecklist: parsed['grillMeChecklist'],
  };
}

function parseImpactResult(value: string): ImpactResult {
  const parsed: unknown = JSON.parse(value);
  if (
    !isRecord(parsed) ||
    !Array.isArray(parsed['files']) ||
    !Array.isArray(parsed['directDecisions']) ||
    !Array.isArray(parsed['avoidWarnings']) ||
    !Array.isArray(parsed['plans']) ||
    !Array.isArray(parsed['traces']) ||
    !Array.isArray(parsed['provenance']) ||
    !Array.isArray(parsed['fallbackSearch'])
  ) {
    throw new TypeError('Expected impact result JSON shape.');
  }
  return parsed as unknown as ImpactResult;
}

const supportsNodeSqlite = (() => {
  const [major = '0', minor = '0'] = process.versions.node.split('.');
  return Number(major) > 22 || (Number(major) === 22 && Number(minor) >= 13);
})();

const describeIfSqlite = supportsNodeSqlite ? describe : describe.skip;

describeIfSqlite('v2 CLI flow', () => {
  const cliRoot = process.cwd();
  let workspace: string | null = null;
  const gitCommitEnv = {
    ...process.env,
    GIT_AUTHOR_NAME: 't',
    GIT_AUTHOR_EMAIL: 't@example.com',
    GIT_COMMITTER_NAME: 't',
    GIT_COMMITTER_EMAIL: 't@example.com',
  };

  afterEach(async () => {
    if (workspace !== null) await removeTempWorkspace(workspace);
    workspace = null;
  });

  async function submitDraftViaCli(projectRoot: string, draft: string): Promise<string> {
    const { cliEntrypoint, tsxBinaryPath } = await resolveRepoLocalCliEntrypoint(cliRoot);
    return execFileSync(process.execPath, [tsxBinaryPath, cliEntrypoint, 'submit', '--stdin'], {
      cwd: projectRoot,
      env: process.env,
      input: draft,
      encoding: 'utf8',
    });
  }

  async function createImpactCliWorkspace(): Promise<{
    avoidFile: string;
    targetFile: string;
    workspacePath: string;
  }> {
    workspace = await createTempWorkspace('v2-impact-cli-');
    execFileSync('git', ['init'], { cwd: workspace });
    await mkdir(join(workspace, 'src', 'core', 'v2'), { recursive: true });
    await writeFile(
      join(workspace, 'src', 'core', 'v2', 'trace.ts'),
      'export const trackedTrace = 1;\n',
    );
    await writeFile(
      join(workspace, 'src', 'core', 'v2', 'controller.ts'),
      'export const controller = 1;\n',
    );
    execFileSync('git', ['add', '.'], { cwd: workspace });
    execFileSync('git', ['commit', '-m', 'initial'], { cwd: workspace, env: gitCommitEnv });

    expect((await runCli(['init'], { cliRoot, cwd: workspace })).exitCode).toBe(0);
    expect((await runCli(['work', 'impact fixture'], { cliRoot, cwd: workspace })).exitCode).toBe(
      0,
    );

    const status = await runCli(['status', '--json'], { cliRoot, cwd: workspace });
    const taskId = requireStatusTaskId(status.stdout);
    const draft = JSON.stringify({
      schemaVersion: 'v2alpha1',
      taskId,
      decisions: [
        {
          id: 'DEC-impact-trace',
          title: 'Trace module changes stay localized',
          kind: 'EXPLICIT',
          status: 'CONFIRMED',
          summary: 'Prefer the trace module over the controller.',
          appliesTo: ['src/core/v2/trace.ts'],
          avoids: ['src/core/v2/controller.ts'],
        },
      ],
      questions: [],
      evidence: [],
    });
    expect(await submitDraftViaCli(workspace, draft)).toContain('Draft submitted');
    await writeFile(
      join(workspace, 'src', 'core', 'v2', 'trace.ts'),
      'export const trackedTrace = 2;\n',
    );

    return {
      avoidFile: 'src/core/v2/controller.ts',
      targetFile: 'src/core/v2/trace.ts',
      workspacePath: workspace,
    };
  }

  it('runs init, work, submit, answer, brief, confirm, trace, remember, recall, close', async () => {
    workspace = await createTempWorkspace('v2-cli-');
    execFileSync('git', ['init'], { cwd: workspace });
    await writeFile(join(workspace, 'tracked.ts'), 'export const tracked = 1;\n');
    execFileSync('git', ['add', 'tracked.ts'], { cwd: workspace });
    execFileSync('git', ['commit', '-m', 'initial'], { cwd: workspace, env: gitCommitEnv });

    expect((await runCli(['init'], { cliRoot, cwd: workspace })).exitCode).toBe(0);
    const work = await runCli(['work', 'payment retry 추가'], { cliRoot, cwd: workspace });
    expect(work.stdout).toContain('작업을 시작했어');

    const context = await runCli(['context'], { cliRoot, cwd: workspace });
    expect(context.stdout).toContain('Agent grill-me prompt:');
    expect(context.stdout).toContain('Skill-backed checklist:');
    expect(context.stdout).toContain('Interview the user relentlessly');

    const contextJson = await runCli(['context', '--json'], { cliRoot, cwd: workspace });
    const parsedContext = parseContextJson(contextJson.stdout);
    expect(typeof parsedContext.grillMePrompt).toBe('string');
    expect(parsedContext.grillMePrompt).toContain('design tree');
    expect(Array.isArray(parsedContext.grillMeChecklist)).toBe(true);

    const status = await runCli(['status', '--json'], { cliRoot, cwd: workspace });
    const taskId = requireStatusTaskId(status.stdout);
    const draft = JSON.stringify({
      schemaVersion: 'v2alpha1',
      taskId,
      decisions: [],
      questions: [
        { id: 'Q1', text: 'retry 횟수는?', recommendedAnswer: '3회', options: ['추천안 사용'] },
      ],
      evidence: [],
    });
    const submit = await submitDraftViaCli(workspace, draft);
    expect(submit).toContain('Draft submitted');

    expect(
      (await runCli(['answer', 'Q1', '--option', '1'], { cliRoot, cwd: workspace })).stdout,
    ).toContain('Answer saved');
    expect((await runCli(['brief'], { cliRoot, cwd: workspace })).stdout).toContain(
      'Implementation Brief',
    );
    expect((await runCli(['confirm'], { cliRoot, cwd: workspace })).stdout).toContain('confirmed');

    await writeFile(join(workspace, 'tracked.ts'), 'export const tracked = 2;\n');
    await writeFile(join(workspace, 'new-file.ts'), 'export const fresh = true;\n');
    const trace = await runCli(['trace', '--json'], { cliRoot, cwd: workspace });
    expect(trace.stdout).toContain('new-file.ts');

    expect((await runCli(['remember'], { cliRoot, cwd: workspace })).stdout).toContain(
      'decision-graph.json',
    );
    expect((await runCli(['recall', 'retry'], { cliRoot, cwd: workspace })).stdout).toContain(
      '검색어',
    );
    expect((await runCli(['close'], { cliRoot, cwd: workspace })).stdout).toContain('closed');
    const closedStatus = await runCli(['status', '--json'], { cliRoot, cwd: workspace });
    expect(parseStatusJson(closedStatus.stdout).task).toBeNull();
    const submitAfterClose = await runCli(['submit', '--stdin'], {
      cliRoot,
      cwd: workspace,
      input: JSON.stringify({ schemaVersion: 'v2alpha1', decisions: [] }),
    });
    expect(submitAfterClose.exitCode).toBe(1);
    expect(submitAfterClose.stderr).toContain('No current task');
  });

  it('uses root .decision from nested cwd and rejects unresolved-question confirm', async () => {
    workspace = await createTempWorkspace('v2-cli-nested-');
    execFileSync('git', ['init'], { cwd: workspace });
    await mkdir(join(workspace, 'src', 'nested'), { recursive: true });
    await writeFile(join(workspace, 'src', 'nested', 'file.ts'), 'export const nested = true;\n');

    expect((await runCli(['init'], { cliRoot, cwd: workspace })).exitCode).toBe(0);
    expect((await runCli(['work', 'nested cwd'], { cliRoot, cwd: workspace })).exitCode).toBe(0);

    const nestedCwd = join(workspace, 'src', 'nested');
    const status = await runCli(['status', '--json'], { cliRoot, cwd: nestedCwd });
    const taskId = requireStatusTaskId(status.stdout);
    const submit = await runCli(['submit', '--stdin'], {
      cliRoot,
      cwd: nestedCwd,
      input: JSON.stringify({
        schemaVersion: 'v2alpha1',
        taskId,
        decisions: [
          { id: 'DEC-nested', title: 'Nested root', kind: 'EXPLICIT', summary: 'Use root store.' },
        ],
        questions: [{ id: 'Q-nested', text: 'Open?', recommendedAnswer: 'yes' }],
      }),
    });
    expect(submit.exitCode).toBe(0);

    const confirm = await runCli(['confirm'], { cliRoot, cwd: nestedCwd });
    expect(confirm.exitCode).toBe(1);
    expect(confirm.stderr).toContain('questions remain open');
    const rootContext = await runCli(['context', '--json'], { cliRoot, cwd: workspace });
    expect(rootContext.exitCode).toBe(0);
  });

  it('rejects duplicate ids through the CLI without overwriting prior draft data', async () => {
    workspace = await createTempWorkspace('v2-cli-duplicate-');
    expect((await runCli(['init'], { cliRoot, cwd: workspace })).exitCode).toBe(0);
    expect((await runCli(['work', 'duplicate ids'], { cliRoot, cwd: workspace })).exitCode).toBe(0);
    const taskId = requireStatusTaskId(
      (await runCli(['status', '--json'], { cliRoot, cwd: workspace })).stdout,
    );

    const first = await runCli(['submit', '--stdin'], {
      cliRoot,
      cwd: workspace,
      input: JSON.stringify({
        schemaVersion: 'v2alpha1',
        taskId,
        decisions: [
          { id: 'DEC-cli-duplicate', title: 'Original', kind: 'EXPLICIT', summary: 'Keep.' },
        ],
      }),
    });
    expect(first.exitCode).toBe(0);

    const duplicate = await runCli(['submit', '--stdin'], {
      cliRoot,
      cwd: workspace,
      input: JSON.stringify({
        schemaVersion: 'v2alpha1',
        taskId,
        decisions: [
          { id: 'DEC-cli-duplicate', title: 'Overwrite', kind: 'EXPLICIT', summary: 'No.' },
        ],
      }),
    });
    expect(duplicate.exitCode).toBe(1);
    expect(duplicate.stderr).toContain('Decision id already exists: DEC-cli-duplicate');

    const brief = await runCli(['brief'], { cliRoot, cwd: workspace });
    expect(brief.stdout).toContain('Original');
    expect(brief.stdout).not.toContain('Overwrite');
  });

  it('clears current task after abandon and rejects mutation', async () => {
    workspace = await createTempWorkspace('v2-cli-abandon-');
    await writeFile(join(workspace, 'file.ts'), 'export const file = true;\n');
    expect((await runCli(['init'], { cliRoot, cwd: workspace })).exitCode).toBe(0);
    expect((await runCli(['work', 'abandon flow'], { cliRoot, cwd: workspace })).exitCode).toBe(0);
    const abandon = await runCli(['abandon'], { cliRoot, cwd: workspace });
    expect(abandon.exitCode).toBe(0);
    expect(
      parseStatusJson((await runCli(['status', '--json'], { cliRoot, cwd: workspace })).stdout)
        .task,
    ).toBeNull();
    const contextAdd = await runCli(['context', 'add', 'file.ts'], { cliRoot, cwd: workspace });
    expect(contextAdd.exitCode).toBe(1);
    expect(contextAdd.stderr).toContain('No current task');
  });

  it('installs agent rails during init by default and keeps it idempotent', async () => {
    workspace = await createTempWorkspace('v2-cli-init-agent-');
    const init = await runCli(['init'], { cliRoot, cwd: workspace });
    expect(init.exitCode).toBe(0);
    expect(init.stdout).toContain('Agent instructions:');
    expect(init.stdout).toContain('AGENTS.md');

    const agentsPath = join(workspace, 'AGENTS.md');
    let content = await readFile(agentsPath, 'utf8');
    expect(content).toContain('<!-- sduck:v2-agent-rails:begin -->');
    expect(content).toContain('sduck impact <file...> --json');
    expect(content).toContain('sduck submit --stdin');
    expect(content).toContain('sduck close');

    const secondInit = await runCli(['init'], { cliRoot, cwd: workspace });
    expect(secondInit.exitCode).toBe(0);
    content = await readFile(agentsPath, 'utf8');
    expect(content.match(/<!-- sduck:v2-agent-rails:begin -->/g)).toHaveLength(1);
  });

  it('preserves existing AGENTS.md content and supports init --no-agent', async () => {
    workspace = await createTempWorkspace('v2-cli-init-existing-agent-');
    await writeFile(join(workspace, 'AGENTS.md'), '# Existing agent rules\nKeep this.\n');

    const init = await runCli(['init'], { cliRoot, cwd: workspace });
    expect(init.exitCode).toBe(0);
    const content = await readFile(join(workspace, 'AGENTS.md'), 'utf8');
    expect(content).toContain('# Existing agent rules');
    expect(content).toContain('Keep this.');
    expect(content).toContain('<!-- sduck:v2-agent-rails:begin -->');

    const optOutWorkspace = await createTempWorkspace('v2-cli-init-no-agent-');
    try {
      const optOut = await runCli(['init', '--no-agent'], { cliRoot, cwd: optOutWorkspace });
      expect(optOut.exitCode).toBe(0);
      expect(optOut.stdout).toContain('skipped (--no-agent)');
      await expect(readFile(join(optOutWorkspace, 'AGENTS.md'), 'utf8')).rejects.toThrow();
      expect(await readFile(join(optOutWorkspace, '.decision', 'state.json'), 'utf8')).toContain(
        'currentTaskId',
      );
    } finally {
      await removeTempWorkspace(optOutWorkspace);
    }
  });

  it('prints parseable impact json with direct decisions and provenance in CLI flow', async () => {
    const { targetFile, workspacePath } = await createImpactCliWorkspace();

    const trace = await runCli(['trace', '--json'], { cliRoot, cwd: workspacePath });
    expect(trace.exitCode).toBe(0);
    expect(trace.stdout).toContain(targetFile);

    const impactJson = await runCli(['impact', targetFile, '--json'], {
      cliRoot,
      cwd: workspacePath,
    });
    expect(impactJson.exitCode).toBe(0);

    const parsed = parseImpactResult(impactJson.stdout);

    expect(Object.keys(parsed)).toEqual([
      'files',
      'directDecisions',
      'avoidWarnings',
      'plans',
      'traces',
      'provenance',
      'fallbackSearch',
    ]);
    expect(parsed.files).toEqual([targetFile]);
    expect(parsed.directDecisions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ entityId: 'DEC-impact-trace', file: targetFile }),
      ]),
    );
    expect(
      parsed.provenance.some(
        (item) =>
          item.decisionId === 'DEC-impact-trace' &&
          item.file === targetFile &&
          typeof item.traceId === 'string' &&
          item.traceId.includes('IMPL'),
      ),
    ).toBe(true);

    const impactHuman = await runCli(['impact', targetFile], { cliRoot, cwd: workspacePath });
    expect(impactHuman.exitCode).toBe(0);
    expect(impactHuman.stdout).toContain('Direct decisions');
    expect(impactHuman.stdout).toContain('Avoid warnings');
    expect(impactHuman.stdout).toContain('Provenance');
    expect(impactHuman.stdout).toContain('Fallback search');
  });

  it('shows avoid warnings in both json and human impact output', async () => {
    const { avoidFile, workspacePath } = await createImpactCliWorkspace();

    const impactJson = await runCli(['impact', avoidFile, '--json'], {
      cliRoot,
      cwd: workspacePath,
    });
    expect(impactJson.exitCode).toBe(0);
    const parsed = parseImpactResult(impactJson.stdout);
    expect(parsed.avoidWarnings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          entityId: 'DEC-impact-trace',
          file: avoidFile,
          matchSource: 'decision.avoids',
        }),
      ]),
    );

    const impactHuman = await runCli(['impact', avoidFile], { cliRoot, cwd: workspacePath });
    expect(impactHuman.exitCode).toBe(0);
    expect(impactHuman.stdout).toContain('Avoid warnings:');
    expect(impactHuman.stdout).toContain('DEC-impact-trace');
  });
});
