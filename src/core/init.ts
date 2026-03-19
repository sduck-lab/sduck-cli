import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  copyFileIntoPlace,
  ensureDirectory,
  ensureReadableFile,
  getFsEntryKind,
  type FsEntryKind,
} from './fs.js';

export type { FsEntryKind } from './fs.js';

export interface InitCommandOptions {
  force: boolean;
}

export type InitMode = 'safe' | 'force';

export type AssetTemplateKey =
  | 'plan-evaluation'
  | 'spec-build'
  | 'spec-feature'
  | 'spec-fix'
  | 'spec-refactor'
  | 'spec-chore';

export interface AssetTemplateDefinition {
  key: AssetTemplateKey;
  fileName: string;
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

export type InitWarningCode = 'kept-existing-asset' | 'type-conflict' | 'force-recommended';

export type InitErrorCode =
  | 'asset-root-conflict'
  | 'workspace-root-conflict'
  | 'asset-write-failed'
  | 'unknown-fs-error';

export interface InitSummaryRow {
  path: string;
  status: 'created' | 'kept' | 'overwritten';
}

export interface InitExecutionSummary {
  created: string[];
  kept: string[];
  overwritten: string[];
  warnings: string[];
  errors: string[];
  rows: InitSummaryRow[];
}

export interface InitExecutionResult {
  mode: InitMode;
  summary: InitExecutionSummary;
  didChange: boolean;
}

const ASSET_TEMPLATE_DEFINITIONS = [
  {
    key: 'plan-evaluation',
    fileName: 'plan-evaluation.yml',
    relativePath: join('sduck-assets', 'plan-evaluation.yml'),
  },
  {
    key: 'spec-build',
    fileName: 'spec-build.md',
    relativePath: join('sduck-assets', 'spec-build.md'),
  },
  {
    key: 'spec-feature',
    fileName: 'spec-feature.md',
    relativePath: join('sduck-assets', 'spec-feature.md'),
  },
  { key: 'spec-fix', fileName: 'spec-fix.md', relativePath: join('sduck-assets', 'spec-fix.md') },
  {
    key: 'spec-refactor',
    fileName: 'spec-refactor.md',
    relativePath: join('sduck-assets', 'spec-refactor.md'),
  },
  {
    key: 'spec-chore',
    fileName: 'spec-chore.md',
    relativePath: join('sduck-assets', 'spec-chore.md'),
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

async function getAssetSourceRoot(): Promise<string> {
  const currentFilePath = fileURLToPath(import.meta.url);
  const currentDirectoryPath = dirname(currentFilePath);
  const candidatePaths = [
    join(currentDirectoryPath, '..', '..', 'sduck-assets'),
    join(currentDirectoryPath, '..', 'sduck-assets'),
  ];

  for (const candidatePath of candidatePaths) {
    if ((await getFsEntryKind(candidatePath)) === 'directory') {
      return candidatePath;
    }
  }

  throw new Error('Unable to locate bundled sduck-assets directory.');
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

async function ensureRootDirectory(
  targetPath: string,
  errorCode: InitErrorCode,
): Promise<'created' | 'kept'> {
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
  const mode = getInitMode(options);
  const assetSourceRoot = await getAssetSourceRoot();
  const assetsRoot = join(projectRoot, 'sduck-assets');
  const workspaceRoot = join(projectRoot, 'sduck-workspace');

  const summary: InitExecutionSummary = {
    created: [],
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
    const sourcePath = join(assetSourceRoot, definition.fileName);
    const targetPath = join(projectRoot, definition.relativePath);

    await ensureReadableFile(sourcePath);
    await copyFileIntoPlace(sourcePath, targetPath);
  }

  return {
    mode,
    summary,
    didChange: summary.created.length > 0 || summary.overwritten.length > 0,
  };
}
