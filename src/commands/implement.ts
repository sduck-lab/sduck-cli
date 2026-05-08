import { runCommand, type CommandResult } from './runner.js';
import { formatImplementOutput, resolveImplementContext } from '../core/implement.js';

export type ImplementCommandResult = CommandResult;

export async function runImplementCommand(
  projectRoot: string,
  target?: string,
): Promise<ImplementCommandResult> {
  return await runCommand(async () => {
    const context = await resolveImplementContext(projectRoot, target);
    return formatImplementOutput(context);
  }, 'Unknown implement failure.');
}
