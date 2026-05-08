import { runCommand, type CommandResult } from './runner.js';
import { runCleanWorkflow } from '../core/clean.js';

export type CleanCommandResult = CommandResult;

export async function runCleanCommand(
  options: { force: boolean | undefined; target: string | undefined },
  projectRoot: string,
): Promise<CleanCommandResult> {
  return await runCommand(async () => {
    const result = await runCleanWorkflow(projectRoot, options.target, options.force ?? false);

    if (result.cleaned.length === 0) {
      return '정리할 작업이 없습니다.';
    }

    const lines = result.cleaned.map(
      (row) =>
        `${row.workId}: ${row.note}` +
        (row.worktreeRemoved ? ' (worktree 제거됨)' : '') +
        (row.branchDeleted ? ' (브랜치 삭제됨)' : ''),
    );

    return lines.join('\n');
  }, 'Unknown clean failure.');
}
