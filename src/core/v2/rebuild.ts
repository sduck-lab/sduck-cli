import { loadSourceBundle, sourceFileCount, sourceFingerprint } from './source-store.js';
import {
  cacheHasRows,
  encodeJson,
  getCacheMetadata,
  openDatabase,
  resetDatabaseCache,
  setCacheMetadata,
} from './store.js';

import type { SourceBundle } from './source-types.js';
import type { DatabaseSync } from 'node:sqlite';

export interface RebuildResult {
  tasks: number;
  decisions: number;
  questions: number;
  evidence: number;
  contextItems: number;
  briefSnapshots: number;
  implementationTraces: number;
  events: number;
}

export function rebuildDecisionCache(projectRoot: string): RebuildResult {
  const files = sourceFileCount(projectRoot);
  if (files === 0 && cacheHasRows(projectRoot) && !cacheHasSourceFingerprint(projectRoot)) {
    throw new Error(
      'No markdown source files found. Run `sduck remember` before rebuilding this DB-only workspace.',
    );
  }
  const bundle = loadSourceBundle(projectRoot);
  const db = resetDatabaseCache(projectRoot);
  try {
    db.exec('BEGIN');
    try {
      insertBundle(db, bundle);
      setCacheMetadata(db, 'source_fingerprint', sourceFingerprint(projectRoot));
      db.exec('COMMIT');
    } catch (error) {
      db.exec('ROLLBACK');
      throw error;
    }
  } finally {
    db.close();
  }
  return {
    tasks: bundle.tasks.length,
    decisions: bundle.decisions.length,
    questions: bundle.questions.length,
    evidence: bundle.evidence.length,
    contextItems: bundle.contextItems.length,
    briefSnapshots: bundle.briefSnapshots.length,
    implementationTraces: bundle.implementationTraces.length,
    events: bundle.events.length,
  };
}

function cacheHasSourceFingerprint(projectRoot: string): boolean {
  const db = openDatabase(projectRoot);
  try {
    return getCacheMetadata(db, 'source_fingerprint') !== null;
  } finally {
    db.close();
  }
}

export function formatRebuildResult(result: RebuildResult): string {
  return [
    'Decision cache rebuilt.',
    `Tasks: ${String(result.tasks)}`,
    `Decisions: ${String(result.decisions)}`,
    `Questions: ${String(result.questions)}`,
    `Evidence: ${String(result.evidence)}`,
    `Context items: ${String(result.contextItems)}`,
    `Brief snapshots: ${String(result.briefSnapshots)}`,
    `Implementation traces: ${String(result.implementationTraces)}`,
    `Events: ${String(result.events)}`,
  ].join('\n');
}

function insertBundle(db: DatabaseSync, bundle: SourceBundle): void {
  const insertTask = db.prepare(
    `INSERT INTO tasks (id, title, description, status, expected_scope_json, avoid_scope_json, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  );
  for (const task of bundle.tasks) {
    insertTask.run(
      task.id,
      task.title,
      task.description,
      task.status,
      encodeJson(task.expectedScope),
      encodeJson(task.avoidScope),
      task.createdAt,
      task.updatedAt,
    );
  }

  const insertDecision = db.prepare(
    `INSERT INTO decisions
      (id, task_id, title, kind, status, confidence, summary, rationale_json, applies_to_json, avoids_json, source_refs_json, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  );
  for (const decision of bundle.decisions) {
    insertDecision.run(
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
  }

  const insertQuestion = db.prepare(
    `INSERT INTO questions
      (id, task_id, decision_id, text, recommended_answer, rationale_json, options_json, answered, answer, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  );
  for (const question of bundle.questions) {
    insertQuestion.run(
      question.id,
      question.taskId,
      question.decisionId,
      question.text,
      question.recommendedAnswer,
      encodeJson(question.rationale),
      encodeJson(question.options),
      question.answered ? 1 : 0,
      question.answer,
      question.createdAt,
    );
  }

  const insertEvidence = db.prepare(
    `INSERT INTO evidence (id, task_id, decision_id, source_type, source_ref, summary, confidence, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  );
  for (const item of bundle.evidence) {
    insertEvidence.run(
      item.id,
      item.taskId,
      item.decisionId,
      item.sourceType,
      item.sourceRef,
      item.summary,
      item.confidence,
      item.createdAt,
    );
  }

  const insertContext = db.prepare(
    `INSERT INTO context_items (id, task_id, source_type, source_ref, summary, metadata_json, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
  );
  for (const item of bundle.contextItems) {
    insertContext.run(
      item.id,
      item.taskId,
      item.sourceType,
      item.sourceRef,
      item.summary,
      encodeJson(item.metadata),
      item.createdAt,
    );
  }

  const insertBrief = db.prepare(
    `INSERT INTO brief_snapshots (id, task_id, snapshot_json, rendered_markdown, created_at)
     VALUES (?, ?, ?, ?, ?)`,
  );
  for (const snapshot of bundle.briefSnapshots) {
    insertBrief.run(
      snapshot.id,
      snapshot.taskId,
      encodeJson(snapshot.snapshot),
      snapshot.renderedMarkdown,
      snapshot.createdAt,
    );
  }

  const insertTrace = db.prepare(
    `INSERT INTO implementation_traces (id, task_id, decision_ids_json, files_changed_json, summary, decision_to_code_map_json, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
  );
  for (const trace of bundle.implementationTraces) {
    insertTrace.run(
      trace.id,
      trace.taskId,
      encodeJson(trace.decisionIds),
      encodeJson(trace.filesChanged),
      trace.summary,
      encodeJson({
        decisionToCodeMap: trace.decisionToCodeMap,
        unmappedDecisions: trace.unmappedDecisions ?? [],
      }),
      trace.createdAt,
    );
  }

  const insertEvent = db.prepare(
    `INSERT INTO events (id, task_id, type, payload_json, created_at) VALUES (?, ?, ?, ?, ?)`,
  );
  for (const event of bundle.events) {
    insertEvent.run(event.id, event.taskId, event.type, encodeJson(event.payload), event.createdAt);
  }
}
