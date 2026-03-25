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

  const initResult: InitExecutionResult = await initProject(
    { force: true, agents: [] },
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
