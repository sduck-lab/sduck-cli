import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { extractGatingUncheckedItems, extractTaskEvalCriteriaLabels } from './done.js';
import { getFsEntryKind } from './fs.js';
import { getProjectRelativeSduckAssetPath } from './project-paths.js';
import { assertTransition, refreshAgentContextBestEffort } from './task-lifecycle.js';
import { markReviewReadyInMeta, patchTaskMeta, readTaskMeta, type TaskMeta } from './task-meta.js';
import { resolveTaskTarget } from './task-target.js';

import type { WorkspaceTaskSummary } from './workspace.js';

function validateStepsComplete(workId: string, meta: TaskMeta): void {
  if (meta.steps.total === null) {
    throw new Error(
      `Cannot mark work ${workId} as review ready: no steps defined. Ensure plan.md has valid Step headers and run \`sduck step done <N>\` to complete them.`,
    );
  }

  const totalSteps = meta.steps.total;
  const completedSteps = meta.steps.completed;

  if (completedSteps.length < totalSteps) {
    const missing: number[] = [];

    for (let step = 1; step <= totalSteps; step += 1) {
      if (!completedSteps.includes(step)) {
        missing.push(step);
      }
    }

    throw new Error(
      `Cannot mark work ${workId} as review ready: steps are incomplete (missing: ${missing.join(', ')}). Run \`sduck step done <N>\` for each missing step.`,
    );
  }
}

function validateSpecChecklist(workId: string, specContent: string): void {
  const uncheckedItems = extractGatingUncheckedItems(specContent);

  if (uncheckedItems.length > 0) {
    throw new Error(
      `Cannot mark work ${workId} as review ready: spec checklist has ${String(uncheckedItems.length)} unchecked item(s): ${uncheckedItems.slice(0, 5).join('; ')}${uncheckedItems.length > 5 ? '; ...' : ''}`,
    );
  }
}

function renderReviewTemplate(workId: string, criteria: readonly string[]): string {
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
    '## Task evaluation',
    '',
    ...criteria.map((criterion) => `- ${criterion}: <1-5> — <evidence>`),
    '',
  ].join('\n');
}

async function loadTaskEvalCriteria(projectRoot: string): Promise<string[]> {
  const relativePath = getProjectRelativeSduckAssetPath('eval', 'task.yml');
  const filePath = join(projectRoot, relativePath);
  if ((await getFsEntryKind(filePath)) !== 'file') return [];
  return extractTaskEvalCriteriaLabels(await readFile(filePath, 'utf8'));
}

export async function resolveReviewTarget(
  projectRoot: string,
  target?: string,
): Promise<WorkspaceTaskSummary> {
  return await resolveTaskTarget(projectRoot, {
    allowedStatuses: ['IN_PROGRESS'],
    commandName: 'review ready',
    fallback: 'current',
    target,
  });
}

export async function runReviewReadyWorkflow(
  projectRoot: string,
  target?: string,
  date = new Date(),
): Promise<{ workId: string }> {
  const work = await resolveReviewTarget(projectRoot, target);
  assertTransition(work.status, 'mark-review-ready', work.id);
  const metaPath = join(projectRoot, work.path, 'meta.yml');

  if ((await getFsEntryKind(metaPath)) !== 'file') {
    throw new Error(`Missing meta.yml for work ${work.id}.`);
  }

  const meta = await readTaskMeta(metaPath);
  validateStepsComplete(work.id, meta);

  const specPath = join(projectRoot, work.path, 'spec.md');

  if ((await getFsEntryKind(specPath)) === 'file') {
    const specContent = await readFile(specPath, 'utf8');
    validateSpecChecklist(work.id, specContent);
  }

  const reviewPath = join(projectRoot, work.path, 'review.md');

  if ((await getFsEntryKind(reviewPath)) !== 'file') {
    await writeFile(
      reviewPath,
      renderReviewTemplate(work.id, await loadTaskEvalCriteria(projectRoot)),
      'utf8',
    );
  }
  await patchTaskMeta(metaPath, (currentMeta) => markReviewReadyInMeta(currentMeta, date));

  await refreshAgentContextBestEffort(projectRoot, work.id);

  return { workId: work.id };
}
