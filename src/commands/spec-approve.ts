import { checkbox } from '@inquirer/prompts';

import {
  approveSpecs,
  createSpecApprovedAt,
  loadSpecApprovalCandidates,
  type SpecApproveCommandInput,
  type SpecApproveResult,
  type SpecApproveTarget,
} from '../core/spec-approve.js';

export interface SpecApproveCommandResult {
  exitCode: number;
  stderr: string;
  stdout: string;
}

function formatTaskLabel(task: SpecApproveTarget): string {
  return `${task.id} (${task.status})`;
}

function formatSuccess(result: SpecApproveResult, tasks: readonly SpecApproveTarget[]): string {
  const lines = ['스펙 승인됨'];

  for (const task of tasks) {
    lines.push(`- ${task.path} -> ${result.nextStatus}`);
  }

  lines.push('상태: SPEC_APPROVED → 플랜 작성을 시작합니다.');

  return lines.join('\n');
}

async function selectTargets(tasks: readonly SpecApproveTarget[]): Promise<SpecApproveTarget[]> {
  if (tasks.length <= 1 || !process.stdin.isTTY || !process.stdout.isTTY) {
    return [...tasks];
  }

  const selectedIds = await checkbox<string>({
    message: 'Select tasks to approve',
    choices: tasks.map((task) => ({
      checked: true,
      name: formatTaskLabel(task),
      value: task.id,
    })),
  });

  return tasks.filter((task) => selectedIds.includes(task.id));
}

export async function runSpecApproveCommand(
  input: SpecApproveCommandInput,
  projectRoot: string,
): Promise<SpecApproveCommandResult> {
  try {
    const candidates = await loadSpecApprovalCandidates(projectRoot, input);

    if (candidates.length === 0) {
      throw new Error('No matching tasks awaiting spec approval.');
    }

    if (
      input.target !== undefined &&
      candidates.length > 1 &&
      (!process.stdin.isTTY || !process.stdout.isTTY)
    ) {
      throw new Error(
        'Multiple matching tasks found; rerun interactively to choose approval targets.',
      );
    }

    const selectedTasks = await selectTargets(candidates);

    if (selectedTasks.length === 0) {
      throw new Error('No tasks selected for spec approval.');
    }

    const result = await approveSpecs(projectRoot, selectedTasks, createSpecApprovedAt());

    return {
      exitCode: 0,
      stderr: '',
      stdout: formatSuccess(result, selectedTasks),
    };
  } catch (error) {
    return {
      exitCode: 1,
      stderr: error instanceof Error ? error.message : 'Unknown spec approval failure.',
      stdout: '',
    };
  }
}
