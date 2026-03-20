import { chmod, mkdir, readFile, writeFile } from 'node:fs/promises';
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
  needsClaudeCodeHook,
  CLAUDE_CODE_HOOK_SETTINGS_PATH,
  CLAUDE_CODE_HOOK_SCRIPT_PATH,
  CLAUDE_CODE_HOOK_SOURCE_PATH,
} from './agent-rules.js';
import { EVAL_ASSET_RELATIVE_PATHS, getBundledAssetsRoot } from './assets.js';
import {
  copyFileIntoPlace,
  ensureDirectory,
  ensureReadableFile,
  getFsEntryKind,
  type FsEntryKind,
} from './fs.js';
import {
  getProjectRelativeSduckAssetPath,
  getProjectSduckAssetsPath,
  getProjectSduckHomePath,
  getProjectSduckWorkspacePath,
  PROJECT_SDUCK_ASSETS_RELATIVE_PATH,
  PROJECT_SDUCK_HOME_RELATIVE_PATH,
  PROJECT_SDUCK_WORKSPACE_RELATIVE_PATH,
  toBundledAssetRelativePath,
} from './project-paths.js';

import type { InitCommandOptions, InitMode, ResolvedInitOptions } from './init-types.js';

export type { FsEntryKind } from './fs.js';
export type { InitCommandOptions, InitMode, ResolvedInitOptions } from './init-types.js';

export type AssetTemplateKey =
  | 'eval-spec'
  | 'eval-plan'
  | 'eval-task'
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
  agents: SupportedAgentId[];
  summary: InitExecutionSummary;
  didChange: boolean;
}

const ASSET_TEMPLATE_DEFINITIONS = [
  {
    key: 'eval-spec',
    relativePath: getProjectRelativeSduckAssetPath(EVAL_ASSET_RELATIVE_PATHS.spec),
  },
  {
    key: 'eval-plan',
    relativePath: getProjectRelativeSduckAssetPath(EVAL_ASSET_RELATIVE_PATHS.plan),
  },
  {
    key: 'eval-task',
    relativePath: getProjectRelativeSduckAssetPath(EVAL_ASSET_RELATIVE_PATHS.task),
  },
  {
    key: 'type-build',
    relativePath: getProjectRelativeSduckAssetPath('types', 'build.md'),
  },
  {
    key: 'type-feature',
    relativePath: getProjectRelativeSduckAssetPath('types', 'feature.md'),
  },
  { key: 'type-fix', relativePath: getProjectRelativeSduckAssetPath('types', 'fix.md') },
  {
    key: 'type-refactor',
    relativePath: getProjectRelativeSduckAssetPath('types', 'refactor.md'),
  },
  {
    key: 'type-chore',
    relativePath: getProjectRelativeSduckAssetPath('types', 'chore.md'),
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
  const sduckHomeRoot = getProjectSduckHomePath(projectRoot);
  const assetsRoot = getProjectSduckAssetsPath(projectRoot);
  const workspaceRoot = getProjectSduckWorkspacePath(projectRoot);

  const summary: InitExecutionSummary = {
    created: [],
    prepended: [],
    kept: [],
    overwritten: [],
    warnings: [],
    errors: [],
    rows: [],
  };

  const sduckHomeStatus = await ensureRootDirectory(sduckHomeRoot, 'asset-root-conflict');
  summary[sduckHomeStatus].push(`${PROJECT_SDUCK_HOME_RELATIVE_PATH}/`);
  summary.rows.push({ path: `${PROJECT_SDUCK_HOME_RELATIVE_PATH}/`, status: sduckHomeStatus });

  const assetsRootStatus = await ensureRootDirectory(assetsRoot, 'asset-root-conflict');
  summary[assetsRootStatus].push(`${PROJECT_SDUCK_ASSETS_RELATIVE_PATH}/`);
  summary.rows.push({ path: `${PROJECT_SDUCK_ASSETS_RELATIVE_PATH}/`, status: assetsRootStatus });

  const workspaceRootStatus = await ensureRootDirectory(workspaceRoot, 'workspace-root-conflict');
  summary[workspaceRootStatus].push(`${PROJECT_SDUCK_WORKSPACE_RELATIVE_PATH}/`);
  summary.rows.push({
    path: `${PROJECT_SDUCK_WORKSPACE_RELATIVE_PATH}/`,
    status: workspaceRootStatus,
  });

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
    const sourcePath = join(assetSourceRoot, toBundledAssetRelativePath(definition.relativePath));
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

  if (needsClaudeCodeHook(resolvedOptions.agents)) {
    await installClaudeCodeHook(projectRoot, summary);
  }

  return {
    mode,
    agents: resolvedOptions.agents,
    summary,
    didChange:
      summary.created.length > 0 || summary.prepended.length > 0 || summary.overwritten.length > 0,
  };
}

async function installClaudeCodeHook(
  projectRoot: string,
  summary: InitExecutionSummary,
): Promise<void> {
  const assetRoot = await getBundledAssetsRoot();
  const hookSourcePath = join(assetRoot, 'agent-rules', CLAUDE_CODE_HOOK_SOURCE_PATH);
  const hookTargetPath = join(projectRoot, CLAUDE_CODE_HOOK_SCRIPT_PATH);
  const settingsPath = join(projectRoot, CLAUDE_CODE_HOOK_SETTINGS_PATH);

  // Copy hook script
  await mkdir(dirname(hookTargetPath), { recursive: true });
  await copyFileIntoPlace(hookSourcePath, hookTargetPath);
  await chmod(hookTargetPath, 0o755);
  summary.created.push(CLAUDE_CODE_HOOK_SCRIPT_PATH);
  summary.rows.push({ path: CLAUDE_CODE_HOOK_SCRIPT_PATH, status: 'created' });

  // Create or merge settings.json
  const hookConfig = {
    hooks: {
      PreToolUse: [
        {
          matcher: 'Edit|Write',
          hooks: [
            {
              type: 'command',
              command: '"$CLAUDE_PROJECT_DIR"/.claude/hooks/sdd-guard.sh',
            },
          ],
        },
      ],
    },
  };

  if ((await getFsEntryKind(settingsPath)) === 'file') {
    const existingContent = await readFile(settingsPath, 'utf8');

    try {
      const existing = JSON.parse(existingContent) as Record<string, unknown>;
      existing['hooks'] = hookConfig.hooks;
      await writeFile(settingsPath, JSON.stringify(existing, null, 2) + '\n', 'utf8');
      summary.overwritten.push(CLAUDE_CODE_HOOK_SETTINGS_PATH);
      summary.rows.push({ path: CLAUDE_CODE_HOOK_SETTINGS_PATH, status: 'overwritten' });
    } catch {
      await writeFile(settingsPath, JSON.stringify(hookConfig, null, 2) + '\n', 'utf8');
      summary.overwritten.push(CLAUDE_CODE_HOOK_SETTINGS_PATH);
      summary.rows.push({ path: CLAUDE_CODE_HOOK_SETTINGS_PATH, status: 'overwritten' });
    }
  } else {
    await mkdir(dirname(settingsPath), { recursive: true });
    await writeFile(settingsPath, JSON.stringify(hookConfig, null, 2) + '\n', 'utf8');
    summary.created.push(CLAUDE_CODE_HOOK_SETTINGS_PATH);
    summary.rows.push({ path: CLAUDE_CODE_HOOK_SETTINGS_PATH, status: 'created' });
  }
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
