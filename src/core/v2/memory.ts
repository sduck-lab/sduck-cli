import { DecisionWorkspace } from './decision-workspace.js';
import { noCurrentTask, taskNotFound, V2ExpectedError } from './errors.js';
import { nowIso } from './ids.js';
import {
  buildMemorySourceCatalog,
  hasPrimaryMemorySource,
  isMemorySourceAllowed,
  memoryCapsuleStaleReasons,
  memorySourceDigest,
  type MemorySourceEntry,
} from './memory-source.js';
import { containsLikePattern, ftsMatchQuery, searchTerms } from './search.js';
import { loadSourceBundle, nextSourceEntityId } from './source-store.js';
import { decodeJson } from './store.js';

import type { SourceBundle } from './source-types.js';
import type {
  MemoryCapsule,
  MemoryCapsuleDraft,
  MemoryClaim,
  MemoryClaimType,
  MemoryStatusEntry,
  MemoryStatusView,
} from '../../types/index.js';
import type { DatabaseSync } from 'node:sqlite';

const MAX_TITLE_LENGTH = 120;
const MAX_SUMMARY_LENGTH = 1_000;
const MAX_TOPICS = 20;
const MAX_TOPIC_LENGTH = 80;
const MAX_CLAIMS = 20;
const MAX_CLAIM_LENGTH = 600;
const MAX_SOURCES_PER_CLAIM = 12;

export interface DistillMemoryResult {
  capsule: MemoryCapsule;
  created: boolean;
  changed: boolean;
}

interface MemoryRow {
  id: string;
  task_id: string;
  title: string;
  summary: string;
  topics_json: string;
  claims_json: string;
  source_digest: string;
  created_at: string;
  updated_at: string;
}

export function distillMemory(
  projectRoot: string,
  content: string,
  options: { taskId?: string } = {},
): DistillMemoryResult {
  const draft = parseMemoryDraft(content);
  return new DecisionWorkspace(projectRoot).mutate(({ bundle, state }) => {
    const taskId = resolveDistillTaskId(state.currentTaskId, draft.taskId, options.taskId);
    const task = bundle.tasks.find((item) => item.id === taskId);
    if (task === undefined) throw taskNotFound(taskId);
    if (task.status !== 'CONFIRMED' && task.status !== 'CLOSED') {
      throw new V2ExpectedError('MEMORY_TASK_NOT_READY', {
        taskId,
        status: task.status,
        expected: 'CONFIRMED or CLOSED',
      });
    }

    const catalog = buildMemorySourceCatalog(bundle);
    validateClaimSources(bundle, catalog, taskId, draft.claims);
    const sourceIds = draft.claims.flatMap((claim) => claim.sourceIds);
    const sourceDigest = memorySourceDigest(catalog, sourceIds);
    const existing = bundle.memoryCapsules.find((memory) => memory.taskId === taskId);
    const candidate = {
      taskId,
      title: draft.title,
      summary: draft.summary,
      topics: draft.topics ?? [],
      claims: draft.claims,
      sourceDigest,
    };
    if (existing !== undefined && memoryContentMatches(existing, candidate)) {
      return { capsule: existing, created: false, changed: false };
    }

    const timestamp = nowIso();
    const capsule: MemoryCapsule = {
      ...candidate,
      id:
        existing?.id ??
        nextSourceEntityId(
          bundle.memoryCapsules.map((memory) => memory.id),
          'MEM',
          projectRoot,
        ),
      createdAt: existing?.createdAt ?? timestamp,
      updatedAt: timestamp,
    };
    if (existing === undefined) {
      bundle.memoryCapsules.push(capsule);
    } else {
      const index = bundle.memoryCapsules.indexOf(existing);
      bundle.memoryCapsules[index] = capsule;
    }
    return { capsule, created: existing === undefined, changed: true };
  });
}

function resolveDistillTaskId(
  currentTaskId: string | null,
  draftTaskId: string | undefined,
  requestedTaskId: string | undefined,
): string {
  const taskId = requestedTaskId ?? currentTaskId;
  if (taskId === null) throw noCurrentTask();
  if (draftTaskId !== undefined && draftTaskId !== taskId) {
    throw new V2ExpectedError('MEMORY_TASK_MISMATCH', {
      taskId: draftTaskId,
      expectedTaskId: taskId,
    });
  }
  return taskId;
}

export function getMemoryStatus(projectRoot: string): MemoryStatusView {
  const bundle = loadSourceBundle(projectRoot);
  const catalog = buildMemorySourceCatalog(bundle);
  const capsulesByTask = new Map(bundle.memoryCapsules.map((memory) => [memory.taskId, memory]));
  const entries = bundle.tasks
    .filter((task) => task.status === 'CONFIRMED' || task.status === 'CLOSED')
    .map((task): MemoryStatusEntry => {
      const capsule = capsulesByTask.get(task.id);
      if (capsule === undefined) {
        return {
          taskId: task.id,
          taskTitle: task.title,
          taskStatus: task.status,
          capsuleId: null,
          state: 'MISSING',
          reasons: ['capsule-missing'],
          sourceCount: 0,
          updatedAt: null,
        };
      }
      const sourceIds = unique(capsule.claims.flatMap((claim) => claim.sourceIds));
      const reasons = memoryCapsuleStaleReasons(bundle, capsule, catalog);
      return {
        taskId: task.id,
        taskTitle: task.title,
        taskStatus: task.status,
        capsuleId: capsule.id,
        state: reasons.length === 0 ? 'CURRENT' : 'STALE',
        reasons: unique(reasons),
        sourceCount: sourceIds.length,
        updatedAt: capsule.updatedAt,
      };
    })
    .sort((left, right) => left.taskId.localeCompare(right.taskId));
  return {
    entries,
    current: entries.filter((entry) => entry.state === 'CURRENT').length,
    missing: entries.filter((entry) => entry.state === 'MISSING').length,
    stale: entries.filter((entry) => entry.state === 'STALE').length,
  };
}

export function findMemoryCapsules(
  db: DatabaseSync,
  query: string,
  options: { excludeTaskId?: string; limit?: number } = {},
): MemoryCapsule[] {
  const limit = options.limit ?? 10;
  const terms = searchTerms(query);
  const byId = new Map<string, MemoryCapsule>();
  const ftsQuery = ftsMatchQuery(terms);
  if (ftsQuery !== null) {
    const rows = db
      .prepare(
        `SELECT m.* FROM memory_fts
         JOIN memory_capsules m ON m.id = memory_fts.id
         JOIN tasks t ON t.id = m.task_id
         WHERE t.status != 'ABANDONED' AND memory_fts MATCH ?
         ORDER BY bm25(memory_fts) LIMIT ?`,
      )
      .all(ftsQuery, limit) as unknown as MemoryRow[];
    for (const row of rows) {
      if (row.task_id === options.excludeTaskId) continue;
      byId.set(row.id, mapMemoryCapsuleRow(row));
    }
  }
  for (const term of terms) {
    const like = containsLikePattern(term);
    const rows = db
      .prepare(
        `SELECT m.* FROM memory_capsules m
         JOIN tasks t ON t.id = m.task_id
         WHERE t.status != 'ABANDONED'
           AND (m.title LIKE ? ESCAPE '\\' OR m.summary LIKE ? ESCAPE '\\'
             OR m.topics_json LIKE ? ESCAPE '\\' OR m.claims_json LIKE ? ESCAPE '\\')
         ORDER BY m.updated_at DESC LIMIT ?`,
      )
      .all(like, like, like, like, limit) as unknown as MemoryRow[];
    for (const row of rows) {
      if (row.task_id === options.excludeTaskId) continue;
      byId.set(row.id, mapMemoryCapsuleRow(row));
    }
  }
  return [...byId.values()]
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
    .slice(0, limit);
}

export function mapMemoryCapsuleRow(row: MemoryRow): MemoryCapsule {
  return {
    id: row.id,
    taskId: row.task_id,
    title: row.title,
    summary: row.summary,
    topics: decodeJson(row.topics_json, []),
    claims: decodeJson(row.claims_json, []),
    sourceDigest: row.source_digest,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function parseMemoryDraft(content: string): MemoryCapsuleDraft {
  let value: unknown;
  try {
    value = JSON.parse(content) as unknown;
  } catch (error) {
    throw new V2ExpectedError('MEMORY_JSON_INVALID', { detail: formatUnknownError(error) });
  }
  if (!isRecord(value)) throw memoryField('root', 'json-object');
  if (value['schemaVersion'] !== 'sduck-memory/v1') {
    throw new V2ExpectedError('MEMORY_SCHEMA', {
      expected: 'sduck-memory/v1',
      actual: describeValue(value['schemaVersion']),
    });
  }
  const taskId = optionalString(value['taskId'], 'taskId');
  const title = boundedString(value['title'], 'title', MAX_TITLE_LENGTH);
  const summary = boundedString(value['summary'], 'summary', MAX_SUMMARY_LENGTH);
  const topics = optionalStringArray(value['topics'], 'topics', MAX_TOPICS, MAX_TOPIC_LENGTH);
  if (!Array.isArray(value['claims']) || value['claims'].length === 0) {
    throw memoryField('claims', 'non-empty-array');
  }
  if (value['claims'].length > MAX_CLAIMS) throw memoryField('claims', 'maximum');
  const claims = value['claims'].map((claim, index) => parseClaim(claim, index));
  return {
    schemaVersion: 'sduck-memory/v1',
    ...(taskId === undefined ? {} : { taskId }),
    title,
    summary,
    topics,
    claims,
  };
}

function parseClaim(value: unknown, index: number): MemoryClaim {
  const field = `claims[${String(index)}]`;
  if (!isRecord(value)) throw memoryField(field, 'json-object');
  const type = value['type'];
  if (!['DECISION', 'CONSTRAINT', 'IMPLEMENTATION', 'VALIDATION'].includes(String(type))) {
    throw memoryField(`${field}.type`, 'unsupported-enum-value');
  }
  const text = boundedString(value['text'], `${field}.text`, MAX_CLAIM_LENGTH);
  const sourceIds = optionalStringArray(
    value['sourceIds'],
    `${field}.sourceIds`,
    MAX_SOURCES_PER_CLAIM,
    MAX_TITLE_LENGTH,
  );
  if (sourceIds.length === 0) throw memoryField(`${field}.sourceIds`, 'non-empty-array');
  return { type: type as MemoryClaimType, text, sourceIds };
}

function validateClaimSources(
  bundle: SourceBundle,
  catalog: ReadonlyMap<string, MemorySourceEntry>,
  taskId: string,
  claims: readonly MemoryClaim[],
): void {
  for (const claim of claims) {
    const kinds = claim.sourceIds.map((sourceId) => {
      const source = catalog.get(sourceId);
      if (source === undefined) throw memorySourceError(sourceId, claim.type, 'missing-source');
      if (source.taskId !== taskId) {
        throw memorySourceError(sourceId, claim.type, 'wrong-task', {
          taskId: source.taskId,
          expectedTaskId: taskId,
        });
      }
      if (!isMemorySourceAllowed(claim.type, source.kind)) {
        throw memorySourceError(sourceId, claim.type, 'incompatible-source-kind', {
          sourceKind: source.kind,
        });
      }
      if (
        source.kind === 'DECISION' &&
        bundle.decisions.find((decision) => decision.id === sourceId)?.status !== 'CONFIRMED'
      ) {
        throw memorySourceError(sourceId, claim.type, 'decision-not-confirmed');
      }
      return source.kind;
    });
    if (!hasPrimaryMemorySource(claim.type, kinds)) {
      throw memorySourceError(claim.sourceIds.join(','), claim.type, 'missing-primary-source');
    }
  }
}

function memoryContentMatches(
  existing: MemoryCapsule,
  candidate: Omit<MemoryCapsule, 'id' | 'createdAt' | 'updatedAt'>,
): boolean {
  return (
    existing.taskId === candidate.taskId &&
    existing.title === candidate.title &&
    existing.summary === candidate.summary &&
    existing.sourceDigest === candidate.sourceDigest &&
    JSON.stringify(existing.topics) === JSON.stringify(candidate.topics) &&
    JSON.stringify(existing.claims) === JSON.stringify(candidate.claims)
  );
}

function boundedString(value: unknown, field: string, maximum: number): string {
  if (typeof value !== 'string' || value.trim() === '')
    throw memoryField(field, 'non-empty-string');
  const normalized = value.trim();
  if (normalized.length > maximum) throw memoryField(field, 'maximum', { maximum });
  return normalized;
}

function optionalString(value: unknown, field: string): string | undefined {
  if (value === undefined) return undefined;
  return boundedString(value, field, MAX_TITLE_LENGTH);
}

function optionalStringArray(
  value: unknown,
  field: string,
  maximumItems: number,
  maximumLength: number,
): string[] {
  if (value === undefined) return [];
  if (!Array.isArray(value)) throw memoryField(field, 'string-array');
  if (value.length > maximumItems) throw memoryField(field, 'maximum', { maximum: maximumItems });
  return unique(
    value.map((item, index) => boundedString(item, `${field}[${String(index)}]`, maximumLength)),
  );
}

function memoryField(
  field: string,
  problemCode: string,
  extra: Record<string, string | number | boolean> = {},
): V2ExpectedError {
  return new V2ExpectedError('MEMORY_FIELD', { field, problemCode, ...extra });
}

function memorySourceError(
  sourceId: string,
  claimType: MemoryClaimType,
  reason: string,
  extra: Record<string, string | number | boolean> = {},
): V2ExpectedError {
  return new V2ExpectedError('MEMORY_SOURCE_INVALID', {
    sourceId,
    claimType,
    reason,
    ...extra,
  });
}

function unique(values: readonly string[]): string[] {
  return [...new Set(values)];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function describeValue(value: unknown): string {
  if (value === undefined) return '';
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  if (value === null) return 'null';
  return Array.isArray(value) ? 'array' : 'object';
}

function formatUnknownError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
