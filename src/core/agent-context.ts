import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { getFsEntryKind } from './fs.js';
import { describeGitResource } from './git-resource.js';
import { getProjectRelativeSduckWorkspacePath } from './project-paths.js';
import { parseTaskMeta, type TaskMeta } from './task-meta.js';

export interface AgentContext {
  id: string;
  type: string;
  slug: string;
  status: string;
  branch: string | null;
  baseBranch: string | null;
  worktreePath: string | null;
  worktreeAbsolutePath: string | null;
  workspacePath: string;
  workspaceAbsolutePath: string;
  specPath: string;
  planPath: string;
  reviewPath: string;
  steps: {
    total: number | null;
    completed: number[];
  };
  specApproved: boolean;
  planApproved: boolean;
  createdAt: string;
  updatedAt: string;
}

export function renderAgentContext(meta: TaskMeta, projectRoot: string): AgentContext {
  const id = meta.id;
  const workspacePath = getProjectRelativeSduckWorkspacePath(id);
  const gitResource = describeGitResource(projectRoot, meta);

  return {
    baseBranch: meta.baseBranch,
    branch: meta.branch,
    createdAt: meta.createdAt,
    id,
    planApproved: meta.plan.approved,
    planPath: join(workspacePath, 'plan.md'),
    reviewPath: join(workspacePath, 'review.md'),
    slug: meta.slug,
    specApproved: meta.spec.approved,
    specPath: join(workspacePath, 'spec.md'),
    status: meta.status,
    steps: meta.steps,
    type: meta.type,
    updatedAt: meta.updatedAt,
    worktreeAbsolutePath: gitResource.worktreeAbsolutePath,
    worktreePath: gitResource.worktreePath,
    workspaceAbsolutePath: join(projectRoot, workspacePath),
    workspacePath,
  };
}

export async function writeAgentContext(projectRoot: string, workId: string): Promise<void> {
  try {
    const workspacePath = getProjectRelativeSduckWorkspacePath(workId);
    const absoluteWorkspacePath = join(projectRoot, workspacePath);
    const metaPath = join(absoluteWorkspacePath, 'meta.yml');

    if ((await getFsEntryKind(metaPath)) !== 'file') {
      return;
    }

    const metaContent = await readFile(metaPath, 'utf8');
    const meta = parseTaskMeta(metaContent);
    const context = renderAgentContext(meta, projectRoot);

    const contextPath = join(absoluteWorkspacePath, 'agent-context.json');
    await writeFile(contextPath, JSON.stringify(context, null, 2), 'utf8');
  } catch {
    // non-fatal
  }
}

export async function readAgentContext(
  projectRoot: string,
  workId: string,
): Promise<AgentContext | null> {
  try {
    const workspacePath = getProjectRelativeSduckWorkspacePath(workId);
    const absoluteWorkspacePath = join(projectRoot, workspacePath);
    const contextPath = join(absoluteWorkspacePath, 'agent-context.json');

    if ((await getFsEntryKind(contextPath)) !== 'file') {
      return null;
    }

    const content = await readFile(contextPath, 'utf8');
    return JSON.parse(content) as AgentContext;
  } catch {
    return null;
  }
}
