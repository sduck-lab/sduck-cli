import { mapDecision } from './decision.js';
import { decodeJson, openDatabase } from './store.js';

import type { ImplementationTrace, RecallResult } from '../../types/index.js';

interface TraceRow {
  id: string;
  task_id: string;
  decision_ids_json: string;
  files_changed_json: string;
  summary: string;
  decision_to_code_map_json: string;
  created_at: string;
}

export function recall(projectRoot: string, query: string): RecallResult {
  const db = openDatabase(projectRoot);
  try {
    const like = `%${query}%`;
    const decisions = db
      .prepare(
        `SELECT * FROM decisions WHERE title LIKE ? OR summary LIKE ? ORDER BY created_at DESC LIMIT 20`,
      )
      .all(like, like)
      .map((row) => mapDecision(row as unknown as Parameters<typeof mapDecision>[0]));
    const traces = (
      db
        .prepare(
          `SELECT * FROM implementation_traces WHERE summary LIKE ? OR files_changed_json LIKE ? ORDER BY created_at DESC LIMIT 20`,
        )
        .all(like, like) as unknown as TraceRow[]
    ).map(mapTraceRow);
    return { query, decisions, traces };
  } finally {
    db.close();
  }
}

function mapTraceRow(row: TraceRow): ImplementationTrace {
  return {
    id: row.id,
    taskId: row.task_id,
    decisionIds: decodeJson<string[]>(row.decision_ids_json, []),
    filesChanged: decodeJson<string[]>(row.files_changed_json, []),
    summary: row.summary,
    decisionToCodeMap: decodeJson<ImplementationTrace['decisionToCodeMap']>(
      row.decision_to_code_map_json,
      [],
    ),
    createdAt: row.created_at,
  };
}
