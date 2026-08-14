import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

import { runCli } from '../helpers/run-cli.js';
import { createTempWorkspace, removeTempWorkspace } from '../helpers/temp-workspace.js';

const supportsNodeSqlite = (() => {
  const [major = '0', minor = '0'] = process.versions.node.split('.');
  return Number(major) > 22 || (Number(major) === 22 && Number(minor) >= 13);
})();

const describeIfSqlite = supportsNodeSqlite ? describe : describe.skip;

describeIfSqlite('v2 memory CLI', () => {
  const cliRoot = process.cwd();
  let workspace: string | null = null;

  afterEach(async () => {
    if (workspace !== null) await removeTempWorkspace(workspace);
    workspace = null;
  });

  it('distills, reports, recalls, and rebuilds a source-backed capsule', async () => {
    workspace = await createTempWorkspace('v2-memory-cli-');
    const root = workspace;
    expect((await runCli(['init'], { cliRoot, cwd: root })).exitCode).toBe(0);
    expect((await runCli(['work', 'bounded retry memory'], { cliRoot, cwd: root })).exitCode).toBe(
      0,
    );
    const status = await runCli(['status', '--json'], { cliRoot, cwd: root });
    const taskId = (JSON.parse(status.stdout) as { task: { id: string } }).task.id;
    expect(
      (
        await runCli(['grill', 'complete', '--reason', 'The memory contract is fully resolved'], {
          cliRoot,
          cwd: root,
        })
      ).exitCode,
    ).toBe(0);
    expect(
      (
        await runCli(['submit', '--stdin'], {
          cliRoot,
          cwd: root,
          stdin: JSON.stringify({
            schemaVersion: 'v2alpha1',
            taskId,
            implementationPlan: ['Distill the confirmed decision.'],
            verificationPlan: ['Check memory status and recall.'],
            decisions: [
              {
                id: 'DEC-memory-cli',
                title: 'Bound retries',
                kind: 'EXPLICIT',
                status: 'CONFIRMED',
                summary: 'Retry transient failures three times.',
              },
            ],
          }),
        })
      ).exitCode,
    ).toBe(0);
    expect((await runCli(['confirm'], { cliRoot, cwd: root })).exitCode).toBe(0);

    const before = await runCli(['memory', 'status', '--json'], { cliRoot, cwd: root });
    expect(JSON.parse(before.stdout)).toMatchObject({ current: 0, missing: 1, stale: 0 });
    const payload = JSON.stringify({
      schemaVersion: 'sduck-memory/v1',
      taskId,
      title: 'Bounded retry memory',
      summary: 'Transient failures use a fixed retry cap.',
      topics: ['retry'],
      claims: [
        {
          type: 'DECISION',
          text: 'Retry transient failures no more than three times.',
          sourceIds: ['DEC-memory-cli'],
        },
      ],
    });
    const distilled = await runCli(['memory', 'distill', '--stdin', '--json'], {
      cliRoot,
      cwd: root,
      stdin: payload,
    });
    expect(distilled.exitCode).toBe(0);
    const result = JSON.parse(distilled.stdout) as {
      capsule: { id: string };
      created: boolean;
      changed: boolean;
    };
    expect(result).toMatchObject({ created: true, changed: true });
    const repeated = await runCli(['memory', 'distill', '--stdin', '--json'], {
      cliRoot,
      cwd: root,
      stdin: payload,
    });
    expect(JSON.parse(repeated.stdout)).toMatchObject({ created: false, changed: false });

    const memoryFile = await readFile(
      join(root, '.decision', 'exports', 'markdown', 'memories', `${result.capsule.id}.md`),
      'utf8',
    );
    expect(memoryFile).toContain('DEC-memory-cli');
    const after = await runCli(['memory', 'status', '--json'], { cliRoot, cwd: root });
    expect(JSON.parse(after.stdout)).toMatchObject({ current: 1, missing: 0, stale: 0 });

    const recalled = await runCli(['recall', 'retry'], { cliRoot, cwd: root });
    expect(recalled.stdout).toContain(result.capsule.id);
    expect(recalled.stdout.indexOf('Related memory capsules')).toBeLessThan(
      recalled.stdout.indexOf('Related decisions'),
    );
    const rebuilt = await runCli(['rebuild'], { cliRoot, cwd: root });
    expect(rebuilt.stdout).toContain('Memory capsules: 1');

    expect((await runCli(['work', 'another current task'], { cliRoot, cwd: root })).exitCode).toBe(
      0,
    );
    const implicitBackfill = await runCli(['memory', 'distill', '--stdin'], {
      cliRoot,
      cwd: root,
      stdin: payload,
    });
    expect(implicitBackfill.exitCode).toBe(1);
    expect(implicitBackfill.stderr).toContain('Use --task for an explicit backfill');
    const explicitBackfill = await runCli(
      ['memory', 'distill', '--stdin', '--task', taskId, '--json'],
      { cliRoot, cwd: root, stdin: payload },
    );
    expect(explicitBackfill.exitCode).toBe(0);
    expect(JSON.parse(explicitBackfill.stdout)).toMatchObject({
      created: false,
      changed: false,
      capsule: { taskId },
    });
  }, 20_000);

  it('rejects a capsule claim without a compatible source', async () => {
    workspace = await createTempWorkspace('v2-memory-cli-invalid-');
    const root = workspace;
    await runCli(['init'], { cliRoot, cwd: root });
    await runCli(['config', 'locale', 'ko'], { cliRoot, cwd: root });
    await runCli(['work', 'invalid memory source'], { cliRoot, cwd: root });
    const status = await runCli(['status', '--json'], { cliRoot, cwd: root });
    const taskId = (JSON.parse(status.stdout) as { task: { id: string } }).task.id;
    await runCli(['grill', 'complete', '--reason', 'Resolved'], { cliRoot, cwd: root });
    await runCli(['submit', '--stdin'], {
      cliRoot,
      cwd: root,
      stdin: JSON.stringify({
        schemaVersion: 'v2alpha1',
        implementationPlan: ['Attempt memory distillation.'],
        verificationPlan: ['Expect incompatible source rejection.'],
        decisions: [
          {
            id: 'DEC-memory-cli-invalid',
            title: 'Decision only',
            kind: 'EXPLICIT',
            status: 'CONFIRMED',
            summary: 'No evaluation exists.',
          },
        ],
      }),
    });
    await runCli(['confirm'], { cliRoot, cwd: root });

    const result = await runCli(['memory', 'distill', '--stdin'], {
      cliRoot,
      cwd: root,
      stdin: JSON.stringify({
        schemaVersion: 'sduck-memory/v1',
        taskId,
        title: 'Invalid validation memory',
        summary: 'This claim uses the wrong source kind.',
        claims: [
          {
            type: 'VALIDATION',
            text: 'Tests passed.',
            sourceIds: ['DEC-memory-cli-invalid'],
          },
        ],
      }),
    });

    expect(result.exitCode).toBe(1);
    expect(`${result.stdout}\n${result.stderr}`).toContain('호환되지 않는 source 종류');
    expect(`${result.stdout}\n${result.stderr}`).not.toContain('incompatible-source-kind');
  }, 20_000);
});
