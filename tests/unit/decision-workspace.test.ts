import { readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

import { submitDraft } from '../../src/core/v2/draft.js';
import { remember } from '../../src/core/v2/remember.js';
import { loadSourceBundle, sourceFingerprint } from '../../src/core/v2/source-store.js';
import { openDatabase } from '../../src/core/v2/store.js';
import { createTask } from '../../src/core/v2/task.js';
import { initDecisionWorkspace } from '../../src/core/v2/workspace.js';
import { runCli } from '../helpers/run-cli.js';
import { createTempWorkspace, removeTempWorkspace } from '../helpers/temp-workspace.js';

describe('DecisionWorkspace', () => {
  let workspace: string | null = null;

  afterEach(async () => {
    if (workspace !== null) await removeTempWorkspace(workspace);
    workspace = null;
  });

  it('does not mutate source when a draft contains a broken decision reference', async () => {
    workspace = await createTempWorkspace('decision-workspace-invalid-ref-');
    const root = workspace;
    initDecisionWorkspace(root);
    const task = createTask(root, 'preserve source on invalid input');
    const taskPath = join(root, '.decision', 'exports', 'markdown', 'tasks', `${task.id}.md`);
    const beforeFingerprint = sourceFingerprint(root);
    const beforeContent = await readFile(taskPath, 'utf8');

    expect(() =>
      submitDraft(
        root,
        JSON.stringify({
          schemaVersion: 'v2alpha1',
          questions: [
            {
              id: 'Q-broken-ref',
              decisionId: 'DEC-does-not-exist',
              text: 'Broken reference?',
              recommendedAnswer: 'Reject it',
            },
          ],
        }),
      ),
    ).toThrow(/question\.decisionId: missing decision DEC-does-not-exist/);

    expect(sourceFingerprint(root)).toBe(beforeFingerprint);
    expect(await readFile(taskPath, 'utf8')).toBe(beforeContent);
  });

  it('rejects an explicit duplicate ID without overwriting the existing decision', async () => {
    workspace = await createTempWorkspace('decision-workspace-duplicate-');
    const root = workspace;
    initDecisionWorkspace(root);
    createTask(root, 'preserve duplicate IDs');
    submitDraft(
      root,
      JSON.stringify({
        schemaVersion: 'v2alpha1',
        decisions: [
          {
            id: 'DEC-stable',
            title: 'Original decision',
            kind: 'INFERRED',
            summary: 'Keep the original.',
          },
        ],
      }),
    );
    const decisionPath = join(
      root,
      '.decision',
      'exports',
      'markdown',
      'decisions',
      'DEC-stable.md',
    );
    const beforeFingerprint = sourceFingerprint(root);
    const beforeContent = await readFile(decisionPath, 'utf8');

    expect(() =>
      submitDraft(
        root,
        JSON.stringify({
          schemaVersion: 'v2alpha1',
          decisions: [
            {
              id: 'DEC-stable',
              title: 'Overwrite attempt',
              kind: 'EXPLICIT',
              summary: 'This must never replace the original.',
            },
          ],
        }),
      ),
    ).toThrow(/decisions\.id: duplicate id DEC-stable/);

    expect(sourceFingerprint(root)).toBe(beforeFingerprint);
    expect(await readFile(decisionPath, 'utf8')).toBe(beforeContent);
  });

  it('serializes 20 concurrent automatic-ID submissions without data loss or SQLite errors', async () => {
    workspace = await createTempWorkspace('decision-workspace-concurrent-');
    const root = workspace;
    initDecisionWorkspace(root);
    createTask(root, 'concurrent writers');

    const results = await Promise.all(
      Array.from({ length: 20 }, (_, index) =>
        runCli(['submit', '--stdin'], {
          cliRoot: process.cwd(),
          cwd: root,
          stdin: JSON.stringify({
            schemaVersion: 'v2alpha1',
            decisions: [
              {
                title: `Concurrent decision ${String(index)}`,
                kind: 'INFERRED',
                summary: `Preserve writer ${String(index)}.`,
              },
            ],
          }),
        }),
      ),
    );

    expect(results.map((result) => result.exitCode)).toEqual(Array.from({ length: 20 }, () => 0));
    expect(
      results.flatMap((result) => result.stderr.match(/SQLITE_BUSY|database is locked/gi) ?? []),
    ).toEqual([]);
    const decisions = loadSourceBundle(root).decisions;
    expect(decisions).toHaveLength(20);
    expect(new Set(decisions.map((decision) => decision.id)).size).toBe(20);
    expect(new Set(decisions.map((decision) => decision.title)).size).toBe(20);
  }, 30_000);

  it('migrates a DB-only legacy workspace when remember is run', async () => {
    workspace = await createTempWorkspace('decision-workspace-db-only-');
    const root = workspace;
    initDecisionWorkspace(root);
    createTask(root, 'migrate legacy cache');
    submitDraft(
      root,
      JSON.stringify({
        schemaVersion: 'v2alpha1',
        decisions: [
          {
            id: 'DEC-legacy-cache',
            title: 'Legacy cache decision',
            kind: 'EXPLICIT',
            summary: 'Recover this decision from SQLite.',
          },
        ],
      }),
    );
    await rm(join(root, '.decision', 'exports', 'markdown'), { recursive: true });
    await writeFile(
      join(root, '.decision', 'state.json'),
      `${JSON.stringify({ currentTaskId: null, updatedAt: '2026-07-10T00:00:00.000Z' }, null, 2)}\n`,
    );
    const db = openDatabase(root);
    db.prepare(`DELETE FROM cache_metadata WHERE key = 'source_fingerprint'`).run();
    db.close();

    expect(() => remember(root)).not.toThrow();
    const migrated = loadSourceBundle(root);
    expect(migrated.decisions.map((decision) => decision.id)).toContain('DEC-legacy-cache');
    expect(migrated.tasks).toHaveLength(1);
  });

  it('diagnoses malformed canonical source with a concrete recovery path', async () => {
    workspace = await createTempWorkspace('decision-workspace-doctor-');
    const root = workspace;
    initDecisionWorkspace(root);
    await writeFile(
      join(root, '.decision', 'exports', 'markdown', 'tasks', 'broken.md'),
      '---\nid: TASK-broken\nstatus: OPEN\ncreated_at: 2026-07-10\n---\n# Broken\n\n```json sduck-source\n{"task":{"id":"TASK-broken"}}\n```\n',
    );

    const result = await runCli(['doctor'], { cliRoot: process.cwd(), cwd: root });

    expect(result.exitCode).toBe(1);
    expect(`${result.stdout}\n${result.stderr}`).toMatch(/broken\.md.*task\.title/s);
    expect(`${result.stdout}\n${result.stderr}`).toMatch(/fix.*source.*rebuild|repair/i);
  });
});
