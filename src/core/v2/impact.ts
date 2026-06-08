import * as path from 'node:path';

import { listAllDecisions } from './decision.js';
import {
  describePathMatch,
  matchPathTarget,
  normalizeInputPath,
  normalizePathTargets,
  type PathMatchKind,
} from './path-matcher.js';
import { listAllImplementationPlans } from './plan.js';
import { searchDecisionMemory } from './search.js';
import { openDatabase } from './store.js';
import { listAllImplementationTraces } from './trace.js';

import type {
  Decision,
  ImpactItem,
  ImpactMatchSource,
  ImpactResult,
  ImplementationPlan,
  ImplementationTrace,
} from '../../types/index.js';
import type { DatabaseSync } from 'node:sqlite';

type ImpactBucket = Map<string, ImpactItem>;

const MATCH_SOURCE_RANK: Record<ImpactMatchSource, number> = {
  'decision.appliesTo': 0,
  'decision.avoids': 1,
  'implementation_plan.targetFiles': 2,
  'implementation_plan.step.targetFiles': 3,
  'implementation_trace.filesChanged': 4,
  'implementation_trace.decisionToCodeMap': 5,
  fts_fallback: 6,
};

const MATCH_CONFIDENCE: Record<
  Exclude<ImpactMatchSource, 'fts_fallback'>,
  Record<PathMatchKind, number>
> = {
  'decision.appliesTo': { exact: 0.9, prefix: 0.7, glob: 0.72 },
  'decision.avoids': { exact: 0.95, prefix: 0.75, glob: 0.78 },
  'implementation_plan.targetFiles': { exact: 0.9, prefix: 0.7, glob: 0.72 },
  'implementation_plan.step.targetFiles': { exact: 0.9, prefix: 0.7, glob: 0.72 },
  'implementation_trace.filesChanged': { exact: 0.7, prefix: 0.6, glob: 0.62 },
  'implementation_trace.decisionToCodeMap': { exact: 1, prefix: 0.8, glob: 0.82 },
};

export function buildImpact(projectRoot: string, files: string[]): ImpactResult {
  const normalizedFiles = normalizeInputFiles(projectRoot, files);
  const directDecisions: ImpactBucket = new Map();
  const avoidWarnings: ImpactBucket = new Map();
  const plans: ImpactBucket = new Map();
  const traces: ImpactBucket = new Map();
  const provenance: ImpactBucket = new Map();
  const fallbackSearch: ImpactBucket = new Map();
  const db = openDatabase(projectRoot);
  try {
    const decisions = listAllDecisions(db);
    const tracesList = listAllImplementationTraces(db);
    const implementationPlans = listAllImplementationPlans(db);
    const decisionById = new Map(decisions.map((decision) => [decision.id, decision]));

    for (const decision of decisions) {
      addDecisionMatches(projectRoot, normalizedFiles, decision, directDecisions, 'appliesTo');
      addDecisionMatches(projectRoot, normalizedFiles, decision, avoidWarnings, 'avoids');
    }

    for (const implementationPlan of implementationPlans) {
      addPlanMatches(projectRoot, normalizedFiles, implementationPlan, plans);
    }

    for (const trace of tracesList) {
      addTraceMatches(projectRoot, normalizedFiles, trace, traces);
      addProvenanceMatches(projectRoot, normalizedFiles, trace, decisionById, provenance);
    }

    addSearchFallbacks(db, normalizedFiles, fallbackSearch, [
      directDecisions,
      avoidWarnings,
      plans,
      traces,
      provenance,
    ]);

    const fileOrder = new Map(normalizedFiles.map((file, index) => [file, index]));
    return {
      files: normalizedFiles,
      directDecisions: finalizeImpactBucket(directDecisions, fileOrder),
      avoidWarnings: finalizeImpactBucket(avoidWarnings, fileOrder),
      plans: finalizeImpactBucket(plans, fileOrder),
      traces: finalizeImpactBucket(traces, fileOrder),
      provenance: finalizeImpactBucket(provenance, fileOrder),
      fallbackSearch: finalizeImpactBucket(fallbackSearch, fileOrder),
    };
  } finally {
    db.close();
  }
}

function addDecisionMatches(
  projectRoot: string,
  files: string[],
  decision: Decision,
  bucket: ImpactBucket,
  field: 'appliesTo' | 'avoids',
): void {
  const matchSource: 'decision.appliesTo' | 'decision.avoids' =
    field === 'appliesTo' ? 'decision.appliesTo' : 'decision.avoids';
  const entityType = field === 'appliesTo' ? 'decision' : 'avoid_warning';
  for (const target of normalizePathTargets(
    projectRoot,
    decision[field],
    `Decision ${decision.id} ${field}`,
  )) {
    for (const file of files) {
      const matchKind = matchPathTarget(file, target);
      if (matchKind === null) {
        continue;
      }
      upsertImpactItem(
        bucket,
        createImpactItem({
          file,
          entityType,
          entityId: decision.id,
          taskId: decision.taskId,
          decisionId: decision.id,
          title: decision.title,
          summary: decision.summary,
          matchSource,
          confidence: MATCH_CONFIDENCE[matchSource][matchKind],
          explanation: `Decision ${field} target "${target.original}" ${describePathMatch(matchKind)} file "${file}".`,
        }),
      );
    }
  }
}

function addPlanMatches(
  projectRoot: string,
  files: string[],
  implementationPlan: ImplementationPlan,
  bucket: ImpactBucket,
): void {
  for (const target of normalizePathTargets(
    projectRoot,
    implementationPlan.targetFiles,
    `Implementation plan ${implementationPlan.id} targetFiles`,
  )) {
    for (const file of files) {
      const matchKind = matchPathTarget(file, target);
      if (matchKind === null) {
        continue;
      }
      upsertImpactItem(
        bucket,
        createImpactItem({
          file,
          entityType: 'implementation_plan',
          entityId: implementationPlan.id,
          taskId: implementationPlan.taskId,
          planId: implementationPlan.id,
          title: implementationPlan.title,
          summary: implementationPlan.summary,
          matchSource: 'implementation_plan.targetFiles',
          confidence: MATCH_CONFIDENCE['implementation_plan.targetFiles'][matchKind],
          explanation: `Implementation plan target "${target.original}" ${describePathMatch(matchKind)} file "${file}".`,
        }),
      );
    }
  }

  for (const [index, step] of implementationPlan.steps.entries()) {
    const stepId = `${implementationPlan.id}:step:${String(index + 1)}`;
    const stepLabel = step.title ?? step.summary ?? stepId;
    for (const target of normalizePathTargets(
      projectRoot,
      step.targetFiles ?? [],
      `Implementation plan ${implementationPlan.id} step ${String(index + 1)} targetFiles`,
    )) {
      for (const file of files) {
        const matchKind = matchPathTarget(file, target);
        if (matchKind === null) {
          continue;
        }
        upsertImpactItem(
          bucket,
          createImpactItem({
            file,
            entityType: 'implementation_plan',
            entityId: implementationPlan.id,
            taskId: implementationPlan.taskId,
            planId: implementationPlan.id,
            stepId,
            title: implementationPlan.title,
            summary: implementationPlan.summary,
            matchSource: 'implementation_plan.step.targetFiles',
            confidence: MATCH_CONFIDENCE['implementation_plan.step.targetFiles'][matchKind],
            explanation: `Implementation plan step "${stepLabel}" target "${target.original}" ${describePathMatch(matchKind)} file "${file}".`,
          }),
        );
      }
    }
  }
}

function addTraceMatches(
  projectRoot: string,
  files: string[],
  trace: ImplementationTrace,
  bucket: ImpactBucket,
): void {
  for (const target of normalizePathTargets(
    projectRoot,
    trace.filesChanged,
    `Implementation trace ${trace.id} filesChanged`,
  )) {
    for (const file of files) {
      const matchKind = matchPathTarget(file, target);
      if (matchKind === null) {
        continue;
      }
      upsertImpactItem(
        bucket,
        createImpactItem({
          file,
          entityType: 'implementation_trace',
          entityId: trace.id,
          taskId: trace.taskId,
          traceId: trace.id,
          title: trace.id,
          summary: trace.summary,
          matchSource: 'implementation_trace.filesChanged',
          confidence: MATCH_CONFIDENCE['implementation_trace.filesChanged'][matchKind],
          explanation: `Implementation trace filesChanged target "${target.original}" ${describePathMatch(matchKind)} file "${file}".`,
        }),
      );
    }
  }
}

function addProvenanceMatches(
  projectRoot: string,
  files: string[],
  trace: ImplementationTrace,
  decisionById: Map<string, Decision>,
  bucket: ImpactBucket,
): void {
  for (const mapping of trace.decisionToCodeMap) {
    if (isReviewRequiredDecisionToCodeMap(mapping.summary)) {
      continue;
    }
    const decision = decisionById.get(mapping.decisionId);
    const title = decision?.title ?? `Decision ${mapping.decisionId}`;
    const summary = mapping.summary.trim() === '' ? (decision?.summary ?? '') : mapping.summary;
    for (const target of normalizePathTargets(
      projectRoot,
      mapping.files,
      `Implementation trace ${trace.id} decisionToCodeMap ${mapping.decisionId}`,
    )) {
      for (const file of files) {
        const matchKind = matchPathTarget(file, target);
        if (matchKind === null) {
          continue;
        }
        upsertImpactItem(
          bucket,
          createImpactItem({
            file,
            entityType: 'provenance',
            entityId: `${trace.id}:${mapping.decisionId}`,
            taskId: trace.taskId,
            decisionId: mapping.decisionId,
            traceId: trace.id,
            title,
            summary,
            matchSource: 'implementation_trace.decisionToCodeMap',
            confidence: MATCH_CONFIDENCE['implementation_trace.decisionToCodeMap'][matchKind],
            explanation: `Implementation trace decisionToCodeMap for decision ${mapping.decisionId} ${describePathMatch(matchKind)} file "${file}" via target "${target.original}" in trace ${trace.id}.`,
          }),
        );
      }
    }
  }
}

function isReviewRequiredDecisionToCodeMap(summary: string): boolean {
  const normalized = summary.trim().toLowerCase();
  return (
    normalized.startsWith('needs review:') ||
    (normalized.includes('mapped') && normalized.includes('to all changed files by default'))
  );
}

function addSearchFallbacks(
  db: DatabaseSync,
  files: string[],
  bucket: ImpactBucket,
  allBuckets: ImpactBucket[],
): void {
  for (const file of files) {
    if (fileHasImpact(file, allBuckets)) {
      continue;
    }
    for (const query of uniqueQueriesForFile(file)) {
      for (const hit of searchDecisionMemory(db, query)) {
        const title = `Fallback match: ${hit.entityType} ${hit.entityId}`;
        const summary = `${hit.title} — ${hit.summary}`;
        upsertImpactItem(
          bucket,
          createImpactItem({
            file,
            entityType: 'fallback',
            entityId: `${hit.entityType}:${hit.entityId}`,
            taskId: hit.taskId,
            ...(hit.entityType === 'decision' ? { decisionId: hit.entityId } : {}),
            ...(hit.entityType === 'implementation_trace' ? { traceId: hit.entityId } : {}),
            title,
            summary,
            matchSource: 'fts_fallback',
            confidence: hit.confidence,
            explanation: `${hit.explanation} Fallback query "${query}" matched file "${file}" against ${hit.entityType} ${hit.entityId}.`,
          }),
        );
      }
    }
  }
}

function normalizeInputFiles(projectRoot: string, files: string[]): string[] {
  const output: string[] = [];
  const seen = new Set<string>();
  for (const file of files) {
    const normalized = normalizeInputPath(projectRoot, file, 'Input file');
    if (seen.has(normalized)) {
      continue;
    }
    seen.add(normalized);
    output.push(normalized);
  }
  return output;
}

function createImpactItem(input: {
  file: string;
  entityType: ImpactItem['entityType'];
  entityId: string;
  taskId: string;
  decisionId?: string;
  traceId?: string;
  planId?: string;
  stepId?: string;
  title: string;
  summary: string;
  matchSource: ImpactMatchSource;
  confidence: number;
  explanation: string;
}): ImpactItem {
  return {
    file: input.file,
    entityType: input.entityType,
    entityId: input.entityId,
    taskId: input.taskId,
    ...(input.decisionId === undefined ? {} : { decisionId: input.decisionId }),
    ...(input.traceId === undefined ? {} : { traceId: input.traceId }),
    ...(input.planId === undefined ? {} : { planId: input.planId }),
    ...(input.stepId === undefined ? {} : { stepId: input.stepId }),
    title: input.title,
    summary: input.summary,
    matchSource: input.matchSource,
    confidence: input.confidence,
    explanation: input.explanation,
  };
}

function upsertImpactItem(bucket: ImpactBucket, item: ImpactItem): void {
  const key = `${item.file}\u0000${item.entityType}\u0000${item.entityId}\u0000${item.matchSource}`;
  const current = bucket.get(key);
  if (current === undefined || item.confidence > current.confidence) {
    bucket.set(key, item);
  }
}

function finalizeImpactBucket(bucket: ImpactBucket, fileOrder: Map<string, number>): ImpactItem[] {
  return [...bucket.values()].sort((left, right) => compareImpactItems(left, right, fileOrder));
}

function compareImpactItems(
  left: ImpactItem,
  right: ImpactItem,
  fileOrder: Map<string, number>,
): number {
  const fileDifference =
    (fileOrder.get(left.file) ?? Number.MAX_SAFE_INTEGER) -
    (fileOrder.get(right.file) ?? Number.MAX_SAFE_INTEGER);
  if (fileDifference !== 0) {
    return fileDifference;
  }
  const sourceDifference =
    MATCH_SOURCE_RANK[left.matchSource] - MATCH_SOURCE_RANK[right.matchSource];
  if (sourceDifference !== 0) {
    return sourceDifference;
  }
  if (left.confidence !== right.confidence) {
    return right.confidence - left.confidence;
  }
  const typeDifference = left.entityType.localeCompare(right.entityType);
  if (typeDifference !== 0) {
    return typeDifference;
  }
  const taskDifference = left.taskId.localeCompare(right.taskId);
  if (taskDifference !== 0) {
    return taskDifference;
  }
  const entityDifference = left.entityId.localeCompare(right.entityId);
  if (entityDifference !== 0) {
    return entityDifference;
  }
  return left.title.localeCompare(right.title);
}

function fileHasImpact(file: string, buckets: ImpactBucket[]): boolean {
  return buckets.some((bucket) => [...bucket.values()].some((item) => item.file === file));
}

function uniqueQueriesForFile(file: string): string[] {
  const queries: string[] = [];
  const seen = new Set<string>();
  for (const candidate of [file, path.posix.basename(file), path.posix.dirname(file)]) {
    const normalized = candidate.trim();
    if (normalized === '' || normalized === '.' || seen.has(normalized)) {
      continue;
    }
    seen.add(normalized);
    queries.push(normalized);
  }
  return queries;
}
