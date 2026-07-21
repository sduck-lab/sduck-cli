import { execFileSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';

import { DecisionWorkspace } from './decision-workspace.js';
import { parseDraftInput, validateCarriedDecisions, validateDraft } from './draft.js';
import { nowIso } from './ids.js';
import { readDecisionWorkspacePolicy } from './policy.js';
import { appendSourceEvent, nextSourceEntityId } from './source-store.js';

import type { Decision, Evidence, SduckDraft, Task } from '../../types/index.js';

export interface RetrospectivePendingMarker {
  commitSha: string;
  parentSha: string | null;
  createdAt: string;
}

export interface RetrospectiveCaptureResult {
  taskId: string;
  commit: string;
  decisions: number;
  evidence: number;
  duplicate: boolean;
}

const MARKER_NAME = 'sduck-retrospective-pending.json';
const MARKER_PUBLICATION_LOCK_NAME = 'sduck-retrospective-marker.lock';
const SHA_RE = /^[0-9a-f]{40,64}$/i;
const MARKER_LOCK_TIMEOUT_MS = 10_000;
const MARKER_LOCK_RETRY_MS = 20;

export function retrospectivePendingMarkerPath(projectRoot: string): string {
  try {
    return execFileSync('git', ['rev-parse', '--path-format=absolute', '--git-path', MARKER_NAME], {
      cwd: projectRoot,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    }).trim();
  } catch (error) {
    throw new Error(
      `Retrospective pending marker is missing: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

export function hasRetrospectivePendingMarker(projectRoot: string): boolean {
  try {
    return fs.existsSync(retrospectivePendingMarkerPath(projectRoot));
  } catch {
    return false;
  }
}

export function retrospectiveMarkerPublicationLockPath(projectRoot: string): string {
  try {
    return execFileSync(
      'git',
      ['rev-parse', '--path-format=absolute', '--git-path', MARKER_PUBLICATION_LOCK_NAME],
      {
        cwd: projectRoot,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe'],
      },
    ).trim();
  } catch (error) {
    throw new Error(
      `Retrospective marker publication lock is unavailable: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

export function withRetrospectiveMarkerPublicationLock<T>(
  projectRoot: string,
  operation: () => T,
): T {
  const lockPath = retrospectiveMarkerPublicationLockPath(projectRoot);
  const ownerPath = path.join(lockPath, 'owner.json');
  const token = `${String(process.pid)}-${Math.random().toString(36).slice(2)}`;
  const deadline = Date.now() + MARKER_LOCK_TIMEOUT_MS;
  let acquired = false;

  while (!acquired) {
    try {
      fs.mkdirSync(lockPath);
      fs.writeFileSync(ownerPath, `${JSON.stringify({ pid: process.pid, token })}\n`);
      acquired = true;
    } catch (error) {
      if (!isAlreadyExists(error)) throw error;
      if (clearStaleMarkerPublicationLock(lockPath)) continue;
      if (Date.now() >= deadline) {
        throw new Error(`Retrospective marker publication lock is busy: ${lockPath}`);
      }
      wait(MARKER_LOCK_RETRY_MS);
    }
  }

  try {
    return operation();
  } finally {
    const owner = readMarkerPublicationLockOwner(ownerPath);
    if (owner?.token === token) fs.rmSync(lockPath, { force: true, recursive: true });
  }
}

export function captureRetrospective(
  projectRoot: string,
  content: string,
): RetrospectiveCaptureResult {
  const markerPath = retrospectivePendingMarkerPath(projectRoot);
  const claimedMarkerPath = claimPendingMarker(markerPath);
  let canonicalMutated = false;
  try {
    const marker = readPendingMarker(claimedMarkerPath);
    validateMarkerGitIdentity(projectRoot, marker);
    const draft = validateRetrospectiveDraft(validateDraft(parseDraftInput(content)));

    const result = new DecisionWorkspace(projectRoot).mutate(({ bundle, state }) => {
      const policy = readDecisionWorkspacePolicy(projectRoot);
      if (policy?.workflowEnabled !== false)
        throw new Error('Retrospective capture requires workflow to be disabled.');
      if (state.currentTaskId !== null) {
        throw new Error(
          `Cannot capture retrospective while task ${state.currentTaskId} is active.`,
        );
      }

      const existing = bundle.events.find(
        (event) =>
          event.type === 'RETROSPECTIVE_CAPTURED' &&
          event.payload['commitSha'] === marker.commitSha,
      );
      if (existing !== undefined) {
        return {
          taskId: existing.taskId ?? '',
          commit: marker.commitSha,
          decisions: bundle.decisions.filter((decision) => decision.taskId === existing.taskId)
            .length,
          evidence: bundle.evidence.filter((evidence) => evidence.taskId === existing.taskId)
            .length,
          duplicate: true,
        } satisfies RetrospectiveCaptureResult;
      }

      const now = nowIso();
      let taskId = `TASK-retrospective-${marker.commitSha.slice(0, 12)}`;
      let suffix = 2;
      while (bundle.tasks.some((task) => task.id === taskId)) {
        taskId = `TASK-retrospective-${marker.commitSha.slice(0, 12)}-${String(suffix)}`;
        suffix += 1;
      }
      validateCarriedDecisions(bundle, taskId, draft.decisions ?? []);

      const task: Task = {
        id: taskId,
        title: `Retrospective capture ${marker.commitSha.slice(0, 12)}`,
        description: `Retrospective capture for commit ${marker.commitSha}`,
        status: 'CLOSED',
        expectedScope: draft.expectedScope ?? [],
        avoidScope: draft.avoidScope ?? [],
        ...(draft.implementationPlan === undefined
          ? {}
          : { implementationPlan: draft.implementationPlan }),
        ...(draft.verificationPlan === undefined
          ? {}
          : { verificationPlan: draft.verificationPlan }),
        retrospective: true,
        createdAt: now,
        updatedAt: now,
      };
      bundle.tasks.push(task);
      appendSourceEvent(bundle, {
        taskId,
        type: 'TASK_CREATED',
        payload: { retrospective: true, commitSha: marker.commitSha, parentSha: marker.parentSha },
      });

      let decisionIds = bundle.decisions.map((item) => item.id);
      for (const draftDecision of draft.decisions ?? []) {
        const id = draftDecision.id ?? nextSourceEntityId(decisionIds, 'DEC');
        decisionIds = [...decisionIds, id];
        const decision: Decision = {
          id,
          taskId,
          title: draftDecision.title,
          kind: draftDecision.kind,
          status: 'DRAFT',
          confidence: draftDecision.confidence ?? (draftDecision.kind === 'EXPLICIT' ? 1 : 0.7),
          summary: draftDecision.summary,
          rationale: draftDecision.rationale ?? [],
          appliesTo: draftDecision.appliesTo ?? [],
          avoids: draftDecision.avoids ?? [],
          sourceRefs: draftDecision.sourceRefs ?? [],
          createdAt: now,
          updatedAt: now,
        };
        bundle.decisions.push(decision);
        appendSourceEvent(bundle, {
          taskId,
          type: 'DECISION_CREATED',
          payload: { decisionId: id },
        });
      }

      let evidenceIds = bundle.evidence.map((item) => item.id);
      const markerEvidenceId = nextSourceEntityId(evidenceIds, 'EVD');
      evidenceIds = [...evidenceIds, markerEvidenceId];
      bundle.evidence.push({
        id: markerEvidenceId,
        taskId,
        decisionId: null,
        sourceType: 'DISCOVERY',
        sourceRef: `git:${marker.commitSha}`,
        summary: `Retrospective pending marker for commit ${marker.commitSha}`,
        confidence: 1,
        createdAt: now,
      });
      for (const draftEvidence of draft.evidence ?? []) {
        const id = draftEvidence.id ?? nextSourceEntityId(evidenceIds, 'EVD');
        evidenceIds = [...evidenceIds, id];
        const item: Evidence = {
          id,
          taskId,
          decisionId: draftEvidence.decisionId ?? null,
          sourceType: draftEvidence.sourceType,
          sourceRef: draftEvidence.sourceRef,
          summary: draftEvidence.summary,
          confidence: draftEvidence.confidence ?? 0.7,
          createdAt: now,
        };
        bundle.evidence.push(item);
      }

      appendSourceEvent(bundle, {
        taskId,
        type: 'DRAFT_SUBMITTED',
        payload: {
          retrospective: true,
          decisions: draft.decisions?.length ?? 0,
          questions: 0,
          evidence: draft.evidence?.length ?? 0,
          expectedScope: draft.expectedScope ?? [],
          avoidScope: draft.avoidScope ?? [],
          implementationPlan: draft.implementationPlan ?? [],
          verificationPlan: draft.verificationPlan ?? [],
        },
      });
      appendSourceEvent(bundle, {
        taskId,
        type: 'RETROSPECTIVE_CAPTURED',
        payload: {
          commitSha: marker.commitSha,
          parentSha: marker.parentSha,
          createdAt: marker.createdAt,
          markerEvidenceId,
        },
      });
      appendSourceEvent(bundle, { taskId, type: 'TASK_CLOSED', payload: { retrospective: true } });
      state.currentTaskId = null;
      state.updatedAt = now;

      return {
        taskId,
        commit: marker.commitSha,
        decisions: draft.decisions?.length ?? 0,
        evidence: (draft.evidence?.length ?? 0) + 1,
        duplicate: false,
      } satisfies RetrospectiveCaptureResult;
    });

    canonicalMutated = true;
    clearClaimedMarker(claimedMarkerPath);
    return result;
  } catch (error) {
    if (canonicalMutated) writeRestoreDiagnostic(markerPath, claimedMarkerPath, error);
    else restoreClaimedMarker(markerPath, claimedMarkerPath, error);
    throw error;
  }
}

function validateRetrospectiveDraft(draft: SduckDraft): SduckDraft {
  if ((draft.questions ?? []).length > 0) {
    throw new Error('Retrospective capture does not accept submitted questions.');
  }
  return draft;
}

function readPendingMarker(markerPath: string): RetrospectivePendingMarker {
  if (!fs.existsSync(markerPath)) throw new Error('Retrospective pending marker is missing.');
  let parsed: unknown;
  try {
    parsed = JSON.parse(fs.readFileSync(markerPath, 'utf8')) as unknown;
  } catch (error) {
    throw new Error(
      `Retrospective pending marker is invalid: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    throw new Error('Retrospective pending marker is invalid: marker must be an object');
  }
  const raw = parsed as Record<string, unknown>;
  const keys = Object.keys(raw).sort();
  if (keys.join(',') !== 'commitSha,createdAt,parentSha') {
    throw new Error(
      'Retrospective pending marker is invalid: expected commitSha,parentSha,createdAt',
    );
  }
  const commitSha = raw['commitSha'];
  const parentSha = raw['parentSha'];
  const createdAt = raw['createdAt'];
  if (typeof commitSha !== 'string' || !SHA_RE.test(commitSha)) {
    throw new Error('Retrospective pending marker is invalid: invalid commitSha');
  }
  if (parentSha !== null && (typeof parentSha !== 'string' || !SHA_RE.test(parentSha))) {
    throw new Error('Retrospective pending marker is invalid: invalid parentSha');
  }
  if (
    typeof createdAt !== 'string' ||
    createdAt.trim() === '' ||
    Number.isNaN(Date.parse(createdAt))
  ) {
    throw new Error('Retrospective pending marker is invalid: invalid createdAt');
  }
  return { commitSha, parentSha, createdAt };
}

function claimPendingMarker(markerPath: string): string {
  const claimedPath = `${markerPath}.claimed-${String(process.pid)}-${String(Date.now())}-${Math.random().toString(36).slice(2)}`;
  try {
    fs.renameSync(markerPath, claimedPath);
  } catch (error) {
    if (!fs.existsSync(markerPath)) throw new Error('Retrospective pending marker is missing.');
    throw error;
  }
  return claimedPath;
}

function clearClaimedMarker(claimedMarkerPath: string): void {
  fs.rmSync(path.resolve(claimedMarkerPath), { force: true });
}

function restoreClaimedMarker(markerPath: string, claimedMarkerPath: string, error: unknown): void {
  if (!fs.existsSync(claimedMarkerPath)) return;
  if (!fs.existsSync(markerPath)) {
    try {
      fs.renameSync(claimedMarkerPath, markerPath);
      return;
    } catch (restoreError) {
      writeRestoreDiagnostic(markerPath, claimedMarkerPath, error, restoreError);
      return;
    }
  }
  writeRestoreDiagnostic(markerPath, claimedMarkerPath, error);
}

function writeRestoreDiagnostic(
  markerPath: string,
  claimedMarkerPath: string,
  error: unknown,
  restoreError?: unknown,
): void {
  const diagnosticPath = `${claimedMarkerPath}.restore-failed.json`;
  const diagnostic = {
    markerPath,
    claimedMarkerPath,
    error: formatUnknownError(error),
    ...(restoreError === undefined ? {} : { restoreError: formatUnknownError(restoreError) }),
    createdAt: new Date().toISOString(),
  };
  try {
    fs.writeFileSync(diagnosticPath, `${JSON.stringify(diagnostic, null, 2)}\n`);
  } catch {
    // Keep the claimed marker itself as the recoverable artifact if diagnostics fail.
  }
}

function validateMarkerGitIdentity(projectRoot: string, marker: RetrospectivePendingMarker): void {
  assertGitCommitExists(projectRoot, marker.commitSha, 'commitSha');
  if (marker.parentSha !== null) assertGitCommitExists(projectRoot, marker.parentSha, 'parentSha');
  const parents = firstParentLine(projectRoot, marker.commitSha).slice(1);
  const firstParent = parents[0] ?? null;
  if (marker.parentSha === null) {
    if (parents.length !== 0) {
      throw new Error(
        'Retrospective pending marker is invalid: parentSha is required for non-root commit',
      );
    }
    return;
  }
  if (firstParent !== marker.parentSha) {
    throw new Error('Retrospective pending marker is invalid: parentSha is not the first parent');
  }
}

function assertGitCommitExists(projectRoot: string, sha: string, field: string): void {
  try {
    execFileSync('git', ['cat-file', '-e', `${sha}^{commit}`], {
      cwd: projectRoot,
      stdio: ['ignore', 'ignore', 'pipe'],
    });
  } catch {
    throw new Error(`Retrospective pending marker is invalid: ${field} does not exist`);
  }
}

function firstParentLine(projectRoot: string, commitSha: string): string[] {
  const output = execFileSync('git', ['rev-list', '--parents', '-n', '1', commitSha], {
    cwd: projectRoot,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();
  return output.split(/\s+/).filter((item) => item !== '');
}

function formatUnknownError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function clearStaleMarkerPublicationLock(lockPath: string): boolean {
  try {
    const owner = readMarkerPublicationLockOwner(path.join(lockPath, 'owner.json'));
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

function readMarkerPublicationLockOwner(ownerPath: string): { pid: number; token: string } | null {
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
