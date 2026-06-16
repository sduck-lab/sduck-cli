import { checkbox } from '@inquirer/prompts';
import { relative } from 'node:path';

import { SUPPORTED_AGENTS, parseAgentsOption, type SupportedAgentId } from '../core/agent-rules.js';
import { type InitCommandOptions, type InitSummaryRow, initProject } from '../core/init.js';
import { initDecisionWorkspace, type InitWorkspaceResult } from '../core/v2/workspace.js';

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
  agentRules?: boolean;
  force: boolean;
}

interface FormattableInitResult {
  didChange: boolean;
  decisionWorkspace: InitWorkspaceResult;
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

function formatDecisionWorkspaceSummary(
  projectRoot: string,
  decisionWorkspace: InitWorkspaceResult,
): string[] {
  const toRelativePath = (path: string) => {
    const relativePath = relative(projectRoot, path);
    return relativePath === '' ? '.' : relativePath;
  };
  const created = decisionWorkspace.created.map(toRelativePath);
  const existing = decisionWorkspace.existing.map(toRelativePath);
  const lines = ['Decision workspace initialized.'];

  if (created.length > 0) {
    lines.push(`Decision created: ${created.join(', ')}`);
  }

  if (existing.length > 0) {
    lines.push(`Decision existing: ${existing.join(', ')}`);
  }

  return lines;
}

function formatResult(projectRoot: string, result: FormattableInitResult): string {
  const lines = [
    result.didChange ? 'sduck init completed.' : 'sduck init completed with no file changes.',
  ];

  if (result.agents.length > 0) {
    lines.push(`Selected agents: ${result.agents.join(', ')}`);
  } else {
    lines.push('Agent rules: skipped.');
  }

  lines.push('', buildSummaryTable(result.summary.rows));

  lines.push('', ...formatDecisionWorkspaceSummary(projectRoot, result.decisionWorkspace));

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
  if (options.agentRules === false) {
    return [];
  }

  const parsedAgents = parseAgentsOption(options.agents);
  const defaultAgentIds = SUPPORTED_AGENTS.map((agent) => agent.id);

  if (parsedAgents.length > 0) {
    return normalizeSelectedAgents(parsedAgents);
  }

  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    return normalizeSelectedAgents(defaultAgentIds);
  }

  return normalizeSelectedAgents(await checkbox<SupportedAgentId>(createAgentCheckboxConfig()));
}

export async function runInitCommand(
  options: InitCliOptions,
  projectRoot: string,
): Promise<CommandResult> {
  try {
    const agents = await resolveSelectedAgents(options);
    const resolvedOptions: InitCommandOptions = {
      force: options.force,
      agents,
    };
    const result = await initProject(resolvedOptions, projectRoot);
    const decisionWorkspace = initDecisionWorkspace(projectRoot);

    return {
      exitCode: 0,
      stderr: '',
      stdout: formatResult(projectRoot, {
        ...result,
        decisionWorkspace,
        didChange: result.didChange || decisionWorkspace.created.length > 0,
      }),
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
