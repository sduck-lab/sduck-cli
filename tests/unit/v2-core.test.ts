import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

import { createTempWorkspace, removeTempWorkspace } from '../helpers/temp-workspace.js';

import type { DecisionToCodeMap, DraftDecision } from '../../src/types/index.js';
import type { DatabaseSync } from 'node:sqlite';

interface ImpactDbDeps {
  db: DatabaseSync;
  encodeJson: (value: unknown) => string;
  insertDecision: (db: DatabaseSync, taskId: string, draft: DraftDecision) => unknown;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

const supportsNodeSqlite = (() => {
  const [major = '0', minor = '0'] = process.versions.node.split('.');
  return Number(major) > 22 || (Number(major) === 22 && Number(minor) >= 13);
})();

const describeIfSqlite = supportsNodeSqlite ? describe : describe.skip;

describeIfSqlite('v2 core workflow', () => {
  let workspace: string | null = null;

  afterEach(async () => {
    if (workspace !== null) await removeTempWorkspace(workspace);
    workspace = null;
  });

  async function createImpactWorkspace(prefix = 'v2-impact-'): Promise<{
    taskId: string;
    workspacePath: string;
  }> {
    workspace = await createTempWorkspace(prefix);
    await Promise.all([
      mkdir(join(workspace, 'src', 'core', 'v2'), { recursive: true }),
      mkdir(join(workspace, 'src', 'controllers'), { recursive: true }),
      mkdir(join(workspace, 'src', 'lib'), { recursive: true }),
    ]);
    await Promise.all([
      writeFile(join(workspace, 'src', 'core', 'v2', 'trace.ts'), 'export const trace = true;\n'),
      writeFile(join(workspace, 'src', 'core', 'v2', 'render.ts'), 'export const render = true;\n'),
      writeFile(
        join(workspace, 'src', 'controllers', 'paymentController.ts'),
        'export const controller = true;\n',
      ),
      writeFile(
        join(workspace, 'src', 'lib', 'mystery-helper.ts'),
        'export const helper = true;\n',
      ),
    ]);

    const { initDecisionWorkspace } = await import('../../src/core/v2/workspace.js');
    const { createTask } = await import('../../src/core/v2/task.js');

    initDecisionWorkspace(workspace);
    const task = createTask(workspace, 'impact fixture');
    return { taskId: task.id, workspacePath: workspace };
  }

  async function withImpactDb<T>(
    projectRoot: string,
    run: (deps: ImpactDbDeps) => T | Promise<T>,
  ): Promise<T> {
    const { insertDecision } = await import('../../src/core/v2/decision.js');
    const { encodeJson, openDatabase } = await import('../../src/core/v2/store.js');
    const db = openDatabase(projectRoot);
    try {
      return await run({ db, encodeJson, insertDecision });
    } finally {
      db.close();
    }
  }

  async function insertImplementationPlanFixture(input: {
    id: string;
    taskId: string;
    title: string;
    summary: string;
    targetFiles: string[];
    steps: unknown[];
    createdAt?: string;
    workspacePath: string;
  }): Promise<void> {
    await withImpactDb(input.workspacePath, ({ db, encodeJson }) => {
      db.exec(`
        CREATE TABLE implementation_plans (
          id TEXT PRIMARY KEY,
          task_id TEXT NOT NULL,
          title TEXT NOT NULL,
          summary TEXT NOT NULL,
          target_files_json TEXT NOT NULL,
          steps_json TEXT NOT NULL,
          created_at TEXT NOT NULL
        )
      `);
      db.prepare(
        `INSERT INTO implementation_plans (id, task_id, title, summary, target_files_json, steps_json, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
      ).run(
        input.id,
        input.taskId,
        input.title,
        input.summary,
        encodeJson(input.targetFiles),
        encodeJson(input.steps),
        input.createdAt ?? '2026-06-05T00:00:00.000Z',
      );
    });
  }

  async function insertImplementationTraceFixture(input: {
    id: string;
    taskId: string;
    decisionIds?: string[];
    filesChanged: string[];
    summary: string;
    decisionToCodeMap?: DecisionToCodeMap[];
    createdAt?: string;
    workspacePath: string;
  }): Promise<void> {
    await withImpactDb(input.workspacePath, ({ db, encodeJson }) => {
      db.prepare(
        `INSERT INTO implementation_traces (id, task_id, decision_ids_json, files_changed_json, summary, decision_to_code_map_json, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
      ).run(
        input.id,
        input.taskId,
        encodeJson(input.decisionIds ?? []),
        encodeJson(input.filesChanged),
        input.summary,
        encodeJson(input.decisionToCodeMap ?? []),
        input.createdAt ?? '2026-06-05T00:00:00.000Z',
      );
    });
  }

  it('initializes workspace, submits draft, answers, confirms, remembers, and recalls', async () => {
    workspace = await createTempWorkspace('v2-core-');
    await mkdir(join(workspace, 'src'), { recursive: true });
    await writeFile(join(workspace, 'src', 'paymentService.ts'), 'export const payment = true;\n');

    const { initDecisionWorkspace } = await import('../../src/core/v2/workspace.js');
    const { createTask } = await import('../../src/core/v2/task.js');
    const {
      buildContextIndex,
      getContextPack,
      GRILL_ME_CHECKLIST,
      GRILL_ME_PROMPT,
      GRILL_ME_PROTOCOL,
    } = await import('../../src/core/v2/context.js');
    const { submitDraft } = await import('../../src/core/v2/draft.js');
    const { answerQuestion } = await import('../../src/core/v2/question.js');
    const { buildBriefView, confirmBrief } = await import('../../src/core/v2/brief.js');
    const { remember } = await import('../../src/core/v2/remember.js');
    const { recall } = await import('../../src/core/v2/recall.js');

    initDecisionWorkspace(workspace);
    const task = createTask(workspace, 'payment retry 추가');
    const context = buildContextIndex(workspace, task);
    expect(context.some((item) => item.sourceRef.includes('paymentService'))).toBe(true);

    const contextPack = getContextPack(workspace);
    expect(contextPack.grillMeProtocol).toEqual([...GRILL_ME_PROTOCOL]);
    expect(contextPack.grillMePrompt).toBe(GRILL_ME_PROMPT);
    expect(contextPack.grillMeChecklist).toEqual([...GRILL_ME_CHECKLIST]);
    expect(contextPack.grillMePrompt).toContain('Interview the user relentlessly');
    expect(contextPack.grillMePrompt).toContain('design tree');
    expect(contextPack.grillMePrompt).toContain('recommended answer');
    expect(contextPack.grillMePrompt).toContain('sduck submit --stdin');
    expect(contextPack.grillMeChecklist).toEqual(
      expect.arrayContaining([
        expect.stringContaining('glossary'),
        expect.stringContaining('public interfaces'),
        expect.stringContaining('feedback loop'),
        expect.stringContaining('module'),
        expect.stringContaining('out-of-scope'),
      ]),
    );

    const submitted = submitDraft(
      workspace,
      JSON.stringify({
        schemaVersion: 'v2alpha1',
        taskId: task.id,
        decisions: [
          {
            id: 'DEC-service-retry',
            title: 'Retry는 service policy에 둔다',
            kind: 'INFERRED',
            summary: 'Controller retry loop는 피한다.',
            confidence: 0.8,
            rationale: ['기존 파일명이 service 중심이다.'],
            appliesTo: ['src/paymentService.ts'],
            avoids: ['src/paymentController.ts'],
          },
        ],
        questions: [
          {
            id: 'Q-retry-target',
            text: 'retry 대상 error는 어디까지로 할까?',
            recommendedAnswer: 'timeout / transient network error만 retry',
            rationale: ['validation error는 retry 가치가 낮다.'],
            options: ['추천안 사용', 'timeout만 retry'],
          },
        ],
        evidence: [],
        expectedScope: ['src/paymentService.ts'],
        avoidScope: ['src/paymentController.ts'],
      }),
    );
    expect(submitted.questions).toBe(1);

    const answered = answerQuestion(workspace, 'Q-retry-target', { optionIndex: 1 });
    expect(answered.answer).toContain('transient');

    const brief = buildBriefView(workspace);
    expect(brief.decisions.EXPLICIT).toHaveLength(1);
    expect(brief.decisions.INFERRED).toHaveLength(1);
    expect(brief.openQuestionCount).toBe(0);

    const snapshot = confirmBrief(workspace);
    expect(snapshot.renderedMarkdown).toContain('Implementation Brief');

    const exported = remember(workspace);
    expect(exported.created.some((file) => file.endsWith('decision-graph.json'))).toBe(true);
    const graph = await readFile(
      join(workspace, '.decision', 'exports', 'graphify', 'decision-graph.json'),
      'utf8',
    );
    expect(graph).toContain('DEC-service-retry');

    const recalled = recall(workspace, 'Retry');
    expect(recalled.decisions.length).toBeGreaterThan(0);
  });

  it('parses markdown fenced json draft', async () => {
    workspace = await createTempWorkspace('v2-markdown-');
    const { initDecisionWorkspace } = await import('../../src/core/v2/workspace.js');
    const { createTask } = await import('../../src/core/v2/task.js');
    const { submitDraft } = await import('../../src/core/v2/draft.js');

    initDecisionWorkspace(workspace);
    const task = createTask(workspace, 'markdown draft');
    const result = submitDraft(
      workspace,
      `# Draft\n\n\`\`\`json sduck-draft\n{"schemaVersion":"v2alpha1","taskId":"${task.id}","questions":[],"decisions":[],"evidence":[]}\n\`\`\`\n`,
    );
    expect(result.taskId).toBe(task.id);
  });

  it('returns direct decisions for exact appliesTo matches', async () => {
    const { taskId, workspacePath } = await createImpactWorkspace('v2-impact-direct-');
    const { buildImpact } = await import('../../src/core/v2/impact.js');

    await withImpactDb(workspacePath, ({ db, insertDecision }) => {
      insertDecision(db, taskId, {
        id: 'DEC-direct-trace',
        title: 'Trace module owns impact logic',
        kind: 'EXPLICIT',
        status: 'CONFIRMED',
        summary: 'Edit the trace module directly.',
        appliesTo: ['src/core/v2/trace.ts'],
      });
    });

    const result = buildImpact(workspacePath, ['src/core/v2/trace.ts']);

    expect(result.directDecisions).toEqual([
      expect.objectContaining({
        file: 'src/core/v2/trace.ts',
        entityId: 'DEC-direct-trace',
        entityType: 'decision',
        confidence: 0.9,
        matchSource: 'decision.appliesTo',
      }),
    ]);
    expect(result.directDecisions[0]?.explanation).toContain('exact-matched');
  });

  it('returns lower-confidence direct decisions for prefix appliesTo matches', async () => {
    const { taskId, workspacePath } = await createImpactWorkspace('v2-impact-prefix-');
    const { buildImpact } = await import('../../src/core/v2/impact.js');

    await withImpactDb(workspacePath, ({ db, insertDecision }) => {
      insertDecision(db, taskId, {
        id: 'DEC-prefix-trace',
        title: 'Trace module boundary',
        kind: 'INFERRED',
        summary: 'Treat the whole v2 module consistently.',
        appliesTo: ['src/core/v2'],
      });
    });

    const result = buildImpact(workspacePath, ['src/core/v2/trace.ts']);

    expect(result.directDecisions).toEqual([
      expect.objectContaining({
        entityId: 'DEC-prefix-trace',
        confidence: 0.7,
        matchSource: 'decision.appliesTo',
      }),
    ]);
    expect(result.directDecisions[0]?.explanation).toContain('prefix-matched');
  });

  it('returns avoid warnings for exact avoids matches', async () => {
    const { taskId, workspacePath } = await createImpactWorkspace('v2-impact-avoid-');
    const { buildImpact } = await import('../../src/core/v2/impact.js');

    await withImpactDb(workspacePath, ({ db, insertDecision }) => {
      insertDecision(db, taskId, {
        id: 'DEC-avoid-controller',
        title: 'Avoid controller retry logic',
        kind: 'EXPLICIT',
        status: 'CONFIRMED',
        summary: 'Keep retry orchestration out of the controller.',
        avoids: ['src/controllers/paymentController.ts'],
      });
    });

    const result = buildImpact(workspacePath, ['src/controllers/paymentController.ts']);

    expect(result.avoidWarnings).toEqual([
      expect.objectContaining({
        entityId: 'DEC-avoid-controller',
        entityType: 'avoid_warning',
        confidence: 0.95,
        matchSource: 'decision.avoids',
      }),
    ]);
  });

  it('returns compatible implementation plans from target_files_json exact matches', async () => {
    const { taskId, workspacePath } = await createImpactWorkspace('v2-impact-plan-target-');
    const { buildImpact } = await import('../../src/core/v2/impact.js');

    await insertImplementationPlanFixture({
      id: 'PLAN-trace-target',
      taskId,
      title: 'Refactor trace impact command',
      summary: 'Touch the trace module directly.',
      targetFiles: ['src/core/v2/trace.ts'],
      steps: [],
      workspacePath,
    });

    const result = buildImpact(workspacePath, ['src/core/v2/trace.ts']);

    expect(result.plans).toEqual([
      expect.objectContaining({
        entityId: 'PLAN-trace-target',
        entityType: 'implementation_plan',
        planId: 'PLAN-trace-target',
        matchSource: 'implementation_plan.targetFiles',
        confidence: 0.9,
      }),
    ]);
  });

  it('returns compatible implementation plan step matches with stepId and step source', async () => {
    const { taskId, workspacePath } = await createImpactWorkspace('v2-impact-plan-step-');
    const { buildImpact } = await import('../../src/core/v2/impact.js');

    await insertImplementationPlanFixture({
      id: 'PLAN-trace-step',
      taskId,
      title: 'Split trace work',
      summary: 'Track target files at the step level.',
      targetFiles: [],
      steps: [{ title: 'Update trace implementation', targetFiles: ['src/core/v2/trace.ts'] }],
      workspacePath,
    });

    const result = buildImpact(workspacePath, ['src/core/v2/trace.ts']);

    expect(result.plans).toEqual([
      expect.objectContaining({
        entityId: 'PLAN-trace-step',
        planId: 'PLAN-trace-step',
        stepId: 'PLAN-trace-step:step:1',
        matchSource: 'implementation_plan.step.targetFiles',
        confidence: 0.9,
      }),
    ]);
  });

  it('returns implementation traces for exact files_changed_json matches', async () => {
    const { taskId, workspacePath } = await createImpactWorkspace('v2-impact-trace-files-');
    const { buildImpact } = await import('../../src/core/v2/impact.js');

    await insertImplementationTraceFixture({
      id: 'IMPL-trace-files',
      taskId,
      filesChanged: ['src/core/v2/trace.ts'],
      summary: 'Changed the trace module before.',
      workspacePath,
    });

    const result = buildImpact(workspacePath, ['src/core/v2/trace.ts']);

    expect(result.traces).toEqual([
      expect.objectContaining({
        entityId: 'IMPL-trace-files',
        entityType: 'implementation_trace',
        traceId: 'IMPL-trace-files',
        matchSource: 'implementation_trace.filesChanged',
        confidence: 0.7,
      }),
    ]);
  });

  it('returns exact provenance matches from decision_to_code_map_json with confidence 1', async () => {
    const { taskId, workspacePath } = await createImpactWorkspace('v2-impact-provenance-');
    const { buildImpact } = await import('../../src/core/v2/impact.js');

    await withImpactDb(workspacePath, ({ db, insertDecision }) => {
      insertDecision(db, taskId, {
        id: 'DEC-provenance-trace',
        title: 'Trace decision provenance',
        kind: 'EXPLICIT',
        status: 'CONFIRMED',
        summary: 'This decision should map straight to the trace file.',
      });
    });
    await insertImplementationTraceFixture({
      id: 'IMPL-provenance-trace',
      taskId,
      decisionIds: ['DEC-provenance-trace'],
      filesChanged: [],
      summary: 'Captured provenance for trace edits.',
      decisionToCodeMap: [
        {
          decisionId: 'DEC-provenance-trace',
          files: ['src/core/v2/trace.ts'],
          summary: 'Mapped directly to the trace module.',
        },
      ],
      workspacePath,
    });

    const result = buildImpact(workspacePath, ['src/core/v2/trace.ts']);

    expect(result.provenance).toEqual([
      expect.objectContaining({
        entityId: 'IMPL-provenance-trace:DEC-provenance-trace',
        entityType: 'provenance',
        decisionId: 'DEC-provenance-trace',
        traceId: 'IMPL-provenance-trace',
        matchSource: 'implementation_trace.decisionToCodeMap',
        confidence: 1,
      }),
    ]);
  });

  it('does not treat review-required default trace maps as high-confidence provenance', async () => {
    const { taskId, workspacePath } = await createImpactWorkspace('v2-impact-review-map-');
    const { buildImpact } = await import('../../src/core/v2/impact.js');

    await insertImplementationTraceFixture({
      id: 'IMPL-review-required-map',
      taskId,
      decisionIds: ['DEC-review-required-map'],
      filesChanged: ['src/core/v2/trace.ts'],
      summary: 'Captured changed files with a review-required default mapping.',
      decisionToCodeMap: [
        {
          decisionId: 'DEC-review-required-map',
          files: ['src/core/v2/trace.ts'],
          summary: 'Needs review: mapped DEC-review-required-map to all changed files by default.',
        },
      ],
      workspacePath,
    });

    const result = buildImpact(workspacePath, ['src/core/v2/trace.ts']);

    expect(result.provenance).toEqual([]);
    expect(result.traces).toEqual([
      expect.objectContaining({
        entityId: 'IMPL-review-required-map',
        matchSource: 'implementation_trace.filesChanged',
      }),
    ]);
  });

  it('returns fallback search items when structured matches are missing', async () => {
    const { taskId, workspacePath } = await createImpactWorkspace('v2-impact-fallback-');
    const { buildImpact } = await import('../../src/core/v2/impact.js');

    await withImpactDb(workspacePath, ({ db, insertDecision }) => {
      insertDecision(db, taskId, {
        id: 'DEC-fallback-helper',
        title: 'mystery-helper.ts needs extra review',
        kind: 'INFERRED',
        summary: 'There is historical discussion about the helper file.',
      });
    });

    const result = buildImpact(workspacePath, ['src/lib/mystery-helper.ts']);

    expect(result.directDecisions).toEqual([]);
    expect(result.fallbackSearch).toEqual([
      expect.objectContaining({
        file: 'src/lib/mystery-helper.ts',
        entityId: 'decision:DEC-fallback-helper',
        entityType: 'fallback',
        matchSource: 'fts_fallback',
      }),
    ]);
    expect(result.fallbackSearch[0]?.confidence).toBeLessThan(0.5);
    expect(result.fallbackSearch[0]?.explanation.toLowerCase()).toContain('fallback');
  });

  it('dedupes duplicate sources stably and preserves the impact JSON shape', async () => {
    const { taskId, workspacePath } = await createImpactWorkspace('v2-impact-dedupe-');
    const { buildImpact } = await import('../../src/core/v2/impact.js');

    await withImpactDb(workspacePath, ({ db, insertDecision }) => {
      insertDecision(db, taskId, {
        id: 'DEC-dedupe-trace',
        title: 'Deduped trace ownership',
        kind: 'EXPLICIT',
        status: 'CONFIRMED',
        summary: 'The same target may appear more than once in source data.',
        appliesTo: ['src/core/v2/trace.ts', 'src/core/v2/trace.ts'],
      });
    });

    const result = buildImpact(workspacePath, ['src/core/v2/trace.ts', './src/core/v2/trace.ts']);
    const serialized: unknown = JSON.parse(JSON.stringify(result));

    expect(result.files).toEqual(['src/core/v2/trace.ts']);
    expect(result.directDecisions).toHaveLength(1);
    expect(isRecord(serialized)).toBe(true);
    if (!isRecord(serialized)) {
      throw new TypeError('Expected serialized impact result to be an object.');
    }
    expect(Object.keys(serialized)).toEqual([
      'files',
      'directDecisions',
      'avoidWarnings',
      'plans',
      'traces',
      'provenance',
      'fallbackSearch',
    ]);
  });

  it('fails for project-external absolute paths and traversal inputs', async () => {
    const { workspacePath } = await createImpactWorkspace('v2-impact-path-guard-');
    const { buildImpact } = await import('../../src/core/v2/impact.js');

    expect(() => buildImpact(workspacePath, ['../outside.ts'])).toThrow('Path is outside project');
    expect(() => buildImpact(workspacePath, [join(workspacePath, '..', 'outside.ts')])).toThrow(
      'Path is outside project',
    );
  });

  it('clears current task on close and rejects later mutable commands', async () => {
    workspace = await createTempWorkspace('v2-terminal-close-');
    const workspacePath = workspace;
    const { initDecisionWorkspace } = await import('../../src/core/v2/workspace.js');
    const { createTask, setTerminalStatus } = await import('../../src/core/v2/task.js');
    const { readState } = await import('../../src/core/v2/state.js');
    const { submitDraft } = await import('../../src/core/v2/draft.js');
    const { createImplementationTrace } = await import('../../src/core/v2/trace.js');

    initDecisionWorkspace(workspacePath);
    const task = createTask(workspacePath, 'terminal close');
    expect(setTerminalStatus(workspacePath, 'CLOSED').id).toBe(task.id);
    expect(readState(workspacePath).currentTaskId).toBeNull();

    expect(() =>
      submitDraft(workspacePath, JSON.stringify({ schemaVersion: 'v2alpha1', taskId: task.id })),
    ).toThrow('No current task');
    expect(() => createImplementationTrace(workspacePath)).toThrow('No current task');
  });

  it('clears current task on abandon and rejects context mutation', async () => {
    workspace = await createTempWorkspace('v2-terminal-abandon-');
    const workspacePath = workspace;
    await writeFile(join(workspacePath, 'tracked.ts'), 'export const tracked = true;\n');
    const { initDecisionWorkspace } = await import('../../src/core/v2/workspace.js');
    const { createTask, setTerminalStatus } = await import('../../src/core/v2/task.js');
    const { readState } = await import('../../src/core/v2/state.js');
    const { addContextPath } = await import('../../src/core/v2/context.js');

    initDecisionWorkspace(workspacePath);
    const task = createTask(workspacePath, 'terminal abandon');
    expect(setTerminalStatus(workspacePath, 'ABANDONED').id).toBe(task.id);
    expect(readState(workspacePath).currentTaskId).toBeNull();
    expect(() => addContextPath(workspacePath, 'tracked.ts')).toThrow('No current task');
  });

  it('rejects duplicate decision, question, and evidence ids without overwriting existing rows', async () => {
    workspace = await createTempWorkspace('v2-duplicate-ids-');
    const workspacePath = workspace;
    const { initDecisionWorkspace } = await import('../../src/core/v2/workspace.js');
    const { createTask } = await import('../../src/core/v2/task.js');
    const { submitDraft } = await import('../../src/core/v2/draft.js');
    const { openDatabase } = await import('../../src/core/v2/store.js');
    const { listDecisionsByTask } = await import('../../src/core/v2/decision.js');
    const { listQuestionsByTask } = await import('../../src/core/v2/question.js');
    const { listEvidenceByTask } = await import('../../src/core/v2/evidence.js');

    initDecisionWorkspace(workspacePath);
    const firstTask = createTask(workspacePath, 'first task');
    submitDraft(
      workspacePath,
      JSON.stringify({
        schemaVersion: 'v2alpha1',
        taskId: firstTask.id,
        decisions: [
          { id: 'DEC-duplicate', title: 'Original', kind: 'EXPLICIT', summary: 'Keep me.' },
        ],
        questions: [{ id: 'Q-duplicate', text: 'Original?', recommendedAnswer: 'yes' }],
        evidence: [
          { id: 'EVD-duplicate', sourceType: 'DISCOVERY', sourceRef: 'note', summary: 'Keep me.' },
        ],
      }),
    );

    expect(() =>
      submitDraft(
        workspacePath,
        JSON.stringify({
          schemaVersion: 'v2alpha1',
          taskId: firstTask.id,
          decisions: [
            { id: 'DEC-duplicate', title: 'Overwrite', kind: 'EXPLICIT', summary: 'No.' },
          ],
        }),
      ),
    ).toThrow('Decision id already exists: DEC-duplicate');
    expect(() =>
      submitDraft(
        workspacePath,
        JSON.stringify({
          schemaVersion: 'v2alpha1',
          taskId: firstTask.id,
          questions: [{ id: 'Q-duplicate', text: 'Overwrite?', recommendedAnswer: 'no' }],
        }),
      ),
    ).toThrow('Question id already exists: Q-duplicate');
    expect(() =>
      submitDraft(
        workspacePath,
        JSON.stringify({
          schemaVersion: 'v2alpha1',
          taskId: firstTask.id,
          evidence: [
            { id: 'EVD-duplicate', sourceType: 'DISCOVERY', sourceRef: 'other', summary: 'No.' },
          ],
        }),
      ),
    ).toThrow('Evidence id already exists: EVD-duplicate');

    const secondTask = createTask(workspacePath, 'second task');
    expect(() =>
      submitDraft(
        workspacePath,
        JSON.stringify({
          schemaVersion: 'v2alpha1',
          taskId: secondTask.id,
          decisions: [
            { id: 'DEC-duplicate', title: 'Cross task', kind: 'EXPLICIT', summary: 'No.' },
          ],
        }),
      ),
    ).toThrow('Decision id already exists: DEC-duplicate');

    const db = openDatabase(workspacePath);
    try {
      expect(listDecisionsByTask(db, firstTask.id)[0]?.title).toBe('Original');
      expect(listQuestionsByTask(db, firstTask.id)[0]?.text).toBe('Original?');
      expect(listEvidenceByTask(db, firstTask.id)[0]?.summary).toBe('Keep me.');
    } finally {
      db.close();
    }
  });

  it('uses shared matcher semantics for exact, prefix, glob, and broad targets', async () => {
    const { taskId, workspacePath } = await createImpactWorkspace('v2-path-matcher-');
    const { buildImpact } = await import('../../src/core/v2/impact.js');

    await withImpactDb(workspacePath, ({ db, insertDecision }) => {
      insertDecision(db, taskId, {
        id: 'DEC-glob-trace',
        title: 'Trace glob applies',
        kind: 'EXPLICIT',
        summary: 'Glob target should match v2 files.',
        appliesTo: ['src/core/v2/**'],
      });
      insertDecision(db, taskId, {
        id: 'DEC-broad-src',
        title: 'Too broad',
        kind: 'EXPLICIT',
        summary: 'Broad target should be ignored.',
        appliesTo: ['src/**'],
      });
      insertDecision(db, taskId, {
        id: 'DEC-controller-prefix',
        title: 'Controller prefix',
        kind: 'EXPLICIT',
        summary: 'Controller directory only.',
        appliesTo: ['src/controllers'],
      });
    });

    const globResult = buildImpact(workspacePath, ['src/core/v2/trace.ts']);
    expect(globResult.directDecisions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ entityId: 'DEC-glob-trace', matchSource: 'decision.appliesTo' }),
      ]),
    );
    expect(globResult.directDecisions.some((item) => item.entityId === 'DEC-broad-src')).toBe(
      false,
    );

    const prefixResult = buildImpact(workspacePath, ['src/controllers/paymentController.ts']);
    expect(prefixResult.directDecisions).toEqual(
      expect.arrayContaining([expect.objectContaining({ entityId: 'DEC-controller-prefix' })]),
    );
    expect(prefixResult.directDecisions.some((item) => item.entityId === 'DEC-glob-trace')).toBe(
      false,
    );
  });

  it('keeps open questions from confirming until answered and marks brief ready after answer', async () => {
    workspace = await createTempWorkspace('v2-brief-ready-');
    const workspacePath = workspace;
    const { initDecisionWorkspace } = await import('../../src/core/v2/workspace.js');
    const { createTask } = await import('../../src/core/v2/task.js');
    const { submitDraft } = await import('../../src/core/v2/draft.js');
    const { answerQuestion } = await import('../../src/core/v2/question.js');
    const { confirmBrief } = await import('../../src/core/v2/brief.js');
    const { buildStatusView } = await import('../../src/core/v2/status.js');

    initDecisionWorkspace(workspacePath);
    const task = createTask(workspacePath, 'brief ready');
    submitDraft(
      workspacePath,
      JSON.stringify({
        schemaVersion: 'v2alpha1',
        taskId: task.id,
        decisions: [
          { id: 'DEC-ready', title: 'Ready decision', kind: 'EXPLICIT', summary: 'Use it.' },
        ],
        questions: [
          { id: 'Q-ready', text: 'Confirm?', recommendedAnswer: 'yes', options: ['추천안 사용'] },
        ],
      }),
    );

    expect(buildStatusView(workspacePath).task?.status).toBe('OPEN');
    expect(() => confirmBrief(workspacePath)).toThrow(
      'Cannot confirm brief while questions remain open',
    );

    answerQuestion(workspacePath, 'Q-ready', { optionIndex: 1 });
    expect(buildStatusView(workspacePath).task?.status).toBe('BRIEF_READY');
    expect(confirmBrief(workspacePath).taskId).toBe(task.id);
  });

  it('installs agent rails in AGENTS.md idempotently while preserving user content', async () => {
    workspace = await createTempWorkspace('v2-agent-rails-');
    const workspacePath = workspace;
    const {
      AGENT_RAILS_BEGIN_MARKER,
      AGENT_RAILS_END_MARKER,
      installAgentRails,
      renderAgentRailsBlock,
    } = await import('../../src/core/v2/agent-rails.js');

    const created = installAgentRails(workspacePath);
    expect(created.action).toBe('created');
    let content = await readFile(join(workspacePath, 'AGENTS.md'), 'utf8');
    expect(content).toContain(AGENT_RAILS_BEGIN_MARKER);
    expect(content).toContain(AGENT_RAILS_END_MARKER);
    for (const command of [
      'sduck status',
      'sduck context --json',
      'sduck impact <file...> --json',
      'sduck submit --stdin',
      'sduck answer',
      'sduck confirm',
      'sduck trace',
      'sduck remember',
      'sduck close',
    ]) {
      expect(content).toContain(command);
    }

    await writeFile(join(workspacePath, 'AGENTS.md'), `# User notes\n\nKeep this.\n\n${content}`);
    const updated = installAgentRails(workspacePath);
    expect(['updated', 'unchanged']).toContain(updated.action);
    content = await readFile(join(workspacePath, 'AGENTS.md'), 'utf8');
    expect(content).toContain('# User notes');
    expect(content).toContain('Keep this.');
    expect(content.match(new RegExp(AGENT_RAILS_BEGIN_MARKER, 'g'))).toHaveLength(1);

    const unchanged = installAgentRails(workspacePath);
    expect(unchanged.action).toBe('unchanged');
    expect(await readFile(join(workspacePath, 'AGENTS.md'), 'utf8')).toBe(content);
    expect(renderAgentRailsBlock()).not.toContain('Claude Code only');
  });

  it('appends agent rails to existing AGENTS.md and rejects malformed managed blocks', async () => {
    workspace = await createTempWorkspace('v2-agent-rails-existing-');
    const workspacePath = workspace;
    const { AGENT_RAILS_BEGIN_MARKER, installAgentRails } =
      await import('../../src/core/v2/agent-rails.js');

    await writeFile(join(workspacePath, 'AGENTS.md'), '# Existing\nNo trailing newline');
    const appended = installAgentRails(workspacePath);
    expect(appended.action).toBe('appended');
    let content = await readFile(join(workspacePath, 'AGENTS.md'), 'utf8');
    expect(content).toContain(
      '# Existing\nNo trailing newline\n\n<!-- sduck:v2-agent-rails:begin -->',
    );

    await writeFile(join(workspacePath, 'AGENTS.md'), `# Broken\n${AGENT_RAILS_BEGIN_MARKER}\n`);
    expect(() => installAgentRails(workspacePath)).toThrow('incomplete sduck agent rails block');
    content = await readFile(join(workspacePath, 'AGENTS.md'), 'utf8');
    expect(content).toBe(`# Broken\n${AGENT_RAILS_BEGIN_MARKER}\n`);
  });

  it('initializes workspace with agent rails by default and supports opt-out', async () => {
    workspace = await createTempWorkspace('v2-init-agent-rails-');
    const workspacePath = workspace;
    const { initDecisionWorkspace } = await import('../../src/core/v2/workspace.js');

    const result = initDecisionWorkspace(workspacePath);
    expect(result.agentRails?.action).toBe('created');
    expect(await readFile(join(workspacePath, 'AGENTS.md'), 'utf8')).toContain(
      'sduck v2 agent rails',
    );

    const optOutWorkspace = await createTempWorkspace('v2-init-no-agent-');
    try {
      const optOut = initDecisionWorkspace(optOutWorkspace, { agentRails: false });
      expect(optOut.agentRails).toBeNull();
      await expect(readFile(join(optOutWorkspace, 'AGENTS.md'), 'utf8')).rejects.toThrow();
      expect(await readFile(join(optOutWorkspace, '.decision', 'state.json'), 'utf8')).toContain(
        'currentTaskId',
      );
    } finally {
      await removeTempWorkspace(optOutWorkspace);
    }
  });
});
