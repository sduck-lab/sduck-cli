import { decodeJson, tableExists } from './store.js';

import type { ImplementationPlan, ImplementationPlanStep } from '../../types/index.js';
import type { DatabaseSync } from 'node:sqlite';

interface ImplementationPlanRow {
  id: string;
  task_id: string;
  title: string;
  summary: string;
  target_files_json: string;
  steps_json: string;
  created_at: string;
}

interface TableInfoRow {
  name: string;
}

export function listAllImplementationPlans(db: DatabaseSync): ImplementationPlan[] {
  if (!tableExists(db, 'implementation_plans')) {
    return [];
  }
  const columns = new Set(
    (db.prepare(`PRAGMA table_info(implementation_plans)`).all() as unknown as TableInfoRow[]).map(
      (row) => row.name,
    ),
  );
  if (!columns.has('id') || !columns.has('task_id')) {
    return [];
  }
  const titleExpression = columns.has('title')
    ? 'title'
    : columns.has('summary')
      ? 'summary'
      : "''";
  const summaryExpression = columns.has('summary')
    ? 'summary'
    : columns.has('title')
      ? 'title'
      : "''";
  const targetFilesExpression = columns.has('target_files_json') ? 'target_files_json' : "'[]'";
  const stepsExpression = columns.has('steps_json') ? 'steps_json' : "'[]'";
  const createdAtExpression = columns.has('created_at') ? 'created_at' : "''";
  const orderBy = columns.has('created_at') ? 'created_at ASC' : 'id ASC';
  const rows = db
    .prepare(
      `SELECT id, task_id, ${titleExpression} AS title, ${summaryExpression} AS summary, ${targetFilesExpression} AS target_files_json, ${stepsExpression} AS steps_json, ${createdAtExpression} AS created_at FROM implementation_plans ORDER BY ${orderBy}`,
    )
    .all() as unknown as ImplementationPlanRow[];
  return rows.map(mapImplementationPlanRow);
}

export function mapImplementationPlanRow(row: ImplementationPlanRow): ImplementationPlan {
  const title = normalizeString(row.title);
  const summary = normalizeString(row.summary);
  return {
    id: row.id,
    taskId: row.task_id,
    title: title ?? summary ?? row.id,
    summary: summary ?? title ?? '',
    targetFiles: normalizeStringArray(decodeJson<unknown[]>(row.target_files_json, [])),
    steps: normalizePlanSteps(decodeJson<unknown[]>(row.steps_json, [])),
    createdAt: row.created_at,
  };
}

function normalizePlanSteps(value: unknown[]): ImplementationPlanStep[] {
  return value.map(normalizePlanStep);
}

function normalizePlanStep(value: unknown): ImplementationPlanStep {
  if (typeof value !== 'object' || value === null) {
    return {};
  }
  const record = value as Record<string, unknown>;
  const title = normalizeUnknownString(record['title']) ?? normalizeUnknownString(record['name']);
  const summary =
    normalizeUnknownString(record['summary']) ?? normalizeUnknownString(record['description']);
  const targetFiles =
    normalizeUnknownStringArray(record['targetFiles']) ??
    normalizeUnknownStringArray(record['target_files']) ??
    normalizeUnknownStringArray(record['files']) ??
    normalizeUnknownStringArray(record['paths']);
  const step: ImplementationPlanStep = {};
  if (title !== null) {
    step.title = title;
  }
  if (summary !== null) {
    step.summary = summary;
  }
  if (targetFiles !== null && targetFiles.length > 0) {
    step.targetFiles = targetFiles;
  }
  return step;
}

function normalizeString(value: string): string | null {
  const normalized = value.trim();
  return normalized === '' ? null : normalized;
}

function normalizeUnknownString(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null;
  }
  return normalizeString(value);
}

function normalizeUnknownStringArray(value: unknown): string[] | null {
  if (!Array.isArray(value)) {
    return null;
  }
  return normalizeStringArray(value);
}

function normalizeStringArray(value: unknown[]): string[] {
  const output: string[] = [];
  const seen = new Set<string>();
  for (const item of value) {
    if (typeof item !== 'string') {
      continue;
    }
    const normalized = item.trim();
    if (normalized === '' || seen.has(normalized)) {
      continue;
    }
    seen.add(normalized);
    output.push(normalized);
  }
  return output;
}
