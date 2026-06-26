import { listDecisionsByTask } from './decision.js';
import { appendEvent } from './events.js';
import { listChangedFiles } from './git-diff.js';
import { nextEntityId, nowIso } from './ids.js';
import {
  DEFAULT_ATTACH_THRESHOLD,
  RELEVANCE_REASONS,
  readGraphDecisionFileLinks,
  scoreDecisionForFiles,
} from './relevance.js';
import { getCurrentTaskId } from './state.js';
import { encodeJson, openDatabase } from './store.js';

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
  const db = openDatabase(projectRoot);
  try {
    const taskId = getCurrentTaskId(projectRoot);
    if (taskId === null) throw new Error('No current task. Run `sduck work "..."` first.');
    const filesChanged = listChangedFiles(projectRoot, options.base);
    const decisions = listDecisionsByTask(db, taskId).filter(
      (decision) => decision.status === 'CONFIRMED',
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
      id: nextEntityId(db, 'implementation_traces', 'IMPL'),
      taskId,
      decisionIds: decisions.map((decision) => decision.id),
      filesChanged,
      summary: `Detected ${String(filesChanged.length)} changed file(s).`,
      decisionToCodeMap,
      unmappedDecisions,
      createdAt: nowIso(),
    };
    db.prepare(
      `INSERT INTO implementation_traces (id, task_id, decision_ids_json, files_changed_json, summary, decision_to_code_map_json, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ).run(
      trace.id,
      trace.taskId,
      encodeJson(trace.decisionIds),
      encodeJson(trace.filesChanged),
      trace.summary,
      encodeJson(encodeTraceMapPayload(trace)),
      trace.createdAt,
    );
    appendEvent(db, {
      taskId,
      type: 'TRACE_CREATED',
      payload: { traceId: trace.id, filesChanged },
    });
    return { trace, filesChanged };
  } finally {
    db.close();
  }
}

export function listImplementationTraces(
  projectRoot: string,
  taskId: string,
): ImplementationTrace[] {
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

function encodeTraceMapPayload(trace: ImplementationTrace): TraceMapPayload {
  return {
    decisionToCodeMap: trace.decisionToCodeMap,
    unmappedDecisions: trace.unmappedDecisions ?? [],
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
