import { checkbox } from '@inquirer/prompts';

import {
  approvePlans,
  createPlanApprovedAt,
  loadPlanApprovalCandidates,
  type PlanApproveCommandInput,
  type PlanApproveResult,
  type PlanApproveTarget,
} from '../core/plan-approve.js';

export interface PlanApproveCommandResult {
  exitCode: number;
  stderr: string;
  stdout: string;
}

function padCell(value: string, width: number): string {
  return value.padEnd(width, ' ');
}

function buildResultTable(result: PlanApproveResult): string {
  const rows = [
    ...result.succeeded.map((row) => ({
      note: row.note,
      result: 'success',
      steps: String(row.steps),
      task: row.taskId,
    })),
    ...result.failed.map((row) => ({
      note: row.note,
      result: 'failed',
      steps: '-',
      task: row.taskId,
    })),
  ];

  const resultWidth = Math.max('Result'.length, ...rows.map((row) => row.result.length));
  const taskWidth = Math.max('Task'.length, ...rows.map((row) => row.task.length));
  const stepsWidth = Math.max('Steps'.length, ...rows.map((row) => row.steps.length));
  const noteWidth = Math.max('Note'.length, ...rows.map((row) => row.note.length));

  const border = `+-${'-'.repeat(resultWidth)}-+-${'-'.repeat(taskWidth)}-+-${'-'.repeat(stepsWidth)}-+-${'-'.repeat(noteWidth)}-+`;
  const header = `| ${padCell('Result', resultWidth)} | ${padCell('Task', taskWidth)} | ${padCell('Steps', stepsWidth)} | ${padCell('Note', noteWidth)} |`;
  const body = rows.map(
    (row) =>
      `| ${padCell(row.result, resultWidth)} | ${padCell(row.task, taskWidth)} | ${padCell(row.steps, stepsWidth)} | ${padCell(row.note, noteWidth)} |`,
  );

  return [border, header, border, ...body, border].join('\n');
}

function formatTaskLabel(task: PlanApproveTarget): string {
  return `${task.id} (${task.status})`;
}

function formatSuccess(result: PlanApproveResult): string {
  const lines = [buildResultTable(result)];

  if (result.succeeded.length > 0) {
    lines.push('', '상태: IN_PROGRESS → 작업을 시작합니다.');
  }

  return lines.join('\n');
}

async function selectTargets(tasks: readonly PlanApproveTarget[]): Promise<PlanApproveTarget[]> {
  if (tasks.length <= 1 || !process.stdin.isTTY || !process.stdout.isTTY) {
    return [...tasks];
  }

  const selectedIds = await checkbox<string>({
    message: 'Select tasks to approve plan for',
    choices: tasks.map((task) => ({ checked: true, name: formatTaskLabel(task), value: task.id })),
  });

  return tasks.filter((task) => selectedIds.includes(task.id));
}

export async function runPlanApproveCommand(
  input: PlanApproveCommandInput,
  projectRoot: string,
): Promise<PlanApproveCommandResult> {
  try {
    const candidates = await loadPlanApprovalCandidates(projectRoot, input);

    if (candidates.length === 0) {
      throw new Error('No matching tasks awaiting plan approval.');
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
      throw new Error('No tasks selected for plan approval.');
    }

    const result = await approvePlans(projectRoot, selectedTasks, createPlanApprovedAt());

    if (result.succeeded.length === 0) {
      return {
        exitCode: 1,
        stderr: buildResultTable(result),
        stdout: '',
      };
    }

    return {
      exitCode: result.failed.length > 0 ? 1 : 0,
      stderr: result.failed.length > 0 ? '' : '',
      stdout: formatSuccess(result),
    };
  } catch (error) {
    return {
      exitCode: 1,
      stderr: error instanceof Error ? error.message : 'Unknown plan approval failure.',
      stdout: '',
    };
  }
}
