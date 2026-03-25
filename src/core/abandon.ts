import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { getFsEntryKind } from './fs.js';
import { readCurrentWorkId, writeCurrentWorkId } from './state.js';
import { listWorkspaceTasks, type WorkspaceTaskSummary } from './workspace.js';
import { formatUtcTimestamp } from '../utils/utc-date.js';

const ABANDONABLE_STATUSES = new Set([
  'PENDING_SPEC_APPROVAL',
  'PENDING_PLAN_APPROVAL',
  'IN_PROGRESS',
  'REVIEW_READY',
  'SPEC_APPROVED',
]);

export async function resolveAbandonTarget(
  projectRoot: string,
  target: string,
): Promise<WorkspaceTaskSummary> {
  const tasks = await listWorkspaceTasks(projectRoot);
  const trimmed = target.trim();

  // id exact match first
  const idMatch = tasks.find((task) => task.id === trimmed);

  if (idMatch !== undefined) {
    if (!ABANDONABLE_STATUSES.has(idMatch.status)) {
      throw new Error(
        `Cannot abandon work ${idMatch.id}: status is ${idMatch.status}. Only active works can be abandoned.`,
      );
    }

    return idMatch;
  }

  // slug exact match
  const slugMatches = tasks.filter((task) => task.slug === trimmed);

  if (slugMatches.length === 1) {
    const match = slugMatches[0];

    if (match === undefined) {
      throw new Error(`No work matches '${trimmed}'.`);
    }

    if (!ABANDONABLE_STATUSES.has(match.status)) {
      throw new Error(
        `Cannot abandon work ${match.id}: status is ${match.status}. Only active works can be abandoned.`,
      );
    }

    return match;
  }

  if (slugMatches.length > 1) {
    const candidates = slugMatches.map((task) => task.id).join(', ');
    throw new Error(
      `Multiple works match slug '${trimmed}': ${candidates}. Use \`sduck abandon <id>\` to specify.`,
    );
  }

  throw new Error(`No work matches '${trimmed}'.`);
}

export async function runAbandonWorkflow(
  projectRoot: string,
  target: string,
  date = new Date(),
): Promise<{ workId: string }> {
  const work = await resolveAbandonTarget(projectRoot, target);
  const metaPath = join(projectRoot, work.path, 'meta.yml');

  if ((await getFsEntryKind(metaPath)) !== 'file') {
    throw new Error(`Missing meta.yml for work ${work.id}.`);
  }

  const metaContent = await readFile(metaPath, 'utf8');
  const updatedContent = metaContent
    .replace(/^status:\s+.+$/m, 'status: ABANDONED')
    .replace(/^updated_at:\s+.+$/m, `updated_at: ${formatUtcTimestamp(date)}`);

  await writeFile(metaPath, updatedContent, 'utf8');

  // Clear current work if this was the current one
  const currentWorkId = await readCurrentWorkId(projectRoot);

  if (currentWorkId === work.id) {
    await writeCurrentWorkId(projectRoot, null, date);
  }

  return { workId: work.id };
}
