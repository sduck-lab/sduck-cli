import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

import { getFsEntryKind } from './fs.js';
import { assertTransition, refreshAgentContextBestEffort } from './task-lifecycle.js';
import { approvePlanInMeta, patchTaskMeta } from './task-meta.js';
import { resolveTaskTargets } from './task-target.js';
import { formatUtcTimestamp } from '../utils/utc-date.js';

import type { WorkspaceTaskSummary } from './workspace.js';

export interface PlanApproveCommandInput {
  target?: string;
}

export interface PlanApproveTarget {
  createdAt?: string;
  id: string;
  path: string;
  slug?: string;
  status: string;
}

export interface PlanApproveSuccessRow {
  note: string;
  steps: number;
  taskId: string;
}

export interface PlanApproveFailureRow {
  note: string;
  taskId: string;
}

export interface PlanApproveResult {
  approvedAt: string;
  failed: PlanApproveFailureRow[];
  nextStatus: 'IN_PROGRESS';
  succeeded: PlanApproveSuccessRow[];
}

export function filterPlanApprovalCandidates(
  tasks: readonly WorkspaceTaskSummary[],
): PlanApproveTarget[] {
  return tasks.filter((task) => task.status === 'SPEC_APPROVED');
}

export function countPlanSteps(planContent: string): number {
  const regex = /^#{2,3}\s+Step\s+(\d+)\.\s+.+/gm;
  const stepNumbers = new Set<number>();
  let match: RegExpExecArray | null;

  while ((match = regex.exec(planContent)) !== null) {
    const digit = match[1];

    if (digit !== undefined) {
      stepNumbers.add(Number.parseInt(digit, 10));
    }
  }

  return stepNumbers.size;
}

export function validatePlanHasSteps(planContent: string): void {
  if (countPlanSteps(planContent) === 0) {
    throw new Error(
      'Plan does not contain any valid Step headers. Expected format: `## Step 1. 제목`',
    );
  }

  const regex = /^#{2,3}\s+Step\s+(\d+)\.\s+.+/gm;
  const stepNumbers: number[] = [];
  let match: RegExpExecArray | null;

  while ((match = regex.exec(planContent)) !== null) {
    const digit = match[1];

    if (digit !== undefined) {
      stepNumbers.push(Number.parseInt(digit, 10));
    }
  }

  const uniqueSorted = [...new Set(stepNumbers)].sort((a, b) => a - b);

  for (let i = 0; i < uniqueSorted.length; i += 1) {
    const expected = i + 1;

    if (uniqueSorted[i] !== expected) {
      throw new Error(
        `Step 번호가 연속적이지 않습니다: Step ${String(expected)}이(가) 누락되었습니다. 1부터 순서대로 작성하세요.`,
      );
    }
  }

  if (stepNumbers.length !== uniqueSorted.length) {
    throw new Error('Step 번호에 중복이 있습니다. 각 Step은 고유한 번호를 가져야 합니다.');
  }
}

export async function approvePlans(
  projectRoot: string,
  tasks: readonly PlanApproveTarget[],
  approvedAt: string,
): Promise<PlanApproveResult> {
  const succeeded: PlanApproveSuccessRow[] = [];
  const failed: PlanApproveFailureRow[] = [];

  for (const task of tasks) {
    try {
      assertTransition(task.status, 'approve-plan', task.id);
    } catch {
      failed.push({
        note: `task is not awaiting plan approval (${task.status})`,
        taskId: task.id,
      });
      continue;
    }

    const metaPath = join(projectRoot, task.path, 'meta.yml');
    const planPath = join(projectRoot, task.path, 'plan.md');

    if ((await getFsEntryKind(metaPath)) !== 'file') {
      failed.push({ note: 'missing meta.yml', taskId: task.id });
      continue;
    }

    if ((await getFsEntryKind(planPath)) !== 'file') {
      failed.push({ note: 'missing plan.md', taskId: task.id });
      continue;
    }

    const planContent = await readFile(planPath, 'utf8');
    const totalSteps = countPlanSteps(planContent);

    if (totalSteps === 0) {
      failed.push({
        note: 'invalid or missing Step headers (format: ## Step N. 제목)',
        taskId: task.id,
      });
      continue;
    }

    await patchTaskMeta(metaPath, (meta) => approvePlanInMeta(meta, approvedAt, totalSteps));

    await refreshAgentContextBestEffort(projectRoot, task.id);

    succeeded.push({ note: 'moved to IN_PROGRESS', steps: totalSteps, taskId: task.id });
  }

  return {
    approvedAt,
    failed,
    nextStatus: 'IN_PROGRESS',
    succeeded,
  };
}

export async function loadPlanApprovalCandidates(
  projectRoot: string,
  input: PlanApproveCommandInput,
): Promise<PlanApproveTarget[]> {
  return await resolveTaskTargets(projectRoot, {
    allowedStatuses: ['SPEC_APPROVED'],
    cardinality: 'many',
    commandName: 'plan approve',
    fallback: 'current-or-all',
    target: input.target,
  });
}

export function createPlanApprovedAt(date = new Date()): string {
  return formatUtcTimestamp(date);
}
