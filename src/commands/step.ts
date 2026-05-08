import { runCommand, type CommandResult } from './runner.js';
import { markStepCompleted } from '../core/step.js';

export type StepCommandResult = CommandResult;

export async function runStepCommand(
  stepNumber: number,
  projectRoot: string,
  target?: string,
): Promise<StepCommandResult> {
  return await runCommand(async () => {
    const result = await markStepCompleted(projectRoot, stepNumber, target);
    const status = `(${String(result.completed.length)}/${String(result.total)})`;

    if (result.alreadyCompleted) {
      return `Step ${String(result.stepNumber)} already completed. ${status}`;
    }

    return `Step ${String(result.stepNumber)} completed. ${status}`;
  }, 'Unknown step failure.');
}
