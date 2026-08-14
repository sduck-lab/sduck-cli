import { execFileSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';

import { ensureReadableCache } from './cache.js';
import { DecisionWorkspace } from './decision-workspace.js';
import { mapDecision } from './decision.js';
import { noCurrentTask, taskNotFound, V2ExpectedError } from './errors.js';
import { listEvidenceByTask } from './evidence.js';
import { GRILL_ME_CHECKLIST, GRILL_ME_PROMPT, GRILL_ME_PROTOCOL } from './grill.js';
import { nextEntityId, nowIso } from './ids.js';
import { citedMemorySourceIds } from './memory-source.js';
import { findMemoryCapsules } from './memory.js';
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
import { containsLikePattern, searchTerms } from './search.js';
import { appendSourceEvent, nextSourceEntityId } from './source-store.js';
import { getCurrentTaskId } from './state.js';
import { decodeJson, encodeJson, openDatabase } from './store.js';
import { TaskLifecycle } from './task-lifecycle.js';
import { getTaskById } from './task.js';
import { mapTraceRow } from './trace.js';

import type {
  ContextItem,
  ContextPack,
  ContextSourceType,
  MemoryCapsule,
  SduckDraft,
  Task,
} from '../../types/index.js';
import type { DatabaseSync } from 'node:sqlite';

export { GRILL_ME_CHECKLIST, GRILL_ME_PROMPT, GRILL_ME_PROTOCOL } from './grill.js';

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
  ensureReadableCache(projectRoot);
  return new DecisionWorkspace(projectRoot).mutate(({ bundle }) => {
    const canonicalTask = bundle.tasks.find((item) => item.id === task.id);
    if (canonicalTask === undefined) throw taskNotFound(task.id);
    new TaskLifecycle(bundle, task.id).assertAllowed('context');
    const db = openDatabase(projectRoot);
    const contextIds = bundle.contextItems.map((item) => item.id);
    const candidates: ContextCandidate[] = [];
    try {
      const discoveredFiles = findRelevantFiles(projectRoot, canonicalTask.description).slice(
        0,
        20,
      );
      const scopedFiles = collectScopedFiles(projectRoot, db, canonicalTask, discoveredFiles);
      candidates.push(...findGraphContextCandidates(projectRoot, db, canonicalTask, scopedFiles));
      candidates.push(...findMemoryItems(db, canonicalTask));
      candidates.push(
        ...findAppliesToContextCandidates(projectRoot, db, canonicalTask, scopedFiles),
      );
      for (const file of discoveredFiles) {
        const excerpt = findRelevantExcerpt(projectRoot, file, canonicalTask.description);
        candidates.push({
          taskId: canonicalTask.id,
          sourceType: 'DISCOVERY',
          sourceRef: file,
          summary:
            excerpt === null
              ? `Path appears relevant to: ${canonicalTask.description}`
              : `File evidence: ${excerpt.text}`,
          metadata: {
            reason: RELEVANCE_REASONS.weakSubstringFallback,
            score: 0.3,
            attached: false,
            ...(excerpt === null ? {} : { excerpt: excerpt.text, line: excerpt.line }),
          },
        });
      }
      const report = graphifyReportPath(projectRoot);
      if (fs.existsSync(report)) {
        candidates.push({
          taskId: canonicalTask.id,
          sourceType: 'GRAPHIFY_REPORT',
          sourceRef: toRelativePath(projectRoot, report),
          summary: 'Existing Graphify report is available as evidence.',
          metadata: {},
        });
      }
      const graph = graphifyGraphPath(projectRoot);
      if (fs.existsSync(graph)) {
        candidates.push({
          taskId: canonicalTask.id,
          sourceType: 'GRAPHIFY_GRAPH',
          sourceRef: toRelativePath(projectRoot, graph),
          summary: 'Existing Graphify graph JSON is available as evidence.',
          metadata: {},
        });
      }
    } finally {
      db.close();
    }
    const previous = bundle.contextItems.filter((item) => item.taskId === canonicalTask.id);
    const explicit = dedupePersistedContextItems(
      previous.filter((item) => item.sourceType === 'FILE'),
    );
    const automatic = reconcileAutomaticContext(
      previous.filter((item) => item.sourceType !== 'FILE'),
      dedupeContextCandidates(candidates),
      contextIds,
    );
    const next = [...explicit, ...automatic];
    bundle.contextItems = [
      ...bundle.contextItems.filter((item) => item.taskId !== canonicalTask.id),
      ...next,
    ];
    if (!sameContextItems(previous, next)) {
      appendSourceEvent(bundle, {
        taskId: canonicalTask.id,
        type: 'CONTEXT_INDEXED',
        payload: { itemCount: automatic.length },
      });
    }
    return automatic;
  });
}

export function getContextPack(projectRoot: string): ContextPack {
  ensureReadableCache(projectRoot);
  const db = openDatabase(projectRoot);
  try {
    const taskId = requireCurrentTaskId(projectRoot);
    const task = getTaskById(db, taskId);
    if (task === null) throw taskNotFound(taskId);
    const rows = db
      .prepare(`SELECT * FROM context_items WHERE task_id = ? ORDER BY created_at ASC`)
      .all(taskId) as unknown as ContextRow[];
    const persistedItems = rows.map(mapContextItem);
    const graphItems = buildGraphContextItems(db, task);
    const priorMemories = findMemoryCapsules(db, task.description, {
      excludeTaskId: task.id,
      limit: 10,
    });
    const citedSourceIds = citedMemorySourceIds(priorMemories);
    const visiblePersistedItems = persistedItems.filter(
      (item) => item.sourceType === 'FILE' || !citedSourceIds.has(item.sourceRef),
    );
    const memoryItems = priorMemories
      .filter(
        (memory) =>
          !visiblePersistedItems.some(
            (item) => item.sourceType === 'MEMORY' && item.sourceRef === memory.id,
          ),
      )
      .map((memory, index) => memoryContextItem(task.id, memory, index));
    return {
      task,
      items: [...visiblePersistedItems, ...memoryItems, ...graphItems],
      evidence: listEvidenceByTask(db, task.id),
      priorMemories,
      priorDecisions: listPriorDecisions(db, task.id, citedSourceIds),
      priorTraces: listPriorTraces(db, task.id, citedSourceIds),
      grillMeProtocol: buildGrillMeProtocol(),
      grillMePrompt: buildGrillMePrompt(),
      grillMeChecklist: buildGrillMeChecklist(),
      draftSchemaExample: buildDraftSchemaExample(task.id),
    };
  } finally {
    db.close();
  }
}

function buildGraphContextItems(db: DatabaseSync, task: Task): ContextItem[] {
  const rows = db
    .prepare(
      `SELECT d.id, d.title, d.kind, d.summary, e.kind AS edge_kind
       FROM graph_edges e
       JOIN decisions d ON d.id = e.to_id OR d.id = e.from_id
       JOIN tasks t ON t.id = d.task_id
       WHERE (e.from_id = ? OR e.to_id = ?) AND d.task_id != ?
         AND d.status = 'CONFIRMED' AND t.status != 'ABANDONED'
       ORDER BY e.kind, d.id
       LIMIT 10`,
    )
    .all(task.id, task.id, task.id) as {
    id: string;
    title: string;
    kind: string;
    summary: string;
    edge_kind: string;
  }[];
  const carriedRows = db
    .prepare(
      `SELECT prior.id, prior.title, prior.kind, prior.summary, e.kind AS edge_kind
       FROM decisions current
       JOIN graph_edges e ON e.from_id = current.id AND e.kind = 'CARRIED_FROM'
       JOIN decisions prior ON prior.id = e.to_id
       JOIN tasks t ON t.id = prior.task_id
       WHERE current.task_id = ? AND prior.status = 'CONFIRMED' AND t.status != 'ABANDONED'
       ORDER BY prior.id
       LIMIT 10`,
    )
    .all(task.id) as typeof rows;
  return [...rows, ...carriedRows].slice(0, 10).map((row, index) => ({
    id: `GRAPH-${String(index + 1).padStart(4, '0')}`,
    taskId: task.id,
    sourceType: 'MEMORY',
    sourceRef: row.id,
    summary: `Graph history (${row.edge_kind}): ${row.title} — ${row.summary}`,
    metadata: { type: 'graph', kind: row.kind, relation: row.edge_kind, synthetic: true },
    createdAt: new Date(0).toISOString(),
  }));
}

function findMemoryItems(db: DatabaseSync, task: Task): ContextCandidate[] {
  const memories = findMemoryCapsules(db, task.description, {
    excludeTaskId: task.id,
    limit: 10,
  });
  const citedSourceIds = citedMemorySourceIds(memories);
  const likes = searchTerms(task.description).map(containsLikePattern);
  const items: ContextCandidate[] = memories.map((memory) => ({
    taskId: task.id,
    sourceType: 'MEMORY',
    sourceRef: memory.id,
    summary: `Memory capsule: ${memory.title} — ${memory.summary}`,
    metadata: {
      type: 'memory_capsule',
      sourceTaskId: memory.taskId,
      topics: memory.topics,
      reason: RELEVANCE_REASONS.recallResult,
      score: 1,
    },
  }));
  for (const like of likes) {
    const decisionRows = db
      .prepare(
        `SELECT d.* FROM decisions d
         JOIN tasks t ON t.id = d.task_id
         WHERE d.task_id != ? AND d.status = 'CONFIRMED' AND t.status != 'ABANDONED'
           AND (d.title LIKE ? ESCAPE '\\' OR d.summary LIKE ? ESCAPE '\\')
         LIMIT 5`,
      )
      .all(task.id, like, like) as unknown as Parameters<typeof mapDecision>[0][];
    for (const row of decisionRows) {
      const decision = mapDecision(row);
      if (citedSourceIds.has(decision.id)) continue;
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
        `SELECT i.* FROM implementation_traces i
         JOIN tasks t ON t.id = i.task_id
         WHERE i.task_id != ? AND t.status != 'ABANDONED'
           AND (i.summary LIKE ? ESCAPE '\\' OR i.files_changed_json LIKE ? ESCAPE '\\')
         LIMIT 5`,
      )
      .all(task.id, like, like) as unknown as Parameters<typeof mapTraceRow>[0][];
    for (const row of traceRows) {
      const trace = mapTraceRow(row);
      if (citedSourceIds.has(trace.id)) continue;
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
  db: DatabaseSync,
  task: Task,
  scopedFiles: string[],
): ContextCandidate[] {
  return readGraphDecisionFileLinks(projectRoot)
    .filter((link) => graphFileIntersectsScope(projectRoot, link.file, scopedFiles))
    .filter((link) => isReusableGraphDecision(db, link.decisionId, task.id))
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

function isReusableGraphDecision(
  db: DatabaseSync,
  decisionId: string,
  currentTaskId: string,
): boolean {
  const row = db
    .prepare(
      `SELECT d.status AS decision_status, d.task_id, t.status AS task_status
       FROM decisions d JOIN tasks t ON t.id = d.task_id
       WHERE d.id = ?`,
    )
    .get(decisionId) as
    { decision_status: string; task_id: string; task_status: string } | undefined;
  if (row === undefined) return true;
  return (
    row.task_id !== currentTaskId &&
    row.decision_status === 'CONFIRMED' &&
    row.task_status !== 'ABANDONED'
  );
}

function findAppliesToContextCandidates(
  projectRoot: string,
  db: DatabaseSync,
  task: Task,
  scopedFiles: string[],
): ContextCandidate[] {
  if (scopedFiles.length === 0) return [];
  const decisionRows = db
    .prepare(
      `SELECT d.* FROM decisions d
       JOIN tasks t ON t.id = d.task_id
       WHERE d.task_id != ? AND d.status = 'CONFIRMED' AND t.status != 'ABANDONED'
       ORDER BY d.created_at DESC LIMIT 50`,
    )
    .all(task.id) as unknown as Parameters<typeof mapDecision>[0][];
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

function dedupePersistedContextItems(items: ContextItem[]): ContextItem[] {
  const byKey = new Map<string, ContextItem>();
  for (const item of items) {
    const key = contextKey(item);
    const existing = byKey.get(key);
    if (existing === undefined || metadataScore(item.metadata) > metadataScore(existing.metadata)) {
      byKey.set(key, item);
    }
  }
  return [...byKey.values()];
}

function reconcileAutomaticContext(
  existingItems: ContextItem[],
  candidates: ContextCandidate[],
  existingIds: string[],
): ContextItem[] {
  const existingByKey = new Map(
    dedupePersistedContextItems(existingItems).map((item) => [contextKey(item), item]),
  );
  const currentByKey = new Map<string, ContextItem>();
  let ids = [...existingIds];
  for (const candidate of candidates) {
    const key = contextKey(candidate);
    const existing = existingByKey.get(key);
    if (existing === undefined) {
      const created = makeSourceContextItem(ids, candidate);
      ids = [...ids, created.id];
      currentByKey.set(key, created);
      continue;
    }
    currentByKey.set(key, {
      ...candidate,
      id: existing.id,
      createdAt: existing.createdAt,
    });
  }
  return [...currentByKey.values()]
    .sort((left, right) => {
      const score = metadataScore(right.metadata) - metadataScore(left.metadata);
      return score === 0 ? left.id.localeCompare(right.id) : score;
    })
    .slice(0, 40);
}

function sameContextItems(left: ContextItem[], right: ContextItem[]): boolean {
  const normalize = (items: ContextItem[]) =>
    [...items].sort((first, second) => first.id.localeCompare(second.id));
  return JSON.stringify(normalize(left)) === JSON.stringify(normalize(right));
}

function contextKey(item: Pick<ContextItem, 'sourceType' | 'sourceRef'>): string {
  return `${item.sourceType}\0${item.sourceRef}`;
}

function metadataScore(metadata: Record<string, unknown>): number {
  return typeof metadata['score'] === 'number' ? metadata['score'] : 0;
}

function listPriorDecisions(
  db: DatabaseSync,
  taskId: string,
  excludedSourceIds: ReadonlySet<string>,
) {
  const rows = db
    .prepare(
      `SELECT d.* FROM decisions d
       JOIN tasks t ON t.id = d.task_id
       WHERE d.task_id != ? AND d.status = 'CONFIRMED' AND t.status != 'ABANDONED'
       ORDER BY d.created_at DESC LIMIT 100`,
    )
    .all(taskId) as unknown as Parameters<typeof mapDecision>[0][];
  return rows
    .map(mapDecision)
    .filter((decision) => !excludedSourceIds.has(decision.id))
    .slice(0, 20);
}

function listPriorTraces(db: DatabaseSync, taskId: string, excludedSourceIds: ReadonlySet<string>) {
  const rows = db
    .prepare(
      `SELECT i.* FROM implementation_traces i
       JOIN tasks t ON t.id = i.task_id
       WHERE i.task_id != ? AND t.status != 'ABANDONED'
       ORDER BY i.created_at DESC LIMIT 100`,
    )
    .all(taskId) as unknown as Parameters<typeof mapTraceRow>[0][];
  return rows
    .map(mapTraceRow)
    .filter((trace) => !excludedSourceIds.has(trace.id))
    .slice(0, 20);
}

function memoryContextItem(taskId: string, memory: MemoryCapsule, index: number): ContextItem {
  return {
    id: `MEMORY-${String(index + 1).padStart(4, '0')}`,
    taskId,
    sourceType: 'MEMORY',
    sourceRef: memory.id,
    summary: `Memory capsule: ${memory.title} — ${memory.summary}`,
    metadata: {
      type: 'memory_capsule',
      sourceTaskId: memory.taskId,
      topics: memory.topics,
      synthetic: true,
    },
    createdAt: memory.updatedAt,
  };
}

export function addContextPath(projectRoot: string, pathOrGlob: string): ContextItem[] {
  const matches = expandPathOrGlob(projectRoot, pathOrGlob);
  if (matches.length === 0) {
    throw new V2ExpectedError('CONTEXT_NO_MATCHES', { path: pathOrGlob });
  }
  return new DecisionWorkspace(projectRoot).mutate(({ bundle, state }) => {
    const taskId = requireCurrentTaskIdFromState(state.currentTaskId);
    new TaskLifecycle(bundle, taskId).assertAllowed('context');
    let contextIds = bundle.contextItems.map((item) => item.id);
    const existingKeys = new Set(
      bundle.contextItems.filter((item) => item.taskId === taskId).map((item) => contextKey(item)),
    );
    const items = matches
      .filter((file) => !existingKeys.has(`FILE\0${file}`))
      .map((file) => {
        const item = makeSourceContextItem(contextIds, {
          taskId,
          sourceType: 'FILE',
          sourceRef: file,
          summary: `Added by agent/user context request: ${file}`,
          metadata: { requested: pathOrGlob },
        });
        contextIds = [...contextIds, item.id];
        existingKeys.add(contextKey(item));
        return item;
      });
    bundle.contextItems.push(...items);
    if (items.length > 0) {
      appendSourceEvent(bundle, {
        taskId,
        type: 'CONTEXT_ITEM_ADDED',
        payload: { pathOrGlob, count: items.length },
      });
    }
    return items;
  });
}

function requireCurrentTaskIdFromState(taskId: string | null): string {
  if (taskId === null) throw noCurrentTask();
  return taskId;
}

function makeSourceContextItem(
  existingIds: string[],
  input: Omit<ContextItem, 'id' | 'createdAt'>,
): ContextItem {
  return { ...input, id: nextSourceEntityId(existingIds, 'CTX'), createdAt: nowIso() };
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
  if (taskId === null) throw noCurrentTask();
  return taskId;
}

function findRelevantFiles(projectRoot: string, description: string): string[] {
  const keywords = description
    .toLowerCase()
    .split(/[^a-z0-9가-힣]+/i)
    .filter((word) => word.length >= 3);
  const files = walk(projectRoot);
  if (keywords.length === 0) return files.slice(0, 10);
  return files
    .map((file) => {
      const pathMatches = keywords.filter((keyword) => file.toLowerCase().includes(keyword)).length;
      const content = readTextSample(projectRoot, file)?.toLowerCase() ?? '';
      const contentMatches = keywords.filter((keyword) => content.includes(keyword)).length;
      return { file, score: pathMatches * 2 + contentMatches };
    })
    .filter((candidate) => candidate.score > 0)
    .sort((left, right) => right.score - left.score || left.file.localeCompare(right.file))
    .map((candidate) => candidate.file);
}

function walk(root: string): string[] {
  const gitVisible = listGitVisibleFiles(root);
  if (gitVisible !== null) return gitVisible;
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

function listGitVisibleFiles(root: string): string[] | null {
  try {
    execFileSync('git', ['rev-parse', '--is-inside-work-tree'], {
      cwd: root,
      env: isolatedGitEnv(),
      stdio: ['ignore', 'pipe', 'ignore'],
    });
    const output = execFileSync(
      'git',
      ['ls-files', '--cached', '--others', '--exclude-standard', '--'],
      {
        cwd: root,
        encoding: 'utf8',
        env: isolatedGitEnv(),
        stdio: ['ignore', 'pipe', 'ignore'],
      },
    );
    return output
      .split('\n')
      .map((file) => file.trim().replaceAll('\\', '/'))
      .filter((file) => file !== '' && isContextFile(file))
      .filter((file) => {
        try {
          return fs.statSync(path.join(root, file)).isFile();
        } catch {
          return false;
        }
      });
  } catch {
    return null;
  }
}

function isContextFile(file: string): boolean {
  return ![
    '.git/',
    '.decision/',
    '.sduck/',
    '.sduck-worktrees/',
    'node_modules/',
    'dist/',
    'coverage/',
    'test/workspaces/',
  ].some((prefix) => file === prefix.slice(0, -1) || file.startsWith(prefix));
}

function findRelevantExcerpt(
  projectRoot: string,
  file: string,
  description: string,
): { line: number; text: string } | null {
  const content = readTextSample(projectRoot, file);
  if (content === null) return null;
  const keywords = description
    .toLowerCase()
    .split(/[^a-z0-9가-힣]+/i)
    .filter((word) => word.length >= 3);
  const lines = content.split('\n');
  const index = lines.findIndex((line) =>
    keywords.some((keyword) => line.toLowerCase().includes(keyword)),
  );
  if (index < 0) return null;
  const text = lines[index]?.trim().slice(0, 240) ?? '';
  return text === '' ? null : { line: index + 1, text };
}

function readTextSample(projectRoot: string, file: string): string | null {
  const absolutePath = path.join(projectRoot, file);
  try {
    const stat = fs.statSync(absolutePath);
    if (!stat.isFile() || stat.size > 128 * 1024) return null;
    const content = fs.readFileSync(absolutePath, 'utf8').slice(0, 16 * 1024);
    return content.includes('\0') ? null : content;
  } catch {
    return null;
  }
}

function isolatedGitEnv(): NodeJS.ProcessEnv {
  const env = { ...process.env };
  delete env['GIT_DIR'];
  delete env['GIT_WORK_TREE'];
  delete env['GIT_INDEX_FILE'];
  delete env['GIT_PREFIX'];
  return env;
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
