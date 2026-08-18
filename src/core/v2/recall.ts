import { ensureReadableCache } from './cache.js';
import { mapDecision } from './decision.js';
import { V2ExpectedError } from './errors.js';
import { expandGraph, isGraphDepthValid } from './graph.js';
import { citedMemorySourceIds } from './memory-source.js';
import { findMemoryCapsules } from './memory.js';
import { containsLikePattern, ftsMatchQuery, rankByRrf, searchTerms } from './search.js';
import { openDatabase } from './store.js';
import { mapTraceRow } from './trace.js';

import type {
  Decision,
  ImplementationTrace,
  RecallResult,
  RelatedGraphItem,
} from '../../types/index.js';
import type { DatabaseSync as DatabaseSyncType } from 'node:sqlite';

interface TraceRow {
  id: string;
  task_id: string;
  decision_ids_json: string;
  files_changed_json: string;
  summary: string;
  decision_to_code_map_json: string;
  created_at: string;
}

export interface RecallOptions {
  depth?: number;
}

const DEFAULT_RECALL_DEPTH = 1;
const RELATED_LIMIT = 20;
const RESULT_LIMIT = 20;
const GRAPH_SEED_LIMIT = 10;

// decisions/traces reachable from graph_edges but not matched by FTS/LIKE at all still need to be
// resolvable to full records so rankByRrf's fused order can include them -- same CONFIRMED /
// not-ABANDONED filter as the keyword queries below, just keyed by id instead of by text match.
function fetchDecisionsByIds(db: DatabaseSyncType, ids: string[]): Decision[] {
  if (ids.length === 0) return [];
  const placeholders = ids.map(() => '?').join(',');
  return db
    .prepare(
      `SELECT d.* FROM decisions d
       JOIN tasks t ON t.id = d.task_id
       WHERE d.status IN ('CONFIRMED', 'DRAFT') AND t.status != 'ABANDONED' AND d.id IN (${placeholders})`,
    )
    .all(...ids)
    .map((row) => mapDecision(row as unknown as Parameters<typeof mapDecision>[0]));
}

function fetchTracesByIds(db: DatabaseSyncType, ids: string[]): ImplementationTrace[] {
  if (ids.length === 0) return [];
  const placeholders = ids.map(() => '?').join(',');
  return (
    db
      .prepare(
        `SELECT i.* FROM implementation_traces i
         JOIN tasks t ON t.id = i.task_id
         WHERE t.status != 'ABANDONED' AND i.id IN (${placeholders})`,
      )
      .all(...ids) as unknown as TraceRow[]
  ).map(mapTraceRow);
}

export function recall(
  projectRoot: string,
  query: string,
  options: RecallOptions = {},
): RecallResult {
  const depth = options.depth ?? DEFAULT_RECALL_DEPTH;
  if (!isGraphDepthValid(depth))
    throw new V2ExpectedError('GRAPH_DEPTH_INVALID', { depth: String(depth) });
  ensureReadableCache(projectRoot);
  const db = openDatabase(projectRoot);
  try {
    const like = containsLikePattern(query);
    const ftsQuery = ftsMatchQuery(searchTerms(query));
    const memories = findMemoryCapsules(db, query, { limit: 10 });
    const citedSourceIds = citedMemorySourceIds(memories);

    const decisionsById = new Map<string, Decision>();
    let ftsDecisionIds: string[] = [];
    if (ftsQuery !== null) {
      const rows = db
        .prepare(
          `SELECT d.* FROM decisions_fts
           JOIN decisions d ON d.id = decisions_fts.id
           JOIN tasks t ON t.id = d.task_id
           WHERE d.status IN ('CONFIRMED', 'DRAFT') AND t.status != 'ABANDONED' AND decisions_fts MATCH ?
           ORDER BY bm25(decisions_fts) LIMIT 100`,
        )
        .all(ftsQuery)
        .map((row) => mapDecision(row as unknown as Parameters<typeof mapDecision>[0]));
      ftsDecisionIds = rows.map((decision) => decision.id);
      for (const decision of rows) decisionsById.set(decision.id, decision);
    }
    const likeDecisions = db
      .prepare(
        `SELECT d.* FROM decisions d
         JOIN tasks t ON t.id = d.task_id
         WHERE d.status IN ('CONFIRMED', 'DRAFT') AND t.status != 'ABANDONED'
           AND (d.title LIKE ? ESCAPE '\\' OR d.summary LIKE ? ESCAPE '\\')
         ORDER BY d.created_at DESC LIMIT 100`,
      )
      .all(like, like)
      .map((row) => mapDecision(row as unknown as Parameters<typeof mapDecision>[0]));
    const likeDecisionIds = likeDecisions.map((decision) => decision.id);
    for (const decision of likeDecisions)
      if (!decisionsById.has(decision.id)) decisionsById.set(decision.id, decision);

    const tracesById = new Map<string, ImplementationTrace>();
    let ftsTraceIds: string[] = [];
    if (ftsQuery !== null) {
      const rows = (
        db
          .prepare(
            `SELECT i.* FROM traces_fts
             JOIN implementation_traces i ON i.id = traces_fts.id
             JOIN tasks t ON t.id = i.task_id
             WHERE t.status != 'ABANDONED' AND traces_fts MATCH ?
             ORDER BY bm25(traces_fts) LIMIT 100`,
          )
          .all(ftsQuery) as unknown as TraceRow[]
      ).map(mapTraceRow);
      ftsTraceIds = rows.map((trace) => trace.id);
      for (const trace of rows) tracesById.set(trace.id, trace);
    }
    const likeTraces = (
      db
        .prepare(
          `SELECT i.* FROM implementation_traces i
           JOIN tasks t ON t.id = i.task_id
           WHERE t.status != 'ABANDONED'
             AND (i.summary LIKE ? ESCAPE '\\' OR i.files_changed_json LIKE ? ESCAPE '\\')
           ORDER BY i.created_at DESC LIMIT 100`,
        )
        .all(like, like) as unknown as TraceRow[]
    ).map(mapTraceRow);
    const likeTraceIds = likeTraces.map((trace) => trace.id);
    for (const trace of likeTraces) if (!tracesById.has(trace.id)) tracesById.set(trace.id, trace);

    // Seed the graph from strong keyword signals (matched memories + top FTS/LIKE hits), not from
    // the final decisions/traces list -- that list is what this expansion feeds INTO via RRF, so
    // seeding from it would be circular.
    const graphSeeds = [
      ...new Set([
        ...memories.map((memory) => memory.id),
        ...ftsDecisionIds.slice(0, GRAPH_SEED_LIMIT),
        ...likeDecisionIds.slice(0, GRAPH_SEED_LIMIT),
        ...ftsTraceIds.slice(0, GRAPH_SEED_LIMIT),
        ...likeTraceIds.slice(0, GRAPH_SEED_LIMIT),
      ]),
    ];
    const graphExpansion =
      graphSeeds.length > 0 && depth > 0
        ? expandGraph(db, graphSeeds, depth)
        : { nodes: [], edges: [], truncated: false };
    // Node order from expandGraph IS the hop-distance ranking (closest first) -- see graph.ts.
    // Seeds themselves always land at level 0 (the best possible graph rank), but they already
    // won their FTS/LIKE rank on merit -- letting them also win the graph rank would just
    // double-count the same signal and bury the *actually new* one-hop-plus neighbors the graph
    // is supposed to surface. So the graph ranked list only ever contains non-seed discoveries.
    const graphSeedSet = new Set(graphSeeds);
    const graphDecisionIds = graphExpansion.nodes
      .filter((node) => node.kind === 'decision' && !graphSeedSet.has(node.id))
      .map((node) => node.id);
    const graphTraceIds = graphExpansion.nodes
      .filter((node) => node.kind === 'trace' && !graphSeedSet.has(node.id))
      .map((node) => node.id);

    for (const decision of fetchDecisionsByIds(
      db,
      graphDecisionIds.filter((id) => !decisionsById.has(id)),
    ))
      decisionsById.set(decision.id, decision);
    for (const trace of fetchTracesByIds(
      db,
      graphTraceIds.filter((id) => !tracesById.has(id)),
    ))
      tracesById.set(trace.id, trace);

    const decisions = rankByRrf([ftsDecisionIds, likeDecisionIds, graphDecisionIds])
      .map((id) => decisionsById.get(id))
      .filter((decision): decision is Decision => decision !== undefined)
      .filter((decision) => !citedSourceIds.has(decision.id))
      .slice(0, RESULT_LIMIT);

    const traces = rankByRrf([ftsTraceIds, likeTraceIds, graphTraceIds])
      .map((id) => tracesById.get(id))
      .filter((trace): trace is ImplementationTrace => trace !== undefined)
      .filter((trace) => !citedSourceIds.has(trace.id))
      .slice(0, RESULT_LIMIT);

    const promoted = new Set([
      ...memories.map((memory) => memory.id),
      ...decisions.map((decision) => decision.id),
      ...traces.map((trace) => trace.id),
      ...citedSourceIds,
    ]);
    const related: RelatedGraphItem[] = graphExpansion.nodes
      .filter((node) => !promoted.has(node.id))
      .slice(0, RELATED_LIMIT);

    return { query, memories, decisions, traces, related };
  } finally {
    db.close();
  }
}
