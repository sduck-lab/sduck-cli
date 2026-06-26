import { execFileSync } from 'node:child_process';
import { readFile, unlink, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

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
    const codexRules = await readFile(join(workspace, 'AGENT.md'), 'utf8');
    const opencodeRules = await readFile(join(workspace, 'AGENTS.md'), 'utf8');
    expect(codexRules).toContain('<!-- sduck:begin -->');
    expect(codexRules).toContain('Selected agents: Codex');
    expect(codexRules).not.toContain('OpenCode Instructions');
    expect(opencodeRules).toContain('<!-- sduck:begin -->');
    expect(opencodeRules).toContain('Selected agents: OpenCode');
    expect(opencodeRules).not.toContain('Codex Instructions');
    expect(await readFile(join(workspace, 'GEMINI.md'), 'utf8')).toContain('<!-- sduck:begin -->');
    const work = await runCli(['work', 'payment retry 추가'], { cliRoot, cwd: workspace });
    expect(work.stdout).toContain('작업을 시작했어');

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
    const taskId = (JSON.parse(status.stdout) as { task: { id: string } }).task.id;
    const draft = JSON.stringify({
      schemaVersion: 'v2alpha1',
      taskId,
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
    const submit = execFileSync(
      join(cliRoot, 'node_modules', '.bin', 'tsx'),
      [join(cliRoot, 'src', 'cli.ts'), 'submit', '--stdin'],
      { cwd: workspace, input: draft, encoding: 'utf8' },
    );
    expect(submit).toContain('Draft submitted');

    expect(
      (await runCli(['answer', 'Q1', '--option', '1'], { cliRoot, cwd: workspace })).stdout,
    ).toContain('Answer saved');
    expect((await runCli(['brief'], { cliRoot, cwd: workspace })).stdout).toContain(
      'Implementation Brief',
    );
    const briefBeforeRebuild = await runCli(['brief', '--json'], { cliRoot, cwd: workspace });
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
      task: { id: taskId },
      openQuestionCount: parseBriefJson(briefBeforeRebuild.stdout).openQuestionCount,
    });

    await unlink(join(workspace, '.decision', 'db.sqlite'));
    const autoStatus = await runCli(['status', '--json'], { cliRoot, cwd: workspace });
    expect(autoStatus.exitCode).toBe(0);
    expect(JSON.parse(autoStatus.stdout)).toMatchObject({ task: { id: taskId } });
    expect((await runCli(['recall', 'retry'], { cliRoot, cwd: workspace })).stdout).toContain(
      '검색어',
    );
    expect((await runCli(['close'], { cliRoot, cwd: workspace })).stdout).toContain('closed');
    expect(await readFile(join(cliRoot, '.gitignore'), 'utf8')).toContain('.decision/db.sqlite');
  }, 15_000);
});
