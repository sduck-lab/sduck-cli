import { runAbandonWorkflow } from '../core/abandon.js';

export interface AbandonCommandResult {
  exitCode: number;
  stderr: string;
  stdout: string;
}

export async function runAbandonCommand(
  target: string,
  projectRoot: string,
): Promise<AbandonCommandResult> {
  try {
    const { workId } = await runAbandonWorkflow(projectRoot, target);

    return {
      exitCode: 0,
      stderr: '',
      stdout: `작업 중단됨: ${workId}`,
    };
  } catch (error) {
    return {
      exitCode: 1,
      stderr: error instanceof Error ? error.message : 'Unknown abandon failure.',
      stdout: '',
    };
  }
}
