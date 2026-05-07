import { listDecisionsByTask } from './decision.js';
import { appendEvent } from './events.js';
import { listChangedFiles } from './git-diff.js';
import { nextEntityId, nowIso } from './ids.js';
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

import type { ImplementationTrace, TraceView } from '../../types/index.js';

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
    const decisionToCodeMap = decisions.map((decision) => {
      const matches = filesChanged.filter((file) =>
        decision.appliesTo.some((target) => file.includes(target)),
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
    const rows = db
      .prepare(`SELECT * FROM implementation_traces WHERE task_id = ? ORDER BY created_at ASC`)
      .all(taskId) as unknown as TraceRow[];
    return rows.map(mapTraceRow);
  } finally {
    db.close();
  }
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
