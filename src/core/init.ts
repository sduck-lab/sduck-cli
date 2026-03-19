import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

import {
  type AgentRuleTarget,
  listAgentRuleTargets,
  planAgentRuleActions,
  prependManagedBlock,
  renderAgentRuleContent,
  replaceManagedBlock,
  type PlannedAgentRuleAction,
  type SupportedAgentId,
} from './agent-rules.js';
import { EVAL_ASSET_RELATIVE_PATHS, getBundledAssetsRoot } from './assets.js';
import {
  copyFileIntoPlace,
  ensureDirectory,
  ensureReadableFile,
  getFsEntryKind,
  type FsEntryKind,
} from './fs.js';

import type { InitCommandOptions, InitMode, ResolvedInitOptions } from './init-types.js';

export type { FsEntryKind } from './fs.js';
export type { InitCommandOptions, InitMode, ResolvedInitOptions } from './init-types.js';

export type AssetTemplateKey =
  | 'eval-spec'
  | 'eval-plan'
  | 'type-build'
  | 'type-feature'
  | 'type-fix'
  | 'type-refactor'
  | 'type-chore';

export interface AssetTemplateDefinition {
  key: AssetTemplateKey;
  relativePath: string;
}

export type AssetTemplateMap = Record<AssetTemplateKey, AssetTemplateDefinition>;

export type AssetActionKind = 'create' | 'keep' | 'overwrite' | 'error';

export type AssetCollisionKind =
  | 'none'
  | 'file-directory-mismatch'
  | 'directory-file-mismatch'
  | 'unknown';

export interface PlannedAssetAction {
  key: AssetTemplateKey;
  targetPath: string;
  currentKind: FsEntryKind;
  action: AssetActionKind;
  collision: AssetCollisionKind;
}

export type InitWarningCode =
  | 'kept-existing-asset'
  | 'kept-existing-rule'
  | 'type-conflict'
  | 'force-recommended';

export type InitErrorCode =
  | 'asset-root-conflict'
  | 'workspace-root-conflict'
  | 'asset-write-failed'
  | 'unknown-fs-error';

export interface InitSummaryRow {
  path: string;
  status: 'created' | 'prepended' | 'kept' | 'overwritten';
}

export interface InitExecutionSummary {
  created: string[];
  prepended: string[];
  kept: string[];
  overwritten: string[];
  warnings: string[];
  errors: string[];
  rows: InitSummaryRow[];
}

export interface InitExecutionResult {
  mode: InitMode;
  agents: string[];
  summary: InitExecutionSummary;
  didChange: boolean;
}

const ASSET_TEMPLATE_DEFINITIONS = [
  {
    key: 'eval-spec',
    relativePath: join('sduck-assets', EVAL_ASSET_RELATIVE_PATHS.spec),
  },
  {
    key: 'eval-plan',
    relativePath: join('sduck-assets', EVAL_ASSET_RELATIVE_PATHS.plan),
  },
  {
    key: 'type-build',
    relativePath: join('sduck-assets', 'types', 'build.md'),
  },
  {
    key: 'type-feature',
    relativePath: join('sduck-assets', 'types', 'feature.md'),
  },
  { key: 'type-fix', relativePath: join('sduck-assets', 'types', 'fix.md') },
  {
    key: 'type-refactor',
    relativePath: join('sduck-assets', 'types', 'refactor.md'),
  },
  {
    key: 'type-chore',
    relativePath: join('sduck-assets', 'types', 'chore.md'),
  },
] as const satisfies readonly AssetTemplateDefinition[];

export const ASSET_TEMPLATE_MAP = Object.fromEntries(
  ASSET_TEMPLATE_DEFINITIONS.map((definition) => [definition.key, definition]),
) as AssetTemplateMap;

export function planInitActions(
  mode: InitMode,
  existingEntries: Map<string, FsEntryKind>,
): PlannedAssetAction[] {
  return ASSET_TEMPLATE_DEFINITIONS.map((definition) => {
    const currentKind = existingEntries.get(definition.relativePath) ?? 'missing';

    if (currentKind === 'missing') {
      return {
        key: definition.key,
        targetPath: definition.relativePath,
        currentKind,
        action: 'create',
        collision: 'none',
      } satisfies PlannedAssetAction;
    }

    if (currentKind === 'file') {
      return {
        key: definition.key,
        targetPath: definition.relativePath,
        currentKind,
        action: mode === 'force' ? 'overwrite' : 'keep',
        collision: 'none',
      } satisfies PlannedAssetAction;
    }

    return {
      key: definition.key,
      targetPath: definition.relativePath,
      currentKind,
      action: 'error',
      collision: 'directory-file-mismatch',
    } satisfies PlannedAssetAction;
  });
}

export function summarizeInitActions(actions: PlannedAssetAction[]): InitExecutionSummary {
  const summary: InitExecutionSummary = {
    created: [],
    prepended: [],
    kept: [],
    overwritten: [],
    warnings: [],
    errors: [],
    rows: [],
  };

  for (const action of actions) {
    if (action.action === 'create') {
      summary.created.push(action.targetPath);
      summary.rows.push({ path: action.targetPath, status: 'created' });
      continue;
    }

    if (action.action === 'keep') {
      summary.kept.push(action.targetPath);
      summary.rows.push({ path: action.targetPath, status: 'kept' });
      summary.warnings.push(`Kept existing asset: ${action.targetPath}`);
      continue;
    }

    if (action.action === 'overwrite') {
      summary.overwritten.push(action.targetPath);
      summary.rows.push({ path: action.targetPath, status: 'overwritten' });
      continue;
    }

    summary.errors.push(`Path conflict for ${action.targetPath}: ${action.collision}`);
  }

  if (summary.kept.length > 0) {
    summary.warnings.push('Run `sduck init --force` if you want to regenerate bundled assets.');
  }

  return summary;
}

function getInitMode(options: InitCommandOptions): InitMode {
  return options.force ? 'force' : 'safe';
}

function resolveInitOptions(options: InitCommandOptions): ResolvedInitOptions {
  return {
    mode: getInitMode(options),
    agents: [...new Set(options.agents)],
  };
}

async function collectExistingEntries(projectRoot: string): Promise<Map<string, FsEntryKind>> {
  const existingEntries = new Map<string, FsEntryKind>();

  for (const definition of ASSET_TEMPLATE_DEFINITIONS) {
    existingEntries.set(
      definition.relativePath,
      await getFsEntryKind(join(projectRoot, definition.relativePath)),
    );
  }

  return existingEntries;
}

async function collectExistingFileContents(
  projectRoot: string,
  targets: readonly AgentRuleTarget[],
): Promise<Map<string, string>> {
  const contents = new Map<string, string>();

  for (const target of targets) {
    const targetPath = join(projectRoot, target.outputPath);

    if ((await getFsEntryKind(targetPath)) === 'file') {
      contents.set(target.outputPath, await readFile(targetPath, 'utf8'));
    }
  }

  return contents;
}

async function ensureRootDirectory(
  targetPath: string,
  errorCode: InitErrorCode,
): Promise<'created' | 'kept' | 'overwritten'> {
  const kind = await getFsEntryKind(targetPath);

  if (kind === 'missing') {
    await ensureDirectory(targetPath);
    return 'created';
  }

  if (kind === 'directory') {
    return 'kept';
  }

  throw new Error(`${errorCode}: expected a directory at ${targetPath}.`);
}

export async function initProject(
  options: InitCommandOptions,
  projectRoot: string,
): Promise<InitExecutionResult> {
  const resolvedOptions = resolveInitOptions(options);
  const { mode } = resolvedOptions;
  const assetSourceRoot = await getBundledAssetsRoot();
  const assetsRoot = join(projectRoot, 'sduck-assets');
  const workspaceRoot = join(projectRoot, 'sduck-workspace');

  const summary: InitExecutionSummary = {
    created: [],
    prepended: [],
    kept: [],
    overwritten: [],
    warnings: [],
    errors: [],
    rows: [],
  };

  const assetsRootStatus = await ensureRootDirectory(assetsRoot, 'asset-root-conflict');
  summary[assetsRootStatus].push('sduck-assets/');
  summary.rows.push({ path: 'sduck-assets/', status: assetsRootStatus });

  const workspaceRootStatus = await ensureRootDirectory(workspaceRoot, 'workspace-root-conflict');
  summary[workspaceRootStatus].push('sduck-workspace/');
  summary.rows.push({ path: 'sduck-workspace/', status: workspaceRootStatus });

  const actions = planInitActions(mode, await collectExistingEntries(projectRoot));
  const actionSummary = summarizeInitActions(actions);

  summary.created.push(...actionSummary.created);
  summary.kept.push(...actionSummary.kept);
  summary.overwritten.push(...actionSummary.overwritten);
  summary.warnings.push(...actionSummary.warnings);
  summary.errors.push(...actionSummary.errors);
  summary.rows.push(...actionSummary.rows);

  const conflict = actions.find((action) => action.action === 'error');

  if (conflict !== undefined) {
    throw new Error(
      `type-conflict: expected a file but found a directory at ${conflict.targetPath}. ` +
        'Resolve it manually or move the conflicting path before retrying.',
    );
  }

  for (const action of actions) {
    if (action.action === 'keep') {
      continue;
    }

    const definition = ASSET_TEMPLATE_MAP[action.key];
    const sourcePath = join(
      assetSourceRoot,
      definition.relativePath.replace(/^sduck-assets[\\/]/, ''),
    );
    const targetPath = join(projectRoot, definition.relativePath);

    await ensureReadableFile(sourcePath);
    await mkdir(dirname(targetPath), { recursive: true });
    await copyFileIntoPlace(sourcePath, targetPath);
  }

  const agentTargets = listAgentRuleTargets(resolvedOptions.agents);
  const agentEntryKinds = new Map<string, FsEntryKind>();

  for (const target of agentTargets) {
    agentEntryKinds.set(
      target.outputPath,
      await getFsEntryKind(join(projectRoot, target.outputPath)),
    );
  }

  const existingContents = await collectExistingFileContents(projectRoot, agentTargets);
  const agentActions = planAgentRuleActions(mode, agentTargets, agentEntryKinds, existingContents);

  await applyAgentRuleActions(
    projectRoot,
    agentActions,
    existingContents,
    summary,
    resolvedOptions.agents,
  );

  return {
    mode,
    agents: resolvedOptions.agents,
    summary,
    didChange:
      summary.created.length > 0 || summary.prepended.length > 0 || summary.overwritten.length > 0,
  };
}

async function applyAgentRuleActions(
  projectRoot: string,
  actions: readonly PlannedAgentRuleAction[],
  existingContents: Map<string, string>,
  summary: InitExecutionSummary,
  selectedAgents: SupportedAgentId[],
): Promise<void> {
  for (const action of actions) {
    const targetPath = join(projectRoot, action.outputPath);
    const content = await renderAgentRuleContent(action, selectedAgents);

    if (action.mergeMode === 'create') {
      await mkdir(dirname(targetPath), { recursive: true });
      await writeFile(targetPath, content, 'utf8');
      summary.created.push(action.outputPath);
      summary.rows.push({ path: action.outputPath, status: 'created' });
      continue;
    }

    if (action.mergeMode === 'keep') {
      summary.kept.push(action.outputPath);
      summary.rows.push({ path: action.outputPath, status: 'kept' });
      summary.warnings.push(`Kept existing rule file: ${action.outputPath}`);
      continue;
    }

    await mkdir(dirname(targetPath), { recursive: true });

    if (action.mergeMode === 'prepend') {
      const currentContent = existingContents.get(action.outputPath) ?? '';
      await writeFile(targetPath, prependManagedBlock(currentContent, content.trimEnd()), 'utf8');
      summary.prepended.push(action.outputPath);
      summary.rows.push({ path: action.outputPath, status: 'prepended' });
      continue;
    }

    if (action.mergeMode === 'replace-block') {
      const currentContent = existingContents.get(action.outputPath) ?? '';
      await writeFile(targetPath, replaceManagedBlock(currentContent, content.trimEnd()), 'utf8');
      summary.overwritten.push(action.outputPath);
      summary.rows.push({ path: action.outputPath, status: 'overwritten' });
      continue;
    }

    await writeFile(targetPath, content, 'utf8');
    summary.overwritten.push(action.outputPath);
    summary.rows.push({ path: action.outputPath, status: 'overwritten' });
  }

  if (summary.kept.some((path) => path.endsWith('.md') || path.endsWith('.mdc'))) {
    summary.warnings.push(
      'Run `sduck init --force` to refresh managed rule content for selected agents.',
    );
  }
}
