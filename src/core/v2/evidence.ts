import { nextEntityId, nowIso } from './ids.js';

import type { DraftEvidence, Evidence, EvidenceSourceType } from '../../types/index.js';
import type { DatabaseSync } from 'node:sqlite';

interface EvidenceRow {
  id: string;
  task_id: string;
  decision_id: string | null;
  source_type: EvidenceSourceType;
  source_ref: string;
  summary: string;
  confidence: number;
  created_at: string;
}

export function mapEvidence(row: EvidenceRow): Evidence {
  return {
    id: row.id,
    taskId: row.task_id,
    decisionId: row.decision_id,
    sourceType: row.source_type,
    sourceRef: row.source_ref,
    summary: row.summary,
    confidence: row.confidence,
    createdAt: row.created_at,
  };
}

export function insertEvidence(db: DatabaseSync, taskId: string, draft: DraftEvidence): Evidence {
  const evidence: Evidence = {
    id: draft.id ?? nextEntityId(db, 'evidence', 'EVD'),
    taskId,
    decisionId: draft.decisionId ?? null,
    sourceType: draft.sourceType,
    sourceRef: draft.sourceRef,
    summary: draft.summary,
    confidence: draft.confidence ?? 0.7,
    createdAt: nowIso(),
  };
  if (evidence.confidence < 0 || evidence.confidence > 1) {
    throw new Error(`Evidence confidence must be between 0 and 1: ${evidence.sourceRef}`);
  }
  try {
    db.prepare(
      `INSERT INTO evidence (id, task_id, decision_id, source_type, source_ref, summary, confidence, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    ).run(
      evidence.id,
      evidence.taskId,
      evidence.decisionId,
      evidence.sourceType,
      evidence.sourceRef,
      evidence.summary,
      evidence.confidence,
      evidence.createdAt,
    );
  } catch (error) {
    throwDuplicateIdError(error, 'Evidence', evidence.id);
  }
  return evidence;
}

function throwDuplicateIdError(error: unknown, entityName: string, id: string): never {
  if (error instanceof Error && /constraint|unique|primary/i.test(error.message)) {
    throw new Error(`${entityName} id already exists: ${id}`);
  }
  throw error;
}

export function listEvidenceByTask(db: DatabaseSync, taskId: string): Evidence[] {
  const rows = db
    .prepare(`SELECT * FROM evidence WHERE task_id = ? ORDER BY created_at ASC`)
    .all(taskId) as unknown as EvidenceRow[];
  return rows.map(mapEvidence);
}
