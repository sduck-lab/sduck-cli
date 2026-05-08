import { runCommand, type CommandResult } from './runner.js';
import { runUseWorkflow } from '../core/use.js';

export type UseCommandResult = CommandResult;

export async function runUseCommand(
  target: string,
  projectRoot: string,
): Promise<UseCommandResult> {
  return await runCommand(async () => {
    const { workId } = await runUseWorkflow(projectRoot, target);
    return `현재 작업 전환: ${workId}`;
  }, 'Unknown use failure.');
}
