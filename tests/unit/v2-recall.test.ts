import { afterEach, describe, expect, it } from 'vitest';

import { createTempWorkspace, removeTempWorkspace } from '../helpers/temp-workspace.js';

const supportsNodeSqlite = (() => {
  const [major = '0', minor = '0'] = process.versions.node.split('.');
  return Number(major) > 22 || (Number(major) === 22 && Number(minor) >= 13);
})();

const describeIfSqlite = supportsNodeSqlite ? describe : describe.skip;

describeIfSqlite('v2 recall hybrid search', () => {
  let workspace: string | null = null;

  afterEach(async () => {
    if (workspace !== null) await removeTempWorkspace(workspace);
    workspace = null;
  });

  it('ranks FTS5 matches, keeps short-term LIKE fallback, and expands related items via the graph', async () => {
    workspace = await createTempWorkspace('v2-recall-');

    const { initDecisionWorkspace } = await import('../../src/core/v2/workspace.js');
    const { createTask } = await import('../../src/core/v2/task.js');
    const { recordGrillMeStarted } = await import('../../src/core/v2/grill.js');
    const { submitDraft } = await import('../../src/core/v2/draft.js');
    const { confirmBrief } = await import('../../src/core/v2/brief.js');
    const { recall } = await import('../../src/core/v2/recall.js');
    const { isV2ExpectedError } = await import('../../src/core/v2/errors.js');

    initDecisionWorkspace(workspace);
    const task = createTask(workspace, 'recall hybrid search 추가');
    recordGrillMeStarted(workspace);

    submitDraft(
      workspace,
      JSON.stringify({
        schemaVersion: 'v2alpha1',
        taskId: task.id,
        decisions: [
          {
            id: 'DEC-recall-hybrid',
            title: 'Add hybrid FTS5 recall search',
            kind: 'EXPLICIT',
            summary: 'Connect trigram FTS5 ranking and graph expansion to recall 검색',
            confidence: 1,
          },
        ],
        questions: [],
        evidence: [
          {
            id: 'EVD-graph-only',
            decisionId: 'DEC-recall-hybrid',
            sourceType: 'CODE',
            sourceRef: 'src/core/v2/graph.ts',
            summary: '이 문장에는 검색어와 무관한 내용만 있다',
          },
        ],
        expectedScope: [],
        avoidScope: [],
      }),
    );

    confirmBrief(workspace);

    const byFts = recall(workspace, 'hybrid');
    expect(byFts.decisions.map((decision) => decision.id)).toContain('DEC-recall-hybrid');
    expect(byFts.related.map((item) => item.id)).toContain('EVD-graph-only');

    const byShortHangul = recall(workspace, '검색');
    expect(byShortHangul.decisions.map((decision) => decision.id)).toContain('DEC-recall-hybrid');

    const noExpansion = recall(workspace, 'hybrid', { depth: 0 });
    expect(noExpansion.related).toHaveLength(0);

    try {
      recall(workspace, 'hybrid', { depth: 99 });
      throw new Error('expected GRAPH_DEPTH_INVALID to be thrown');
    } catch (error) {
      expect(isV2ExpectedError(error)).toBe(true);
    }
  });

  it('promotes a graph-only decision into decisions via RRF fusion, ranked behind its keyword-matched neighbor', async () => {
    workspace = await createTempWorkspace('v2-recall-rrf-');

    const { initDecisionWorkspace } = await import('../../src/core/v2/workspace.js');
    const { createTask } = await import('../../src/core/v2/task.js');
    const { recordGrillMeStarted } = await import('../../src/core/v2/grill.js');
    const { submitDraft } = await import('../../src/core/v2/draft.js');
    const { confirmBrief } = await import('../../src/core/v2/brief.js');
    const { recall } = await import('../../src/core/v2/recall.js');

    initDecisionWorkspace(workspace);

    const taskA = createTask(workspace, '알파 마커 원본 결정');
    recordGrillMeStarted(workspace);
    submitDraft(
      workspace,
      JSON.stringify({
        schemaVersion: 'v2alpha1',
        taskId: taskA.id,
        decisions: [
          {
            id: 'DEC-alpha-marker-origin',
            title: 'gizmoAlphaMarker keyword origin decision',
            kind: 'EXPLICIT',
            summary: 'This decision contains the unique keyword gizmoAlphaMarker.',
            confidence: 1,
          },
        ],
        questions: [],
        evidence: [],
        expectedScope: [],
        avoidScope: [],
      }),
    );
    confirmBrief(workspace);

    const taskB = createTask(workspace, '알파 마커를 계승하는 후속 결정');
    recordGrillMeStarted(workspace);
    submitDraft(
      workspace,
      JSON.stringify({
        schemaVersion: 'v2alpha1',
        taskId: taskB.id,
        decisions: [
          {
            id: 'DEC-alpha-marker-carried',
            title: 'Downstream decision with no shared keywords',
            kind: 'CARRIED',
            summary: 'Completely unrelated wording, reachable only via the decision graph.',
            confidence: 1,
            rationale: ['carries forward the origin decision'],
            sourceRefs: ['DEC-alpha-marker-origin'],
          },
        ],
        questions: [],
        evidence: [],
        expectedScope: [],
        avoidScope: [],
      }),
    );
    confirmBrief(workspace);

    // Old behavior: a decision with zero keyword overlap could only ever surface in `related`,
    // never in `decisions`, no matter how strongly it was graph-connected to a real hit. RRF
    // fusion of the FTS rank list with the graph hop-distance rank list is what promotes it.
    const result = recall(workspace, 'gizmoAlphaMarker', { depth: 1 });
    const ids = result.decisions.map((decision) => decision.id);
    expect(ids).toContain('DEC-alpha-marker-origin');
    expect(ids).toContain('DEC-alpha-marker-carried');
    expect(ids.indexOf('DEC-alpha-marker-origin')).toBeLessThan(
      ids.indexOf('DEC-alpha-marker-carried'),
    );
    expect(result.related.map((item) => item.id)).not.toContain('DEC-alpha-marker-carried');
  });

  it('finds a DRAFT decision whose task was never confirmed, and labels it as DRAFT', async () => {
    workspace = await createTempWorkspace('v2-recall-draft-');

    const { initDecisionWorkspace } = await import('../../src/core/v2/workspace.js');
    const { createTask } = await import('../../src/core/v2/task.js');
    const { recordGrillMeStarted } = await import('../../src/core/v2/grill.js');
    const { submitDraft } = await import('../../src/core/v2/draft.js');
    const { recall } = await import('../../src/core/v2/recall.js');
    const { renderRecallLocalized } = await import('../../src/ui/v2/render.js');

    initDecisionWorkspace(workspace);

    const draftTask = createTask(workspace, '미확정 채로 남은 결정');
    recordGrillMeStarted(workspace);
    submitDraft(
      workspace,
      JSON.stringify({
        schemaVersion: 'v2alpha1',
        taskId: draftTask.id,
        decisions: [
          {
            id: 'DEC-widgetDraftMarker',
            title: 'widgetDraftMarker never confirmed',
            kind: 'EXPLICIT',
            summary: 'This task never reaches confirm, so the decision stays DRAFT forever.',
            confidence: 1,
          },
        ],
        questions: [],
        evidence: [],
        expectedScope: [],
        avoidScope: [],
      }),
    );
    // Deliberately no confirmBrief() -- the task stays OPEN/BRIEF_READY, matching the real cases
    // found via sduck-recall-bench (DEC-0068 in this repo, DEC-0024/0125/0124 in adieum-api) where
    // the citing decision's target was never confirmed but its task was never abandoned either.

    const result = recall(workspace, 'widgetDraftMarker');
    const found = result.decisions.find((decision) => decision.id === 'DEC-widgetDraftMarker');
    expect(found).toBeDefined();
    expect(found?.status).toBe('DRAFT');
    expect(renderRecallLocalized(result)).toContain('DEC-widgetDraftMarker [EXPLICIT] (DRAFT)');
  });
});
