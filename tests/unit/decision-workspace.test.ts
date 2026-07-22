import { existsSync } from 'node:fs';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

import { loadLegacyCacheBundle } from '../../src/core/v2/cache-bundle.js';
import { getContextPack } from '../../src/core/v2/context.js';
import {
  DecisionWorkspace,
  recoverInterruptedDecisionWorkspace,
} from '../../src/core/v2/decision-workspace.js';
import { submitDraft } from '../../src/core/v2/draft.js';
import { showGraph } from '../../src/core/v2/graph.js';
import { recordGrillMeStarted } from '../../src/core/v2/grill.js';
import { remember } from '../../src/core/v2/remember.js';
import {
  loadSourceBundle,
  sourceFingerprint,
  validateSourceBundle,
} from '../../src/core/v2/source-store.js';
import { readState, setCurrentTaskId } from '../../src/core/v2/state.js';
import { openDatabase } from '../../src/core/v2/store.js';
import { createTask, setTerminalStatus } from '../../src/core/v2/task.js';
import { initDecisionWorkspace } from '../../src/core/v2/workspace.js';
import { runCli } from '../helpers/run-cli.js';
import { createTempWorkspace, removeTempWorkspace } from '../helpers/temp-workspace.js';

import type { SourceBundle } from '../../src/core/v2/source-types.js';

describe('DecisionWorkspace', () => {
  let workspace: string | null = null;

  afterEach(async () => {
    if (workspace !== null) await removeTempWorkspace(workspace);
    workspace = null;
  });

  it('rejects malformed canonical guided and graph invariants', () => {
    const now = '2026-07-17T00:00:00.000Z';
    const base = (): SourceBundle => ({
      tasks: [
        {
          id: 'TASK-one',
          title: 'one',
          description: 'one',
          status: 'OPEN',
          expectedScope: [],
          avoidScope: [],
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'TASK-two',
          title: 'two',
          description: 'two',
          status: 'CONFIRMED',
          expectedScope: [],
          avoidScope: [],
          createdAt: now,
          updatedAt: now,
        },
      ],
      decisions: [
        {
          id: 'DEC-source',
          taskId: 'TASK-two',
          title: 'source',
          kind: 'EXPLICIT',
          status: 'CONFIRMED',
          confidence: 1,
          summary: 'source',
          rationale: [],
          appliesTo: [],
          avoids: [],
          sourceRefs: [],
          createdAt: now,
          updatedAt: now,
        },
      ],
      questions: [],
      evidence: [],
      contextItems: [],
      briefSnapshots: [],
      implementationTraces: [
        {
          id: 'IMPL-one',
          taskId: 'TASK-one',
          decisionIds: [],
          filesChanged: [],
          summary: 'trace',
          decisionToCodeMap: [],
          createdAt: now,
        },
      ],
      evaluations: [],
      events: [],
    });
    const firstDecision = (bundle: SourceBundle) => {
      const decision = bundle.decisions[0];
      if (decision === undefined) throw new Error('missing decision fixture');
      return decision;
    };
    const secondTask = (bundle: SourceBundle) => {
      const task = bundle.tasks[1];
      if (task === undefined) throw new Error('missing task fixture');
      return task;
    };
    const firstTrace = (bundle: SourceBundle) => {
      const trace = bundle.implementationTraces[0];
      if (trace === undefined) throw new Error('missing trace fixture');
      return trace;
    };

    const malformed = [
      (bundle: SourceBundle) => {
        bundle.decisions.push({
          ...firstDecision(bundle),
          id: 'DEC-carried',
          taskId: 'TASK-one',
          kind: 'CARRIED',
          rationale: [],
          sourceRefs: ['DEC-source'],
        });
      },
      (bundle: SourceBundle) => {
        bundle.decisions.push({
          ...firstDecision(bundle),
          id: 'DEC-carried',
          taskId: 'TASK-one',
          kind: 'CARRIED',
          rationale: ['carry'],
          sourceRefs: ['DEC-missing'],
        });
      },
      (bundle: SourceBundle) => {
        bundle.decisions.push({
          ...firstDecision(bundle),
          id: 'DEC-draft',
          status: 'DRAFT',
        });
        bundle.decisions.push({
          ...firstDecision(bundle),
          id: 'DEC-carried',
          taskId: 'TASK-one',
          kind: 'CARRIED',
          rationale: ['carry'],
          sourceRefs: ['DEC-draft'],
        });
      },
      (bundle: SourceBundle) => {
        bundle.decisions.push({
          ...firstDecision(bundle),
          id: 'DEC-same-task-source',
          taskId: 'TASK-one',
        });
        bundle.decisions.push({
          ...firstDecision(bundle),
          id: 'DEC-carried',
          taskId: 'TASK-one',
          kind: 'CARRIED',
          rationale: ['carry'],
          sourceRefs: ['DEC-same-task-source'],
        });
      },
      (bundle: SourceBundle) => {
        bundle.tasks[1] = { ...secondTask(bundle), status: 'ABANDONED' };
        bundle.decisions.push({
          ...firstDecision(bundle),
          id: 'DEC-carried',
          taskId: 'TASK-one',
          kind: 'CARRIED',
          rationale: ['carry'],
          sourceRefs: ['DEC-source'],
        });
      },
      (bundle: SourceBundle) => {
        bundle.events.push({
          id: 'EVT-bad',
          taskId: 'TASK-one',
          type: 'GRILL_COMPLETED',
          payload: { reason: '' },
          createdAt: now,
        });
      },
      (bundle: SourceBundle) => {
        bundle.evaluations.push({
          id: 'EVAL-bad',
          taskId: 'TASK-one',
          traceId: 'IMPL-one',
          checks: [],
          createdAt: now,
        });
      },
      (bundle: SourceBundle) => {
        bundle.implementationTraces.push({
          ...firstTrace(bundle),
          id: 'IMPL-two',
          taskId: 'TASK-two',
        });
        bundle.evaluations.push({
          id: 'EVAL-bad',
          taskId: 'TASK-one',
          traceId: 'IMPL-two',
          checks: [{ name: 'x', outcome: 'y' }],
          createdAt: now,
        });
      },
    ];

    for (const mutate of malformed) {
      const bundle = base();
      mutate(bundle);
      expect(() => {
        validateSourceBundle(bundle);
      }).toThrow();
    }
  });

  it('adds graph-derived context at read time without persisting it', async () => {
    workspace = await createTempWorkspace('decision-workspace-graph-context-');
    const root = workspace;
    initDecisionWorkspace(root);
    createTask(root, 'source task');
    recordGrillMeStarted(root);
    submitDraft(
      root,
      JSON.stringify({
        schemaVersion: 'v2alpha1',
        decisions: [
          {
            id: 'DEC-prior',
            title: 'Prior confirmed',
            kind: 'EXPLICIT',
            status: 'CONFIRMED',
            summary: 'Reusable prior decision.',
          },
        ],
      }),
    );
    createTask(root, 'carry prior');
    recordGrillMeStarted(root);
    submitDraft(
      root,
      JSON.stringify({
        schemaVersion: 'v2alpha1',
        decisions: [
          {
            id: 'DEC-carried-current',
            title: 'Carry prior',
            kind: 'CARRIED',
            status: 'CONFIRMED',
            summary: 'Carry prior forward.',
            rationale: ['Prior task already settled it.'],
            sourceRefs: ['DEC-prior'],
          },
        ],
      }),
    );
    const before = sourceFingerprint(root);
    const pack = getContextPack(root);
    expect(pack.items.some((item) => item.summary.includes('Graph history'))).toBe(true);
    expect(sourceFingerprint(root)).toBe(before);
  });

  it('caps graph show globally and keeps edge endpoints admitted', async () => {
    workspace = await createTempWorkspace('decision-workspace-graph-caps-');
    const root = workspace;
    const db = openDatabase(root);
    try {
      db.prepare(`INSERT INTO graph_nodes (id, kind, label) VALUES (?, ?, ?)`).run(
        'TASK-root',
        'task',
        'root',
      );
      for (let index = 0; index < 150; index += 1) {
        const id = `DEC-${String(index).padStart(4, '0')}`;
        db.prepare(`INSERT INTO graph_nodes (id, kind, label) VALUES (?, ?, ?)`).run(
          id,
          'decision',
          id,
        );
        db.prepare(`INSERT INTO graph_edges (id, from_id, to_id, kind) VALUES (?, ?, ?, ?)`).run(
          `TASK-root|HAS_DECISION|${id}`,
          'TASK-root',
          id,
          'HAS_DECISION',
        );
      }
    } finally {
      db.close();
    }
    const view = showGraph(root, 'TASK-root', 1);
    expect(view.nodes.length).toBeLessThanOrEqual(100);
    expect(view.edges.length).toBeLessThanOrEqual(200);
    expect(view.truncated).toBe(true);
    const nodeIds = new Set(view.nodes.map((node) => node.id));
    for (const edge of view.edges) {
      expect(nodeIds.has(edge.from)).toBe(true);
      expect(nodeIds.has(edge.to)).toBe(true);
    }
    expect(() => showGraph(root, 'TASK-root', Number.NaN)).toThrow(/GRAPH_DEPTH_INVALID/);
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

  it('round-trips record depth through canonical source and rebuilt cache', async () => {
    workspace = await createTempWorkspace('decision-workspace-record-depth-roundtrip-');
    const root = workspace;
    initDecisionWorkspace(root);

    const task = createTask(root, 'lightweight canonical task', { recordDepth: 'LIGHTWEIGHT' });
    const taskPath = join(root, '.decision', 'exports', 'markdown', 'tasks', `${task.id}.md`);
    const taskSource = await readFile(taskPath, 'utf8');

    expect(task.recordDepth).toBe('LIGHTWEIGHT');
    expect(taskSource).toContain('record_depth: LIGHTWEIGHT');
    expect(taskSource).toContain('"recordDepth": "LIGHTWEIGHT"');
    expect(loadSourceBundle(root).tasks[0]).toMatchObject({
      id: task.id,
      recordDepth: 'LIGHTWEIGHT',
    });

    await rm(join(root, '.decision', 'db.sqlite'), { force: true });
    const rebuild = await runCli(['rebuild'], { cliRoot: process.cwd(), cwd: root });
    expect(rebuild.exitCode).toBe(0);

    const db = openDatabase(root);
    try {
      const row = db.prepare(`SELECT record_depth FROM tasks WHERE id = ?`).get(task.id) as
        { record_depth?: unknown } | undefined;
      expect(row?.record_depth).toBe('LIGHTWEIGHT');
    } finally {
      db.close();
    }
  });

  it('resolves missing legacy Markdown and cache record depth to FULL', async () => {
    workspace = await createTempWorkspace('decision-workspace-record-depth-legacy-');
    const root = workspace;
    initDecisionWorkspace(root);
    const tasksDir = join(root, '.decision', 'exports', 'markdown', 'tasks');
    await writeFile(
      join(tasksDir, 'TASK-legacy-markdown.md'),
      [
        '---',
        'id: TASK-legacy-markdown',
        'type: task',
        'status: OPEN',
        'title: Legacy markdown',
        "created_at: '2026-07-22T00:00:00.000Z'",
        "updated_at: '2026-07-22T00:00:00.000Z'",
        '---',
        '# TASK-legacy-markdown: Legacy markdown',
        '',
      ].join('\n'),
    );

    expect(loadSourceBundle(root).tasks[0]).toMatchObject({
      id: 'TASK-legacy-markdown',
      recordDepth: 'FULL',
    });

    await rm(join(root, '.decision', 'exports', 'markdown'), { recursive: true, force: true });
    const db = openDatabase(root);
    try {
      db.prepare(
        `INSERT INTO tasks (id, title, description, status, expected_scope_json, avoid_scope_json, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      ).run(
        'TASK-legacy-cache',
        'Legacy cache',
        'Legacy cache',
        'OPEN',
        '[]',
        '[]',
        '2026-07-22T00:00:00.000Z',
        '2026-07-22T00:00:00.000Z',
      );
    } finally {
      db.close();
    }

    expect(loadLegacyCacheBundle(root).tasks[0]).toMatchObject({
      id: 'TASK-legacy-cache',
      recordDepth: 'FULL',
    });
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

  it('diagnoses and repairs a stale terminal current task pointer without rewriting source or cache', async () => {
    workspace = await createTempWorkspace('decision-workspace-terminal-pointer-');
    const root = workspace;
    initDecisionWorkspace(root);
    const task = createTask(root, 'stale terminal pointer');
    setTerminalStatus(root, 'ABANDONED');
    setCurrentTaskId(root, task.id);
    const beforeSourceFingerprint = sourceFingerprint(root);
    const beforeCacheFingerprint = cacheSourceFingerprint(root);

    const diagnosis = await runCli(['doctor'], { cliRoot: process.cwd(), cwd: root });

    expect(diagnosis.exitCode).toBe(1);
    expect(`${diagnosis.stdout}\n${diagnosis.stderr}`).toContain('STALE_TERMINAL_TASK_POINTER');
    expect(`${diagnosis.stdout}\n${diagnosis.stderr}`).toContain(task.id);

    const repair = await runCli(['doctor', '--repair'], { cliRoot: process.cwd(), cwd: root });

    expect(repair.exitCode).toBe(0);
    expect(repair.stdout).toContain('Cleared stale current task pointer');
    expect(readState(root).currentTaskId).toBeNull();
    expect(readState(root).updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(sourceFingerprint(root)).toBe(beforeSourceFingerprint);
    expect(cacheSourceFingerprint(root)).toBe(beforeCacheFingerprint);

    const repeatRepair = await runCli(['doctor', '--repair'], {
      cliRoot: process.cwd(),
      cwd: root,
    });
    expect(repeatRepair.exitCode).toBe(0);
    expect(repeatRepair.stdout).toContain('Decision workspace is healthy.');

    const nextTask = createTask(root, 'new task after repair');
    expect(nextTask.id).not.toBe(task.id);
    expect(readState(root).currentTaskId).toBe(nextTask.id);
  });

  it('reports and preserves non-terminal, missing, and malformed state during repair', async () => {
    workspace = await createTempWorkspace('decision-workspace-terminal-pointer-protected-');
    const root = workspace;
    initDecisionWorkspace(root);
    const task = createTask(root, 'open pointer is valid');

    let repair = await runCli(['doctor', '--repair'], { cliRoot: process.cwd(), cwd: root });
    expect(repair.exitCode).toBe(0);
    expect(readState(root).currentTaskId).toBe(task.id);

    const beforeMissingSourceFingerprint = sourceFingerprint(root);
    removeCacheSourceFingerprint(root);
    const beforeMissingCacheFingerprint = cacheSourceFingerprint(root);
    setCurrentTaskId(root, 'TASK-missing');
    repair = await runCli(['doctor', '--repair'], { cliRoot: process.cwd(), cwd: root });
    expect(repair.exitCode).toBe(1);
    expect(`${repair.stdout}\n${repair.stderr}`).toContain('MISSING_CURRENT_TASK_POINTER');
    expect(readState(root).currentTaskId).toBe('TASK-missing');
    expect(sourceFingerprint(root)).toBe(beforeMissingSourceFingerprint);
    expect(cacheSourceFingerprint(root)).toBe(beforeMissingCacheFingerprint);

    await writeFile(join(root, '.decision', 'state.json'), '{"currentTaskId": null}\n');
    repair = await runCli(['doctor', '--repair'], { cliRoot: process.cwd(), cwd: root });
    expect(repair.exitCode).toBe(1);
    expect(`${repair.stdout}\n${repair.stderr}`).toContain('INVALID_STATE');
    await expect(Promise.resolve().then(() => readState(root))).rejects.toThrow(/STATE_INVALID/);

    await writeFile(join(root, '.decision', 'state.json'), '{not-json}\n');
    repair = await runCli(['doctor', '--repair'], { cliRoot: process.cwd(), cwd: root });
    expect(repair.exitCode).toBe(1);
    expect(`${repair.stdout}\n${repair.stderr}`).toContain('INVALID_STATE');
    await expect(Promise.resolve().then(() => readState(root))).rejects.toThrow(
      /STATE_JSON_INVALID/,
    );
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

function cacheSourceFingerprint(projectRoot: string): string | null {
  const db = openDatabase(projectRoot);
  try {
    const row = db
      .prepare(`SELECT value FROM cache_metadata WHERE key = 'source_fingerprint'`)
      .get() as { value?: unknown } | undefined;
    return typeof row?.value === 'string' ? row.value : null;
  } finally {
    db.close();
  }
}

function removeCacheSourceFingerprint(projectRoot: string): void {
  const db = openDatabase(projectRoot);
  try {
    db.prepare(`DELETE FROM cache_metadata WHERE key = 'source_fingerprint'`).run();
  } finally {
    db.close();
  }
}
