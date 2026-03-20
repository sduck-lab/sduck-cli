import {
  loadArchiveTargets,
  runArchiveWorkflow,
  type ArchiveCommandInput,
  type ArchiveResult,
  type ArchiveSkipRow,
  type ArchiveSuccessRow,
} from '../core/archive.js';

export interface ArchiveCommandResult {
  exitCode: number;
  stderr: string;
  stdout: string;
}

function padCell(value: string, width: number): string {
  return value.padEnd(width, ' ');
}

function buildResultTable(result: ArchiveResult): string {
  const rows: { month: string; result: string; task: string }[] = [
    ...result.archived.map((row: ArchiveSuccessRow) => ({
      month: row.month,
      result: 'archived',
      task: row.taskId,
    })),
    ...result.skipped.map((row: ArchiveSkipRow) => ({
      month: '',
      result: 'skipped',
      task: row.taskId,
    })),
  ];

  const resultWidth = Math.max('Result'.length, ...rows.map((row) => row.result.length));
  const taskWidth = Math.max('Task'.length, ...rows.map((row) => row.task.length));
  const monthWidth = Math.max('Month'.length, ...rows.map((row) => row.month.length));
  const border = `+-${'-'.repeat(resultWidth)}-+-${'-'.repeat(taskWidth)}-+-${'-'.repeat(monthWidth)}-+`;
  const header = `| ${padCell('Result', resultWidth)} | ${padCell('Task', taskWidth)} | ${padCell('Month', monthWidth)} |`;
  const body = rows.map(
    (row) =>
      `| ${padCell(row.result, resultWidth)} | ${padCell(row.task, taskWidth)} | ${padCell(row.month, monthWidth)} |`,
  );

  return [border, header, border, ...body, border].join('\n');
}

export async function runArchiveCommand(
  input: ArchiveCommandInput,
  projectRoot: string,
): Promise<ArchiveCommandResult> {
  try {
    const targets = await loadArchiveTargets(projectRoot, input);

    if (targets.length === 0) {
      return {
        exitCode: 0,
        stderr: '',
        stdout: '아카이브 대상이 없습니다.',
      };
    }

    const result = await runArchiveWorkflow(projectRoot, targets);

    return {
      exitCode: 0,
      stderr: '',
      stdout: buildResultTable(result),
    };
  } catch (error) {
    return {
      exitCode: 1,
      stderr: error instanceof Error ? error.message : 'Unknown archive failure.',
      stdout: '',
    };
  }
}
