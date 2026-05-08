import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import {
  getBundledAssetsRoot,
  isSupportedTaskType,
  resolveSpecTemplateRelativePath,
  type SupportedTaskType,
} from './assets.js';
import { getFsEntryKind } from './fs.js';
import { allocateGitResource } from './git-resource.js';
import { ensureGitignoreEntries } from './gitignore.js';
import {
  getProjectRelativeSduckWorkspacePath,
  getProjectSduckArchivePath,
  getProjectSduckHomePath,
  getProjectSduckWorkspacePath,
  SDUCK_WORKTREES_DIR,
} from './project-paths.js';
import { writeCurrentWorkId } from './state.js';
import { refreshAgentContextBestEffort } from './task-lifecycle.js';
import { createInitialTaskMeta, renderTaskMeta } from './task-meta.js';
import { formatUtcDate, formatUtcTimestamp } from '../utils/utc-date.js';

export interface StartCommandInput {
  type: SupportedTaskType;
  slug: string;
}

export interface StartExecutionResult {
  gitignoreWarning: string | undefined;
  workspaceId: string;
  workspacePath: string;
  status: 'PENDING_SPEC_APPROVAL';
}

export function normalizeSlug(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[_\s]+/g, '-')
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function validateSlug(slug: string): void {
  if (slug === '') {
    throw new Error('Invalid slug: slug cannot be empty after normalization.');
  }

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new Error('Invalid slug: use lowercase kebab-case only.');
  }
}

export function createWorkspaceId(date: Date, type: SupportedTaskType, slug: string): string {
  const year = String(date.getUTCFullYear());
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const hour = String(date.getUTCHours()).padStart(2, '0');
  const minute = String(date.getUTCMinutes()).padStart(2, '0');

  return `${year}${month}${day}-${hour}${minute}-${type}-${slug}`;
}

async function existsInArchive(projectRoot: string, id: string): Promise<boolean> {
  const archivePath = getProjectSduckArchivePath(projectRoot);

  if ((await getFsEntryKind(archivePath)) !== 'directory') {
    return false;
  }

  const months = await readdir(archivePath, { withFileTypes: true });

  for (const month of months) {
    if (!month.isDirectory()) {
      continue;
    }

    const candidatePath = join(archivePath, month.name, id);

    if ((await getFsEntryKind(candidatePath)) !== 'missing') {
      return true;
    }
  }

  return false;
}

export async function resolveUniqueWorkspaceId(
  projectRoot: string,
  baseId: string,
): Promise<string> {
  const workspacePath = getProjectRelativeSduckWorkspacePath(baseId);
  const absolutePath = join(projectRoot, workspacePath);

  if (
    (await getFsEntryKind(absolutePath)) === 'missing' &&
    !(await existsInArchive(projectRoot, baseId))
  ) {
    return baseId;
  }

  for (let suffix = 2; suffix <= 100; suffix += 1) {
    const candidateId = `${baseId}-${String(suffix)}`;
    const candidatePath = join(projectRoot, getProjectRelativeSduckWorkspacePath(candidateId));

    if (
      (await getFsEntryKind(candidatePath)) === 'missing' &&
      !(await existsInArchive(projectRoot, candidateId))
    ) {
      return candidateId;
    }
  }

  throw new Error(`Cannot resolve unique workspace id for ${baseId}: too many collisions.`);
}

export async function resolveSpecTemplatePath(type: SupportedTaskType): Promise<string> {
  const assetsRoot = await getBundledAssetsRoot();
  return join(assetsRoot, resolveSpecTemplateRelativePath(type));
}

function applyTemplateDefaults(
  template: string,
  type: SupportedTaskType,
  slug: string,
  currentDate: Date,
): string {
  const displayName = slug.replace(/-/g, ' ');

  return template
    .replace(/\{기능명\}/g, displayName)
    .replace(/\{버그 요약 한 줄\}/g, displayName)
    .replace(/YYYY-MM-DD/g, formatUtcDate(currentDate))
    .replace(/> \*\*작성자:\*\*\s*$/m, '> **작성자:** taehee')
    .replace(/> \*\*연관 티켓:\*\*\s*$/m, '> **연관 티켓:** -')
    .replace(/^# \[(feature|fix|refactor|chore|build)\] .*/m, `# [${type}] ${displayName}`);
}

export interface StartTaskOptions {
  noGit?: boolean;
}

export async function startTask(
  rawType: string,
  rawSlug: string,
  projectRoot: string,
  currentDate = new Date(),
  options?: StartTaskOptions,
): Promise<StartExecutionResult> {
  if (!isSupportedTaskType(rawType)) {
    throw new Error(`Unsupported type: ${rawType}`);
  }

  const slug = normalizeSlug(rawSlug);
  validateSlug(slug);

  const baseId = createWorkspaceId(currentDate, rawType, slug);
  const workspaceId = await resolveUniqueWorkspaceId(projectRoot, baseId);
  const workspacePath = getProjectRelativeSduckWorkspacePath(workspaceId);
  const absoluteWorkspacePath = join(projectRoot, workspacePath);

  const workspaceRoot = getProjectSduckWorkspacePath(projectRoot);
  await mkdir(workspaceRoot, { recursive: true });
  await mkdir(absoluteWorkspacePath, { recursive: false });

  let gitResource;

  try {
    gitResource = await allocateGitResource(projectRoot, workspaceId, rawType, slug, options);
  } catch (error) {
    await rm(absoluteWorkspacePath, { recursive: true, force: true });
    throw error;
  }

  const templatePath = await resolveSpecTemplatePath(rawType);
  if ((await getFsEntryKind(templatePath)) !== 'file') {
    throw new Error(`Missing spec template for type '${rawType}' at ${templatePath}`);
  }

  const specTemplate = await readFile(templatePath, 'utf8');
  const specContent = applyTemplateDefaults(specTemplate, rawType, slug, currentDate);
  const timestamp = formatUtcTimestamp(currentDate);
  const metaContent = renderTaskMeta(
    createInitialTaskMeta({
      baseBranch: gitResource.baseBranch,
      branch: gitResource.branch,
      createdAt: timestamp,
      id: workspaceId,
      slug,
      type: rawType,
      updatedAt: timestamp,
      worktreePath: gitResource.worktreePath,
    }),
  );

  await writeFile(join(absoluteWorkspacePath, 'meta.yml'), metaContent, 'utf8');
  await writeFile(join(absoluteWorkspacePath, 'spec.md'), specContent, 'utf8');
  await writeFile(join(absoluteWorkspacePath, 'plan.md'), '', 'utf8');

  // Ensure .sduck/ exists and update state
  const sduckHome = getProjectSduckHomePath(projectRoot);
  await mkdir(sduckHome, { recursive: true });
  await writeCurrentWorkId(projectRoot, workspaceId, currentDate);

  await refreshAgentContextBestEffort(projectRoot, workspaceId);

  // Update .gitignore (non-fatal)
  const gitignoreResult = await ensureGitignoreEntries(projectRoot, [
    `${SDUCK_WORKTREES_DIR}/`,
    '.sduck/sduck-state.yml',
  ]);

  return {
    gitignoreWarning: gitignoreResult.warning,
    workspaceId,
    workspacePath,
    status: 'PENDING_SPEC_APPROVAL',
  };
}
