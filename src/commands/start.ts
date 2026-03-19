import { startTask } from '../core/start.js';

export interface StartCommandResult {
  exitCode: number;
  stderr: string;
  stdout: string;
}

export async function runStartCommand(
  type: string,
  slug: string,
  projectRoot: string,
): Promise<StartCommandResult> {
  try {
    const result = await startTask(type, slug, projectRoot);

    return {
      exitCode: 0,
      stderr: '',
      stdout: [
        '작업 디렉토리 생성됨',
        `경로: ${result.workspacePath}/`,
        `상태: ${result.status}`,
      ].join('\n'),
    };
  } catch (error) {
    return {
      exitCode: 1,
      stderr: error instanceof Error ? error.message : 'Unknown start failure.',
      stdout: '',
    };
  }
}
