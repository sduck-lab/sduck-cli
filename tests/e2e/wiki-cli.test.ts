import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

import {
  WIKI_PAGE_DEFINITIONS,
  WIKI_SCHEMA_VERSION,
  type WikiPayload,
} from '../../src/core/v2/wiki.js';
import { runCli } from '../helpers/run-cli.js';
import { createTempWorkspace, removeTempWorkspace } from '../helpers/temp-workspace.js';

const cliRoot = process.cwd();

function payloadFor(sourceId: string, suffix = 'initial'): WikiPayload {
  return {
    schemaVersion: WIKI_SCHEMA_VERSION,
    pages: WIKI_PAGE_DEFINITIONS.map((page) => ({
      kind: page.kind,
      slug: page.slug,
      sections: page.sections.map((section) => ({
        id: section.id,
        blocks: [
          {
            type: 'explanation',
            markdown: `${section.id} ${suffix}.`,
            sourceIds: [sourceId],
          },
        ],
      })),
    })),
  };
}

describe('Auto Wiki CLI', () => {
  let workspace: string | undefined;

  afterEach(async () => {
    if (workspace !== undefined) await removeTempWorkspace(workspace);
    workspace = undefined;
  });

  it('runs the build, status, sync, and lint flow through the public CLI', async () => {
    workspace = await createTempWorkspace('wiki-cli-flow-');
    expect((await runCli(['init', '--no-agent-rules'], { cliRoot, cwd: workspace })).exitCode).toBe(
      0,
    );
    expect(
      (await runCli(['work', 'Build the project Wiki'], { cliRoot, cwd: workspace })).exitCode,
    ).toBe(0);
    const taskStatus = await runCli(['status', '--json'], { cliRoot, cwd: workspace });
    const taskId = (JSON.parse(taskStatus.stdout) as { task: { id: string } }).task.id;
    const initial = payloadFor(taskId);

    const built = await runCli(['wiki', 'build', '--stdin'], {
      cliRoot,
      cwd: workspace,
      stdin: JSON.stringify(initial),
    });
    expect(built).toMatchObject({ exitCode: 0 });
    expect(built.stdout).toContain('Wiki built');

    const status = await runCli(['wiki', 'status', '--json'], { cliRoot, cwd: workspace });
    expect(status.exitCode).toBe(0);
    expect(JSON.parse(status.stdout)).toMatchObject({
      enabled: true,
      dirtyCount: 0,
      staleCount: 0,
    });

    const updated = payloadFor(taskId, 'updated');
    const synced = await runCli(['wiki', 'sync', '--stdin', '--force'], {
      cliRoot,
      cwd: workspace,
      stdin: JSON.stringify({ ...updated, pages: [updated.pages[0]] }),
    });
    expect(synced).toMatchObject({ exitCode: 0 });
    expect(synced.stdout).toContain('Wiki synced');

    const linted = await runCli(['wiki', 'lint'], { cliRoot, cwd: workspace });
    expect(linted).toMatchObject({ exitCode: 0 });
    expect(linted.stdout).toContain('Wiki lint passed');
  }, 15_000);

  it('localizes Wiki help and command results in Korean', async () => {
    workspace = await createTempWorkspace('wiki-cli-ko-');
    expect((await runCli(['init', '--no-agent-rules'], { cliRoot, cwd: workspace })).exitCode).toBe(
      0,
    );
    expect((await runCli(['config', 'locale', 'ko'], { cliRoot, cwd: workspace })).exitCode).toBe(
      0,
    );

    const help = await runCli(['wiki', '--help'], { cliRoot, cwd: workspace });
    expect(help.exitCode).toBe(0);
    expect(help.stdout).toContain('근거 기반 Markdown Wiki');
    expect(help.stdout).toContain('build');
    expect(help.stdout).toContain('status');
    expect(help.stdout).toContain('sync');
    expect(help.stdout).toContain('lint');

    const status = await runCli(['wiki', 'status'], { cliRoot, cwd: workspace });
    expect(status).toMatchObject({ exitCode: 0 });
    expect(status.stdout).toContain('Wiki: 활성화됨');
    expect(status.stdout).toContain('Dirty 페이지: 5');

    const lint = await runCli(['wiki', 'lint'], { cliRoot, cwd: workspace });
    expect(lint.exitCode).toBe(1);
    expect(lint.stderr).toContain('Wiki lint 실패');

    expect(
      (await runCli(['work', '한국어 Wiki 결과 확인'], { cliRoot, cwd: workspace })).exitCode,
    ).toBe(0);
    const taskStatus = await runCli(['status', '--json'], { cliRoot, cwd: workspace });
    const taskId = (JSON.parse(taskStatus.stdout) as { task: { id: string } }).task.id;
    const initial = payloadFor(taskId);
    const built = await runCli(['wiki', 'build', '--stdin'], {
      cliRoot,
      cwd: workspace,
      stdin: JSON.stringify(initial),
    });
    expect(built).toMatchObject({ exitCode: 0 });
    expect(built.stdout).toContain('Wiki 빌드 완료');

    const updated = payloadFor(taskId, '갱신');
    const synced = await runCli(['wiki', 'sync', '--stdin', '--force'], {
      cliRoot,
      cwd: workspace,
      stdin: JSON.stringify({ ...updated, pages: [updated.pages[0]] }),
    });
    expect(synced).toMatchObject({ exitCode: 0 });
    expect(synced.stdout).toContain('Wiki 동기화 완료');
    const passingLint = await runCli(['wiki', 'lint'], { cliRoot, cwd: workspace });
    expect(passingLint).toMatchObject({ exitCode: 0 });
    expect(passingLint.stdout).toContain('Wiki lint 통과');
  }, 15_000);

  it('serializes concurrent Wiki writers without mixed page output', async () => {
    workspace = await createTempWorkspace('wiki-cli-concurrent-');
    expect((await runCli(['init', '--no-agent-rules'], { cliRoot, cwd: workspace })).exitCode).toBe(
      0,
    );
    expect(
      (await runCli(['work', 'Build a concurrent Wiki fixture'], { cliRoot, cwd: workspace }))
        .exitCode,
    ).toBe(0);
    const taskStatus = await runCli(['status', '--json'], { cliRoot, cwd: workspace });
    const taskId = (JSON.parse(taskStatus.stdout) as { task: { id: string } }).task.id;
    const initial = payloadFor(taskId);
    expect(
      (
        await runCli(['wiki', 'build', '--stdin'], {
          cliRoot,
          cwd: workspace,
          stdin: JSON.stringify(initial),
        })
      ).exitCode,
    ).toBe(0);

    const candidates = ['concurrent-a', 'concurrent-b', 'concurrent-c', 'concurrent-d'].map(
      (suffix) => {
        const payload = payloadFor(taskId, suffix);
        return {
          suffix,
          input: JSON.stringify({ ...payload, pages: [payload.pages[0]] }),
        };
      },
    );
    const projectRoot = workspace;
    const results = await Promise.all(
      candidates.map(({ input }) =>
        runCli(['wiki', 'sync', '--stdin', '--force'], {
          cliRoot,
          cwd: projectRoot,
          stdin: input,
        }),
      ),
    );

    expect(results.every((result) => result.exitCode === 0)).toBe(true);
    expect(
      results.flatMap((result) => result.stderr.match(/SQLITE_BUSY|database is locked/gi) ?? []),
    ).toHaveLength(0);
    const overview = await readFile(join(projectRoot, 'docs/wiki/README.md'), 'utf8');
    const winner = candidates.find(({ suffix }) => overview.includes(`purpose ${suffix}.`));
    if (winner === undefined) throw new Error('No concurrent sync winner was found.');
    expect(overview).toContain(`users-and-success ${winner.suffix}.`);
    expect(overview).toContain(`scope-and-constraints ${winner.suffix}.`);
    expect((await runCli(['wiki', 'lint'], { cliRoot, cwd: projectRoot })).exitCode).toBe(0);
  }, 15_000);
});
