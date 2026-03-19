import { checkbox } from '@inquirer/prompts';

import { SUPPORTED_AGENTS, parseAgentsOption, type SupportedAgentId } from '../core/agent-rules.js';
import { type InitCommandOptions, type InitSummaryRow, initProject } from '../core/init.js';

const AGENT_PROMPT_MESSAGE = 'Select AI agents to generate repository rule files for';
const AGENT_PROMPT_INSTRUCTIONS =
  'Use space to toggle agents, arrow keys to move, and enter to submit.';
const AGENT_PROMPT_REQUIRED_MESSAGE =
  'Select at least one agent. Use space to toggle and enter to submit.';

export interface CommandResult {
  exitCode: number;
  stderr: string;
  stdout: string;
}

export interface InitCliOptions {
  agents?: string;
  force: boolean;
}

interface FormattableInitResult {
  didChange: boolean;
  agents: readonly SupportedAgentId[];
  summary: {
    rows: InitSummaryRow[];
    warnings: string[];
  };
}

function padCell(value: string, width: number): string {
  return value.padEnd(width, ' ');
}

function buildSummaryTable(rows: InitSummaryRow[]): string {
  const statusWidth = Math.max('Status'.length, ...rows.map((row) => row.status.length));
  const pathWidth = Math.max('Path'.length, ...rows.map((row) => row.path.length));

  const border = `+-${'-'.repeat(statusWidth)}-+-${'-'.repeat(pathWidth)}-+`;
  const header = `| ${padCell('Status', statusWidth)} | ${padCell('Path', pathWidth)} |`;
  const body = rows.map(
    (row) => `| ${padCell(row.status, statusWidth)} | ${padCell(row.path, pathWidth)} |`,
  );

  return [border, header, border, ...body, border].join('\n');
}

function formatResult(result: FormattableInitResult): string {
  const lines = [
    result.didChange ? 'sduck init completed.' : 'sduck init completed with no file changes.',
  ];

  if (result.agents.length > 0) {
    lines.push(`Selected agents: ${result.agents.join(', ')}`);
  }

  lines.push('', buildSummaryTable(result.summary.rows));

  if (result.summary.warnings.length > 0) {
    lines.push('', 'Warnings:');
    lines.push(...result.summary.warnings.map((warning) => `- ${warning}`));
  }

  return lines.join('\n');
}

function normalizeSelectedAgents(agentIds: readonly SupportedAgentId[]): SupportedAgentId[] {
  const selectedAgentSet = new Set(agentIds);

  return SUPPORTED_AGENTS.map((agent) => agent.id).filter((agentId) =>
    selectedAgentSet.has(agentId),
  );
}

export function createAgentCheckboxConfig() {
  return {
    message: AGENT_PROMPT_MESSAGE,
    instructions: AGENT_PROMPT_INSTRUCTIONS,
    required: true,
    validate: (choices: readonly { value: SupportedAgentId }[]) =>
      choices.length > 0 || AGENT_PROMPT_REQUIRED_MESSAGE,
    choices: SUPPORTED_AGENTS.map((agent) => ({
      name: agent.label,
      value: agent.id,
    })),
  };
}

async function resolveSelectedAgents(options: InitCliOptions): Promise<SupportedAgentId[]> {
  const parsedAgents = parseAgentsOption(options.agents);

  if (parsedAgents.length > 0 || !process.stdin.isTTY || !process.stdout.isTTY) {
    return normalizeSelectedAgents(parsedAgents);
  }

  return normalizeSelectedAgents(await checkbox<SupportedAgentId>(createAgentCheckboxConfig()));
}

export async function runInitCommand(
  options: InitCliOptions,
  projectRoot: string,
): Promise<CommandResult> {
  try {
    const resolvedOptions: InitCommandOptions = {
      force: options.force,
      agents: await resolveSelectedAgents(options),
    };
    const result = await initProject(resolvedOptions, projectRoot);

    return {
      exitCode: 0,
      stderr: '',
      stdout: formatResult(result),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown init failure.';

    return {
      exitCode: 1,
      stderr: message,
      stdout: '',
    };
  }
}
