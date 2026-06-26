import { ensureReadableCache } from './cache.js';
import { listChangedFiles } from './git-diff.js';
import { nowIso } from './ids.js';
import { rebuildDecisionCache } from './rebuild.js';
import {
  appendSourceEvent,
  loadSourceBundleForWrite,
  nextSourceEntityId,
  writeSourceBundle,
} from './source-store.js';
import { getCurrentTaskId } from './state.js';
import { openDatabase } from './store.js';

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
  ensureReadableCache(projectRoot);
  const bundle = loadSourceBundleForWrite(projectRoot);
  const taskId = getCurrentTaskId(projectRoot);
  if (taskId === null) throw new Error('No current task. Run `sduck work "..."` first.');
  const filesChanged = listChangedFiles(projectRoot, options.base);
  const decisions = bundle.decisions.filter(
    (decision) => decision.taskId === taskId && decision.status === 'CONFIRMED',
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
    id: nextSourceEntityId(
      bundle.implementationTraces.map((item) => item.id),
      'IMPL',
    ),
    taskId,
    decisionIds: decisions.map((decision) => decision.id),
    filesChanged,
    summary: `Detected ${String(filesChanged.length)} changed file(s).`,
    decisionToCodeMap,
    createdAt: nowIso(),
  };
  bundle.implementationTraces.push(trace);
  appendSourceEvent(bundle, {
    taskId,
    type: 'TRACE_CREATED',
    payload: { traceId: trace.id, filesChanged },
  });
  writeSourceBundle(projectRoot, bundle);
  rebuildDecisionCache(projectRoot);
  return { trace, filesChanged };
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
