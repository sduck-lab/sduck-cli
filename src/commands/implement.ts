import { formatImplementOutput, resolveImplementContext } from '../core/implement.js';

export interface ImplementCommandResult {
  exitCode: number;
  stderr: string;
  stdout: string;
}

export async function runImplementCommand(
  projectRoot: string,
  target?: string,
): Promise<ImplementCommandResult> {
  try {
    const context = await resolveImplementContext(projectRoot, target);

    return {
      exitCode: 0,
      stderr: '',
      stdout: formatImplementOutput(context),
    };
  } catch (error) {
    return {
      exitCode: 1,
      stderr: error instanceof Error ? error.message : 'Unknown implement failure.',
      stdout: '',
    };
  }
}
