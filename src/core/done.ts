import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { getFsEntryKind } from './fs.js';
import { getProjectRelativeSduckAssetPath } from './project-paths.js';
import { listWorkspaceTasks, type WorkspaceTaskSummary } from './workspace.js';
import { formatUtcTimestamp } from '../utils/utc-date.js';

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
  return tasks.filter((task) => task.status === 'IN_PROGRESS');
}

export function resolveDoneTargetMatches(
  tasks: readonly WorkspaceTaskSummary[],
  target: string | undefined,
): DoneTarget[] {
  if (target === undefined || target.trim() === '') {
    return filterDoneCandidates(tasks);
  }

  const trimmedTarget = target.trim();

  return tasks.filter((task) => task.id === trimmedTarget || task.slug === trimmedTarget);
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

export function validateDoneMetaContent(metaContent: string): MetaValidationSummary {
  const totalMatch = /^ {2}total:\s+(.+)$/m.exec(metaContent);
  const completedMatch = /^ {2}completed:\s+\[(.*)\]$/m.exec(metaContent);

  if (totalMatch?.[1] === undefined || completedMatch?.[1] === undefined) {
    throw new Error('Task meta is missing a valid steps block.');
  }

  if (totalMatch[1].trim() === 'null') {
    throw new Error('Task steps are not initialized yet (steps.total is null).');
  }

  const totalSteps = Number.parseInt(totalMatch[1].trim(), 10);

  if (!Number.isInteger(totalSteps) || totalSteps <= 0) {
    throw new Error(`Task has an invalid steps.total value: ${totalMatch[1].trim()}`);
  }

  const completedSteps = parseCompletedStepNumbers(completedMatch[1]);
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

function updateDoneBlock(metaContent: string, completedAt: string): string {
  const withStatus = metaContent.replace(/^status:\s+.+$/m, 'status: DONE');

  return withStatus.replace(/^completed_at:\s+.+$/m, `completed_at: ${completedAt}`);
}

function validateDoneTarget(task: DoneTarget): void {
  if (task.status === 'DONE') {
    throw new Error(`Task ${task.id} is already DONE.`);
  }

  if (task.status !== 'IN_PROGRESS') {
    throw new Error(`Task ${task.id} is not in progress (${task.status}).`);
  }
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

  const metaContent = await readFile(metaPath, 'utf8');
  validateDoneMetaContent(metaContent);

  const specContent = await readFile(specPath, 'utf8');
  const uncheckedItems = extractUncheckedChecklistItems(specContent);

  if (uncheckedItems.length > 0) {
    throw new Error(`Spec checklist is incomplete: ${uncheckedItems.join('; ')}`);
  }

  await writeFile(metaPath, updateDoneBlock(metaContent, completedAt), 'utf8');

  return {
    completedAt,
    note: `task eval checked (${String(taskEvalCriteria.length)} criteria)`,
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
  const tasks = await listWorkspaceTasks(projectRoot);
  const matches = resolveDoneTargetMatches(tasks, input.target);

  if (input.target === undefined || input.target.trim() === '') {
    if (matches.length === 0) {
      throw new Error('No IN_PROGRESS task found. Run `sduck done <slug>` after choosing a task.');
    }

    if (matches.length > 1) {
      const labels = matches.map((task) => task.slug ?? task.id).join(', ');
      throw new Error(
        `Multiple IN_PROGRESS tasks found: ${labels}. Rerun with \`sduck done <slug>\` or \`sduck done <id>\`.`,
      );
    }

    return matches;
  }

  if (matches.length === 0) {
    throw new Error(`No task matches target '${input.target.trim()}'.`);
  }

  if (matches.length > 1) {
    const ids = matches.map((task) => task.id).join(', ');
    throw new Error(`Multiple tasks match '${input.target.trim()}': ${ids}. Use an exact task id.`);
  }

  return matches;
}

export function createTaskCompletedAt(date = new Date()): string {
  return formatUtcTimestamp(date);
}
