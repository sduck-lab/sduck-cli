import { ensureReadableCache } from './cache.js';
import { mapDecision } from './decision.js';
import { citedMemorySourceIds } from './memory-source.js';
import { findMemoryCapsules } from './memory.js';
import { containsLikePattern } from './search.js';
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
    const like = containsLikePattern(query);
    const memories = findMemoryCapsules(db, query, { limit: 10 });
    const citedSourceIds = citedMemorySourceIds(memories);
    const decisions = db
      .prepare(
        `SELECT d.* FROM decisions d
         JOIN tasks t ON t.id = d.task_id
         WHERE d.status = 'CONFIRMED' AND t.status != 'ABANDONED'
           AND (d.title LIKE ? ESCAPE '\\' OR d.summary LIKE ? ESCAPE '\\')
         ORDER BY d.created_at DESC LIMIT 100`,
      )
      .all(like, like)
      .map((row) => mapDecision(row as unknown as Parameters<typeof mapDecision>[0]))
      .filter((decision) => !citedSourceIds.has(decision.id))
      .slice(0, 20);
    const traces = (
      db
        .prepare(
          `SELECT i.* FROM implementation_traces i
           JOIN tasks t ON t.id = i.task_id
           WHERE t.status != 'ABANDONED'
             AND (i.summary LIKE ? ESCAPE '\\' OR i.files_changed_json LIKE ? ESCAPE '\\')
           ORDER BY i.created_at DESC LIMIT 100`,
        )
        .all(like, like) as unknown as TraceRow[]
    )
      .map(mapTraceRow)
      .filter((trace) => !citedSourceIds.has(trace.id))
      .slice(0, 20);
    return { query, memories, decisions, traces };
  } finally {
    db.close();
  }
}
