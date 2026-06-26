import * as fs from 'node:fs';
import * as path from 'node:path';

import { mapDecision } from './decision.js';
import { appendEvent } from './events.js';
import { listEvidenceByTask } from './evidence.js';
import { nextEntityId, nowIso } from './ids.js';
import {
  graphifyGraphPath,
  graphifyReportPath,
  resolveInsideProject,
  toRelativePath,
} from './paths.js';
import {
  DEFAULT_ATTACH_THRESHOLD,
  GRAPH_RELEVANCE_SCORE,
  RELEVANCE_REASONS,
  normalizeProjectPath,
  readGraphDecisionFileLinks,
  scoreDecisionForFiles,
} from './relevance.js';
import { getCurrentTaskId } from './state.js';
import { decodeJson, encodeJson, openDatabase } from './store.js';
import { getTaskById } from './task.js';
import { mapTraceRow } from './trace.js';

import type {
  ContextItem,
  ContextPack,
  ContextSourceType,
  SduckDraft,
  Task,
} from '../../types/index.js';
import type { DatabaseSync } from 'node:sqlite';

interface ContextRow {
  id: string;
  task_id: string;
  source_type: ContextSourceType;
  source_ref: string;
  summary: string;
  metadata_json: string;
  created_at: string;
}

type ContextCandidate = Omit<ContextItem, 'id' | 'createdAt'>;

export const GRILL_ME_PROTOCOL = [
  'Ask one question at a time.',
  'Do not ask what can be inferred from context.',
  'Provide a recommended answer with rationale.',
  'Separate EXPLICIT, INFERRED, CARRIED, CONFLICT, and OPEN decisions.',
  'Submit structured draft with `sduck submit --stdin`.',
] as const;

export const GRILL_ME_PROMPT = [
  'Interview the user relentlessly about every aspect of this plan until shared understanding is reached.',
  'Walk down each branch of the design tree, resolving dependencies between decisions one-by-one.',
  'Ask one question at a time.',
  'For each question, provide a recommended answer and rationale.',
  'If a question can be answered by exploring the codebase, explore the codebase instead and cite evidence/source refs.',
  'Do not ask what can already be inferred from context.',
  'Classify outcomes as EXPLICIT, INFERRED, CARRIED, CONFLICT, or OPEN decisions.',
  'When the decision tree is sufficiently resolved, submit a structured draft with `sduck submit --stdin`.',
].join('\n');

export const GRILL_ME_CHECKLIST = [
  'Domain/docs: check glossary, ADRs, and contradictions between user claims and code.',
  'Brief quality: keep the final brief durable, behavioral, testable, and explicit about out-of-scope items.',
  'Testing: identify public interfaces, observable behaviors, and test priorities.',
  'Bug/performance: establish feedback loop, reproduction signal, and falsifiable hypotheses before fix choices.',
  'Architecture/refactor: reason in terms of module, interface, seam, locality, and leverage.',
] as const;

export function mapContextItem(row: ContextRow): ContextItem {
  return {
    id: row.id,
    taskId: row.task_id,
    sourceType: row.source_type,
    sourceRef: row.source_ref,
    summary: row.summary,
    metadata: decodeJson<Record<string, unknown>>(row.metadata_json, {}),
    createdAt: row.created_at,
  };
}

export function insertContextItem(
  db: DatabaseSync,
  input: Omit<ContextItem, 'id' | 'createdAt'>,
): ContextItem {
  const item: ContextItem = {
    ...input,
    id: nextEntityId(db, 'context_items', 'CTX'),
    createdAt: nowIso(),
  };
  db.prepare(
    `INSERT INTO context_items (id, task_id, source_type, source_ref, summary, metadata_json, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    item.id,
    item.taskId,
    item.sourceType,
    item.sourceRef,
    item.summary,
    encodeJson(item.metadata),
    item.createdAt,
  );
  return item;
}

export function buildContextIndex(projectRoot: string, task: Task): ContextItem[] {
  const db = openDatabase(projectRoot);
  try {
    const discoveredFiles = findRelevantFiles(projectRoot, task.description).slice(0, 20);
    const scopedFiles = collectScopedFiles(projectRoot, db, task, discoveredFiles);
    const candidates: ContextCandidate[] = [];
    candidates.push(...findGraphContextCandidates(projectRoot, task, scopedFiles));
    candidates.push(...findMemoryItems(db, task));
    candidates.push(...findAppliesToContextCandidates(projectRoot, db, task, scopedFiles));
    for (const file of discoveredFiles) {
      candidates.push({
        taskId: task.id,
        sourceType: 'DISCOVERY',
        sourceRef: file,
        summary: `Filename/path appears relevant to: ${task.description}`,
        metadata: {
          reason: RELEVANCE_REASONS.weakSubstringFallback,
          score: 0.3,
          attached: false,
        },
      });
    }
    const report = graphifyReportPath(projectRoot);
    if (fs.existsSync(report)) {
      candidates.push({
        taskId: task.id,
        sourceType: 'GRAPHIFY_REPORT',
        sourceRef: toRelativePath(projectRoot, report),
        summary: 'Existing Graphify report is available as evidence.',
        metadata: {},
      });
    }
    const graph = graphifyGraphPath(projectRoot);
    if (fs.existsSync(graph)) {
      candidates.push({
        taskId: task.id,
        sourceType: 'GRAPHIFY_GRAPH',
        sourceRef: toRelativePath(projectRoot, graph),
        summary: 'Existing Graphify graph JSON is available as evidence.',
        metadata: {},
      });
    }
    const inserted = dedupeContextCandidates(candidates)
      .slice(0, 40)
      .map((candidate) => insertContextItem(db, candidate));
    appendEvent(db, {
      taskId: task.id,
      type: 'CONTEXT_INDEXED',
      payload: { itemCount: inserted.length },
    });
    return inserted;
  } finally {
    db.close();
  }
}

export function getContextPack(projectRoot: string): ContextPack {
  const db = openDatabase(projectRoot);
  try {
    const taskId = requireCurrentTaskId(projectRoot);
    const task = getTaskById(db, taskId);
    if (task === null) throw new Error(`Task not found: ${taskId}`);
    const rows = db
      .prepare(`SELECT * FROM context_items WHERE task_id = ? ORDER BY created_at ASC`)
      .all(taskId) as unknown as ContextRow[];
    return {
      task,
      items: rows.map(mapContextItem),
      evidence: listEvidenceByTask(db, task.id),
      priorDecisions: listPriorDecisions(db, task.id),
      priorTraces: listPriorTraces(db, task.id),
      grillMeProtocol: buildGrillMeProtocol(),
      grillMePrompt: buildGrillMePrompt(),
      grillMeChecklist: buildGrillMeChecklist(),
      draftSchemaExample: buildDraftSchemaExample(task.id),
    };
  } finally {
    db.close();
  }
}

function findMemoryItems(db: DatabaseSync, task: Task): ContextCandidate[] {
  const keywords = task.description
    .toLowerCase()
    .split(/[^a-z0-9가-힣]+/i)
    .filter((word) => word.length >= 3);
  const likes =
    keywords.length === 0 ? [`%${task.description}%`] : keywords.map((keyword) => `%${keyword}%`);
  const items: ContextCandidate[] = [];
  for (const like of likes) {
    const decisionRows = db
      .prepare(
        `SELECT * FROM decisions WHERE task_id != ? AND (title LIKE ? OR summary LIKE ?) LIMIT 5`,
      )
      .all(task.id, like, like) as unknown as Parameters<typeof mapDecision>[0][];
    for (const row of decisionRows) {
      const decision = mapDecision(row);
      items.push({
        taskId: task.id,
        sourceType: 'MEMORY',
        sourceRef: decision.id,
        summary: `Prior decision: ${decision.title} — ${decision.summary}`,
        metadata: {
          type: 'decision',
          kind: decision.kind,
          reason: RELEVANCE_REASONS.recallResult,
          score: DEFAULT_ATTACH_THRESHOLD,
        },
      });
    }
    const traceRows = db
      .prepare(
        `SELECT * FROM implementation_traces WHERE task_id != ? AND (summary LIKE ? OR files_changed_json LIKE ?) LIMIT 5`,
      )
      .all(task.id, like, like) as unknown as Parameters<typeof mapTraceRow>[0][];
    for (const row of traceRows) {
      const trace = mapTraceRow(row);
      items.push({
        taskId: task.id,
        sourceType: 'MEMORY',
        sourceRef: trace.id,
        summary: `Prior implementation trace: ${trace.summary}`,
        metadata: {
          type: 'implementation_trace',
          filesChanged: trace.filesChanged,
          reason: RELEVANCE_REASONS.recallResult,
          score: DEFAULT_ATTACH_THRESHOLD,
        },
      });
    }
  }
  return items.slice(0, 20);
}

function findGraphContextCandidates(
  projectRoot: string,
  task: Task,
  scopedFiles: string[],
): ContextCandidate[] {
  return readGraphDecisionFileLinks(projectRoot)
    .filter((link) => graphFileIntersectsScope(projectRoot, link.file, scopedFiles))
    .map((link) => ({
      taskId: task.id,
      sourceType: 'MEMORY' as const,
      sourceRef: link.decisionId,
      summary: `Decision ${link.decisionId} is related to scoped file ${link.file} by graph edge.`,
      metadata: {
        type: 'decision',
        files: [link.file],
        scopedFiles,
        reason: RELEVANCE_REASONS.graphEdge,
        score: GRAPH_RELEVANCE_SCORE,
        graphRelation: link.relation,
      },
    }));
}

function findAppliesToContextCandidates(
  projectRoot: string,
  db: DatabaseSync,
  task: Task,
  scopedFiles: string[],
): ContextCandidate[] {
  if (scopedFiles.length === 0) return [];
  const decisionRows = db
    .prepare(`SELECT * FROM decisions ORDER BY created_at DESC LIMIT 50`)
    .all() as unknown as Parameters<typeof mapDecision>[0][];
  const output: ContextCandidate[] = [];
  for (const row of decisionRows) {
    const decision = mapDecision(row);
    const relevance = scoreDecisionForFiles(projectRoot, decision, scopedFiles, []);
    for (const match of relevance.attached) {
      output.push({
        taskId: task.id,
        sourceType: 'MEMORY',
        sourceRef: decision.id,
        summary: `Decision applies to relevant file ${match.file}: ${decision.title}`,
        metadata: {
          type: 'decision',
          kind: decision.kind,
          files: [match.file],
          reason: match.reason,
          score: match.score,
        },
      });
    }
  }
  return output;
}

function collectScopedFiles(
  projectRoot: string,
  db: DatabaseSync,
  task: Task,
  discoveredFiles: string[],
): string[] {
  const scoped = new Set<string>();
  for (const file of discoveredFiles) addScopedFile(projectRoot, scoped, file);
  for (const entry of task.expectedScope) {
    const expanded = safeExpandPathOrGlob(projectRoot, entry);
    if (expanded.length === 0) addScopedFile(projectRoot, scoped, entry);
    for (const file of expanded) addScopedFile(projectRoot, scoped, file);
  }
  for (const file of listExistingScopedContextFiles(db, task.id)) {
    addScopedFile(projectRoot, scoped, file);
  }
  return [...scoped];
}

function listExistingScopedContextFiles(db: DatabaseSync, taskId: string): string[] {
  const rows = db
    .prepare(
      `SELECT source_ref FROM context_items WHERE task_id = ? AND source_type IN ('FILE', 'DISCOVERY')`,
    )
    .all(taskId) as unknown as { source_ref: string }[];
  return rows.map((row) => row.source_ref);
}

function safeExpandPathOrGlob(projectRoot: string, input: string): string[] {
  try {
    return expandPathOrGlob(projectRoot, input);
  } catch {
    return [];
  }
}

function addScopedFile(projectRoot: string, scoped: Set<string>, file: string): void {
  const normalized = normalizeProjectPath(projectRoot, file);
  if (normalized !== '') scoped.add(normalized);
}

function graphFileIntersectsScope(
  projectRoot: string,
  graphFile: string,
  scopedFiles: string[],
): boolean {
  if (scopedFiles.length === 0) return false;
  const normalizedGraphFile = normalizeProjectPath(projectRoot, graphFile);
  return scopedFiles.some((scopedFile) => pathsIntersect(normalizedGraphFile, scopedFile));
}

function pathsIntersect(left: string, right: string): boolean {
  const normalizedLeft = left.replace(/\/+$/, '');
  const normalizedRight = right.replace(/\/+$/, '');
  if (normalizedLeft === '' || normalizedRight === '') return false;
  return (
    normalizedLeft === normalizedRight ||
    normalizedLeft.startsWith(`${normalizedRight}/`) ||
    normalizedRight.startsWith(`${normalizedLeft}/`)
  );
}

function dedupeContextCandidates(candidates: ContextCandidate[]): ContextCandidate[] {
  const byKey = new Map<string, ContextCandidate>();
  for (const candidate of candidates) {
    const key = `${candidate.sourceType}\0${candidate.sourceRef}`;
    const existing = byKey.get(key);
    if (
      existing === undefined ||
      metadataScore(candidate.metadata) > metadataScore(existing.metadata)
    ) {
      byKey.set(key, candidate);
    }
  }
  return [...byKey.values()];
}

function metadataScore(metadata: Record<string, unknown>): number {
  return typeof metadata['score'] === 'number' ? metadata['score'] : 0;
}

function listPriorDecisions(db: DatabaseSync, taskId: string) {
  const rows = db
    .prepare(`SELECT * FROM decisions WHERE task_id != ? ORDER BY created_at DESC LIMIT 20`)
    .all(taskId) as unknown as Parameters<typeof mapDecision>[0][];
  return rows.map(mapDecision);
}

function listPriorTraces(db: DatabaseSync, taskId: string) {
  const rows = db
    .prepare(
      `SELECT * FROM implementation_traces WHERE task_id != ? ORDER BY created_at DESC LIMIT 20`,
    )
    .all(taskId) as unknown as Parameters<typeof mapTraceRow>[0][];
  return rows.map(mapTraceRow);
}

export function addContextPath(projectRoot: string, pathOrGlob: string): ContextItem[] {
  const db = openDatabase(projectRoot);
  try {
    const taskId = requireCurrentTaskId(projectRoot);
    const matches = expandPathOrGlob(projectRoot, pathOrGlob);
    if (matches.length === 0) {
      throw new Error(`No matching files: ${pathOrGlob}`);
    }
    const items = matches.map((file) =>
      insertContextItem(db, {
        taskId,
        sourceType: 'FILE',
        sourceRef: file,
        summary: `Added by agent/user context request: ${file}`,
        metadata: { requested: pathOrGlob },
      }),
    );
    appendEvent(db, {
      taskId,
      type: 'CONTEXT_ITEM_ADDED',
      payload: { pathOrGlob, count: items.length },
    });
    return items;
  } finally {
    db.close();
  }
}

function buildDraftSchemaExample(taskId: string): SduckDraft {
  return {
    schemaVersion: 'v2alpha1',
    taskId,
    decisions: [],
    questions: [],
    evidence: [],
    expectedScope: [],
    avoidScope: [],
  };
}

function buildGrillMeProtocol(): string[] {
  return [...GRILL_ME_PROTOCOL];
}

function buildGrillMePrompt(): string {
  return GRILL_ME_PROMPT;
}

function buildGrillMeChecklist(): string[] {
  return [...GRILL_ME_CHECKLIST];
}

function requireCurrentTaskId(projectRoot: string): string {
  const taskId = getCurrentTaskId(projectRoot);
  if (taskId === null) throw new Error('No current task. Run `sduck work "..."` first.');
  return taskId;
}

function findRelevantFiles(projectRoot: string, description: string): string[] {
  const keywords = description
    .toLowerCase()
    .split(/[^a-z0-9가-힣]+/i)
    .filter((word) => word.length >= 3);
  const files = walk(projectRoot);
  if (keywords.length === 0) return files.slice(0, 10);
  return files.filter((file) => keywords.some((keyword) => file.toLowerCase().includes(keyword)));
}

function walk(root: string): string[] {
  const output: string[] = [];
  const ignored = new Set(['.git', 'node_modules', 'dist', '.decision', '.sduck-worktrees']);
  function visit(dir: string): void {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (ignored.has(entry.name)) continue;
      const absolute = path.join(dir, entry.name);
      if (entry.isDirectory()) visit(absolute);
      if (entry.isFile()) output.push(toRelativePath(root, absolute));
    }
  }
  visit(root);
  return output;
}

function expandPathOrGlob(projectRoot: string, pathOrGlob: string): string[] {
  if (!pathOrGlob.includes('*')) {
    const absolute = resolveInsideProject(projectRoot, pathOrGlob);
    if (!fs.existsSync(absolute)) return [];
    const stat = fs.statSync(absolute);
    if (stat.isFile()) return [toRelativePath(projectRoot, absolute)];
    if (stat.isDirectory())
      return walk(absolute).map((file) => toRelativePath(projectRoot, path.join(absolute, file)));
    return [];
  }
  const escaped = pathOrGlob
    .split('*')
    .map((part) => part.replace(/[.+?^${}()|[\]\\]/g, '\\$&'))
    .join('.*');
  const regex = new RegExp(`^${escaped}$`);
  return walk(projectRoot).filter((file) => regex.test(file));
}
