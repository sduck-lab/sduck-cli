import { join, relative } from 'node:path';

export const SDUCK_HOME_DIR = '.sduck';
export const SDUCK_ASSETS_DIR = 'sduck-assets';
export const SDUCK_WORKSPACE_DIR = 'sduck-workspace';
export const SDUCK_ARCHIVE_DIR = 'sduck-archive';

export const PROJECT_SDUCK_HOME_RELATIVE_PATH = SDUCK_HOME_DIR;
export const PROJECT_SDUCK_ASSETS_RELATIVE_PATH = join(SDUCK_HOME_DIR, SDUCK_ASSETS_DIR);
export const PROJECT_SDUCK_WORKSPACE_RELATIVE_PATH = join(SDUCK_HOME_DIR, SDUCK_WORKSPACE_DIR);
export const PROJECT_SDUCK_ARCHIVE_RELATIVE_PATH = join(SDUCK_HOME_DIR, SDUCK_ARCHIVE_DIR);

export function getProjectSduckHomePath(projectRoot: string): string {
  return join(projectRoot, PROJECT_SDUCK_HOME_RELATIVE_PATH);
}

export function getProjectSduckAssetsPath(projectRoot: string): string {
  return join(projectRoot, PROJECT_SDUCK_ASSETS_RELATIVE_PATH);
}

export function getProjectSduckWorkspacePath(projectRoot: string): string {
  return join(projectRoot, PROJECT_SDUCK_WORKSPACE_RELATIVE_PATH);
}

export function getProjectSduckArchivePath(projectRoot: string): string {
  return join(projectRoot, PROJECT_SDUCK_ARCHIVE_RELATIVE_PATH);
}

export function getProjectRelativeSduckAssetPath(...segments: string[]): string {
  return join(PROJECT_SDUCK_ASSETS_RELATIVE_PATH, ...segments);
}

export function getProjectRelativeSduckWorkspacePath(...segments: string[]): string {
  return join(PROJECT_SDUCK_WORKSPACE_RELATIVE_PATH, ...segments);
}

export function toBundledAssetRelativePath(projectRelativeAssetPath: string): string {
  return relative(PROJECT_SDUCK_ASSETS_RELATIVE_PATH, projectRelativeAssetPath);
}
