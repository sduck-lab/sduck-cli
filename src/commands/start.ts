import { startTask, type StartTaskOptions } from '../core/start.js';

export interface StartCommandResult {
  exitCode: number;
  stderr: string;
  stdout: string;
}

export async function runStartCommand(
  type: string,
  slug: string,
  projectRoot: string,
  options?: StartTaskOptions,
): Promise<StartCommandResult> {
  try {
    const result = await startTask(type, slug, projectRoot, new Date(), options);
    const lines = [
      '작업 디렉토리 생성됨',
      `경로: ${result.workspacePath}/`,
      `상태: ${result.status}`,
    ];

    if (result.gitignoreWarning !== undefined) {
      lines.push('', result.gitignoreWarning);
    }

    return {
      exitCode: 0,
      stderr: '',
      stdout: lines.join('\n'),
    };
  } catch (error) {
    return {
      exitCode: 1,
      stderr: error instanceof Error ? error.message : 'Unknown start failure.',
      stdout: '',
    };
  }
}
