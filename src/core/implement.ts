import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

import { writeAgentContext } from './agent-context.js';
import { getFsEntryKind } from './fs.js';
import { getProjectRelativeSduckWorkspacePath } from './project-paths.js';
import { readCurrentWorkId, throwNoCurrentWorkError } from './state.js';
import { resolveUseTarget } from './use.js';
import { parseMetaText } from './workspace.js';

export interface ImplementContext {
  baseBranch: string | null;
  branch: string | null;
  id: string;
  planPath: string;
  specPath: string;
  status: string;
  worktreePath: string | null;
  workspacePath: string;
}

export async function resolveImplementContext(
  projectRoot: string,
  target?: string,
): Promise<ImplementContext> {
  let workId: string;

  if (target !== undefined) {
    const work = await resolveUseTarget(projectRoot, target);
    workId = work.id;
  } else {
    const currentWorkId = await readCurrentWorkId(projectRoot);

    if (currentWorkId === null) {
      throwNoCurrentWorkError('implement');
    }

    workId = currentWorkId;
  }

  const workspacePath = getProjectRelativeSduckWorkspacePath(workId);
  const absolutePath = join(projectRoot, workspacePath);

  if ((await getFsEntryKind(absolutePath)) !== 'directory') {
    throw new Error(
      `Current work ${workId} not found in workspace. It may have been archived or removed.`,
    );
  }

  const metaPath = join(absolutePath, 'meta.yml');

  if ((await getFsEntryKind(metaPath)) !== 'file') {
    throw new Error(`Missing meta.yml for work ${workId}.`);
  }

  const metaContent = await readFile(metaPath, 'utf8');
  const meta = parseMetaText(metaContent);

  const contextPath = join(absolutePath, 'agent-context.json');
  if ((await getFsEntryKind(contextPath)) !== 'file') {
    await writeAgentContext(projectRoot, workId);
  }

  return {
    baseBranch: meta.baseBranch ?? null,
    branch: meta.branch ?? null,
    id: workId,
    planPath: join(workspacePath, 'plan.md'),
    specPath: join(workspacePath, 'spec.md'),
    status: meta.status ?? 'UNKNOWN',
    worktreePath: meta.worktreePath ?? null,
    workspacePath,
  };
}

export function formatImplementOutput(context: ImplementContext): string {
  const branchDisplay = context.branch ?? '(none)';
  const worktreeDisplay = context.worktreePath ?? '(none)';
  const lines = [
    `Work ID:      ${context.id}`,
    `Branch:       ${branchDisplay}`,
    `Worktree:     ${worktreeDisplay}`,
    `Spec:         ${context.specPath}`,
    `Plan:         ${context.planPath}`,
    `Context File: ${context.workspacePath}/agent-context.json`,
    '',
  ];

  if (context.worktreePath !== null) {
    lines.push(
      '다음 명령으로 코딩 에이전트를 시작하세요:',
      `  cd ${context.worktreePath}`,
      '  claude  # 또는 opencode / codex',
    );
  }

  return lines.join('\n');
}
