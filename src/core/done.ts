import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

import { getFsEntryKind } from './fs.js';
import { getProjectRelativeSduckAssetPath } from './project-paths.js';
import { readCurrentWorkId, writeCurrentWorkId } from './state.js';
import { assertTransition, refreshAgentContextBestEffort } from './task-lifecycle.js';
import { markDoneInMeta, parseTaskMeta, patchTaskMeta, type TaskMeta } from './task-meta.js';
import { resolveTaskTarget } from './task-target.js';
import { formatUtcTimestamp } from '../utils/utc-date.js';

import type { WorkspaceTaskSummary } from './workspace.js';

export interface DoneCommandInput {
  target?: string;
}

export interface DoneTarget {
  createdAt?: string;
  id: string;
  path: string;
  slug?: string;
  status: string;
}

export interface DoneSuccessRow {
  completedAt: string;
  note: string;
  reviewWarning: string | undefined;
  taskEvalCriteria: string[];
  taskId: string;
}

export interface DoneFailureRow {
  note: string;
  pendingChecklistItems: string[];
  taskId: string;
}

export interface DoneResult {
  completedAt: string;
  failed: DoneFailureRow[];
  nextStatus: 'DONE';
  succeeded: DoneSuccessRow[];
}

interface MetaValidationSummary {
  completedSteps: number[];
  totalSteps: number;
}

const TASK_EVAL_ASSET_PATH = getProjectRelativeSduckAssetPath('eval', 'task.yml');

export function filterDoneCandidates(tasks: readonly WorkspaceTaskSummary[]): DoneTarget[] {
  return tasks.filter((task) => task.status === 'REVIEW_READY');
}

export function extractUncheckedChecklistItems(specContent: string): string[] {
  const uncheckedMatches = specContent.matchAll(/^\s*- \[ \] (.+)$/gm);
  return [...uncheckedMatches]
    .map((match) => match[1])
    .filter((item): item is string => item !== undefined)
    .map((item) => item.trim());
}

export function extractTaskEvalCriteriaLabels(taskEvalContent: string): string[] {
  const labels = [...taskEvalContent.matchAll(/^\s{6}label:\s+(.+)$/gm)]
    .map((match) => match[1])
    .filter((item): item is string => item !== undefined)
    .map((item) => item.trim());

  return [...new Set(labels)];
}

export function parseCompletedStepNumbers(value: string): number[] {
  const trimmedValue = value.trim();

  if (trimmedValue === '') {
    return [];
  }

  return trimmedValue.split(',').map((segment) => {
    const parsedValue = Number.parseInt(segment.trim(), 10);

    if (!Number.isInteger(parsedValue)) {
      throw new Error(`Invalid completed step value: ${segment.trim()}`);
    }

    return parsedValue;
  });
}

function validateDoneTaskMeta(meta: TaskMeta): MetaValidationSummary {
  if (meta.steps.total === null) {
    throw new Error('Task steps are not initialized yet (steps.total is null).');
  }

  const totalSteps = meta.steps.total;
  const completedSteps = meta.steps.completed;
  const uniqueSteps = new Set(completedSteps);

  if (uniqueSteps.size !== completedSteps.length) {
    throw new Error('Task has duplicate completed step numbers.');
  }

  const invalidStep = completedSteps.find((step) => step < 1 || step > totalSteps);

  if (invalidStep !== undefined) {
    throw new Error(`Task has an out-of-range completed step number: ${String(invalidStep)}`);
  }

  if (completedSteps.length !== totalSteps) {
    const missingSteps: number[] = [];

    for (let step = 1; step <= totalSteps; step += 1) {
      if (!uniqueSteps.has(step)) {
        missingSteps.push(step);
      }
    }

    throw new Error(`Task steps are incomplete. Missing steps: ${missingSteps.join(', ')}`);
  }

  return {
    completedSteps,
    totalSteps,
  };
}

export function validateDoneMetaContent(metaContent: string): MetaValidationSummary {
  return validateDoneTaskMeta(parseTaskMeta(metaContent));
}

function validateDoneTarget(task: DoneTarget): void {
  if (task.status === 'DONE') {
    throw new Error(`Task ${task.id} is already DONE.`);
  }

  try {
    assertTransition(task.status, 'mark-done', task.id);
  } catch {
    throw new Error(
      `Task ${task.id} is not in REVIEW_READY state (${task.status}). Run \`sduck review ready\` first.`,
    );
  }
}

async function checkReviewWarning(
  projectRoot: string,
  task: DoneTarget,
): Promise<string | undefined> {
  const reviewPath = join(projectRoot, task.path, 'review.md');

  if ((await getFsEntryKind(reviewPath)) !== 'file') {
    return `review.md is missing for task ${task.id}. Consider running \`sduck review ready\` to create it.`;
  }

  const content = await readFile(reviewPath, 'utf8');

  if (content.trim().length === 0) {
    return `review.md is empty for task ${task.id}.`;
  }

  return undefined;
}

async function loadTaskEvalCriteria(projectRoot: string): Promise<string[]> {
  const taskEvalPath = join(projectRoot, TASK_EVAL_ASSET_PATH);

  if ((await getFsEntryKind(taskEvalPath)) !== 'file') {
    throw new Error(`Missing task evaluation asset at ${TASK_EVAL_ASSET_PATH}.`);
  }

  const taskEvalContent = await readFile(taskEvalPath, 'utf8');
  const labels = extractTaskEvalCriteriaLabels(taskEvalContent);

  if (labels.length === 0) {
    throw new Error(`Task evaluation asset has no criteria labels: ${TASK_EVAL_ASSET_PATH}.`);
  }

  return labels;
}

async function completeTask(
  projectRoot: string,
  task: DoneTarget,
  completedAt: string,
  taskEvalCriteria: readonly string[],
): Promise<DoneSuccessRow> {
  validateDoneTarget(task);

  const metaPath = join(projectRoot, task.path, 'meta.yml');
  const specPath = join(projectRoot, task.path, 'spec.md');

  if ((await getFsEntryKind(metaPath)) !== 'file') {
    throw new Error(`Missing meta.yml for task ${task.id}.`);
  }

  if ((await getFsEntryKind(specPath)) !== 'file') {
    throw new Error(`Missing spec.md for task ${task.id}.`);
  }

  const reviewWarning = await checkReviewWarning(projectRoot, task);

  const metaContent = await readFile(metaPath, 'utf8');
  validateDoneMetaContent(metaContent);

  const specContent = await readFile(specPath, 'utf8');
  const uncheckedItems = extractUncheckedChecklistItems(specContent);

  if (uncheckedItems.length > 0) {
    throw new Error(`Spec checklist is incomplete: ${uncheckedItems.join('; ')}`);
  }

  await patchTaskMeta(metaPath, (meta) => markDoneInMeta(meta, completedAt));

  await refreshAgentContextBestEffort(projectRoot, task.id);

  // Clear current work if this task was the current one
  const currentWorkId = await readCurrentWorkId(projectRoot);

  if (currentWorkId === task.id) {
    await writeCurrentWorkId(projectRoot, null);
  }

  return {
    completedAt,
    note: `task eval checked (${String(taskEvalCriteria.length)} criteria)`,
    reviewWarning,
    taskEvalCriteria: [...taskEvalCriteria],
    taskId: task.id,
  };
}

export async function runDoneWorkflow(
  projectRoot: string,
  tasks: readonly DoneTarget[],
  completedAt: string,
): Promise<DoneResult> {
  const taskEvalCriteria = await loadTaskEvalCriteria(projectRoot);
  const succeeded: DoneSuccessRow[] = [];
  const failed: DoneFailureRow[] = [];

  for (const task of tasks) {
    try {
      succeeded.push(await completeTask(projectRoot, task, completedAt, taskEvalCriteria));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown done failure.';
      const pendingChecklistItems = message.startsWith('Spec checklist is incomplete: ')
        ? message
            .replace('Spec checklist is incomplete: ', '')
            .split('; ')
            .filter((item) => item !== '')
        : [];

      failed.push({
        note: message,
        pendingChecklistItems,
        taskId: task.id,
      });
    }
  }

  return {
    completedAt,
    failed,
    nextStatus: 'DONE',
    succeeded,
  };
}

export async function loadDoneTargets(
  projectRoot: string,
  input: DoneCommandInput,
): Promise<DoneTarget[]> {
  return [
    await resolveTaskTarget(projectRoot, {
      commandName: 'done',
      fallback: 'current',
      target: input.target,
    }),
  ];
}

export function createTaskCompletedAt(date = new Date()): string {
  return formatUtcTimestamp(date);
}
