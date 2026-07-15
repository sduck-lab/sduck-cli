import { ensureReadableCache } from './cache.js';
import { DecisionWorkspace } from './decision-workspace.js';
import { noCurrentTask } from './errors.js';
import { listChangedFiles } from './git-diff.js';
import { nowIso } from './ids.js';
import {
  DEFAULT_ATTACH_THRESHOLD,
  RELEVANCE_REASONS,
  readGraphDecisionFileLinks,
  scoreDecisionForFiles,
} from './relevance.js';
import { appendSourceEvent, nextSourceEntityId } from './source-store.js';
import { openDatabase } from './store.js';
import { TaskLifecycle } from './task-lifecycle.js';

export interface TraceRow {
  id: string;
  task_id: string;
  decision_ids_json: string;
  files_changed_json: string;
  summary: string;
  decision_to_code_map_json: string;
  created_at: string;
}

import type {
  DecisionToCodeMap,
  ImplementationTrace,
  TraceView,
  UnmappedDecisionReview,
} from '../../types/index.js';

interface TraceMapPayload {
  decisionToCodeMap: DecisionToCodeMap[];
  unmappedDecisions: UnmappedDecisionReview[];
}

export function createImplementationTrace(
  projectRoot: string,
  options: { base?: string } = {},
): TraceView {
  return new DecisionWorkspace(projectRoot).mutate(({ bundle, state }) => {
    const taskId = state.currentTaskId;
    if (taskId === null) throw noCurrentTask();
    new TaskLifecycle(bundle, taskId).assertAllowed('trace');
    const latestSnapshot = bundle.briefSnapshots
      .filter((snapshot) => snapshot.taskId === taskId)
      .at(-1);
    const filesChanged = listChangedFiles(
      projectRoot,
      options.base,
      options.base === undefined ? latestSnapshot?.gitBaseline : undefined,
    );
    const decisions = bundle.decisions.filter(
      (decision) => decision.taskId === taskId && decision.status === 'CONFIRMED',
    );
    const graphLinks = readGraphDecisionFileLinks(projectRoot);
    const decisionToCodeMap: DecisionToCodeMap[] = [];
    const unmappedDecisions: UnmappedDecisionReview[] = [];
    for (const decision of decisions) {
      const relevance = scoreDecisionForFiles(projectRoot, decision, filesChanged, graphLinks);
      for (const match of relevance.attached) {
        decisionToCodeMap.push({
          decisionId: decision.id,
          files: [match.file],
          summary: `${match.reason} for ${decision.id}.`,
          score: match.score,
          reason: match.reason,
        });
      }
      if (relevance.attached.length === 0) {
        const reviewMatch = relevance.bestReviewMatch;
        unmappedDecisions.push({
          decisionId: decision.id,
          summary:
            reviewMatch === null
              ? `Review required: no appliesTo/graph match reached attach threshold ${String(DEFAULT_ATTACH_THRESHOLD)}.`
              : `Review required: best match did not reach attach threshold ${String(DEFAULT_ATTACH_THRESHOLD)}.`,
          reason: reviewMatch?.reason ?? RELEVANCE_REASONS.noStrongMatch,
          score: reviewMatch?.score ?? 0,
          files: reviewMatch === null ? [] : [reviewMatch.file],
          appliesTo: decision.appliesTo,
        });
      }
    }
    const trace: ImplementationTrace = {
      id: nextSourceEntityId(
        bundle.implementationTraces.map((item) => item.id),
        'IMPL',
      ),
      taskId,
      decisionIds: decisions.map((decision) => decision.id),
      filesChanged,
      summary: `Detected ${String(filesChanged.length)} changed file(s).`,
      decisionToCodeMap,
      unmappedDecisions,
      createdAt: nowIso(),
    };
    bundle.implementationTraces.push(trace);
    appendSourceEvent(bundle, {
      taskId,
      type: 'TRACE_CREATED',
      payload: { traceId: trace.id, filesChanged },
    });
    return { trace, filesChanged };
  });
}

export function listImplementationTraces(
  projectRoot: string,
  taskId: string,
): ImplementationTrace[] {
  ensureReadableCache(projectRoot);
  const db = openDatabase(projectRoot);
  try {
    const rows = db
      .prepare(`SELECT * FROM implementation_traces WHERE task_id = ? ORDER BY created_at ASC`)
      .all(taskId) as unknown as TraceRow[];
    return rows.map(mapTraceRow);
  } finally {
    db.close();
  }
}

export function mapTraceRow(row: TraceRow): ImplementationTrace {
  const traceMapPayload = decodeTraceMapPayload(row.decision_to_code_map_json);
  return {
    id: row.id,
    taskId: row.task_id,
    decisionIds: JSON.parse(row.decision_ids_json) as string[],
    filesChanged: JSON.parse(row.files_changed_json) as string[],
    summary: row.summary,
    decisionToCodeMap: traceMapPayload.decisionToCodeMap,
    unmappedDecisions: traceMapPayload.unmappedDecisions,
    createdAt: row.created_at,
  };
}

function decodeTraceMapPayload(value: string): TraceMapPayload {
  const parsed = JSON.parse(value) as unknown;
  if (Array.isArray(parsed))
    return { decisionToCodeMap: parsed as DecisionToCodeMap[], unmappedDecisions: [] };
  if (typeof parsed === 'object' && parsed !== null) {
    const raw = parsed as Record<string, unknown>;
    return {
      decisionToCodeMap: Array.isArray(raw['decisionToCodeMap'])
        ? (raw['decisionToCodeMap'] as DecisionToCodeMap[])
        : [],
      unmappedDecisions: Array.isArray(raw['unmappedDecisions'])
        ? (raw['unmappedDecisions'] as UnmappedDecisionReview[])
        : [],
    };
  }
  return { decisionToCodeMap: [], unmappedDecisions: [] };
}
