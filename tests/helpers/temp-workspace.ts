import { mkdir, rm } from 'node:fs/promises';
import { resolve, sep } from 'node:path';

const PROJECT_TEST_WORKSPACE_ROOT_SEGMENTS = ['test', 'workspaces'];

function getProjectTestWorkspaceRoot(cliRoot: string): string {
  return resolve(cliRoot, ...PROJECT_TEST_WORKSPACE_ROOT_SEGMENTS);
}

function assertInsideProjectTestRoot(cliRoot: string, workspacePath: string): void {
  const rootPath = getProjectTestWorkspaceRoot(cliRoot);
  const normalizedRootPath = `${rootPath}${sep}`;

  if (workspacePath !== rootPath && !workspacePath.startsWith(normalizedRootPath)) {
    throw new Error(`Refusing to modify workspace outside ${rootPath}`);
  }
}

export async function prepareProjectWorkspace(cliRoot: string, name: string): Promise<string> {
  const rootPath = getProjectTestWorkspaceRoot(cliRoot);
  const workspacePath = resolve(rootPath, name);

  assertInsideProjectTestRoot(cliRoot, workspacePath);
  await mkdir(rootPath, { recursive: true });
  await rm(workspacePath, { force: true, recursive: true });
  await mkdir(workspacePath, { recursive: true });

  return workspacePath;
}

export async function removeProjectWorkspace(cliRoot: string, name: string): Promise<void> {
  const workspacePath = resolve(getProjectTestWorkspaceRoot(cliRoot), name);

  assertInsideProjectTestRoot(cliRoot, workspacePath);
  await rm(workspacePath, { force: true, recursive: true });
}

export async function createTempWorkspace(prefix = 'sduck-'): Promise<string> {
  const cliRoot = process.cwd();
  const workspaceName = `${prefix}${String(Date.now())}-${Math.random().toString(36).slice(2, 8)}`;

  return await prepareProjectWorkspace(cliRoot, workspaceName);
}

export async function removeTempWorkspace(path: string): Promise<void> {
  assertInsideProjectTestRoot(process.cwd(), path);
  await rm(path, { force: true, recursive: true });
}
