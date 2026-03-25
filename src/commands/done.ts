import {
  createTaskCompletedAt,
  loadDoneTargets,
  runDoneWorkflow,
  type DoneCommandInput,
  type DoneFailureRow,
  type DoneResult,
} from '../core/done.js';

export interface DoneCommandResult {
  exitCode: number;
  stderr: string;
  stdout: string;
}

function padCell(value: string, width: number): string {
  return value.padEnd(width, ' ');
}

function buildResultTable(result: DoneResult): string {
  const rows = [
    ...result.succeeded.map((row) => ({
      note: row.note,
      result: 'success',
      task: row.taskId,
    })),
    ...result.failed.map((row) => ({
      note: row.note,
      result: 'failed',
      task: row.taskId,
    })),
  ];

  const resultWidth = Math.max('Result'.length, ...rows.map((row) => row.result.length));
  const taskWidth = Math.max('Task'.length, ...rows.map((row) => row.task.length));
  const noteWidth = Math.max('Note'.length, ...rows.map((row) => row.note.length));
  const border = `+-${'-'.repeat(resultWidth)}-+-${'-'.repeat(taskWidth)}-+-${'-'.repeat(noteWidth)}-+`;
  const header = `| ${padCell('Result', resultWidth)} | ${padCell('Task', taskWidth)} | ${padCell('Note', noteWidth)} |`;
  const body = rows.map(
    (row) =>
      `| ${padCell(row.result, resultWidth)} | ${padCell(row.task, taskWidth)} | ${padCell(row.note, noteWidth)} |`,
  );

  return [border, header, border, ...body, border].join('\n');
}

function formatFailureDetails(failed: readonly DoneFailureRow[]): string[] {
  const lines: string[] = [];

  for (const row of failed) {
    if (row.pendingChecklistItems.length === 0) {
      continue;
    }

    lines.push('', `미완료 체크리스트 (${row.taskId})`);

    for (const item of row.pendingChecklistItems) {
      lines.push(`- [ ] ${item}`);
    }
  }

  return lines;
}

function formatSuccess(result: DoneResult): string {
  const lines = [buildResultTable(result)];

  if (result.succeeded.length > 0) {
    const criteriaLabels = result.succeeded[0]?.taskEvalCriteria ?? [];

    lines.push('', '상태: DONE');

    if (criteriaLabels.length > 0) {
      lines.push(`task eval 기준: ${criteriaLabels.join(', ')}`);
    }
  }

  for (const row of result.succeeded) {
    if (row.reviewWarning !== undefined) {
      lines.push(`경고: ${row.reviewWarning}`);
    }
  }

  lines.push(...formatFailureDetails(result.failed));

  return lines.join('\n');
}

export async function runDoneCommand(
  input: DoneCommandInput,
  projectRoot: string,
): Promise<DoneCommandResult> {
  try {
    const tasks = await loadDoneTargets(projectRoot, input);
    const result = await runDoneWorkflow(projectRoot, tasks, createTaskCompletedAt());

    if (result.succeeded.length === 0) {
      return {
        exitCode: 1,
        stderr: formatSuccess(result),
        stdout: '',
      };
    }

    return {
      exitCode: result.failed.length > 0 ? 1 : 0,
      stderr: '',
      stdout: formatSuccess(result),
    };
  } catch (error) {
    return {
      exitCode: 1,
      stderr: error instanceof Error ? error.message : 'Unknown done failure.',
      stdout: '',
    };
  }
}
