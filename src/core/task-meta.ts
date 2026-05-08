import { readFile, writeFile } from 'node:fs/promises';

import { formatUtcTimestamp } from '../utils/utc-date.js';

export interface TaskMetaApproval {
  approved: boolean;
  approvedAt: string | null;
}

export interface TaskMetaSteps {
  completed: number[];
  total: number | null;
}

export interface TaskMeta {
  baseBranch: string | null;
  branch: string | null;
  completedAt: string | null;
  createdAt: string;
  cycle: number | null;
  id: string;
  plan: TaskMetaApproval;
  slug: string;
  spec: TaskMetaApproval;
  status: string;
  steps: TaskMetaSteps;
  type: string;
  updatedAt: string;
  worktreePath: string | null;
}

export interface CreateInitialTaskMetaInput {
  baseBranch: string | null;
  branch: string | null;
  createdAt: string;
  id: string;
  slug: string;
  type: string;
  updatedAt: string;
  worktreePath: string | null;
}

function readRequired(content: string, label: string, pattern: RegExp): string {
  const match = pattern.exec(content);
  const value = match?.[1]?.trim();

  if (value === undefined || value === '') {
    throw new Error(`Meta is missing a valid ${label} field.`);
  }

  return value;
}

function readNullable(content: string, pattern: RegExp): string | null {
  const value = pattern.exec(content)?.[1]?.trim();
  if (value === undefined || value === '' || value === 'null') return null;
  return value;
}

function parseBoolean(value: string, label: string): boolean {
  if (value === 'true') return true;
  if (value === 'false') return false;
  throw new Error(`Invalid ${label} value: ${value}`);
}

function parseNullableNumber(value: string, label: string): number | null {
  if (value === 'null') return null;
  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`Invalid ${label} value: ${value}`);
  }
  return parsed;
}

export function parseCompletedSteps(value: string): number[] {
  const trimmed = value.trim();
  if (trimmed === '') return [];

  return trimmed.split(',').map((segment) => {
    const step = Number.parseInt(segment.trim(), 10);
    if (!Number.isInteger(step)) {
      throw new Error(`Invalid completed step value: ${segment.trim()}`);
    }
    return step;
  });
}

function renderNullable(value: string | null): string {
  return value ?? 'null';
}

function renderSteps(steps: readonly number[]): string {
  return steps.length === 0 ? '' : steps.join(', ');
}

function timestamp(value: Date | string): string {
  return value instanceof Date ? formatUtcTimestamp(value) : value;
}

export function parseTaskMeta(content: string): TaskMeta {
  const cycleRaw = /^cycle:[ \t]+(.+)$/m.exec(content)?.[1]?.trim();
  const cycle = cycleRaw === undefined ? null : parseNullableNumber(cycleRaw, 'cycle');
  const specSection = /^spec:\n {2}approved:[ \t]+(.+)\n {2}approved_at:[ \t]+(.+)$/m.exec(content);
  const planSection = /^plan:\n {2}approved:[ \t]+(.+)\n {2}approved_at:[ \t]+(.+)$/m.exec(content);
  const stepsSection = /^steps:\n {2}total:[ \t]+(.+)\n {2}completed:[ \t]+\[(.*)\]$/m.exec(
    content,
  );

  if (specSection?.[1] === undefined || specSection[2] === undefined) {
    throw new Error('Meta is missing a valid spec block.');
  }
  if (planSection?.[1] === undefined || planSection[2] === undefined) {
    throw new Error('Meta is missing a valid plan block.');
  }
  if (stepsSection?.[1] === undefined || stepsSection[2] === undefined) {
    throw new Error('Meta is missing a valid steps block.');
  }

  return {
    baseBranch: readNullable(content, /^base_branch:[ \t]+(.+)$/m),
    branch: readNullable(content, /^branch:[ \t]+(.+)$/m),
    completedAt: readNullable(content, /^completed_at:[ \t]+(.+)$/m),
    createdAt: readRequired(content, 'created_at', /^created_at:[ \t]+(.+)$/m),
    cycle,
    id: readRequired(content, 'id', /^id:[ \t]+(.+)$/m),
    plan: {
      approved: parseBoolean(planSection[1].trim(), 'plan.approved'),
      approvedAt: planSection[2].trim() === 'null' ? null : planSection[2].trim(),
    },
    slug: readRequired(content, 'slug', /^slug:[ \t]+(.+)$/m),
    spec: {
      approved: parseBoolean(specSection[1].trim(), 'spec.approved'),
      approvedAt: specSection[2].trim() === 'null' ? null : specSection[2].trim(),
    },
    status: readRequired(content, 'status', /^status:[ \t]+(.+)$/m),
    steps: {
      completed: parseCompletedSteps(stepsSection[2]),
      total: parseNullableNumber(stepsSection[1].trim(), 'steps.total'),
    },
    type: readRequired(content, 'type', /^type:[ \t]+(.+)$/m),
    updatedAt: readRequired(content, 'updated_at', /^updated_at:[ \t]+(.+)$/m),
    worktreePath: readNullable(content, /^worktree_path:[ \t]+(.+)$/m),
  };
}

export function renderTaskMeta(meta: TaskMeta): string {
  const lines = [
    `id: ${meta.id}`,
    `type: ${meta.type}`,
    `slug: ${meta.slug}`,
    `created_at: ${meta.createdAt}`,
    `updated_at: ${meta.updatedAt}`,
    '',
    `branch: ${renderNullable(meta.branch)}`,
    `base_branch: ${renderNullable(meta.baseBranch)}`,
    `worktree_path: ${renderNullable(meta.worktreePath)}`,
    '',
  ];

  if (meta.cycle !== null) {
    lines.push(`cycle: ${String(meta.cycle)}`, '');
  }

  lines.push(
    `status: ${meta.status}`,
    '',
    'spec:',
    `  approved: ${String(meta.spec.approved)}`,
    `  approved_at: ${renderNullable(meta.spec.approvedAt)}`,
    '',
    'plan:',
    `  approved: ${String(meta.plan.approved)}`,
    `  approved_at: ${renderNullable(meta.plan.approvedAt)}`,
    '',
    'steps:',
    `  total: ${meta.steps.total === null ? 'null' : String(meta.steps.total)}`,
    `  completed: [${renderSteps(meta.steps.completed)}]`,
    '',
    `completed_at: ${renderNullable(meta.completedAt)}`,
    '',
  );

  return lines.join('\n');
}

export async function readTaskMeta(metaPath: string): Promise<TaskMeta> {
  return parseTaskMeta(await readFile(metaPath, 'utf8'));
}

export async function writeTaskMeta(metaPath: string, meta: TaskMeta): Promise<void> {
  await writeFile(metaPath, renderTaskMeta(meta), 'utf8');
}

export async function patchTaskMeta(
  metaPath: string,
  mutator: (meta: TaskMeta) => TaskMeta,
): Promise<TaskMeta> {
  const next = mutator(await readTaskMeta(metaPath));
  await writeTaskMeta(metaPath, next);
  return next;
}

export function createInitialTaskMeta(input: CreateInitialTaskMetaInput): TaskMeta {
  return {
    baseBranch: input.baseBranch,
    branch: input.branch,
    completedAt: null,
    createdAt: input.createdAt,
    cycle: null,
    id: input.id,
    plan: { approved: false, approvedAt: null },
    slug: input.slug,
    spec: { approved: false, approvedAt: null },
    status: 'PENDING_SPEC_APPROVAL',
    steps: { completed: [], total: null },
    type: input.type,
    updatedAt: input.updatedAt,
    worktreePath: input.worktreePath,
  };
}

export function approveSpecInMeta(meta: TaskMeta, approvedAt: string): TaskMeta {
  return { ...meta, spec: { approved: true, approvedAt }, status: 'SPEC_APPROVED' };
}

export function approvePlanInMeta(
  meta: TaskMeta,
  approvedAt: string,
  totalSteps: number,
): TaskMeta {
  return {
    ...meta,
    plan: { approved: true, approvedAt },
    status: 'IN_PROGRESS',
    steps: { completed: [], total: totalSteps },
  };
}

export function completeStepInMeta(
  meta: TaskMeta,
  stepNumber: number,
  updatedAt: Date | string,
): TaskMeta {
  const completed = [...new Set([...meta.steps.completed, stepNumber])].sort((a, b) => a - b);
  return { ...meta, steps: { ...meta.steps, completed }, updatedAt: timestamp(updatedAt) };
}

export function markReviewReadyInMeta(meta: TaskMeta, updatedAt: Date | string): TaskMeta {
  return { ...meta, status: 'REVIEW_READY', updatedAt: timestamp(updatedAt) };
}

export function markDoneInMeta(meta: TaskMeta, completedAt: string): TaskMeta {
  return { ...meta, completedAt, status: 'DONE' };
}

export function reopenMeta(meta: TaskMeta, newCycle: number): TaskMeta {
  if (meta.status === 'REVIEW_READY') {
    return { ...meta, cycle: newCycle, status: 'IN_PROGRESS' };
  }

  return {
    ...meta,
    completedAt: null,
    cycle: newCycle,
    plan: { approved: false, approvedAt: null },
    spec: { approved: false, approvedAt: null },
    status: 'PENDING_SPEC_APPROVAL',
    steps: { completed: [], total: null },
  };
}

export function abandonMeta(meta: TaskMeta, updatedAt: Date | string): TaskMeta {
  return { ...meta, status: 'ABANDONED', updatedAt: timestamp(updatedAt) };
}
