import { createHash } from 'node:crypto';

import type { SourceBundle } from './source-types.js';
import type { MemoryCapsule, MemoryClaimType } from '../../types/index.js';

export type MemorySourceKind = 'DECISION' | 'EVIDENCE' | 'IMPLEMENTATION_TRACE' | 'EVALUATION';

export interface MemorySourceEntry {
  id: string;
  taskId: string;
  kind: MemorySourceKind;
  timestamp: string;
  value: unknown;
}

export type MemoryReferenceProblemReason =
  | 'missing-task'
  | 'missing-source'
  | 'wrong-task'
  | 'incompatible-source-kind'
  | 'missing-primary-source';

export interface MemoryReferenceProblem {
  memoryId: string;
  reason: MemoryReferenceProblemReason;
  claimType?: MemoryClaimType;
  sourceId?: string;
}

const ALLOWED_SOURCE_KINDS: Record<MemoryClaimType, readonly MemorySourceKind[]> = {
  DECISION: ['DECISION', 'EVIDENCE'],
  CONSTRAINT: ['DECISION', 'EVIDENCE'],
  IMPLEMENTATION: ['IMPLEMENTATION_TRACE', 'DECISION'],
  VALIDATION: ['EVALUATION', 'IMPLEMENTATION_TRACE'],
};

export function buildMemorySourceCatalog(bundle: SourceBundle): Map<string, MemorySourceEntry> {
  const entries: MemorySourceEntry[] = [
    ...bundle.decisions.map((value) => ({
      id: value.id,
      taskId: value.taskId,
      kind: 'DECISION' as const,
      timestamp: value.updatedAt,
      value,
    })),
    ...bundle.evidence.map((value) => ({
      id: value.id,
      taskId: value.taskId,
      kind: 'EVIDENCE' as const,
      timestamp: value.createdAt,
      value,
    })),
    ...bundle.implementationTraces.map((value) => ({
      id: value.id,
      taskId: value.taskId,
      kind: 'IMPLEMENTATION_TRACE' as const,
      timestamp: value.createdAt,
      value,
    })),
    ...bundle.evaluations.map((value) => ({
      id: value.id,
      taskId: value.taskId,
      kind: 'EVALUATION' as const,
      timestamp: value.createdAt,
      value,
    })),
  ];
  return new Map(entries.map((entry) => [entry.id, entry]));
}

export function isMemorySourceAllowed(
  claimType: MemoryClaimType,
  sourceKind: MemorySourceKind,
): boolean {
  return ALLOWED_SOURCE_KINDS[claimType].includes(sourceKind);
}

export function hasPrimaryMemorySource(
  claimType: MemoryClaimType,
  sourceKinds: readonly MemorySourceKind[],
): boolean {
  switch (claimType) {
    case 'DECISION':
      return sourceKinds.includes('DECISION');
    case 'CONSTRAINT':
      return sourceKinds.some((kind) => kind === 'DECISION' || kind === 'EVIDENCE');
    case 'IMPLEMENTATION':
      return sourceKinds.includes('IMPLEMENTATION_TRACE');
    case 'VALIDATION':
      return sourceKinds.includes('EVALUATION');
  }
}

export function citedMemorySourceIds(
  memories: readonly Pick<MemoryCapsule, 'claims'>[],
): Set<string> {
  return new Set(memories.flatMap((memory) => memory.claims.flatMap((claim) => claim.sourceIds)));
}

export function memoryReferenceProblems(
  bundle: SourceBundle,
  memory: MemoryCapsule,
  catalog: ReadonlyMap<string, MemorySourceEntry> = buildMemorySourceCatalog(bundle),
): MemoryReferenceProblem[] {
  const problems: MemoryReferenceProblem[] = [];
  if (!bundle.tasks.some((task) => task.id === memory.taskId)) {
    problems.push({ memoryId: memory.id, reason: 'missing-task' });
  }
  for (const claim of memory.claims) {
    const validKinds: MemorySourceKind[] = [];
    for (const sourceId of claim.sourceIds) {
      const source = catalog.get(sourceId);
      if (source === undefined) {
        problems.push({
          memoryId: memory.id,
          reason: 'missing-source',
          claimType: claim.type,
          sourceId,
        });
        continue;
      }
      if (source.taskId !== memory.taskId) {
        problems.push({
          memoryId: memory.id,
          reason: 'wrong-task',
          claimType: claim.type,
          sourceId,
        });
        continue;
      }
      if (!isMemorySourceAllowed(claim.type, source.kind)) {
        problems.push({
          memoryId: memory.id,
          reason: 'incompatible-source-kind',
          claimType: claim.type,
          sourceId,
        });
        continue;
      }
      validKinds.push(source.kind);
    }
    if (!hasPrimaryMemorySource(claim.type, validKinds)) {
      problems.push({
        memoryId: memory.id,
        reason: 'missing-primary-source',
        claimType: claim.type,
      });
    }
  }
  return problems;
}

export function memoryCapsuleStaleReasons(
  bundle: SourceBundle,
  memory: MemoryCapsule,
  catalog: ReadonlyMap<string, MemorySourceEntry> = buildMemorySourceCatalog(bundle),
): string[] {
  const sourceIds = citedMemorySourceIds([memory]);
  const reasons: string[] = memoryReferenceProblems(bundle, memory, catalog).map(
    (problem) => problem.reason,
  );
  if (memorySourceDigest(catalog, [...sourceIds]) !== memory.sourceDigest) {
    reasons.push('source-digest-changed');
  }
  if (
    [...catalog.values()].some(
      (source) => source.taskId === memory.taskId && source.timestamp > memory.updatedAt,
    )
  ) {
    reasons.push('newer-source-record');
  }
  if (
    bundle.decisions.some(
      (decision) => sourceIds.has(decision.id) && decision.status !== 'CONFIRMED',
    )
  ) {
    reasons.push('source-no-longer-reusable');
  }
  return [...new Set(reasons)];
}

export function memorySourceDigest(
  catalog: ReadonlyMap<string, MemorySourceEntry>,
  sourceIds: readonly string[],
): string {
  const sources = [...new Set(sourceIds)].sort(compareCodeUnits).map((id) => {
    const source = catalog.get(id);
    return source === undefined
      ? { id, missing: true }
      : { id: source.id, kind: source.kind, taskId: source.taskId, value: source.value };
  });
  const hash = createHash('sha256').update(stableJson(sources)).digest('hex');
  return `sduck-memory-sources/v1:${hash}`;
}

function stableJson(value: unknown): string {
  return JSON.stringify(sortJson(value));
}

function sortJson(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortJson);
  if (typeof value !== 'object' || value === null) return value;
  return Object.fromEntries(
    Object.entries(value)
      .sort(([left], [right]) => compareCodeUnits(left, right))
      .map(([key, item]) => [key, sortJson(item)]),
  );
}

function compareCodeUnits(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}
