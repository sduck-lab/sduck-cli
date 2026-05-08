import { runCommand, type CommandResult } from './runner.js';
import { startTask, type StartTaskOptions } from '../core/start.js';

export type StartCommandResult = CommandResult;

export async function runStartCommand(
  type: string,
  slug: string,
  projectRoot: string,
  options?: StartTaskOptions,
): Promise<StartCommandResult> {
  return await runCommand(async () => {
    const result = await startTask(type, slug, projectRoot, new Date(), options);
    const lines = [
      '작업 디렉토리 생성됨',
      `경로: ${result.workspacePath}/`,
      `상태: ${result.status}`,
    ];

    if (result.gitignoreWarning !== undefined) {
      lines.push('', result.gitignoreWarning);
    }

    return lines.join('\n');
  }, 'Unknown start failure.');
}
