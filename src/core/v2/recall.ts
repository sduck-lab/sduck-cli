import { ensureReadableCache } from './cache.js';
import { mapDecision } from './decision.js';
import { openDatabase } from './store.js';
import { mapTraceRow } from './trace.js';

import type { RecallResult } from '../../types/index.js';

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
  ensureReadableCache(projectRoot);
  const db = openDatabase(projectRoot);
  try {
    const like = `%${query}%`;
    const decisions = db
      .prepare(
        `SELECT d.* FROM decisions d
         JOIN tasks t ON t.id = d.task_id
         WHERE d.status = 'CONFIRMED' AND t.status != 'ABANDONED'
           AND (d.title LIKE ? OR d.summary LIKE ?)
         ORDER BY d.created_at DESC LIMIT 20`,
      )
      .all(like, like)
      .map((row) => mapDecision(row as unknown as Parameters<typeof mapDecision>[0]));
    const traces = (
      db
        .prepare(
          `SELECT i.* FROM implementation_traces i
           JOIN tasks t ON t.id = i.task_id
           WHERE t.status != 'ABANDONED' AND (i.summary LIKE ? OR i.files_changed_json LIKE ?)
           ORDER BY i.created_at DESC LIMIT 20`,
        )
        .all(like, like) as unknown as TraceRow[]
    ).map(mapTraceRow);
    return { query, decisions, traces };
  } finally {
    db.close();
  }
}
