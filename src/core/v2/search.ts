import { mapDecision } from './decision.js';
import { tableExists } from './store.js';
import { mapTraceRow } from './trace.js';

import type { DatabaseSync } from 'node:sqlite';

export interface SearchFallbackHit {
  entityType: 'decision' | 'implementation_trace';
  entityId: string;
  taskId: string;
  title: string;
  summary: string;
  confidence: number;
  explanation: string;
}

interface SearchIndexRow {
  entity_type?: unknown;
  entity_id?: unknown;
  type?: unknown;
  id?: unknown;
}

export function searchDecisionMemory(
  db: DatabaseSync,
  query: string,
  limit = 10,
): SearchFallbackHit[] {
  const normalizedQuery = query.trim();
  if (normalizedQuery === '') {
    return [];
  }
  const indexed = searchWithIndex(db, normalizedQuery, limit);
  if (indexed.length > 0) {
    return indexed;
  }
  return searchWithLike(db, normalizedQuery, limit);
}

function searchWithIndex(db: DatabaseSync, query: string, limit: number): SearchFallbackHit[] {
  if (!tableExists(db, 'decision_search_index')) {
    return [];
  }
  const ftsQuery = buildFtsQuery(query);
  if (ftsQuery === null) {
    return [];
  }
  try {
    const rows = db
      .prepare(`SELECT * FROM decision_search_index WHERE decision_search_index MATCH ? LIMIT ?`)
      .all(ftsQuery, limit) as unknown as SearchIndexRow[];
    const hits: SearchFallbackHit[] = [];
    const seen = new Set<string>();
    for (const row of rows) {
      const entityType = normalizeEntityType(row.entity_type) ?? normalizeEntityType(row.type);
      const entityId = normalizeUnknownString(row.entity_id) ?? normalizeUnknownString(row.id);
      if (entityType === null || entityId === null) {
        continue;
      }
      const hit = loadEntityHit(db, entityType, entityId, 'Matched via FTS fallback search index.');
      if (hit === null) {
        continue;
      }
      const key = `${hit.entityType}\u0000${hit.entityId}`;
      if (seen.has(key)) {
        continue;
      }
      seen.add(key);
      hits.push(hit);
    }
    return hits;
  } catch {
    return [];
  }
}

function searchWithLike(db: DatabaseSync, query: string, limit: number): SearchFallbackHit[] {
  const like = `%${query}%`;
  const hits: SearchFallbackHit[] = [];
  const seen = new Set<string>();
  const decisionRows = db
    .prepare(
      `SELECT * FROM decisions WHERE title LIKE ? OR summary LIKE ? OR applies_to_json LIKE ? OR avoids_json LIKE ? ORDER BY created_at DESC LIMIT ?`,
    )
    .all(like, like, like, like, limit) as unknown as Parameters<typeof mapDecision>[0][];
  for (const row of decisionRows) {
    const decision = mapDecision(row);
    const hit: SearchFallbackHit = {
      entityType: 'decision',
      entityId: decision.id,
      taskId: decision.taskId,
      title: decision.title,
      summary: decision.summary,
      confidence: 0.2,
      explanation: 'Matched via LIKE fallback search over decisions.',
    };
    const key = `${hit.entityType}\u0000${hit.entityId}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    hits.push(hit);
  }
  const traceRows = db
    .prepare(
      `SELECT * FROM implementation_traces WHERE summary LIKE ? OR files_changed_json LIKE ? OR decision_to_code_map_json LIKE ? ORDER BY created_at DESC LIMIT ?`,
    )
    .all(like, like, like, limit) as unknown as Parameters<typeof mapTraceRow>[0][];
  for (const row of traceRows) {
    const trace = mapTraceRow(row);
    const hit: SearchFallbackHit = {
      entityType: 'implementation_trace',
      entityId: trace.id,
      taskId: trace.taskId,
      title: trace.id,
      summary: trace.summary,
      confidence: 0.2,
      explanation: 'Matched via LIKE fallback search over implementation traces.',
    };
    const key = `${hit.entityType}\u0000${hit.entityId}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    hits.push(hit);
  }
  return hits;
}

function loadEntityHit(
  db: DatabaseSync,
  entityType: SearchFallbackHit['entityType'],
  entityId: string,
  explanation: string,
): SearchFallbackHit | null {
  if (entityType === 'decision') {
    const row = db.prepare(`SELECT * FROM decisions WHERE id = ?`).get(entityId) as
      | Parameters<typeof mapDecision>[0]
      | undefined;
    if (row === undefined) {
      return null;
    }
    const decision = mapDecision(row);
    return {
      entityType,
      entityId: decision.id,
      taskId: decision.taskId,
      title: decision.title,
      summary: decision.summary,
      confidence: 0.35,
      explanation,
    };
  }
  const row = db.prepare(`SELECT * FROM implementation_traces WHERE id = ?`).get(entityId) as
    | Parameters<typeof mapTraceRow>[0]
    | undefined;
  if (row === undefined) {
    return null;
  }
  const trace = mapTraceRow(row);
  return {
    entityType,
    entityId: trace.id,
    taskId: trace.taskId,
    title: trace.id,
    summary: trace.summary,
    confidence: 0.35,
    explanation,
  };
}

function buildFtsQuery(query: string): string | null {
  const tokens = query
    .split(/[^A-Za-z0-9_가-힣]+/)
    .map((token) => token.trim())
    .filter((token) => token.length >= 2);
  if (tokens.length === 0) {
    return null;
  }
  return tokens.map((token) => `"${token.replaceAll('"', '""')}"`).join(' OR ');
}

function normalizeEntityType(value: unknown): SearchFallbackHit['entityType'] | null {
  const normalized = normalizeUnknownString(value)?.toLowerCase();
  if (normalized === 'decision') {
    return 'decision';
  }
  if (normalized === 'implementation_trace' || normalized === 'trace') {
    return 'implementation_trace';
  }
  return null;
}

function normalizeUnknownString(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null;
  }
  const normalized = value.trim();
  return normalized === '' ? null : normalized;
}
