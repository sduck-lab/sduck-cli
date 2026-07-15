import * as fs from 'node:fs';
import * as path from 'node:path';

import { V2ExpectedError } from './errors.js';
import { policyPath } from './paths.js';

export interface DecisionWorkspacePolicy {
  schemaVersion: 'v2alpha1';
  requireGrillMe: boolean;
}

export const DEFAULT_REQUIRED_POLICY: DecisionWorkspacePolicy = {
  schemaVersion: 'v2alpha1',
  requireGrillMe: true,
};

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
  return { schemaVersion: 'v2alpha1', requireGrillMe: raw['requireGrillMe'] };
}

export function resolveTaskCreationPolicy(projectRoot: string): { grillMeRequired: boolean } {
  return { grillMeRequired: readDecisionWorkspacePolicy(projectRoot)?.requireGrillMe === true };
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
