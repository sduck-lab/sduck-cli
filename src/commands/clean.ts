import { runCleanWorkflow } from '../core/clean.js';

export interface CleanCommandResult {
  exitCode: number;
  stderr: string;
  stdout: string;
}

export async function runCleanCommand(
  options: { force: boolean | undefined; target: string | undefined },
  projectRoot: string,
): Promise<CleanCommandResult> {
  try {
    const result = await runCleanWorkflow(projectRoot, options.target, options.force ?? false);

    if (result.cleaned.length === 0) {
      return {
        exitCode: 0,
        stderr: '',
        stdout: '정리할 작업이 없습니다.',
      };
    }

    const lines = result.cleaned.map(
      (row) =>
        `${row.workId}: ${row.note}` +
        (row.worktreeRemoved ? ' (worktree 제거됨)' : '') +
        (row.branchDeleted ? ' (브랜치 삭제됨)' : ''),
    );

    return {
      exitCode: 0,
      stderr: '',
      stdout: lines.join('\n'),
    };
  } catch (error) {
    return {
      exitCode: 1,
      stderr: error instanceof Error ? error.message : 'Unknown clean failure.',
      stdout: '',
    };
  }
}
