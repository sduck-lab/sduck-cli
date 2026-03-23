import {
  loadReopenTarget,
  runReopenWorkflow,
  type ReopenCommandInput,
  type ReopenResult,
} from '../core/reopen.js';

export interface ReopenCommandResult {
  exitCode: number;
  stderr: string;
  stdout: string;
}

function formatSuccess(result: ReopenResult): string {
  const lines = [
    `Reopened ${result.taskId} → cycle ${String(result.newCycle)} (PENDING_SPEC_APPROVAL)`,
  ];

  if (result.snapshots.length > 0) {
    lines.push('');
    lines.push('Snapshots:');

    for (const snapshot of result.snapshots) {
      lines.push(`  - ${snapshot}`);
    }
  }

  return lines.join('\n');
}

export async function runReopenCommand(
  input: ReopenCommandInput,
  projectRoot: string,
): Promise<ReopenCommandResult> {
  try {
    const task = await loadReopenTarget(projectRoot, input);
    const result = await runReopenWorkflow(projectRoot, task);

    return {
      exitCode: 0,
      stderr: '',
      stdout: formatSuccess(result),
    };
  } catch (error) {
    return {
      exitCode: 1,
      stderr: error instanceof Error ? error.message : 'Unknown reopen failure.',
      stdout: '',
    };
  }
}
