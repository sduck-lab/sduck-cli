import { appendEvent } from './events.js';
import { nextEntityId, nowIso } from './ids.js';
import { decodeJson, encodeJson } from './store.js';

import type { Decision, DecisionKind, DecisionStatus, DraftDecision } from '../../types/index.js';
import type { DatabaseSync } from 'node:sqlite';

interface DecisionRow {
  id: string;
  task_id: string;
  title: string;
  kind: DecisionKind;
  status: DecisionStatus;
  confidence: number;
  summary: string;
  rationale_json: string;
  applies_to_json: string;
  avoids_json: string;
  source_refs_json: string;
  created_at: string;
  updated_at: string;
}

export function mapDecision(row: DecisionRow): Decision {
  return {
    id: row.id,
    taskId: row.task_id,
    title: row.title,
    kind: row.kind,
    status: row.status,
    confidence: row.confidence,
    summary: row.summary,
    rationale: decodeJson<string[]>(row.rationale_json, []),
    appliesTo: decodeJson<string[]>(row.applies_to_json, []),
    avoids: decodeJson<string[]>(row.avoids_json, []),
    sourceRefs: decodeJson<string[]>(row.source_refs_json, []),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function insertDecision(db: DatabaseSync, taskId: string, draft: DraftDecision): Decision {
  const createdAt = nowIso();
  const decision: Decision = {
    id: draft.id ?? nextEntityId(db, 'decisions', 'DEC'),
    taskId,
    title: draft.title,
    kind: draft.kind,
    status: draft.status ?? 'DRAFT',
    confidence: draft.confidence ?? (draft.kind === 'EXPLICIT' ? 1 : 0.7),
    summary: draft.summary,
    rationale: draft.rationale ?? [],
    appliesTo: draft.appliesTo ?? [],
    avoids: draft.avoids ?? [],
    sourceRefs: draft.sourceRefs ?? [],
    createdAt,
    updatedAt: createdAt,
  };
  if (decision.confidence < 0 || decision.confidence > 1) {
    throw new Error(`Decision confidence must be between 0 and 1: ${decision.title}`);
  }
  try {
    db.prepare(
      `INSERT INTO decisions
      (id, task_id, title, kind, status, confidence, summary, rationale_json, applies_to_json, avoids_json, source_refs_json, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ).run(
      decision.id,
      decision.taskId,
      decision.title,
      decision.kind,
      decision.status,
      decision.confidence,
      decision.summary,
      encodeJson(decision.rationale),
      encodeJson(decision.appliesTo),
      encodeJson(decision.avoids),
      encodeJson(decision.sourceRefs),
      decision.createdAt,
      decision.updatedAt,
    );
  } catch (error) {
    throwDuplicateIdError(error, 'Decision', decision.id);
  }
  appendEvent(db, { taskId, type: 'DECISION_CREATED', payload: { decisionId: decision.id } });
  return decision;
}

function throwDuplicateIdError(error: unknown, entityName: string, id: string): never {
  if (error instanceof Error && /constraint|unique|primary/i.test(error.message)) {
    throw new Error(`${entityName} id already exists: ${id}`);
  }
  throw error;
}

export function updateDecisionFromAnswer(
  db: DatabaseSync,
  decisionId: string,
  answer: string,
  questionId: string,
): Decision | null {
  const row = db.prepare(`SELECT * FROM decisions WHERE id = ?`).get(decisionId) as
    | DecisionRow
    | undefined;
  if (row === undefined) return null;
  const decision = mapDecision(row);
  const updatedAt = nowIso();
  db.prepare(
    `UPDATE decisions SET kind = ?, status = ?, confidence = ?, summary = ?, source_refs_json = ?, updated_at = ? WHERE id = ?`,
  ).run(
    'EXPLICIT',
    'CONFIRMED',
    1,
    answer,
    encodeJson([...decision.sourceRefs, `USER_ANSWER:${questionId}`]),
    updatedAt,
    decisionId,
  );
  const updated = db.prepare(`SELECT * FROM decisions WHERE id = ?`).get(decisionId) as
    | DecisionRow
    | undefined;
  return updated === undefined ? null : mapDecision(updated);
}

export function listDecisionsByTask(db: DatabaseSync, taskId: string): Decision[] {
  const rows = db
    .prepare(`SELECT * FROM decisions WHERE task_id = ? ORDER BY created_at ASC`)
    .all(taskId) as unknown as DecisionRow[];
  return rows.map(mapDecision);
}

export function listAllDecisions(db: DatabaseSync): Decision[] {
  const rows = db
    .prepare(`SELECT * FROM decisions ORDER BY created_at ASC`)
    .all() as unknown as DecisionRow[];
  return rows.map(mapDecision);
}

export function listDecisionsByStatus(
  db: DatabaseSync,
  taskId: string,
  status: DecisionStatus,
): Decision[] {
  const rows = db
    .prepare(`SELECT * FROM decisions WHERE task_id = ? AND status = ? ORDER BY created_at ASC`)
    .all(taskId, status) as unknown as DecisionRow[];
  return rows.map(mapDecision);
}

export function emptyDecisionKindCounts(): Record<DecisionKind, number> {
  return { EXPLICIT: 0, INFERRED: 0, CARRIED: 0, CONFLICT: 0, OPEN: 0 };
}
