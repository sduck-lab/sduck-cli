import { execFileSync } from 'node:child_process';
import * as fs from 'node:fs';
import { chmod, mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, isAbsolute, join } from 'node:path';
import { fileURLToPath } from 'node:url';

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
  CLAUDE_CODE_SKILLS_PATH,
} from './agent-rules.js';
import {
  EVAL_ASSET_RELATIVE_PATHS,
  getBundledAssetsRoot,
  listBundledAssetsRootCandidates,
} from './assets.js';
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
import { readDecisionWorkspacePolicy } from './v2/policy.js';
import { writeProjectVersion } from './version-file.js';

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
  | 'type-chore'
  | 'agent-rules-core'
  | 'agent-rules-claude-code'
  | 'agent-rules-codex'
  | 'agent-rules-opencode'
  | 'agent-rules-gemini-cli'
  | 'agent-rules-cursor'
  | 'agent-rules-antigravity'
  | 'agent-rules-skill-codebase-decisions'
  | 'agent-rules-skill-retrospective-capture'
  | 'agent-rules-hook'
  | 'agent-rules-retrospective-post-commit-hook';

export interface AssetTemplateDefinition {
  key: AssetTemplateKey;
  relativePath: string;
}

export type AssetTemplateMap = Record<AssetTemplateKey, AssetTemplateDefinition>;

export type AssetActionKind = 'create' | 'keep' | 'overwrite' | 'error';

export type AssetCollisionKind =
  'none' | 'file-directory-mismatch' | 'directory-file-mismatch' | 'unknown';

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
  | 'kept-existing-non-file-hook'
  | 'kept-settings-non-object-hooks'
  | 'kept-settings-non-array-pre-tool-use'
  | 'kept-invalid-settings'
  | 'kept-existing-non-file-settings'
  | 'cannot-create-skills-directory'
  | 'cannot-copy-skill-non-file'
  | 'skill-source-not-found'
  | 'not-git-repo'
  | 'kept-existing-post-commit-hook'
  | 'kept-managed-post-commit-hook'
  | 'gitignore-update-failed'
  | 'refresh-assets-recommended'
  | 'refresh-rules-recommended';

export type InitErrorCode =
  | 'asset-root-conflict'
  | 'workspace-root-conflict'
  | 'type-conflict'
  | 'invalid-agent'
  | 'asset-write-failed'
  | 'unknown-fs-error';

export interface InitWarning {
  code: InitWarningCode;
  path?: string;
  detail?: string;
}

export class InitError extends Error {
  constructor(
    readonly code: InitErrorCode,
    readonly params: { path?: string; detail?: string; agent?: string } = {},
  ) {
    super(code);
    this.name = 'InitError';
  }
}

export function isInitError(error: unknown): error is InitError {
  return error instanceof InitError;
}

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
  structuredWarnings: InitWarning[];
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
  {
    key: 'agent-rules-core',
    relativePath: getProjectRelativeSduckAssetPath('agent-rules', 'core.md'),
  },
  {
    key: 'agent-rules-claude-code',
    relativePath: getProjectRelativeSduckAssetPath('agent-rules', 'claude-code.md'),
  },
  {
    key: 'agent-rules-codex',
    relativePath: getProjectRelativeSduckAssetPath('agent-rules', 'codex.md'),
  },
  {
    key: 'agent-rules-opencode',
    relativePath: getProjectRelativeSduckAssetPath('agent-rules', 'opencode.md'),
  },
  {
    key: 'agent-rules-gemini-cli',
    relativePath: getProjectRelativeSduckAssetPath('agent-rules', 'gemini-cli.md'),
  },
  {
    key: 'agent-rules-cursor',
    relativePath: getProjectRelativeSduckAssetPath('agent-rules', 'cursor.mdc'),
  },
  {
    key: 'agent-rules-antigravity',
    relativePath: getProjectRelativeSduckAssetPath('agent-rules', 'antigravity.md'),
  },
  {
    key: 'agent-rules-skill-codebase-decisions',
    relativePath: getProjectRelativeSduckAssetPath(
      'agent-rules',
      'skills',
      'sduck-codebase-decisions',
      'SKILL.md',
    ),
  },
  {
    key: 'agent-rules-skill-retrospective-capture',
    relativePath: getProjectRelativeSduckAssetPath(
      'agent-rules',
      'skills',
      'sduck-retrospective-capture',
      'SKILL.md',
    ),
  },
  {
    key: 'agent-rules-hook',
    relativePath: getProjectRelativeSduckAssetPath('agent-rules', 'hooks', 'sdd-guard.sh'),
  },
  {
    key: 'agent-rules-retrospective-post-commit-hook',
    relativePath: getProjectRelativeSduckAssetPath(
      'agent-rules',
      'hooks',
      'sduck-retrospective-post-commit.sh',
    ),
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
    structuredWarnings: [],
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
      summary.structuredWarnings.push({ code: 'kept-existing-asset', path: action.targetPath });
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
    summary.structuredWarnings.push({ code: 'refresh-assets-recommended' });
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

  throw new InitError(errorCode, { path: targetPath });
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
    structuredWarnings: [],
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
  summary.structuredWarnings.push(...actionSummary.structuredWarnings);
  summary.errors.push(...actionSummary.errors);
  summary.rows.push(...actionSummary.rows);

  const conflict = actions.find((action) => action.action === 'error');

  if (conflict !== undefined) {
    throw new InitError('type-conflict', {
      path: conflict.targetPath,
      detail: conflict.collision,
    });
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
    await installClaudeCodeHook(projectRoot, summary, mode);
    await installClaudeCodeSkills(projectRoot, summary, mode);
  }

  installRetrospectivePostCommitHook(projectRoot, summary, mode);

  await writeProjectVersion(projectRoot);

  return {
    mode,
    agents: resolvedOptions.agents,
    summary,
    didChange:
      summary.created.length > 0 || summary.prepended.length > 0 || summary.overwritten.length > 0,
  };
}

const CLAUDE_CODE_HOOK_COMMAND = '"$CLAUDE_PROJECT_DIR"/.claude/hooks/sdd-guard.sh';
const RETROSPECTIVE_POST_COMMIT_HOOK_SOURCE_PATH = join(
  'hooks',
  'sduck-retrospective-post-commit.sh',
);
const GIT_POST_COMMIT_HOOK_DISPLAY_PATH = 'git-hooks/post-commit';

export function installRetrospectivePostCommitHook(
  projectRoot: string,
  summary: InitExecutionSummary,
  mode: InitMode,
): void {
  installRetrospectivePostCommitHookSync(projectRoot, summary, mode);
}

const MANAGED_RETROSPECTIVE_HOOK_SENTINEL = 'sduck managed retrospective post-commit hook';

function getBundledAssetsRootSync(): string {
  const currentDirectoryPath = dirname(fileURLToPath(import.meta.url));
  for (const candidatePath of listBundledAssetsRootCandidates(currentDirectoryPath)) {
    try {
      if (fs.statSync(candidatePath).isDirectory()) return candidatePath;
    } catch {
      // Try the next bundled asset layout candidate.
    }
  }
  throw new Error('Unable to locate bundled .sduck/sduck-assets directory.');
}

function getFsEntryKindSync(targetPath: string): FsEntryKind {
  try {
    const stats = fs.statSync(targetPath);
    if (stats.isDirectory()) return 'directory';
    return 'file';
  } catch {
    return 'missing';
  }
}

function resolveGitPathSync(projectRoot: string, relativePath: string): string | null {
  try {
    const insideWorkTree = execFileSync('git', ['rev-parse', '--is-inside-work-tree'], {
      cwd: projectRoot,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    if (insideWorkTree !== 'true') return null;
    const gitPath = execFileSync('git', ['rev-parse', '--git-path', relativePath], {
      cwd: projectRoot,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    if (gitPath === '') return null;
    return isAbsolute(gitPath) ? gitPath : join(projectRoot, gitPath);
  } catch {
    return null;
  }
}

function isWorkflowPolicyDisabled(projectRoot: string): boolean {
  return readDecisionWorkspacePolicy(projectRoot)?.workflowEnabled === false;
}

export function installRetrospectivePostCommitHookSync(
  projectRoot: string,
  summary: InitExecutionSummary,
  mode: InitMode,
): void {
  if (!isWorkflowPolicyDisabled(projectRoot)) {
    return;
  }

  const hookTargetPath = resolveGitPathSync(projectRoot, 'hooks/post-commit');

  if (hookTargetPath === null) {
    summary.structuredWarnings.push({
      code: 'not-git-repo',
      path: GIT_POST_COMMIT_HOOK_DISPLAY_PATH,
    });
    summary.warnings.push('Skipped Git post-commit hook install: not inside a Git repository.');
    return;
  }

  const hookTargetKind = getFsEntryKindSync(hookTargetPath);

  if (hookTargetKind === 'missing') {
    const assetRoot = getBundledAssetsRootSync();
    const hookSourcePath = join(
      assetRoot,
      'agent-rules',
      RETROSPECTIVE_POST_COMMIT_HOOK_SOURCE_PATH,
    );
    fs.mkdirSync(dirname(hookTargetPath), { recursive: true });
    fs.copyFileSync(hookSourcePath, hookTargetPath);
    fs.chmodSync(hookTargetPath, 0o755);

    summary.created.push(GIT_POST_COMMIT_HOOK_DISPLAY_PATH);
    summary.rows.push({ path: GIT_POST_COMMIT_HOOK_DISPLAY_PATH, status: 'created' });
    return;
  }

  summary.kept.push(GIT_POST_COMMIT_HOOK_DISPLAY_PATH);
  summary.rows.push({ path: GIT_POST_COMMIT_HOOK_DISPLAY_PATH, status: 'kept' });

  if (hookTargetKind === 'file') {
    let isManaged = false;
    try {
      isManaged = fs
        .readFileSync(hookTargetPath, 'utf8')
        .includes(MANAGED_RETROSPECTIVE_HOOK_SENTINEL);
    } catch {
      isManaged = false;
    }
    summary.structuredWarnings.push({
      code: isManaged ? 'kept-managed-post-commit-hook' : 'kept-existing-post-commit-hook',
      path: GIT_POST_COMMIT_HOOK_DISPLAY_PATH,
    });
    summary.warnings.push(
      mode === 'force'
        ? 'Kept existing Git post-commit hook even under --force; sduck never replaces existing user or managed post-commit hooks automatically.'
        : 'Kept existing Git post-commit hook; sduck installs the managed retrospective marker hook only when the hook path is absent.',
    );
  } else {
    summary.structuredWarnings.push({
      code: 'kept-existing-non-file-hook',
      path: GIT_POST_COMMIT_HOOK_DISPLAY_PATH,
    });
    summary.warnings.push(`Kept existing non-file Git post-commit hook path: ${hookTargetPath}`);
  }
}

function createClaudeCodeHookEntry(): Record<string, unknown> {
  return {
    matcher: 'Edit|Write|MultiEdit',
    hooks: [
      {
        type: 'command',
        command: CLAUDE_CODE_HOOK_COMMAND,
      },
    ],
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function containsClaudeCodeSddHook(value: unknown): boolean {
  if (!isRecord(value)) {
    return false;
  }

  const hooks = value['hooks'];

  if (!Array.isArray(hooks)) {
    return false;
  }

  return hooks.some(
    (hook) =>
      isRecord(hook) && hook['type'] === 'command' && hook['command'] === CLAUDE_CODE_HOOK_COMMAND,
  );
}

function toUnknownArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value.map((entry): unknown => entry) : [];
}

function mergeClaudeCodeHookSettings(
  existing: Record<string, unknown>,
  mode: InitMode,
): { didChange: boolean; settings: Record<string, unknown> } {
  const hooksValue = existing['hooks'];
  const hooks = isRecord(hooksValue) ? hooksValue : {};
  const preToolUseValue = hooks['PreToolUse'];
  const preToolUse = toUnknownArray(preToolUseValue);
  const hasExistingSddHook = preToolUse.some(containsClaudeCodeSddHook);

  if (mode === 'safe' && hasExistingSddHook) {
    return { didChange: false, settings: existing };
  }

  const preservedPreToolUse =
    mode === 'force' ? preToolUse.filter((entry) => !containsClaudeCodeSddHook(entry)) : preToolUse;

  return {
    didChange: true,
    settings: {
      ...existing,
      hooks: {
        ...hooks,
        PreToolUse: [...preservedPreToolUse, createClaudeCodeHookEntry()],
      },
    },
  };
}

async function installClaudeCodeHook(
  projectRoot: string,
  summary: InitExecutionSummary,
  mode: InitMode,
): Promise<void> {
  const assetRoot = await getBundledAssetsRoot();
  const hookSourcePath = join(assetRoot, 'agent-rules', CLAUDE_CODE_HOOK_SOURCE_PATH);
  const hookTargetPath = join(projectRoot, CLAUDE_CODE_HOOK_SCRIPT_PATH);
  const settingsPath = join(projectRoot, CLAUDE_CODE_HOOK_SETTINGS_PATH);

  const hookTargetKind = await getFsEntryKind(hookTargetPath);

  if (hookTargetKind === 'missing' || (hookTargetKind === 'file' && mode === 'force')) {
    await mkdir(dirname(hookTargetPath), { recursive: true });
    await copyFileIntoPlace(hookSourcePath, hookTargetPath);
    await chmod(hookTargetPath, 0o755);

    if (hookTargetKind === 'missing') {
      summary.created.push(CLAUDE_CODE_HOOK_SCRIPT_PATH);
      summary.rows.push({ path: CLAUDE_CODE_HOOK_SCRIPT_PATH, status: 'created' });
    } else {
      summary.overwritten.push(CLAUDE_CODE_HOOK_SCRIPT_PATH);
      summary.rows.push({ path: CLAUDE_CODE_HOOK_SCRIPT_PATH, status: 'overwritten' });
    }
  } else if (hookTargetKind === 'file') {
    summary.kept.push(CLAUDE_CODE_HOOK_SCRIPT_PATH);
    summary.rows.push({ path: CLAUDE_CODE_HOOK_SCRIPT_PATH, status: 'kept' });
  } else {
    summary.kept.push(CLAUDE_CODE_HOOK_SCRIPT_PATH);
    summary.rows.push({ path: CLAUDE_CODE_HOOK_SCRIPT_PATH, status: 'kept' });
    summary.structuredWarnings.push({
      code: 'kept-existing-non-file-hook',
      path: CLAUDE_CODE_HOOK_SCRIPT_PATH,
    });
    summary.warnings.push(
      `Kept existing non-file Claude Code hook path: ${CLAUDE_CODE_HOOK_SCRIPT_PATH}`,
    );
  }

  const settingsKind = await getFsEntryKind(settingsPath);

  if (settingsKind === 'file') {
    const existingContent = await readFile(settingsPath, 'utf8');

    try {
      const existing = JSON.parse(existingContent) as Record<string, unknown>;
      const hooksValue = existing['hooks'];
      const preToolUseValue = isRecord(hooksValue) ? hooksValue['PreToolUse'] : undefined;

      if (mode === 'safe' && hooksValue !== undefined && !isRecord(hooksValue)) {
        summary.kept.push(CLAUDE_CODE_HOOK_SETTINGS_PATH);
        summary.rows.push({ path: CLAUDE_CODE_HOOK_SETTINGS_PATH, status: 'kept' });
        summary.structuredWarnings.push({
          code: 'kept-settings-non-object-hooks',
          path: CLAUDE_CODE_HOOK_SETTINGS_PATH,
        });
        summary.warnings.push(
          `Kept Claude Code settings with non-object hooks: ${CLAUDE_CODE_HOOK_SETTINGS_PATH}. Run \`sduck init --force\` to replace it.`,
        );
        return;
      }

      if (mode === 'safe' && preToolUseValue !== undefined && !Array.isArray(preToolUseValue)) {
        summary.kept.push(CLAUDE_CODE_HOOK_SETTINGS_PATH);
        summary.rows.push({ path: CLAUDE_CODE_HOOK_SETTINGS_PATH, status: 'kept' });
        summary.structuredWarnings.push({
          code: 'kept-settings-non-array-pre-tool-use',
          path: CLAUDE_CODE_HOOK_SETTINGS_PATH,
        });
        summary.warnings.push(
          `Kept Claude Code settings with non-array PreToolUse hooks: ${CLAUDE_CODE_HOOK_SETTINGS_PATH}. Run \`sduck init --force\` to replace it.`,
        );
        return;
      }

      const { didChange, settings } = mergeClaudeCodeHookSettings(existing, mode);

      if (didChange) {
        await writeFile(settingsPath, JSON.stringify(settings, null, 2) + '\n', 'utf8');
        summary.overwritten.push(CLAUDE_CODE_HOOK_SETTINGS_PATH);
        summary.rows.push({ path: CLAUDE_CODE_HOOK_SETTINGS_PATH, status: 'overwritten' });
      } else {
        summary.kept.push(CLAUDE_CODE_HOOK_SETTINGS_PATH);
        summary.rows.push({ path: CLAUDE_CODE_HOOK_SETTINGS_PATH, status: 'kept' });
      }
    } catch {
      if (mode === 'force') {
        await writeFile(
          settingsPath,
          JSON.stringify({ hooks: { PreToolUse: [createClaudeCodeHookEntry()] } }, null, 2) + '\n',
          'utf8',
        );
        summary.overwritten.push(CLAUDE_CODE_HOOK_SETTINGS_PATH);
        summary.rows.push({ path: CLAUDE_CODE_HOOK_SETTINGS_PATH, status: 'overwritten' });
      } else {
        summary.kept.push(CLAUDE_CODE_HOOK_SETTINGS_PATH);
        summary.rows.push({ path: CLAUDE_CODE_HOOK_SETTINGS_PATH, status: 'kept' });
        summary.structuredWarnings.push({
          code: 'kept-invalid-settings',
          path: CLAUDE_CODE_HOOK_SETTINGS_PATH,
        });
        summary.warnings.push(
          `Kept invalid Claude Code settings file: ${CLAUDE_CODE_HOOK_SETTINGS_PATH}. Run \`sduck init --force\` to replace it.`,
        );
      }
    }
  } else if (settingsKind === 'missing') {
    await mkdir(dirname(settingsPath), { recursive: true });
    await writeFile(
      settingsPath,
      JSON.stringify({ hooks: { PreToolUse: [createClaudeCodeHookEntry()] } }, null, 2) + '\n',
      'utf8',
    );
    summary.created.push(CLAUDE_CODE_HOOK_SETTINGS_PATH);
    summary.rows.push({ path: CLAUDE_CODE_HOOK_SETTINGS_PATH, status: 'created' });
  } else {
    summary.kept.push(CLAUDE_CODE_HOOK_SETTINGS_PATH);
    summary.rows.push({ path: CLAUDE_CODE_HOOK_SETTINGS_PATH, status: 'kept' });
    summary.structuredWarnings.push({
      code: 'kept-existing-non-file-settings',
      path: CLAUDE_CODE_HOOK_SETTINGS_PATH,
    });
    summary.warnings.push(
      `Kept existing non-file Claude Code settings path: ${CLAUDE_CODE_HOOK_SETTINGS_PATH}`,
    );
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
      summary.structuredWarnings.push({ code: 'kept-existing-rule', path: action.outputPath });
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
    summary.structuredWarnings.push({ code: 'refresh-rules-recommended' });
    summary.warnings.push(
      'Run `sduck init --force` to refresh managed rule content for selected agents.',
    );
  }
}

async function installClaudeCodeSkills(
  projectRoot: string,
  summary: InitExecutionSummary,
  mode: InitMode,
): Promise<void> {
  const assetRoot = await getBundledAssetsRoot();
  const skillsSourceRoot = join(assetRoot, 'agent-rules', 'skills');
  const skillsTargetRoot = join(projectRoot, CLAUDE_CODE_SKILLS_PATH);

  // 스킬 디렉토리 생성
  const skillsRootKind = await getFsEntryKind(skillsTargetRoot);

  if (skillsRootKind === 'missing') {
    await mkdir(skillsTargetRoot, { recursive: true });
    summary.created.push(`${CLAUDE_CODE_SKILLS_PATH}/`);
    summary.rows.push({ path: `${CLAUDE_CODE_SKILLS_PATH}/`, status: 'created' });
  } else if (skillsRootKind === 'directory') {
    summary.kept.push(`${CLAUDE_CODE_SKILLS_PATH}/`);
    summary.rows.push({ path: `${CLAUDE_CODE_SKILLS_PATH}/`, status: 'kept' });
  } else {
    summary.structuredWarnings.push({
      code: 'cannot-create-skills-directory',
      path: CLAUDE_CODE_SKILLS_PATH,
    });
    summary.warnings.push(
      `Cannot create skills directory: ${CLAUDE_CODE_SKILLS_PATH} exists as non-directory.`,
    );
    return;
  }

  for (const skillName of ['sduck-codebase-decisions', 'sduck-retrospective-capture'] as const) {
    const skillSourcePath = join(skillsSourceRoot, skillName, 'SKILL.md');
    const skillTargetRelativePath = `${CLAUDE_CODE_SKILLS_PATH}/${skillName}.md`;
    const skillTargetPath = join(skillsTargetRoot, `${skillName}.md`);

    const skillSourceKind = await getFsEntryKind(skillSourcePath);

    if (skillSourceKind === 'file') {
      const skillTargetKind = await getFsEntryKind(skillTargetPath);

      if (skillTargetKind === 'missing' || (skillTargetKind === 'file' && mode === 'force')) {
        await copyFileIntoPlace(skillSourcePath, skillTargetPath);

        if (skillTargetKind === 'missing') {
          summary.created.push(skillTargetRelativePath);
          summary.rows.push({ path: skillTargetRelativePath, status: 'created' });
        } else {
          summary.overwritten.push(skillTargetRelativePath);
          summary.rows.push({ path: skillTargetRelativePath, status: 'overwritten' });
        }
      } else if (skillTargetKind === 'file') {
        summary.kept.push(skillTargetRelativePath);
        summary.rows.push({ path: skillTargetRelativePath, status: 'kept' });
      } else {
        summary.structuredWarnings.push({
          code: 'cannot-copy-skill-non-file',
          path: skillTargetRelativePath,
        });
        summary.warnings.push(`Cannot copy skill: ${skillTargetRelativePath} exists as non-file.`);
      }
    } else {
      summary.structuredWarnings.push({ code: 'skill-source-not-found', path: skillSourcePath });
      summary.warnings.push(`Skill source not found: ${skillSourcePath}`);
    }
  }
}
