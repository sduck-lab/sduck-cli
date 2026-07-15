import { existsSync } from 'node:fs';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

import {
  DecisionWorkspace,
  recoverInterruptedDecisionWorkspace,
} from '../../src/core/v2/decision-workspace.js';
import { submitDraft } from '../../src/core/v2/draft.js';
import { recordGrillMeStarted } from '../../src/core/v2/grill.js';
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
    recordGrillMeStarted(root);
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
    ).toThrow(/SOURCE_VALIDATION/);

    expect(sourceFingerprint(root)).toBe(beforeFingerprint);
    expect(await readFile(taskPath, 'utf8')).toBe(beforeContent);
  });

  it('rejects an explicit duplicate ID without overwriting the existing decision', async () => {
    workspace = await createTempWorkspace('decision-workspace-duplicate-');
    const root = workspace;
    initDecisionWorkspace(root);
    createTask(root, 'preserve duplicate IDs');
    recordGrillMeStarted(root);
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
    ).toThrow(/SOURCE_VALIDATION/);

    expect(sourceFingerprint(root)).toBe(beforeFingerprint);
    expect(await readFile(decisionPath, 'utf8')).toBe(beforeContent);
  });

  it('rejects path traversal IDs without changing source files', async () => {
    workspace = await createTempWorkspace('decision-workspace-traversal-');
    const root = workspace;
    initDecisionWorkspace(root);
    createTask(root, 'reject path traversal IDs');
    recordGrillMeStarted(root);
    const beforeFingerprint = sourceFingerprint(root);

    expect(() =>
      submitDraft(
        root,
        JSON.stringify({
          schemaVersion: 'v2alpha1',
          decisions: [
            {
              id: '../escape',
              title: 'Unsafe ID',
              kind: 'INFERRED',
              summary: 'Must be rejected before staging.',
            },
          ],
        }),
      ),
    ).toThrow(/id.*portable|invalid.*id|path/i);

    expect(sourceFingerprint(root)).toBe(beforeFingerprint);
    expect(existsSync(join(root, '.decision', 'exports', 'markdown', 'escape.md'))).toBe(false);
  });

  it('preserves unmanaged nested markdown files during canonical source replacement', async () => {
    workspace = await createTempWorkspace('decision-workspace-foreign-source-');
    const root = workspace;
    initDecisionWorkspace(root);
    createTask(root, 'preserve foreign markdown');
    recordGrillMeStarted(root);
    const foreignPath = join(
      root,
      '.decision',
      'exports',
      'markdown',
      'tasks',
      'foreign',
      'notes.md',
    );
    await mkdir(join(foreignPath, '..'), { recursive: true });
    await writeFile(foreignPath, '# User note\n\nDo not delete this file.\n');

    submitDraft(
      root,
      JSON.stringify({
        schemaVersion: 'v2alpha1',
        decisions: [
          {
            title: 'Managed update',
            kind: 'INFERRED',
            summary: 'Only managed files should be replaced.',
          },
        ],
      }),
    );

    expect(await readFile(foreignPath, 'utf8')).toContain('Do not delete this file.');
  });

  it('restores canonical source when a later artifact replacement fails', async () => {
    workspace = await createTempWorkspace('decision-workspace-rollback-');
    const root = workspace;
    initDecisionWorkspace(root);
    const task = createTask(root, 'restore source after failed commit');
    const taskPath = join(root, '.decision', 'exports', 'markdown', 'tasks', `${task.id}.md`);
    const beforeContent = await readFile(taskPath, 'utf8');
    await writeFile(join(root, 'generated'), 'a file blocks the artifact directory');

    expect(() => {
      new DecisionWorkspace(root).mutate(({ bundle, artifacts }) => {
        bundle.tasks = bundle.tasks.map((item) =>
          item.id === task.id ? { ...item, title: 'must roll back' } : item,
        );
        artifacts.set('generated/output.txt', 'this replacement must fail');
      });
    }).toThrow(/EEXIST|generated|artifact/i);

    expect(await readFile(taskPath, 'utf8')).toBe(beforeContent);
  });

  it('rejects artifacts that target decision-managed files before commit', async () => {
    workspace = await createTempWorkspace('decision-workspace-artifact-guard-');
    const root = workspace;
    initDecisionWorkspace(root);
    createTask(root, 'guard managed artifacts');
    const beforeFingerprint = sourceFingerprint(root);

    expect(() => {
      new DecisionWorkspace(root).mutate(({ artifacts }) => {
        artifacts.set('.decision/db.sqlite', 'must not replace the cache');
      });
    }).toThrow(/artifact.*managed|decision workspace|reserved/i);

    expect(sourceFingerprint(root)).toBe(beforeFingerprint);
  });

  it('recovers a durable commit journal after an interrupted replacement', async () => {
    workspace = await createTempWorkspace('decision-workspace-journal-');
    const root = workspace;
    initDecisionWorkspace(root);
    const task = createTask(root, 'recover interrupted replacement');
    const targetPath = join(root, '.decision', 'exports', 'markdown', 'tasks', `${task.id}.md`);
    const originalContent = await readFile(targetPath, 'utf8');
    const backupRoot = join(root, '.decision', '.rollback-test', 'markdown', 'tasks');
    const backupPath = join(backupRoot, `${task.id}.md`);
    await mkdir(backupRoot, { recursive: true });
    await writeFile(backupPath, originalContent);
    await writeFile(targetPath, '# interrupted replacement\n');
    const journalPath = join(root, '.decision', '.commit-test.json');
    await writeFile(
      journalPath,
      `${JSON.stringify({
        stagingRoot: join(root, '.decision', '.staging-test'),
        backupRoot: join(root, '.decision', '.rollback-test'),
        replacements: [
          {
            backupPath,
            hadOriginal: true,
            stagedPath: join(root, '.decision', '.staging-test', 'tasks', `${task.id}.md`),
            targetPath,
            originalMoved: true,
            stagedMoved: true,
          },
        ],
      })}\n`,
    );

    expect(recoverInterruptedDecisionWorkspace(root)).toBe(true);
    expect(await readFile(targetPath, 'utf8')).toBe(originalContent);
    expect(existsSync(journalPath)).toBe(false);
  });

  it('serializes 20 concurrent automatic-ID submissions without data loss or SQLite errors', async () => {
    workspace = await createTempWorkspace('decision-workspace-concurrent-');
    const root = workspace;
    initDecisionWorkspace(root);
    createTask(root, 'concurrent writers');
    recordGrillMeStarted(root);

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
    recordGrillMeStarted(root);
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

  it('rejects malformed state before changing canonical source or cache', async () => {
    workspace = await createTempWorkspace('decision-workspace-state-');
    const root = workspace;
    initDecisionWorkspace(root);
    createTask(root, 'reject malformed state');
    recordGrillMeStarted(root);
    const beforeFingerprint = sourceFingerprint(root);
    await writeFile(join(root, '.decision', 'state.json'), '{"currentTaskId": null}\n');

    expect(() =>
      submitDraft(
        root,
        JSON.stringify({
          schemaVersion: 'v2alpha1',
          decisions: [{ title: 'Blocked', kind: 'INFERRED', summary: 'Must not write.' }],
        }),
      ),
    ).toThrow(/STATE_INVALID/);
    expect(sourceFingerprint(root)).toBe(beforeFingerprint);
  });
});
