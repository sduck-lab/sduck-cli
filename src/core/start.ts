import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import {
  getBundledAssetsRoot,
  isSupportedTaskType,
  resolveSpecTemplateRelativePath,
  type SupportedTaskType,
} from './assets.js';
import { getFsEntryKind } from './fs.js';
import {
  getProjectRelativeSduckWorkspacePath,
  getProjectSduckWorkspacePath,
} from './project-paths.js';
import { findActiveTask, type ActiveTaskSummary } from './workspace.js';
import { formatUtcDate, formatUtcTimestamp } from '../utils/utc-date.js';

export interface StartCommandInput {
  type: SupportedTaskType;
  slug: string;
}

export interface StartExecutionResult {
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

export function renderInitialMeta(input: {
  createdAt: string;
  id: string;
  slug: string;
  type: SupportedTaskType;
}): string {
  return [
    `id: ${input.id}`,
    `type: ${input.type}`,
    `slug: ${input.slug}`,
    `created_at: ${input.createdAt}`,
    '',
    'status: PENDING_SPEC_APPROVAL',
    '',
    'spec:',
    '  approved: false',
    '  approved_at: null',
    '',
    'plan:',
    '  approved: false',
    '  approved_at: null',
    '',
    'steps:',
    '  total: null',
    '  completed: []',
    '',
    'completed_at: null',
    '',
  ].join('\n');
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

export async function startTask(
  rawType: string,
  rawSlug: string,
  projectRoot: string,
  currentDate = new Date(),
): Promise<StartExecutionResult> {
  if (!isSupportedTaskType(rawType)) {
    throw new Error(`Unsupported type: ${rawType}`);
  }

  const slug = normalizeSlug(rawSlug);
  validateSlug(slug);

  const activeTask = await findActiveTask(projectRoot);

  if (activeTask !== null) {
    throw new Error(
      `Active task exists: ${activeTask.id} (${activeTask.status}) at ${activeTask.path}. Finish or approve it before starting a new task.`,
    );
  }

  const workspaceId = createWorkspaceId(currentDate, rawType, slug);
  const workspacePath = getProjectRelativeSduckWorkspacePath(workspaceId);
  const absoluteWorkspacePath = join(projectRoot, workspacePath);

  if ((await getFsEntryKind(absoluteWorkspacePath)) !== 'missing') {
    throw new Error(`Workspace already exists: ${workspacePath}`);
  }

  const workspaceRoot = getProjectSduckWorkspacePath(projectRoot);
  await mkdir(workspaceRoot, { recursive: true });
  await mkdir(absoluteWorkspacePath, { recursive: false });

  const templatePath = await resolveSpecTemplatePath(rawType);
  if ((await getFsEntryKind(templatePath)) !== 'file') {
    throw new Error(`Missing spec template for type '${rawType}' at ${templatePath}`);
  }

  const specTemplate = await readFile(templatePath, 'utf8');
  const specContent = applyTemplateDefaults(specTemplate, rawType, slug, currentDate);
  const metaContent = renderInitialMeta({
    createdAt: formatUtcTimestamp(currentDate),
    id: workspaceId,
    slug,
    type: rawType,
  });

  await writeFile(join(absoluteWorkspacePath, 'meta.yml'), metaContent, 'utf8');
  await writeFile(join(absoluteWorkspacePath, 'spec.md'), specContent, 'utf8');
  await writeFile(join(absoluteWorkspacePath, 'plan.md'), '', 'utf8');

  return {
    workspaceId,
    workspacePath,
    status: 'PENDING_SPEC_APPROVAL',
  };
}

export type { ActiveTaskSummary };
