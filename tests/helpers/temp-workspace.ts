import { mkdir, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve, sep } from 'node:path';

const PROJECT_TEST_WORKSPACE_ROOT_SEGMENTS = ['test', 'workspaces'];
const SYSTEM_TEST_WORKSPACE_ROOT = join(tmpdir(), 'sduck-cli-tests');

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
  await mkdir(SYSTEM_TEST_WORKSPACE_ROOT, { recursive: true });
  return await mkdtemp(join(SYSTEM_TEST_WORKSPACE_ROOT, prefix.replaceAll('/', '-')));
}

export async function removeTempWorkspace(path: string): Promise<void> {
  const normalizedRoot = `${resolve(SYSTEM_TEST_WORKSPACE_ROOT)}${sep}`;
  if (!resolve(path).startsWith(normalizedRoot)) {
    throw new Error(`Refusing to remove workspace outside ${SYSTEM_TEST_WORKSPACE_ROOT}`);
  }
  await rm(path, { force: true, recursive: true });
}
