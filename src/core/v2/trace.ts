import { listDecisionsByTask } from './decision.js';
import { appendEvent } from './events.js';
import { listChangedFiles } from './git-diff.js';
import { nextEntityId, nowIso } from './ids.js';
import { matchPathTarget, normalizePathTargets } from './path-matcher.js';
import { encodeJson, openDatabase } from './store.js';
import { requireMutableCurrentTask } from './task.js';

export interface TraceRow {
  id: string;
  task_id: string;
  decision_ids_json: string;
  files_changed_json: string;
  summary: string;
  decision_to_code_map_json: string;
  created_at: string;
}

import type { ImplementationTrace, TraceView } from '../../types/index.js';
import type { DatabaseSync } from 'node:sqlite';

export function createImplementationTrace(
  projectRoot: string,
  options: { base?: string } = {},
): TraceView {
  const db = openDatabase(projectRoot);
  try {
    const taskId = requireMutableCurrentTask(projectRoot, db).id;
    const filesChanged = listChangedFiles(projectRoot, options.base);
    const decisions = listDecisionsByTask(db, taskId).filter(
      (decision) => decision.status === 'CONFIRMED',
    );
    const decisionToCodeMap = decisions.map((decision) => {
      const targets = normalizePathTargets(
        projectRoot,
        decision.appliesTo,
        `Decision ${decision.id} appliesTo`,
      );
      const matches = filesChanged.filter((file) =>
        targets.some((target) => matchPathTarget(file, target) !== null),
      );
      const files = matches.length > 0 ? matches : filesChanged;
      return {
        decisionId: decision.id,
        files,
        summary:
          matches.length > 0
            ? `Mapped by appliesTo path hints for ${decision.id}.`
            : `Needs review: mapped ${decision.id} to all changed files by default.`,
      };
    });
    const trace: ImplementationTrace = {
      id: nextEntityId(db, 'implementation_traces', 'IMPL'),
      taskId,
      decisionIds: decisions.map((decision) => decision.id),
      filesChanged,
      summary: `Detected ${String(filesChanged.length)} changed file(s).`,
      decisionToCodeMap,
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
      encodeJson(trace.decisionToCodeMap),
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
    return listImplementationTracesByTask(db, taskId);
  } finally {
    db.close();
  }
}

export function listImplementationTracesByTask(
  db: DatabaseSync,
  taskId: string,
): ImplementationTrace[] {
  const rows = db
    .prepare(`SELECT * FROM implementation_traces WHERE task_id = ? ORDER BY created_at ASC`)
    .all(taskId) as unknown as TraceRow[];
  return rows.map(mapTraceRow);
}

export function listAllImplementationTraces(db: DatabaseSync): ImplementationTrace[] {
  const rows = db
    .prepare(`SELECT * FROM implementation_traces ORDER BY created_at ASC`)
    .all() as unknown as TraceRow[];
  return rows.map(mapTraceRow);
}

export function mapTraceRow(row: TraceRow): ImplementationTrace {
  return {
    id: row.id,
    taskId: row.task_id,
    decisionIds: JSON.parse(row.decision_ids_json) as string[],
    filesChanged: JSON.parse(row.files_changed_json) as string[],
    summary: row.summary,
    decisionToCodeMap: JSON.parse(
      row.decision_to_code_map_json,
    ) as ImplementationTrace['decisionToCodeMap'],
    createdAt: row.created_at,
  };
}
