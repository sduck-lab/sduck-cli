import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { getFsEntryKind } from './fs.js';
import { getProjectRelativeSduckWorkspacePath } from './project-paths.js';
import { parseMetaText, type ParsedMeta } from './workspace.js';

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

function parseStepsBlock(content: string): { total: number | null; completed: number[] } {
  const totalMatch = /^ {2}total:[ \t]+(.+)$/m.exec(content);
  const completedMatch = /^ {2}completed:[ \t]+\[(.+)\]$/m.exec(content);

  let total: number | null = null;
  const completed: number[] = [];

  if (totalMatch?.[1] !== undefined) {
    const trimmed = totalMatch[1].trim();
    if (trimmed !== 'null') {
      total = Number.parseInt(trimmed, 10);
      if (Number.isNaN(total)) {
        total = null;
      }
    }
  }

  if (completedMatch?.[1] !== undefined) {
    const trimmed = completedMatch[1].trim();
    if (trimmed !== '') {
      for (const item of trimmed.split(',')) {
        const num = Number.parseInt(item.trim(), 10);
        if (!Number.isNaN(num)) {
          completed.push(num);
        }
      }
    }
  }

  return { completed, total };
}

function parseApprovalBlocks(content: string): { planApproved: boolean; specApproved: boolean } {
  const sections = content.split(/^plan:/m);
  const specSection = sections[0] ?? '';
  const planSection = sections[1] ?? '';

  const specApprovedMatch = /^ {2}approved:[ \t]+(.+)$/m.exec(specSection);
  const planApprovedMatch = /^ {2}approved:[ \t]+(.+)$/m.exec(planSection);

  const specApproved = specApprovedMatch?.[1]?.trim() === 'true';
  const planApproved = planApprovedMatch?.[1]?.trim() === 'true';

  return { planApproved, specApproved };
}

export function renderAgentContext(
  meta: ParsedMeta,
  projectRoot: string,
  metaContent: string,
): AgentContext {
  const id = meta.id ?? 'unknown';
  const workspacePath = getProjectRelativeSduckWorkspacePath(id);

  return {
    baseBranch: meta.baseBranch ?? null,
    branch: meta.branch ?? null,
    createdAt: meta.createdAt ?? '',
    id,
    planApproved: parseApprovalBlocks(metaContent).planApproved,
    planPath: join(workspacePath, 'plan.md'),
    reviewPath: join(workspacePath, 'review.md'),
    slug: meta.slug ?? '',
    specApproved: parseApprovalBlocks(metaContent).specApproved,
    specPath: join(workspacePath, 'spec.md'),
    status: meta.status ?? 'UNKNOWN',
    steps: parseStepsBlock(metaContent),
    type: meta.type ?? 'unknown',
    updatedAt: meta.updatedAt ?? '',
    worktreeAbsolutePath:
      meta.worktreePath !== undefined ? join(projectRoot, meta.worktreePath) : null,
    worktreePath: meta.worktreePath ?? null,
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
    const meta = parseMetaText(metaContent);
    const context = renderAgentContext(meta, projectRoot, metaContent);

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
