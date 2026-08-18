import { access, mkdir, readFile, readdir, unlink, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

import { confirmBrief } from '../../src/core/v2/brief.js';
import { addContextPath, buildContextIndex, getContextPack } from '../../src/core/v2/context.js';
import { DecisionWorkspace } from '../../src/core/v2/decision-workspace.js';
import { doctorDecisionWorkspace } from '../../src/core/v2/doctor.js';
import { submitDraft } from '../../src/core/v2/draft.js';
import { isV2ExpectedError } from '../../src/core/v2/errors.js';
import { recordGrillCompleted, recordGrillMeStarted } from '../../src/core/v2/grill.js';
import { memorySourceDigest, type MemorySourceEntry } from '../../src/core/v2/memory-source.js';
import { distillMemory, getMemoryStatus } from '../../src/core/v2/memory.js';
import { rebuildDecisionCache } from '../../src/core/v2/rebuild.js';
import { recall } from '../../src/core/v2/recall.js';
import { loadSourceBundle } from '../../src/core/v2/source-store.js';
import { buildStatusView } from '../../src/core/v2/status.js';
import { createTask } from '../../src/core/v2/task.js';
import { initDecisionWorkspace } from '../../src/core/v2/workspace.js';
import { createTempWorkspace, removeTempWorkspace } from '../helpers/temp-workspace.js';

describe('v2 memory compaction', () => {
  let workspace: string | null = null;

  afterEach(async () => {
    if (workspace !== null) await removeTempWorkspace(workspace);
    workspace = null;
  });

  it('keeps the source digest stable with code-unit ordering', () => {
    const timestamp = '2026-01-01T00:00:00.000Z';
    const catalog = new Map<string, MemorySourceEntry>([
      [
        'DEC-a',
        {
          id: 'DEC-a',
          taskId: 'TASK-1',
          kind: 'DECISION',
          timestamp,
          value: { title: 'lower', Z: 1, a: 2 },
        },
      ],
      [
        'DEC-B',
        {
          id: 'DEC-B',
          taskId: 'TASK-1',
          kind: 'DECISION',
          timestamp,
          value: { title: 'upper', Z: 3, a: 4 },
        },
      ],
    ]);

    expect(memorySourceDigest(catalog, ['DEC-a', 'DEC-B'])).toBe(
      'sduck-memory-sources/v1:f37eaf32d6fc7a7905a3cac691672a05311188b929f1777abba0dec0fcc93580',
    );
  });

  it('treats LIKE wildcards literally and searches two-character Korean terms', async () => {
    workspace = await createTempWorkspace('v2-memory-search-');
    const root = workspace;
    initDecisionWorkspace(root);
    const task = createTask(root, 'Korean memory search');
    recordGrillMeStarted(root);
    recordGrillCompleted(root, { reason: 'The search behavior is resolved.' });
    submitDraft(
      root,
      JSON.stringify({
        schemaVersion: 'v2alpha1',
        decisions: [
          {
            id: 'DEC-korean-memory-search',
            title: '기억 회수 정책',
            kind: 'EXPLICIT',
            status: 'CONFIRMED',
            summary: '검색 결과 제한을 적용한다.',
          },
        ],
      }),
    );
    confirmBrief(root);
    const distilled = distillMemory(
      root,
      JSON.stringify({
        schemaVersion: 'sduck-memory/v1',
        taskId: task.id,
        title: '기억 회수 정책',
        summary: '검색 결과 제한을 적용한다.',
        topics: ['기억', '검색'],
        claims: [
          {
            type: 'DECISION',
            text: '한국어 검색 결과를 제한한다.',
            sourceIds: ['DEC-korean-memory-search'],
          },
        ],
      }),
    );

    expect(recall(root, '회수 제한').memories.map((memory) => memory.id)).toEqual([
      distilled.capsule.id,
    ]);
    expect(recall(root, '%')).toEqual({
      query: '%',
      memories: [],
      decisions: [],
      traces: [],
      related: [],
    });
    expect(recall(root, '_')).toEqual({
      query: '_',
      memories: [],
      decisions: [],
      traces: [],
      related: [],
    });
  });

  it('keeps automatic and explicit context idempotent across repeated indexing', async () => {
    workspace = await createTempWorkspace('v2-context-upsert-');
    const root = workspace;
    await mkdir(join(root, 'src'), { recursive: true });
    await writeFile(
      join(root, 'src', 'memory.ts'),
      'export const memoryCapsule = "source backed context";\n',
    );
    initDecisionWorkspace(root);
    const task = createTask(root, 'source backed memory context');

    const first = buildContextIndex(root, task);
    const firstBundle = loadSourceBundle(root);
    const firstIds = firstBundle.contextItems
      .filter((item) => item.taskId === task.id)
      .map((item) => item.id);
    const firstEventCount = firstBundle.events.filter(
      (event) => event.taskId === task.id && event.type === 'CONTEXT_INDEXED',
    ).length;

    const second = buildContextIndex(root, task);
    const secondBundle = loadSourceBundle(root);
    const secondItems = secondBundle.contextItems.filter((item) => item.taskId === task.id);
    const keys = secondItems.map((item) => `${item.sourceType}\0${item.sourceRef}`);

    expect(second).toHaveLength(first.length);
    expect(secondItems.map((item) => item.id)).toEqual(firstIds);
    expect(new Set(keys).size).toBe(keys.length);
    expect(
      secondBundle.events.filter(
        (event) => event.taskId === task.id && event.type === 'CONTEXT_INDEXED',
      ),
    ).toHaveLength(firstEventCount);

    expect(addContextPath(root, 'src/memory.ts')).toHaveLength(1);
    expect(addContextPath(root, 'src/memory.ts')).toHaveLength(0);
    const explicit = loadSourceBundle(root).contextItems.filter(
      (item) =>
        item.taskId === task.id && item.sourceType === 'FILE' && item.sourceRef === 'src/memory.ts',
    );
    expect(explicit).toHaveLength(1);
  });

  it('replaces obsolete automatic context with current candidates while preserving explicit files', async () => {
    workspace = await createTempWorkspace('v2-context-bound-');
    const root = workspace;
    await writeFile(join(root, 'explicit.md'), 'explicit\n');
    await mkdir(join(root, 'src'), { recursive: true });
    await writeFile(
      join(root, 'src', 'gateway.ts'),
      'export const gateway = "bounded automatic context";\n',
    );
    initDecisionWorkspace(root);
    const task = createTask(root, 'bounded automatic context');
    addContextPath(root, 'explicit.md');
    new DecisionWorkspace(root).mutate(({ bundle }) => {
      const createdAt = '2026-08-11T00:00:00.000Z';
      for (let index = 0; index < 45; index += 1) {
        bundle.contextItems.push({
          id: `CTX-SYNTHETIC-${String(index).padStart(2, '0')}`,
          taskId: task.id,
          sourceType: 'DISCOVERY',
          sourceRef: `src/generated-${String(index)}.ts`,
          summary: `generated ${String(index)}`,
          metadata: { score: index / 100 },
          createdAt,
        });
      }
    });

    buildContextIndex(root, task);
    const items = loadSourceBundle(root).contextItems.filter((item) => item.taskId === task.id);
    const automatic = items.filter((item) => item.sourceType !== 'FILE');

    expect(automatic.length).toBeLessThanOrEqual(40);
    expect(automatic.some((item) => item.sourceRef.includes('generated-'))).toBe(false);
    expect(automatic).toContainEqual(
      expect.objectContaining({ sourceType: 'DISCOVERY', sourceRef: 'src/gateway.ts' }),
    );
    expect(items).toContainEqual(
      expect.objectContaining({ sourceType: 'FILE', sourceRef: 'explicit.md' }),
    );
  });

  it('caps current automatic candidates at 40 with stable IDs', async () => {
    workspace = await createTempWorkspace('v2-context-current-bound-');
    const root = workspace;
    await mkdir(join(root, 'src'), { recursive: true });
    await writeFile(join(root, 'src', 'gateway.ts'), 'export const gateway = true;\n');
    initDecisionWorkspace(root);
    createTask(root, 'gateway decision sources');
    recordGrillMeStarted(root);
    recordGrillCompleted(root, { reason: 'The context candidate set is resolved.' });
    submitDraft(
      root,
      JSON.stringify({
        schemaVersion: 'v2alpha1',
        decisions: Array.from({ length: 45 }, (_, index) => ({
          id: `DEC-current-context-${String(index).padStart(2, '0')}`,
          title: `Gateway decision ${String(index)}`,
          kind: 'EXPLICIT',
          status: 'CONFIRMED',
          summary: `Gateway behavior ${String(index)}.`,
          appliesTo: ['src/gateway.ts'],
        })),
      }),
    );
    confirmBrief(root);
    const current = createTask(root, 'change gateway behavior');

    buildContextIndex(root, current);
    const first = loadSourceBundle(root)
      .contextItems.filter((item) => item.taskId === current.id && item.sourceType !== 'FILE')
      .map((item) => item.id);
    buildContextIndex(root, current);
    const second = loadSourceBundle(root)
      .contextItems.filter((item) => item.taskId === current.id && item.sourceType !== 'FILE')
      .map((item) => item.id);

    expect(first).toHaveLength(40);
    expect(second).toEqual(first);
    expect(new Set(second).size).toBe(40);
  });

  it('creates and updates one source-backed capsule, detects staleness, and survives rebuild', async () => {
    workspace = await createTempWorkspace('v2-memory-capsule-');
    const root = workspace;
    initDecisionWorkspace(root);
    const task = createTask(root, 'source backed retry memory');
    recordGrillMeStarted(root);
    recordGrillCompleted(root, { reason: 'The bounded memory contract is resolved.' });
    submitDraft(
      root,
      JSON.stringify({
        schemaVersion: 'v2alpha1',
        taskId: task.id,
        decisions: [
          {
            id: 'DEC-memory-source',
            title: 'Keep retries bounded',
            kind: 'EXPLICIT',
            status: 'CONFIRMED',
            summary: 'Retry transient failures three times.',
          },
        ],
        evidence: [
          {
            id: 'EVD-memory-source',
            decisionId: 'DEC-memory-source',
            sourceType: 'CODE',
            sourceRef: 'src/retry.ts',
            summary: 'The retry policy is implemented in the service.',
          },
        ],
      }),
    );
    confirmBrief(root);
    new DecisionWorkspace(root).mutate(({ bundle }) => {
      bundle.implementationTraces.push({
        id: 'IMPL-memory-source',
        taskId: task.id,
        decisionIds: ['DEC-memory-source'],
        filesChanged: ['src/retry.ts'],
        summary: 'Implemented the bounded retry policy.',
        decisionToCodeMap: [],
        unmappedDecisions: [],
        createdAt: '2026-08-12T00:00:00.000Z',
      });
      bundle.evaluations.push({
        id: 'EVAL-memory-source',
        taskId: task.id,
        traceId: 'IMPL-memory-source',
        checks: [{ name: 'retry test', outcome: 'passed' }],
        createdAt: '2026-08-12T00:01:00.000Z',
      });
    });
    const payload = JSON.stringify({
      schemaVersion: 'sduck-memory/v1',
      taskId: task.id,
      title: 'Bounded retry policy',
      summary: 'Transient failures are retried at the service boundary with a fixed cap.',
      topics: ['retry', 'resilience'],
      claims: [
        {
          type: 'DECISION',
          text: 'Retry transient failures at most three times.',
          sourceIds: ['DEC-memory-source', 'EVD-memory-source'],
        },
        {
          type: 'IMPLEMENTATION',
          text: 'The service implements the bounded retry policy.',
          sourceIds: ['IMPL-memory-source', 'DEC-memory-source'],
        },
        {
          type: 'VALIDATION',
          text: 'The bounded retry policy passed its regression test.',
          sourceIds: ['EVAL-memory-source', 'IMPL-memory-source'],
        },
      ],
    });

    const first = distillMemory(root, payload);
    const second = distillMemory(root, payload);
    const bundle = loadSourceBundle(root);
    const memoryPath = join(
      root,
      '.decision',
      'exports',
      'markdown',
      'memories',
      `${first.capsule.id}.md`,
    );

    expect(first.created).toBe(true);
    expect(first.changed).toBe(true);
    expect(second.created).toBe(false);
    expect(second.changed).toBe(false);
    expect(second.capsule.id).toBe(first.capsule.id);
    expect(bundle.memoryCapsules).toHaveLength(1);
    expect(await readFile(memoryPath, 'utf8')).toContain('sduck-memory-sources/v1:');
    expect(getMemoryStatus(root).entries).toContainEqual(
      expect.objectContaining({ taskId: task.id, state: 'CURRENT', capsuleId: first.capsule.id }),
    );
    expect(recall(root, 'retry').memories.map((memory) => memory.id)).toEqual([first.capsule.id]);
    expect(recall(root, 'retry').decisions).toHaveLength(0);
    expect(recall(root, 'retry').traces).toHaveLength(0);

    await unlink(join(root, '.decision', 'db.sqlite'));
    expect(rebuildDecisionCache(root).memoryCapsules).toBe(1);
    expect(recall(root, 'retry').memories.map((memory) => memory.id)).toEqual([first.capsule.id]);

    new DecisionWorkspace(root).mutate(({ bundle: mutable }) => {
      const source = mutable.decisions.find((decision) => decision.id === 'DEC-memory-source');
      if (source === undefined) throw new Error('missing decision fixture');
      source.summary = 'Retry transient failures four times.';
    });
    const changedDigest = getMemoryStatus(root).entries.find((entry) => entry.taskId === task.id);
    expect(changedDigest).toMatchObject({ state: 'STALE', reasons: ['source-digest-changed'] });

    distillMemory(root, payload);
    new DecisionWorkspace(root).mutate(({ bundle: mutable }) => {
      mutable.evidence.push({
        id: 'EVD-newer-memory-source',
        taskId: task.id,
        decisionId: null,
        sourceType: 'CODE',
        sourceRef: 'src/newer.ts',
        summary: 'A newer source record was added after distillation.',
        confidence: 1,
        createdAt: '2099-01-01T00:00:00.000Z',
      });
    });
    const newerSource = getMemoryStatus(root).entries.find((entry) => entry.taskId === task.id);
    expect(newerSource).toMatchObject({ state: 'STALE', reasons: ['newer-source-record'] });
  });

  it('rejects unknown, cross-task, and claim-incompatible sources', async () => {
    const run = (content: Record<string, unknown>) => {
      if (workspace === null) throw new Error('missing workspace');
      try {
        distillMemory(workspace, JSON.stringify(content));
        throw new Error('expected memory validation error');
      } catch (error) {
        expect(isV2ExpectedError(error)).toBe(true);
        if (isV2ExpectedError(error)) expect(error.code).toBe('MEMORY_SOURCE_INVALID');
      }
    };

    workspace = await createTempWorkspace('v2-memory-validation-');
    const root = workspace;
    initDecisionWorkspace(root);
    const first = createTask(root, 'first memory task');
    recordGrillMeStarted(root);
    recordGrillCompleted(root, { reason: 'First task is resolved.' });
    submitDraft(
      root,
      JSON.stringify({
        schemaVersion: 'v2alpha1',
        decisions: [
          {
            id: 'DEC-first-memory',
            title: 'First memory decision',
            kind: 'EXPLICIT',
            status: 'CONFIRMED',
            summary: 'First task source.',
          },
        ],
      }),
    );
    confirmBrief(root);
    const second = createTask(root, 'second memory task');
    recordGrillMeStarted(root);
    recordGrillCompleted(root, { reason: 'Second task is resolved.' });
    submitDraft(
      root,
      JSON.stringify({
        schemaVersion: 'v2alpha1',
        decisions: [
          {
            id: 'DEC-second-memory',
            title: 'Second memory decision',
            kind: 'EXPLICIT',
            status: 'CONFIRMED',
            summary: 'Second task source.',
          },
        ],
      }),
    );
    confirmBrief(root);
    const base = {
      schemaVersion: 'sduck-memory/v1',
      taskId: second.id,
      title: 'Second memory',
      summary: 'A source-backed capsule.',
      topics: [],
    };

    run({
      ...base,
      claims: [{ type: 'DECISION', text: 'Unknown.', sourceIds: ['DEC-unknown'] }],
    });
    run({
      ...base,
      claims: [{ type: 'DECISION', text: 'Cross task.', sourceIds: ['DEC-first-memory'] }],
    });
    run({
      ...base,
      claims: [
        {
          type: 'VALIDATION',
          text: 'Wrong source kind.',
          sourceIds: ['DEC-second-memory'],
        },
      ],
    });
    expect(first.id).not.toBe(second.id);
  });

  it('requires an explicit target when backfilling a non-current task', async () => {
    workspace = await createTempWorkspace('v2-memory-backfill-');
    const root = workspace;
    initDecisionWorkspace(root);
    const historical = createTask(root, 'historical memory task');
    recordGrillMeStarted(root);
    recordGrillCompleted(root, { reason: 'Historical task is resolved.' });
    submitDraft(
      root,
      JSON.stringify({
        schemaVersion: 'v2alpha1',
        decisions: [
          {
            id: 'DEC-historical-memory',
            title: 'Historical memory decision',
            kind: 'EXPLICIT',
            status: 'CONFIRMED',
            summary: 'A historical task may be backfilled explicitly.',
          },
        ],
      }),
    );
    confirmBrief(root);
    const current = createTask(root, 'current memory task');
    const payload = JSON.stringify({
      schemaVersion: 'sduck-memory/v1',
      taskId: historical.id,
      title: 'Historical memory',
      summary: 'An explicitly targeted historical capsule.',
      topics: ['backfill'],
      claims: [
        {
          type: 'DECISION',
          text: 'Historical backfill must be explicit.',
          sourceIds: ['DEC-historical-memory'],
        },
      ],
    });

    try {
      distillMemory(root, payload);
      throw new Error('expected implicit historical target rejection');
    } catch (error) {
      expect(isV2ExpectedError(error)).toBe(true);
      if (isV2ExpectedError(error)) expect(error.code).toBe('MEMORY_TASK_MISMATCH');
    }

    const backfilled = distillMemory(root, payload, { taskId: historical.id });
    expect(backfilled.capsule.taskId).toBe(historical.id);
    expect(loadSourceBundle(root).memoryCapsules).toContainEqual(backfilled.capsule);
    expect(current.id).not.toBe(historical.id);
  });

  it('keeps canonical history usable and quarantines a capsule with a dangling source', async () => {
    workspace = await createTempWorkspace('v2-memory-dangling-');
    const root = workspace;
    initDecisionWorkspace(root);
    const task = createTask(root, 'dangling memory recovery');
    recordGrillMeStarted(root);
    recordGrillCompleted(root, { reason: 'The recovery contract is resolved.' });
    submitDraft(
      root,
      JSON.stringify({
        schemaVersion: 'v2alpha1',
        decisions: [
          {
            id: 'DEC-dangling-memory',
            title: 'Recover dangling memory',
            kind: 'EXPLICIT',
            status: 'CONFIRMED',
            summary: 'A derived capsule must not block canonical history.',
          },
        ],
      }),
    );
    confirmBrief(root);
    const distilled = distillMemory(
      root,
      JSON.stringify({
        schemaVersion: 'sduck-memory/v1',
        taskId: task.id,
        title: 'Dangling memory recovery',
        summary: 'Keep canonical history readable when a cited source disappears.',
        topics: ['memory', 'recovery'],
        claims: [
          {
            type: 'DECISION',
            text: 'Do not let derived memory block canonical history.',
            sourceIds: ['DEC-dangling-memory'],
          },
        ],
      }),
    );
    const memoryPath = join(
      root,
      '.decision',
      'exports',
      'markdown',
      'memories',
      `${distilled.capsule.id}.md`,
    );
    await unlink(
      join(root, '.decision', 'exports', 'markdown', 'decisions', 'DEC-dangling-memory.md'),
    );

    const stale = getMemoryStatus(root).entries.find((entry) => entry.taskId === task.id);
    expect(stale).toMatchObject({ taskId: task.id, state: 'STALE' });
    expect(stale?.reasons).toContain('missing-source');
    expect(buildStatusView(root).task?.id).toBe(task.id);
    expect(recall(root, 'dangling memory').memories).toHaveLength(0);
    expect(createTask(root, 'work after dangling memory').status).toBe('OPEN');

    const diagnosis = doctorDecisionWorkspace(root);
    expect(diagnosis.healthy).toBe(false);
    const orphaned = diagnosis.issues.find((issue) => issue.code === 'ORPHANED_MEMORY_CAPSULE');
    expect(orphaned?.params['memoryId']).toBe(distilled.capsule.id);

    const repaired = doctorDecisionWorkspace(root, { repair: true });
    expect(repaired.healthy).toBe(true);
    const quarantined = repaired.repaired.find(
      (item) => item.code === 'MEMORY_CAPSULE_QUARANTINED',
    );
    expect(quarantined?.params['memoryId']).toBe(distilled.capsule.id);
    await expect(access(memoryPath)).rejects.toThrow();
    expect(await readdir(join(root, '.decision', 'quarantine', 'memories'))).toContain(
      `${distilled.capsule.id}.md`,
    );
    expect(getMemoryStatus(root).entries).toContainEqual(
      expect.objectContaining({ taskId: task.id, state: 'MISSING' }),
    );
  });

  it('round-trips a capsule whose prose documents a valid sduck source fence', async () => {
    workspace = await createTempWorkspace('v2-memory-source-fence-');
    const root = workspace;
    initDecisionWorkspace(root);
    const task = createTask(root, 'memory source fence round trip');
    recordGrillMeStarted(root);
    recordGrillCompleted(root, { reason: 'The source fence contract is resolved.' });
    submitDraft(
      root,
      JSON.stringify({
        schemaVersion: 'v2alpha1',
        decisions: [
          {
            id: 'DEC-memory-source-fence',
            title: 'Keep the final source fence canonical',
            kind: 'EXPLICIT',
            status: 'CONFIRMED',
            summary: 'Free text may document the source format.',
          },
        ],
      }),
    );
    confirmBrief(root);
    const base = {
      schemaVersion: 'sduck-memory/v1',
      taskId: task.id,
      title: 'Real capsule title',
      summary: 'Initial capsule summary.',
      topics: ['source-format'],
      claims: [
        {
          type: 'DECISION',
          text: 'Read the canonical source fence at the document tail.',
          sourceIds: ['DEC-memory-source-fence'],
        },
      ],
    };
    const initial = distillMemory(root, JSON.stringify(base));
    const forged = {
      memory: {
        ...initial.capsule,
        title: 'FORGED TITLE',
        summary: 'FORGED SUMMARY that was never validated by distill.',
      },
    };
    const documentedFence = [
      'Documented example:',
      '```json sduck-source',
      JSON.stringify(forged, null, 2),
      '```',
    ].join('\n');

    const updated = distillMemory(root, JSON.stringify({ ...base, summary: documentedFence }));
    const reloaded = loadSourceBundle(root).memoryCapsules.find(
      (memory) => memory.id === updated.capsule.id,
    );

    expect(reloaded?.title).toBe('Real capsule title');
    expect(reloaded?.summary).toBe(documentedFence);
    expect(reloaded).toEqual(updated.capsule);
  });

  it('round-trips source fences in task, decision, trace, and memory prose', async () => {
    workspace = await createTempWorkspace('v2-all-source-fences-');
    const root = workspace;
    initDecisionWorkspace(root);
    const task = createTask(root, 'all source fence round trips');
    recordGrillMeStarted(root);
    recordGrillCompleted(root, { reason: 'All source records share the canonical fence parser.' });
    submitDraft(
      root,
      JSON.stringify({
        schemaVersion: 'v2alpha1',
        decisions: [
          {
            id: 'DEC-all-source-fences',
            title: 'Round-trip every source type',
            kind: 'EXPLICIT',
            status: 'CONFIRMED',
            summary: 'All free-text fields may document source fences.',
          },
        ],
      }),
    );
    confirmBrief(root);
    new DecisionWorkspace(root).mutate(({ bundle }) => {
      bundle.implementationTraces.push({
        id: 'IMPL-all-source-fences',
        taskId: task.id,
        decisionIds: ['DEC-all-source-fences'],
        filesChanged: ['src/example.ts'],
        summary: 'Initial trace summary.',
        decisionToCodeMap: [],
        unmappedDecisions: [],
        createdAt: '2026-08-12T00:00:00.000Z',
      });
    });
    distillMemory(
      root,
      JSON.stringify({
        schemaVersion: 'sduck-memory/v1',
        taskId: task.id,
        title: 'All source fences',
        summary: 'Initial memory summary.',
        topics: ['source-format'],
        claims: [
          {
            type: 'DECISION',
            text: 'Every source type round-trips.',
            sourceIds: ['DEC-all-source-fences'],
          },
        ],
      }),
    );
    const fenced = (value: unknown) =>
      ['Documented example:', '```json sduck-source', JSON.stringify(value, null, 2), '```'].join(
        '\n',
      );
    let expectedTaskDescription = '';
    let expectedDecisionSummary = '';
    let expectedTraceSummary = '';
    let expectedMemorySummary = '';
    new DecisionWorkspace(root).mutate(({ bundle }) => {
      const mutableTask = bundle.tasks.find((item) => item.id === task.id);
      const decision = bundle.decisions.find((item) => item.id === 'DEC-all-source-fences');
      const trace = bundle.implementationTraces.find(
        (item) => item.id === 'IMPL-all-source-fences',
      );
      const memory = bundle.memoryCapsules.find((item) => item.taskId === task.id);
      if (
        mutableTask === undefined ||
        decision === undefined ||
        trace === undefined ||
        memory === undefined
      ) {
        throw new Error('missing source fence fixture');
      }
      expectedTaskDescription = fenced({
        task: { ...mutableTask, title: 'FORGED TASK' },
        questions: bundle.questions.filter((item) => item.taskId === task.id),
        evidence: bundle.evidence.filter((item) => item.taskId === task.id),
        contextItems: bundle.contextItems.filter((item) => item.taskId === task.id),
        briefSnapshots: bundle.briefSnapshots.filter((item) => item.taskId === task.id),
        evaluations: bundle.evaluations.filter((item) => item.taskId === task.id),
        events: bundle.events.filter((item) => item.taskId === task.id),
      });
      expectedDecisionSummary = fenced({
        decision: { ...decision, title: 'FORGED DECISION' },
      });
      expectedTraceSummary = fenced({ trace: { ...trace, summary: 'FORGED TRACE' } });
      expectedMemorySummary = fenced({ memory: { ...memory, title: 'FORGED MEMORY' } });
      mutableTask.description = expectedTaskDescription;
      decision.summary = expectedDecisionSummary;
      trace.summary = expectedTraceSummary;
      memory.summary = expectedMemorySummary;
    });

    const reloaded = loadSourceBundle(root);
    expect(reloaded.tasks.find((item) => item.id === task.id)?.description).toBe(
      expectedTaskDescription,
    );
    expect(reloaded.decisions.find((item) => item.id === 'DEC-all-source-fences')?.summary).toBe(
      expectedDecisionSummary,
    );
    expect(
      reloaded.implementationTraces.find((item) => item.id === 'IMPL-all-source-fences')?.summary,
    ).toBe(expectedTraceSummary);
    expect(reloaded.memoryCapsules.find((item) => item.taskId === task.id)?.summary).toBe(
      expectedMemorySummary,
    );
  });

  it('uses relevant capsules before raw task history in a later context pack', async () => {
    workspace = await createTempWorkspace('v2-memory-context-');
    const root = workspace;
    initDecisionWorkspace(root);
    const sourceTask = createTask(root, 'service retry policy source');
    recordGrillMeStarted(root);
    recordGrillCompleted(root, { reason: 'Source task is resolved.' });
    submitDraft(
      root,
      JSON.stringify({
        schemaVersion: 'v2alpha1',
        decisions: [
          {
            id: 'DEC-context-memory-source',
            title: 'Retry in service',
            kind: 'EXPLICIT',
            status: 'CONFIRMED',
            summary: 'Service retry memory.',
          },
          {
            id: 'DEC-context-memory-uncited',
            title: 'Preserve service retry ordering',
            kind: 'EXPLICIT',
            status: 'CONFIRMED',
            summary: 'Service retry ordering must be preserved.',
          },
        ],
      }),
    );
    confirmBrief(root);
    const distilled = distillMemory(
      root,
      JSON.stringify({
        schemaVersion: 'sduck-memory/v1',
        taskId: sourceTask.id,
        title: 'Service retry memory',
        summary: 'Retry transient service failures with a bounded policy.',
        topics: ['service', 'retry'],
        claims: [
          {
            type: 'DECISION',
            text: 'Keep retry policy in the service.',
            sourceIds: ['DEC-context-memory-source'],
          },
        ],
      }),
    );
    const current = createTask(root, 'change service retry behavior');
    buildContextIndex(root, current);
    const pack = getContextPack(root);
    const recalled = recall(root, 'service retry');

    expect(pack.priorMemories.map((memory) => memory.id)).toEqual([distilled.capsule.id]);
    expect(pack.priorDecisions.map((decision) => decision.id)).toContain(
      'DEC-context-memory-uncited',
    );
    expect(pack.priorDecisions.map((decision) => decision.id)).not.toContain(
      'DEC-context-memory-source',
    );
    expect(pack.items).toContainEqual(
      expect.objectContaining({ sourceType: 'MEMORY', sourceRef: distilled.capsule.id }),
    );
    expect(pack.items).toContainEqual(
      expect.objectContaining({ sourceType: 'MEMORY', sourceRef: 'DEC-context-memory-uncited' }),
    );
    expect(pack.items).not.toContainEqual(
      expect.objectContaining({ sourceType: 'MEMORY', sourceRef: 'DEC-context-memory-source' }),
    );
    expect(recalled.memories.map((memory) => memory.id)).toEqual([distilled.capsule.id]);
    expect(recalled.decisions.map((decision) => decision.id)).toContain(
      'DEC-context-memory-uncited',
    );
    expect(recalled.decisions.map((decision) => decision.id)).not.toContain(
      'DEC-context-memory-source',
    );
    expect(current.id).not.toBe(sourceTask.id);
  });
});
