import { renderTable, runCommand, type CommandResult } from './runner.js';
import {
  loadArchiveTargets,
  runArchiveWorkflow,
  type ArchiveCommandInput,
  type ArchiveResult,
  type ArchiveSkipRow,
  type ArchiveSuccessRow,
} from '../core/archive.js';

export type ArchiveCommandResult = CommandResult;

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

  return renderTable(
    ['Result', 'Task', 'Month'],
    rows.map((row) => [row.result, row.task, row.month]),
  );
}

export async function runArchiveCommand(
  input: ArchiveCommandInput,
  projectRoot: string,
): Promise<ArchiveCommandResult> {
  return await runCommand(async () => {
    const targets = await loadArchiveTargets(projectRoot, input);

    if (targets.length === 0) {
      return '아카이브 대상이 없습니다.';
    }

    const result = await runArchiveWorkflow(projectRoot, targets);
    return buildResultTable(result);
  }, 'Unknown archive failure.');
}
