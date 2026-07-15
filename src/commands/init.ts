import { checkbox } from '@inquirer/prompts';
import { relative } from 'node:path';

import { SUPPORTED_AGENTS, type SupportedAgentId } from '../core/agent-rules.js';
import { ensureGitignoreEntries } from '../core/gitignore.js';
import {
  InitError,
  type InitCommandOptions,
  type InitErrorCode,
  type InitSummaryRow,
  type InitWarning,
  initProject,
  isInitError,
} from '../core/init.js';
import { initDecisionWorkspace, type InitWorkspaceResult } from '../core/v2/workspace.js';
import { enV2Messages } from '../ui/v2/messages.js';

import type { V2MessageCatalog } from '../ui/v2/messages.js';

const DECISION_LOCAL_PATHS = [
  '.decision/db.sqlite',
  '.decision/db.sqlite-*',
  '.decision/state.json',
  '.decision/workspace.lock/',
  '.decision/.staging-*/',
  '.decision/.rollback-*/',
  '.decision/.commit-*.json',
  '.decision/exports/graphify/',
] as const;

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
    structuredWarnings?: InitWarning[];
  };
}

interface InitCommandFailure {
  expected: boolean;
  code?: InitErrorCode;
  path?: string;
  detail?: string;
}

export interface InitCommandData extends FormattableInitResult {
  projectRoot: string;
}

function padCell(value: string, width: number): string {
  return value.padEnd(width, ' ');
}

function localizeStatus(status: InitSummaryRow['status'], messages: V2MessageCatalog): string {
  if (status === 'created') return messages.init.statusCreated;
  if (status === 'prepended') return messages.init.statusPrepended;
  if (status === 'kept') return messages.init.statusKept;
  return messages.init.statusOverwritten;
}

function buildSummaryTable(rows: InitSummaryRow[], messages: V2MessageCatalog): string {
  const localizedRows = rows.map((row) => ({
    ...row,
    status: localizeStatus(row.status, messages),
  }));
  const statusWidth = Math.max(
    messages.common.status.length,
    ...localizedRows.map((row) => row.status.length),
  );
  const pathWidth = Math.max(
    messages.common.path.length,
    ...localizedRows.map((row) => row.path.length),
  );

  const border = `+-${'-'.repeat(statusWidth)}-+-${'-'.repeat(pathWidth)}-+`;
  const header = `| ${padCell(messages.common.status, statusWidth)} | ${padCell(messages.common.path, pathWidth)} |`;
  const body = localizedRows.map(
    (row) => `| ${padCell(row.status, statusWidth)} | ${padCell(row.path, pathWidth)} |`,
  );

  return [border, header, border, ...body, border].join('\n');
}

function formatDecisionWorkspaceSummary(
  projectRoot: string,
  decisionWorkspace: InitWorkspaceResult,
  messages: V2MessageCatalog,
): string[] {
  const toRelativePath = (path: string) => {
    const relativePath = relative(projectRoot, path);
    return relativePath === '' ? '.' : relativePath;
  };
  const created = decisionWorkspace.created.map(toRelativePath);
  const existing = decisionWorkspace.existing.map(toRelativePath);
  const lines = [messages.commands.initDone];

  if (created.length > 0) {
    lines.push(`${messages.init.decisionCreated}: ${created.join(', ')}`);
  }

  if (existing.length > 0) {
    lines.push(`${messages.init.decisionExisting}: ${existing.join(', ')}`);
  }

  return lines;
}

export function renderInitCommandData(
  data: InitCommandData,
  messages: V2MessageCatalog = enV2Messages,
): string {
  const lines = [
    data.didChange ? messages.init.completed : messages.init.completedNoChanges,
    messages.init.primaryCompatibility,
  ];

  if (data.agents.length > 0) {
    lines.push(`${messages.init.selectedAgents}: ${data.agents.join(', ')}`);
  } else {
    lines.push(messages.init.agentRulesSkipped);
  }

  lines.push('', buildSummaryTable(data.summary.rows, messages));

  lines.push(
    '',
    ...formatDecisionWorkspaceSummary(data.projectRoot, data.decisionWorkspace, messages),
  );

  const structuredWarnings = data.summary.structuredWarnings ?? [];
  if (data.summary.warnings.length > 0 || structuredWarnings.length > 0) {
    lines.push('', `${messages.init.warnings}:`);
    const renderedStructuredWarnings = structuredWarnings.map(
      (warning) => `- ${messages.init.warning(warning.code, warning.path, warning.detail)}`,
    );
    const unstructuredWarnings = data.summary.warnings
      .slice(structuredWarnings.length)
      .map((warning) => `- ${warning}`);
    lines.push(...renderedStructuredWarnings, ...unstructuredWarnings);
  }

  return lines.join('\n');
}

function normalizeSelectedAgents(agentIds: readonly SupportedAgentId[]): SupportedAgentId[] {
  const selectedAgentSet = new Set(agentIds);

  return SUPPORTED_AGENTS.map((agent) => agent.id).filter((agentId) =>
    selectedAgentSet.has(agentId),
  );
}

export function createAgentCheckboxConfig(messages: V2MessageCatalog = enV2Messages) {
  return {
    message: messages.init.promptMessage,
    instructions: messages.init.promptInstructions,
    required: true,
    validate: (choices: readonly { value: SupportedAgentId }[]) =>
      choices.length > 0 || messages.init.promptRequired,
    choices: SUPPORTED_AGENTS.map((agent) => ({
      name: agent.label,
      value: agent.id,
    })),
  };
}

async function resolveSelectedAgents(
  options: InitCliOptions,
  messages: V2MessageCatalog,
): Promise<SupportedAgentId[]> {
  if (options.agentRules === false) {
    return [];
  }

  const parsedAgents = parseAgentsOptionStrict(options.agents);
  const defaultAgentIds = SUPPORTED_AGENTS.map((agent) => agent.id);

  if (parsedAgents.length > 0) {
    return normalizeSelectedAgents(parsedAgents);
  }

  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    return normalizeSelectedAgents(defaultAgentIds);
  }

  return normalizeSelectedAgents(
    await checkbox<SupportedAgentId>(createAgentCheckboxConfig(messages)),
  );
}

function parseAgentsOptionStrict(rawAgents: string | undefined): SupportedAgentId[] {
  if (rawAgents === undefined || rawAgents.trim() === '') return [];
  const requestedAgents = [
    ...new Set(
      rawAgents
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean),
    ),
  ];
  const validAgents = new Set(SUPPORTED_AGENTS.map((agent) => agent.id));
  const invalidAgent = requestedAgents.find((agent) => !validAgents.has(agent as SupportedAgentId));
  if (invalidAgent !== undefined) throw new InitError('invalid-agent', { agent: invalidAgent });
  return requestedAgents as SupportedAgentId[];
}

function toInitCommandFailure(error: unknown): InitCommandFailure {
  if (isInitError(error)) {
    const path = error.params.path ?? error.params.agent;
    return {
      expected: true,
      code: error.code,
      ...(path === undefined ? {} : { path }),
      ...(error.params.detail === undefined ? {} : { detail: error.params.detail }),
    };
  }
  return {
    expected: false,
    detail: error instanceof Error ? error.message : String(error),
  };
}

function renderInitCommandFailure(failure: InitCommandFailure, messages: V2MessageCatalog): string {
  if (failure.expected && failure.code !== undefined) {
    if (failure.code === 'invalid-agent' && failure.path !== undefined) {
      return messages.init.invalidAgent(failure.path);
    }
    return messages.init.error(failure.code, failure.path, failure.detail);
  }
  return messages.errors.unexpected(failure.detail ?? 'Unknown init failure.');
}

export async function runInitCommandData(
  options: InitCliOptions,
  projectRoot: string,
  messages: V2MessageCatalog = enV2Messages,
): Promise<InitCommandData> {
  const agents = await resolveSelectedAgents(options, messages);
  const resolvedOptions: InitCommandOptions = {
    force: options.force,
    agents,
  };
  const result = await initProject(resolvedOptions, projectRoot);
  const decisionWorkspace = initDecisionWorkspace(projectRoot);
  const ignoreResult = await ensureGitignoreEntries(projectRoot, DECISION_LOCAL_PATHS);
  if (ignoreResult.added.length > 0) {
    const existingGitignore = ignoreResult.skipped.length > 0;
    result.summary.rows.push({
      path: '.gitignore',
      status: existingGitignore ? 'overwritten' : 'created',
    });
    result.summary[existingGitignore ? 'overwritten' : 'created'].push('.gitignore');
  }
  if (ignoreResult.warning !== undefined) {
    result.summary.structuredWarnings.push({
      code: 'gitignore-update-failed',
      path: '.gitignore',
      detail: DECISION_LOCAL_PATHS.join('\n'),
    });
    result.summary.warnings.push(ignoreResult.warning);
  }

  return {
    ...result,
    projectRoot,
    decisionWorkspace,
    didChange:
      result.didChange || decisionWorkspace.created.length > 0 || ignoreResult.added.length > 0,
  };
}

export async function runInitCommand(
  options: InitCliOptions,
  projectRoot: string,
  messages: V2MessageCatalog = enV2Messages,
): Promise<CommandResult> {
  try {
    const data = await runInitCommandData(options, projectRoot, messages);
    return {
      exitCode: 0,
      stderr: '',
      stdout: renderInitCommandData(data, messages),
    };
  } catch (error) {
    const failure = toInitCommandFailure(error);

    return {
      exitCode: 1,
      stderr: renderInitCommandFailure(failure, messages),
      stdout: '',
    };
  }
}
