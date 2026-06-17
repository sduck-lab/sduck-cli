import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

import {
  hasManagedBlock,
  listAgentRuleTargets,
  SUPPORTED_AGENTS,
  type SupportedAgentId,
} from './agent-rules.js';
import { CLI_VERSION } from './command-metadata.js';
import { getFsEntryKind } from './fs.js';
import { type InitExecutionResult, initProject } from './init.js';
import { getProjectSduckHomePath } from './project-paths.js';
import { readProjectVersion, writeProjectVersion } from './version-file.js';

export interface UpdateCommandOptions {
  dryRun: boolean;
}

export interface UpdateExecutionSummary {
  rows: {
    path: string;
    status: 'created' | 'prepended' | 'kept' | 'overwritten';
  }[];
  warnings: string[];
}

export interface UpdateExecutionResult {
  fromVersion: string | null;
  toVersion: string;
  didChange: boolean;
  summary: UpdateExecutionSummary;
}

async function readExistingFile(projectRoot: string, relativePath: string): Promise<string | null> {
  const absolutePath = join(projectRoot, relativePath);

  if ((await getFsEntryKind(absolutePath)) !== 'file') {
    return null;
  }

  return await readFile(absolutePath, 'utf8');
}

function looksLikeSduckManagedFile(content: string): boolean {
  return content.includes('# SDD Workflow Rules') || content.includes('sduck SDD workflow rules');
}

async function detectExistingAgentRuleAgents(projectRoot: string): Promise<SupportedAgentId[]> {
  const agents: SupportedAgentId[] = [];

  for (const agent of SUPPORTED_AGENTS) {
    const [target] = listAgentRuleTargets([agent.id]);

    if (target === undefined) {
      continue;
    }

    const content = await readExistingFile(projectRoot, target.outputPath);

    if (content === null) {
      continue;
    }

    if (target.kind === 'managed-file') {
      if (looksLikeSduckManagedFile(content)) {
        agents.push(agent.id);
      }
      continue;
    }

    if (!hasManagedBlock(content)) {
      continue;
    }

    if (content.includes(agent.label) || target.outputPath !== 'AGENT.md') {
      agents.push(agent.id);
    }
  }

  return agents;
}

export async function updateProject(
  options: UpdateCommandOptions,
  projectRoot: string,
): Promise<UpdateExecutionResult> {
  const sduckHomePath = getProjectSduckHomePath(projectRoot);

  if ((await getFsEntryKind(sduckHomePath)) !== 'directory') {
    throw new Error(
      'No .sduck/ directory found. Run `sduck init` first to initialize the project.',
    );
  }

  const currentVersion = await readProjectVersion(projectRoot);

  if (currentVersion === CLI_VERSION) {
    return {
      fromVersion: currentVersion,
      toVersion: CLI_VERSION,
      didChange: false,
      summary: { rows: [], warnings: [] },
    };
  }

  if (options.dryRun) {
    return {
      fromVersion: currentVersion,
      toVersion: CLI_VERSION,
      didChange: true,
      summary: {
        rows: [],
        warnings: ['Dry run — no files were changed.'],
      },
    };
  }

  const agentsToRefresh = await detectExistingAgentRuleAgents(projectRoot);
  const initResult: InitExecutionResult = await initProject(
    { force: true, agents: agentsToRefresh },
    projectRoot,
  );

  await writeProjectVersion(projectRoot);

  return {
    fromVersion: currentVersion,
    toVersion: CLI_VERSION,
    didChange: initResult.didChange,
    summary: {
      rows: initResult.summary.rows,
      warnings: initResult.summary.warnings,
    },
  };
}
