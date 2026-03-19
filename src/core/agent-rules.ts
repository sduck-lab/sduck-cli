import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { getFsEntryKind, type FsEntryKind } from './fs.js';

export type SupportedAgentId =
  | 'claude-code'
  | 'codex'
  | 'opencode'
  | 'gemini-cli'
  | 'cursor'
  | 'antigravity';

export type AgentRuleTargetKind = 'root-file' | 'managed-file';

export interface AgentRuleTarget {
  agentId: SupportedAgentId;
  outputPath: string;
  kind: AgentRuleTargetKind;
}

export type AgentRuleMergeMode = 'create' | 'prepend' | 'keep' | 'replace-block' | 'overwrite';

export interface PlannedAgentRuleAction {
  agentId: SupportedAgentId;
  outputPath: string;
  kind: AgentRuleTargetKind;
  mergeMode: AgentRuleMergeMode;
  currentKind: FsEntryKind;
}

export const SDD_RULES_BEGIN = '<!-- sduck:begin -->';
export const SDD_RULES_END = '<!-- sduck:end -->';

export const SUPPORTED_AGENTS: readonly { id: SupportedAgentId; label: string }[] = [
  { id: 'claude-code', label: 'Claude Code' },
  { id: 'codex', label: 'Codex' },
  { id: 'opencode', label: 'OpenCode' },
  { id: 'gemini-cli', label: 'Gemini CLI' },
  { id: 'cursor', label: 'Cursor' },
  { id: 'antigravity', label: 'Antigravity' },
];

const AGENT_RULE_TARGETS: readonly AgentRuleTarget[] = [
  { agentId: 'claude-code', outputPath: 'CLAUDE.md', kind: 'root-file' },
  { agentId: 'codex', outputPath: 'AGENT.md', kind: 'root-file' },
  { agentId: 'opencode', outputPath: 'AGENT.md', kind: 'root-file' },
  { agentId: 'gemini-cli', outputPath: 'GEMINI.md', kind: 'root-file' },
  {
    agentId: 'cursor',
    outputPath: join('.cursor', 'rules', 'sduck-core.mdc'),
    kind: 'managed-file',
  },
  {
    agentId: 'antigravity',
    outputPath: join('.agents', 'rules', 'sduck-core.md'),
    kind: 'managed-file',
  },
];

const AGENT_TEMPLATE_FILES: Record<SupportedAgentId, string> = {
  'claude-code': 'claude-code.md',
  codex: 'codex.md',
  opencode: 'opencode.md',
  'gemini-cli': 'gemini-cli.md',
  cursor: 'cursor.mdc',
  antigravity: 'antigravity.md',
};

function unique<T>(values: readonly T[]): T[] {
  return [...new Set(values)];
}

export function parseAgentsOption(rawAgents: string | undefined): SupportedAgentId[] {
  if (rawAgents === undefined || rawAgents.trim() === '') {
    return [];
  }

  const requestedAgents = unique(
    rawAgents
      .split(',')
      .map((value) => value.trim())
      .filter((value) => value !== ''),
  );

  const validAgents = new Set(SUPPORTED_AGENTS.map((agent) => agent.id));
  const invalidAgent = requestedAgents.find((agent) => !validAgents.has(agent as SupportedAgentId));

  if (invalidAgent !== undefined) {
    throw new Error(`Unsupported agent: ${invalidAgent}`);
  }

  return requestedAgents as SupportedAgentId[];
}

export function listAgentRuleTargets(selectedAgents: SupportedAgentId[]): AgentRuleTarget[] {
  const selectedAgentSet = new Set(selectedAgents);

  return AGENT_RULE_TARGETS.filter((target) => selectedAgentSet.has(target.agentId)).filter(
    (target, index, allTargets) =>
      index === allTargets.findIndex((candidate) => candidate.outputPath === target.outputPath),
  );
}

export function hasManagedBlock(content: string): boolean {
  return content.includes(SDD_RULES_BEGIN) && content.includes(SDD_RULES_END);
}

export function prependManagedBlock(existingContent: string, blockContent: string): string {
  const normalizedExistingContent = existingContent.trimStart();

  if (normalizedExistingContent === '') {
    return `${blockContent}\n`;
  }

  return `${blockContent}\n\n${normalizedExistingContent}`;
}

export function replaceManagedBlock(existingContent: string, blockContent: string): string {
  const blockPattern = new RegExp(`${SDD_RULES_BEGIN}[\\s\\S]*?${SDD_RULES_END}`);

  if (!blockPattern.test(existingContent)) {
    return prependManagedBlock(existingContent, blockContent);
  }

  return existingContent.replace(blockPattern, blockContent);
}

function renderManagedBlock(lines: string[]): string {
  return [SDD_RULES_BEGIN, ...lines, SDD_RULES_END].join('\n');
}

async function getAgentRulesAssetRoot(): Promise<string> {
  const currentDirectoryPath = dirname(fileURLToPath(import.meta.url));
  const candidatePaths = [
    join(currentDirectoryPath, '..', '..', 'sduck-assets', 'agent-rules'),
    join(currentDirectoryPath, '..', 'sduck-assets', 'agent-rules'),
  ];

  for (const candidatePath of candidatePaths) {
    if ((await getFsEntryKind(candidatePath)) === 'directory') {
      return candidatePath;
    }
  }

  throw new Error('Unable to locate bundled sduck agent rule assets.');
}

async function readAssetFile(assetRoot: string, fileName: string): Promise<string> {
  return await readFile(join(assetRoot, fileName), 'utf8');
}

function buildRootFileLines(
  agentIds: SupportedAgentId[],
  agentSpecificContent: string[],
): string[] {
  const labels = SUPPORTED_AGENTS.filter((agent) => agentIds.includes(agent.id)).map(
    (agent) => agent.label,
  );

  return [
    '# sduck managed rules',
    '',
    `Selected agents: ${labels.join(', ')}`,
    '',
    ...agentSpecificContent,
  ];
}

export async function renderAgentRuleContent(
  target: AgentRuleTarget,
  selectedAgents: SupportedAgentId[],
): Promise<string> {
  const assetRoot = await getAgentRulesAssetRoot();
  const coreContent = await readAssetFile(assetRoot, 'core.md');

  if (target.kind === 'managed-file') {
    const templateFileName = AGENT_TEMPLATE_FILES[target.agentId];
    const specificContent = await readAssetFile(assetRoot, templateFileName);

    return `${specificContent.trim()}\n\n${coreContent.trim()}\n`;
  }

  const relatedAgents = AGENT_RULE_TARGETS.filter(
    (candidate) =>
      candidate.outputPath === target.outputPath && selectedAgents.includes(candidate.agentId),
  ).map((candidate) => candidate.agentId);

  const specificSections: string[] = [];

  for (const agentId of relatedAgents) {
    const templateFileName = AGENT_TEMPLATE_FILES[agentId];
    specificSections.push((await readAssetFile(assetRoot, templateFileName)).trim());
  }

  const lines = buildRootFileLines(relatedAgents, [...specificSections, coreContent.trim()]);

  return `${renderManagedBlock(lines)}\n`;
}

export function planAgentRuleActions(
  mode: 'safe' | 'force',
  targets: readonly AgentRuleTarget[],
  existingEntries: Map<string, FsEntryKind>,
  existingContents: Map<string, string>,
): PlannedAgentRuleAction[] {
  return targets.map((target) => {
    const currentKind = existingEntries.get(target.outputPath) ?? 'missing';

    if (currentKind === 'missing') {
      return { ...target, mergeMode: 'create', currentKind };
    }

    if (currentKind !== 'file') {
      return { ...target, mergeMode: 'overwrite', currentKind };
    }

    if (target.kind === 'managed-file') {
      return { ...target, mergeMode: mode === 'force' ? 'overwrite' : 'keep', currentKind };
    }

    const content = existingContents.get(target.outputPath) ?? '';

    if (mode === 'safe') {
      return { ...target, mergeMode: hasManagedBlock(content) ? 'keep' : 'prepend', currentKind };
    }

    return {
      ...target,
      mergeMode: hasManagedBlock(content) ? 'replace-block' : 'prepend',
      currentKind,
    };
  });
}
