import * as fs from 'node:fs';
import * as path from 'node:path';

import { V2ExpectedError } from './errors.js';
import { decisionRoot } from './paths.js';

const LOCK_TIMEOUT_MS = 10_000;
const LOCK_RETRY_MS = 20;

export function withDecisionWorkspaceLock<T>(projectRoot: string, operation: () => T): T {
  fs.mkdirSync(decisionRoot(projectRoot), { recursive: true });
  const lockPath = path.join(decisionRoot(projectRoot), 'workspace.lock');
  const ownerPath = path.join(lockPath, 'owner.json');
  const token = `${String(process.pid)}-${Math.random().toString(36).slice(2)}`;
  const deadline = Date.now() + LOCK_TIMEOUT_MS;
  let acquired = false;

  while (!acquired) {
    try {
      fs.mkdirSync(lockPath);
      fs.writeFileSync(ownerPath, `${JSON.stringify({ pid: process.pid, token })}\n`);
      acquired = true;
    } catch (error) {
      if (!isAlreadyExists(error)) throw error;
      if (clearStaleLock(lockPath)) continue;
      if (Date.now() >= deadline) {
        throw new V2ExpectedError('WORKSPACE_LOCKED', { path: lockPath });
      }
      wait(LOCK_RETRY_MS);
    }
  }

  try {
    return operation();
  } finally {
    const owner = readLockOwner(ownerPath);
    if (owner?.token === token) fs.rmSync(lockPath, { force: true, recursive: true });
  }
}

function clearStaleLock(lockPath: string): boolean {
  try {
    const owner = readLockOwner(path.join(lockPath, 'owner.json'));
    if (owner !== null && Number.isInteger(owner.pid)) {
      try {
        process.kill(owner.pid, 0);
        return false;
      } catch (error) {
        if (!isMissingProcess(error)) return false;
      }
    }
    const ageMs = Date.now() - fs.statSync(lockPath).mtimeMs;
    if (owner === null && ageMs < 1_000) return false;
    fs.rmSync(lockPath, { force: true, recursive: true });
    return true;
  } catch (error) {
    return isMissing(error);
  }
}

function readLockOwner(ownerPath: string): { pid: number; token: string } | null {
  try {
    const parsed = JSON.parse(fs.readFileSync(ownerPath, 'utf8')) as unknown;
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return null;
    const owner = parsed as Record<string, unknown>;
    return typeof owner['pid'] === 'number' && typeof owner['token'] === 'string'
      ? { pid: owner['pid'], token: owner['token'] }
      : null;
  } catch {
    return null;
  }
}

function wait(milliseconds: number): void {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, milliseconds);
}

function isAlreadyExists(error: unknown): boolean {
  return error instanceof Error && 'code' in error && error.code === 'EEXIST';
}

function isMissing(error: unknown): boolean {
  return error instanceof Error && 'code' in error && error.code === 'ENOENT';
}

function isMissingProcess(error: unknown): boolean {
  return error instanceof Error && 'code' in error && error.code === 'ESRCH';
}
