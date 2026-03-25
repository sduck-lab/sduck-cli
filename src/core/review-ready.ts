import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { writeAgentContext } from './agent-context.js';
import { getFsEntryKind } from './fs.js';
import { readCurrentWorkId, throwNoCurrentWorkError } from './state.js';
import { listWorkspaceTasks, type WorkspaceTaskSummary } from './workspace.js';
import { formatUtcTimestamp } from '../utils/utc-date.js';

function renderReviewTemplate(workId: string): string {
  return [
    `# Review: ${workId}`,
    '',
    '## 변경 요약',
    '',
    '- ',
    '',
    '## 테스트 결과',
    '',
    '- ',
    '',
    '## 리뷰 체크리스트',
    '',
    '- [ ] 코드 품질 확인',
    '- [ ] 테스트 통과 확인',
    '- [ ] 문서 업데이트 확인',
    '',
  ].join('\n');
}

export async function resolveReviewTarget(
  projectRoot: string,
  target?: string,
): Promise<WorkspaceTaskSummary> {
  const tasks = await listWorkspaceTasks(projectRoot);

  if (target !== undefined && target.trim() !== '') {
    const trimmed = target.trim();

    // id exact match first
    const idMatch = tasks.find((task) => task.id === trimmed);

    if (idMatch !== undefined) {
      if (idMatch.status !== 'IN_PROGRESS') {
        throw new Error(
          `Cannot mark work ${idMatch.id} as review ready: status is ${idMatch.status}, expected IN_PROGRESS.`,
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

      if (match.status !== 'IN_PROGRESS') {
        throw new Error(
          `Cannot mark work ${match.id} as review ready: status is ${match.status}, expected IN_PROGRESS.`,
        );
      }

      return match;
    }

    if (slugMatches.length > 1) {
      const candidates = slugMatches.map((task) => task.id).join(', ');
      throw new Error(
        `Multiple works match slug '${trimmed}': ${candidates}. Use \`sduck review ready <id>\` to specify.`,
      );
    }

    throw new Error(`No work matches '${trimmed}'.`);
  }

  // No target: use current work
  const currentWorkId = await readCurrentWorkId(projectRoot);

  if (currentWorkId === null) {
    throwNoCurrentWorkError('review ready');
  }

  const match = tasks.find((task) => task.id === currentWorkId);

  if (match === undefined) {
    throw new Error(`Current work ${currentWorkId} not found in workspace.`);
  }

  if (match.status !== 'IN_PROGRESS') {
    throw new Error(
      `Cannot mark work ${match.id} as review ready: status is ${match.status}, expected IN_PROGRESS.`,
    );
  }

  return match;
}

export async function runReviewReadyWorkflow(
  projectRoot: string,
  target?: string,
  date = new Date(),
): Promise<{ workId: string }> {
  const work = await resolveReviewTarget(projectRoot, target);
  const reviewPath = join(projectRoot, work.path, 'review.md');

  // Only create review.md if it doesn't exist
  if ((await getFsEntryKind(reviewPath)) !== 'file') {
    await writeFile(reviewPath, renderReviewTemplate(work.id), 'utf8');
  }

  // Update status after file creation succeeds
  const metaPath = join(projectRoot, work.path, 'meta.yml');

  if ((await getFsEntryKind(metaPath)) !== 'file') {
    throw new Error(`Missing meta.yml for work ${work.id}.`);
  }

  const metaContent = await readFile(metaPath, 'utf8');
  const updatedContent = metaContent
    .replace(/^status:\s+.+$/m, 'status: REVIEW_READY')
    .replace(/^updated_at:\s+.+$/m, `updated_at: ${formatUtcTimestamp(date)}`);

  await writeFile(metaPath, updatedContent, 'utf8');

  try {
    await writeAgentContext(projectRoot, work.id);
  } catch {
    // non-fatal
  }

  return { workId: work.id };
}
