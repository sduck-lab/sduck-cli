import { decodeJson, openDatabase } from './store.js';

import type { SourceBundle } from './source-types.js';
import type {
  BriefSnapshot,
  ContextItem,
  Decision,
  Evidence,
  EventRecord,
  ImplementationTrace,
  Question,
  RecordDepth,
  Task,
} from '../../types/index.js';

/** Reads the pre-Markdown SQLite format so the workspace can migrate it once. */
export function loadLegacyCacheBundle(projectRoot: string): SourceBundle {
  const db = openDatabase(projectRoot);
  try {
    const tasks = (
      db.prepare(`SELECT * FROM tasks ORDER BY created_at`).all() as unknown as TaskRow[]
    ).map(mapTask);
    const decisions = (
      db.prepare(`SELECT * FROM decisions ORDER BY created_at`).all() as unknown as DecisionRow[]
    ).map(mapDecision);
    const questions = (
      db.prepare(`SELECT * FROM questions ORDER BY created_at`).all() as unknown as QuestionRow[]
    ).map(mapQuestion);
    const evidence = (
      db.prepare(`SELECT * FROM evidence ORDER BY created_at`).all() as unknown as EvidenceRow[]
    ).map(mapEvidence);
    const contextItems = (
      db.prepare(`SELECT * FROM context_items ORDER BY created_at`).all() as unknown as ContextRow[]
    ).map(mapContextItem);
    const briefSnapshots = (
      db.prepare(`SELECT * FROM brief_snapshots ORDER BY created_at`).all() as unknown as BriefRow[]
    ).map(mapBrief);
    const implementationTraces = (
      db
        .prepare(`SELECT * FROM implementation_traces ORDER BY created_at`)
        .all() as unknown as TraceRow[]
    ).map(mapTrace);
    const events = (
      db.prepare(`SELECT * FROM events ORDER BY created_at`).all() as unknown as EventRow[]
    ).map(mapEvent);
    return {
      tasks,
      decisions,
      questions,
      evidence,
      contextItems,
      briefSnapshots,
      implementationTraces,
      evaluations: [],
      events,
    };
  } finally {
    db.close();
  }
}

interface TaskRow {
  id: string;
  title: string;
  description: string;
  status: Task['status'];
  expected_scope_json: string;
  avoid_scope_json: string;
  record_depth?: RecordDepth | null;
  created_at: string;
  updated_at: string;
}

function mapTask(row: TaskRow): Task {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    status: row.status,
    expectedScope: decodeJson(row.expected_scope_json, []),
    avoidScope: decodeJson(row.avoid_scope_json, []),
    recordDepth: row.record_depth ?? 'FULL',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

interface DecisionRow {
  id: string;
  task_id: string;
  title: string;
  kind: Decision['kind'];
  status: Decision['status'];
  confidence: number;
  summary: string;
  rationale_json: string;
  applies_to_json: string;
  avoids_json: string;
  source_refs_json: string;
  created_at: string;
  updated_at: string;
}

function mapDecision(row: DecisionRow): Decision {
  return {
    id: row.id,
    taskId: row.task_id,
    title: row.title,
    kind: row.kind,
    status: row.status,
    confidence: row.confidence,
    summary: row.summary,
    rationale: decodeJson(row.rationale_json, []),
    appliesTo: decodeJson(row.applies_to_json, []),
    avoids: decodeJson(row.avoids_json, []),
    sourceRefs: decodeJson(row.source_refs_json, []),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

interface QuestionRow {
  id: string;
  task_id: string;
  decision_id: string | null;
  text: string;
  recommended_answer: string;
  rationale_json: string;
  options_json: string;
  answered: number;
  answer: string | null;
  created_at: string;
}

function mapQuestion(row: QuestionRow): Question {
  return {
    id: row.id,
    taskId: row.task_id,
    decisionId: row.decision_id,
    text: row.text,
    recommendedAnswer: row.recommended_answer,
    rationale: decodeJson(row.rationale_json, []),
    options: decodeJson(row.options_json, []),
    answered: row.answered === 1,
    answer: row.answer,
    createdAt: row.created_at,
  };
}

interface EvidenceRow {
  id: string;
  task_id: string;
  decision_id: string | null;
  source_type: Evidence['sourceType'];
  source_ref: string;
  summary: string;
  confidence: number;
  created_at: string;
}

function mapEvidence(row: EvidenceRow): Evidence {
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

interface ContextRow {
  id: string;
  task_id: string;
  source_type: ContextItem['sourceType'];
  source_ref: string;
  summary: string;
  metadata_json: string;
  created_at: string;
}

function mapContextItem(row: ContextRow): ContextItem {
  return {
    id: row.id,
    taskId: row.task_id,
    sourceType: row.source_type,
    sourceRef: row.source_ref,
    summary: row.summary,
    metadata: decodeJson(row.metadata_json, {}),
    createdAt: row.created_at,
  };
}

interface BriefRow {
  id: string;
  task_id: string;
  snapshot_json: string;
  rendered_markdown: string;
  created_at: string;
}

function mapBrief(row: BriefRow): BriefSnapshot {
  return {
    id: row.id,
    taskId: row.task_id,
    snapshot: decodeJson(row.snapshot_json, {} as BriefSnapshot['snapshot']),
    renderedMarkdown: row.rendered_markdown,
    createdAt: row.created_at,
  };
}

interface TraceRow {
  id: string;
  task_id: string;
  decision_ids_json: string;
  files_changed_json: string;
  summary: string;
  decision_to_code_map_json: string;
  created_at: string;
}

function mapTrace(row: TraceRow): ImplementationTrace {
  const payload = decodeJson<unknown>(row.decision_to_code_map_json, []);
  const { decisionToCodeMap, unmappedDecisions } = decodeTraceMapping(payload);
  return {
    id: row.id,
    taskId: row.task_id,
    decisionIds: decodeJson(row.decision_ids_json, []),
    filesChanged: decodeJson(row.files_changed_json, []),
    summary: row.summary,
    decisionToCodeMap,
    unmappedDecisions: unmappedDecisions ?? [],
    createdAt: row.created_at,
  };
}

function decodeTraceMapping(
  payload: unknown,
): Pick<ImplementationTrace, 'decisionToCodeMap' | 'unmappedDecisions'> {
  if (Array.isArray(payload)) {
    return {
      decisionToCodeMap: payload as ImplementationTrace['decisionToCodeMap'],
      unmappedDecisions: [],
    };
  }

  if (typeof payload !== 'object' || payload === null) {
    return { decisionToCodeMap: [], unmappedDecisions: [] };
  }

  const mapping = payload as {
    decisionToCodeMap?: ImplementationTrace['decisionToCodeMap'];
    unmappedDecisions?: ImplementationTrace['unmappedDecisions'];
  };
  return {
    decisionToCodeMap: mapping.decisionToCodeMap ?? [],
    unmappedDecisions: mapping.unmappedDecisions ?? [],
  };
}

interface EventRow {
  id: string;
  task_id: string | null;
  type: EventRecord['type'];
  payload_json: string;
  created_at: string;
}

function mapEvent(row: EventRow): EventRecord {
  return {
    id: row.id,
    taskId: row.task_id,
    type: row.type,
    payload: decodeJson(row.payload_json, {}),
    createdAt: row.created_at,
  };
}
