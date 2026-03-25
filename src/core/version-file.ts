import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { CLI_VERSION } from './command-metadata.js';
import { getProjectSduckAssetsPath } from './project-paths.js';

export const ASSET_VERSION_FILE_NAME = '.sduck-version';

export function getProjectVersionPath(projectRoot: string): string {
  return join(getProjectSduckAssetsPath(projectRoot), ASSET_VERSION_FILE_NAME);
}

export async function readProjectVersion(projectRoot: string): Promise<string | null> {
  const versionPath = getProjectVersionPath(projectRoot);

  try {
    const content = await readFile(versionPath, 'utf8');
    const version = content.trim();

    if (version === '') {
      return null;
    }

    return version;
  } catch {
    return null;
  }
}

export async function writeProjectVersion(
  projectRoot: string,
  version: string = CLI_VERSION,
): Promise<void> {
  const versionPath = getProjectVersionPath(projectRoot);

  await writeFile(versionPath, `${version}\n`, 'utf8');
}
