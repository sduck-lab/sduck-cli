import { updateProject, type UpdateExecutionResult } from '../core/update.js';

export interface CommandResult {
  exitCode: number;
  stderr: string;
  stdout: string;
}

export interface UpdateCliOptions {
  dryRun: boolean;
}

function formatResult(result: UpdateExecutionResult): string {
  const lines: string[] = [];

  if (!result.didChange) {
    lines.push('sduck update: already up to date.');
    return lines.join('\n');
  }

  const versionLine =
    result.fromVersion !== null
      ? `Updated sduck assets from v${result.fromVersion} to v${result.toVersion}.`
      : `Updated sduck assets to v${result.toVersion}.`;

  lines.push(versionLine);

  if (result.summary.rows.length > 0) {
    const statusWidth = Math.max(
      'Status'.length,
      ...result.summary.rows.map((r) => r.status.length),
    );
    const pathWidth = Math.max('Path'.length, ...result.summary.rows.map((r) => r.path.length));

    const border = `+-${'-'.repeat(statusWidth)}-+-${'-'.repeat(pathWidth)}-+`;
    const header = `| ${'Status'.padEnd(statusWidth)} | ${'Path'.padEnd(pathWidth)} |`;
    const body = result.summary.rows.map(
      (row) => `| ${row.status.padEnd(statusWidth)} | ${row.path.padEnd(pathWidth)} |`,
    );

    lines.push('', border, header, border, ...body, border);
  }

  if (result.summary.warnings.length > 0) {
    lines.push('', 'Warnings:');
    lines.push(...result.summary.warnings.map((warning) => `- ${warning}`));
  }

  return lines.join('\n');
}

export async function runUpdateCommand(
  options: UpdateCliOptions,
  projectRoot: string,
): Promise<CommandResult> {
  try {
    const result = await updateProject({ dryRun: options.dryRun }, projectRoot);

    return {
      exitCode: 0,
      stderr: '',
      stdout: formatResult(result),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown update failure.';

    return {
      exitCode: 1,
      stderr: message,
      stdout: '',
    };
  }
}
