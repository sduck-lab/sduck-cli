import * as fs from 'node:fs';
import * as path from 'node:path';

import { V2ExpectedError } from './errors.js';
import { policyPath } from './paths.js';
import { loadSourceBundle } from './source-store.js';
import { readState, validateDecisionState } from './state.js';
import { withDecisionWorkspaceLock } from './workspace-lock.js';

export interface DecisionWorkspacePolicy {
  schemaVersion: 'v2alpha1';
  requireGrillMe: boolean;
  workflowEnabled: boolean;
  wiki?: WikiPolicy;
}

export interface WikiPolicy {
  enabled: boolean;
  root: typeof DEFAULT_WIKI_ROOT;
}

export interface WikiPolicyStatus {
  enabled: boolean;
  initialized: boolean;
  root: typeof DEFAULT_WIKI_ROOT;
  policyPath: string;
}

export const DEFAULT_WIKI_ROOT = 'docs/wiki' as const;
export const DEFAULT_WIKI_POLICY: WikiPolicy = { enabled: true, root: DEFAULT_WIKI_ROOT };

const DEFAULT_POLICY_WITHOUT_WIKI: DecisionWorkspacePolicy = {
  schemaVersion: 'v2alpha1',
  requireGrillMe: true,
  workflowEnabled: true,
};

export const DEFAULT_REQUIRED_POLICY: DecisionWorkspacePolicy = {
  ...DEFAULT_POLICY_WITHOUT_WIKI,
  wiki: DEFAULT_WIKI_POLICY,
};

export interface WorkflowStatusView {
  enabled: boolean;
  initialized: boolean;
  policyPath: string;
}

export function writeDefaultPolicy(projectRoot: string): string {
  const target = policyPath(projectRoot);
  writeAtomicDurable(target, `${JSON.stringify(DEFAULT_REQUIRED_POLICY, null, 2)}\n`);
  return target;
}

export function readDecisionWorkspacePolicy(projectRoot: string): DecisionWorkspacePolicy | null {
  const target = policyPath(projectRoot);
  if (!fs.existsSync(target)) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(fs.readFileSync(target, 'utf8')) as unknown;
  } catch (error) {
    throw new V2ExpectedError('POLICY_JSON_INVALID', {
      detail: error instanceof Error ? error.message : String(error),
    });
  }
  if (typeof parsed !== 'object' || parsed === null) {
    throw new V2ExpectedError('POLICY_INVALID', { problemCode: 'json-object' });
  }
  const raw = parsed as Record<string, unknown>;
  if (raw['schemaVersion'] !== 'v2alpha1') {
    throw new V2ExpectedError('POLICY_INVALID', { problemCode: 'unsupported-schema-version' });
  }
  if (typeof raw['requireGrillMe'] !== 'boolean') {
    throw new V2ExpectedError('POLICY_INVALID', {
      field: 'requireGrillMe',
      problemCode: 'boolean',
    });
  }
  if (raw['workflowEnabled'] !== undefined && typeof raw['workflowEnabled'] !== 'boolean') {
    throw new V2ExpectedError('POLICY_INVALID', {
      field: 'workflowEnabled',
      problemCode: 'boolean',
    });
  }
  if (raw['wiki'] !== undefined) {
    if (typeof raw['wiki'] !== 'object' || raw['wiki'] === null || Array.isArray(raw['wiki'])) {
      throw new V2ExpectedError('POLICY_INVALID', {
        field: 'wiki',
        problemCode: 'json-object',
      });
    }
    const wiki = raw['wiki'] as Record<string, unknown>;
    if (typeof wiki['enabled'] !== 'boolean') {
      throw new V2ExpectedError('POLICY_INVALID', {
        field: 'wiki.enabled',
        problemCode: 'boolean',
      });
    }
    if (wiki['root'] !== DEFAULT_WIKI_ROOT) {
      throw new V2ExpectedError('POLICY_INVALID', {
        field: 'wiki.root',
        problemCode: 'unsupported-enum-value',
      });
    }
  }
  return {
    schemaVersion: 'v2alpha1',
    requireGrillMe: raw['requireGrillMe'],
    workflowEnabled: raw['workflowEnabled'] ?? true,
    ...(raw['wiki'] === undefined ? {} : { wiki: raw['wiki'] as WikiPolicy }),
  };
}

export function readWikiPolicyStatus(projectRoot: string): WikiPolicyStatus {
  const policy = readDecisionWorkspacePolicy(projectRoot);
  return {
    enabled: policy?.wiki?.enabled === true,
    initialized: policy?.wiki !== undefined,
    root: policy?.wiki?.root ?? DEFAULT_WIKI_ROOT,
    policyPath: policyPath(projectRoot),
  };
}

export function assertWikiEnabled(projectRoot: string): void {
  if (!readWikiPolicyStatus(projectRoot).enabled) {
    throw new Error('Wiki is not enabled for this durable workspace. Run `sduck update` first.');
  }
}

export function migrateWikiPolicy(projectRoot: string): WikiPolicyStatus {
  return withDecisionWorkspaceLock(projectRoot, () => {
    const existing = readDecisionWorkspacePolicy(projectRoot);
    if (existing?.wiki !== undefined) return readWikiPolicyStatus(projectRoot);
    const legacyCompatible: DecisionWorkspacePolicy = existing ?? {
      schemaVersion: 'v2alpha1',
      requireGrillMe: false,
      workflowEnabled: true,
    };
    writeAtomicDurable(
      policyPath(projectRoot),
      `${JSON.stringify({ ...legacyCompatible, wiki: DEFAULT_WIKI_POLICY }, null, 2)}\n`,
    );
    return readWikiPolicyStatus(projectRoot);
  });
}

export function resolveTaskCreationPolicy(projectRoot: string): { grillMeRequired: boolean } {
  return { grillMeRequired: readDecisionWorkspacePolicy(projectRoot)?.requireGrillMe === true };
}

export function assertWorkflowEnabledForTaskCreation(projectRoot: string): void {
  if (readDecisionWorkspacePolicy(projectRoot)?.workflowEnabled === false) {
    throw new V2ExpectedError('WORKFLOW_DISABLED');
  }
}

export function getWorkflowStatus(projectRoot: string): WorkflowStatusView {
  const policy = readDecisionWorkspacePolicy(projectRoot);
  return {
    enabled: policy?.workflowEnabled ?? true,
    initialized: policy !== null,
    policyPath: policyPath(projectRoot),
  };
}

export function setWorkflowEnabled(projectRoot: string, enabled: boolean): WorkflowStatusView {
  return withDecisionWorkspaceLock(projectRoot, () => {
    const policy = readDecisionWorkspacePolicy(projectRoot) ?? DEFAULT_POLICY_WITHOUT_WIKI;
    const state = readState(projectRoot);
    const bundle = loadSourceBundle(projectRoot);
    validateDecisionState(state, bundle);
    if (state.currentTaskId !== null) {
      const task = bundle.tasks.find((item) => item.id === state.currentTaskId);
      if (
        task !== undefined &&
        (task.status === 'OPEN' || task.status === 'BRIEF_READY' || task.status === 'CONFIRMED')
      ) {
        throw new V2ExpectedError('WORKFLOW_TOGGLE_ACTIVE_TASK', {
          taskId: task.id,
          status: task.status,
        });
      }
    }
    writeAtomicDurable(
      policyPath(projectRoot),
      `${JSON.stringify({ ...policy, workflowEnabled: enabled }, null, 2)}\n`,
    );
    return getWorkflowStatus(projectRoot);
  });
}

function writeAtomicDurable(filePath: string, content: string): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const tmp = `${filePath}.${String(process.pid)}.${String(Date.now())}.tmp`;
  const fd = fs.openSync(tmp, 'w');
  try {
    fs.writeFileSync(fd, content);
    fs.fsyncSync(fd);
  } finally {
    fs.closeSync(fd);
  }
  fs.renameSync(tmp, filePath);
  fsyncDirectory(path.dirname(filePath));
}

function fsyncDirectory(dir: string): void {
  let fd: number | null = null;
  try {
    fd = fs.openSync(dir, 'r');
    fs.fsyncSync(fd);
  } catch {
    // Best-effort directory fsync; some filesystems/platforms reject it.
  } finally {
    if (fd !== null) fs.closeSync(fd);
  }
}
