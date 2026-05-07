import { execFileSync } from 'node:child_process';
import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

import { runCli } from '../helpers/run-cli.js';
import { createTempWorkspace, removeTempWorkspace } from '../helpers/temp-workspace.js';

const supportsNodeSqlite = (() => {
  const [major = '0', minor = '0'] = process.versions.node.split('.');
  return Number(major) > 22 || (Number(major) === 22 && Number(minor) >= 13);
})();

const describeIfSqlite = supportsNodeSqlite ? describe : describe.skip;

describeIfSqlite('v2 CLI flow', () => {
  const cliRoot = process.cwd();
  let workspace: string | null = null;

  afterEach(async () => {
    if (workspace !== null) await removeTempWorkspace(workspace);
    workspace = null;
  });

  it('runs init, work, submit, answer, brief, confirm, trace, remember, recall, close', async () => {
    workspace = await createTempWorkspace('v2-cli-');
    execFileSync('git', ['init'], { cwd: workspace });
    await writeFile(join(workspace, 'tracked.ts'), 'export const tracked = 1;\n');
    execFileSync('git', ['add', 'tracked.ts'], { cwd: workspace });
    execFileSync('git', ['commit', '-m', 'initial'], {
      cwd: workspace,
      env: {
        ...process.env,
        GIT_AUTHOR_NAME: 't',
        GIT_AUTHOR_EMAIL: 't@example.com',
        GIT_COMMITTER_NAME: 't',
        GIT_COMMITTER_EMAIL: 't@example.com',
      },
    });

    expect((await runCli(['init'], { cliRoot, cwd: workspace })).exitCode).toBe(0);
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
      decisions: [],
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
  });
});
