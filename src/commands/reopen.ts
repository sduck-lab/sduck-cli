import { runCommand, type CommandResult } from './runner.js';
import {
  loadReopenTarget,
  runReopenWorkflow,
  type ReopenCommandInput,
  type ReopenResult,
} from '../core/reopen.js';

export type ReopenCommandResult = CommandResult;

function formatSuccess(result: ReopenResult): string {
  const lines = [
    `Reopened ${result.taskId} → cycle ${String(result.newCycle)} (${result.newStatus})`,
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
  return await runCommand(async () => {
    const task = await loadReopenTarget(projectRoot, input);
    const result = await runReopenWorkflow(projectRoot, task);
    return formatSuccess(result);
  }, 'Unknown reopen failure.');
}
