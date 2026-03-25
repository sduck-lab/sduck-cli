import { markStepCompleted } from '../core/step.js';

export interface StepCommandResult {
  exitCode: number;
  stderr: string;
  stdout: string;
}

export async function runStepCommand(
  stepNumber: number,
  projectRoot: string,
  target?: string,
): Promise<StepCommandResult> {
  try {
    const result = await markStepCompleted(projectRoot, stepNumber, target);
    const status = `(${String(result.completed.length)}/${String(result.total)})`;

    if (result.alreadyCompleted) {
      return {
        exitCode: 0,
        stderr: '',
        stdout: `Step ${String(result.stepNumber)} already completed. ${status}`,
      };
    }

    return {
      exitCode: 0,
      stderr: '',
      stdout: `Step ${String(result.stepNumber)} completed. ${status}`,
    };
  } catch (error) {
    return {
      exitCode: 1,
      stderr: error instanceof Error ? error.message : 'Unknown step failure.',
      stdout: '',
    };
  }
}
