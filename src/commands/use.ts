import { runUseWorkflow } from '../core/use.js';

export interface UseCommandResult {
  exitCode: number;
  stderr: string;
  stdout: string;
}

export async function runUseCommand(
  target: string,
  projectRoot: string,
): Promise<UseCommandResult> {
  try {
    const { workId } = await runUseWorkflow(projectRoot, target);

    return {
      exitCode: 0,
      stderr: '',
      stdout: `현재 작업 전환: ${workId}`,
    };
  } catch (error) {
    return {
      exitCode: 1,
      stderr: error instanceof Error ? error.message : 'Unknown use failure.',
      stdout: '',
    };
  }
}
