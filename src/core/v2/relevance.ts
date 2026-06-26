import * as fs from 'node:fs';
import * as path from 'node:path';

import { decisionGraphExportPath, graphifyGraphPath, toRelativePath } from './paths.js';

import type { Decision } from '../../types/index.js';

export const DEFAULT_ATTACH_THRESHOLD = 0.7;
export const GRAPH_RELEVANCE_SCORE = 0.7;

export const RELEVANCE_REASONS = {
  appliesToExactPath: 'matched by appliesTo exact path',
  appliesToGlob: 'matched by appliesTo glob',
  appliesToDirectoryPrefix: 'matched by appliesTo directory prefix',
  appliesToSymbolHint: 'matched by appliesTo symbol hint',
  graphEdge: 'matched by graph edge',
  recallResult: 'matched by recall result',
  weakSubstringFallback: 'weak substring fallback',
  noStrongMatch: 'no strong relevance match',
} as const;

export type RelevanceReason = (typeof RELEVANCE_REASONS)[keyof typeof RELEVANCE_REASONS];

export interface RelevanceMatch {
  file: string;
  score: number;
  reason: RelevanceReason;
  target?: string;
}

export interface DecisionRelevanceResult {
  attached: RelevanceMatch[];
  bestReviewMatch: RelevanceMatch | null;
}

interface GraphLink {
  source: string;
  target: string;
  relation: string;
}

export interface GraphDecisionFileLink extends GraphLink {
  decisionId: string;
  file: string;
}

interface NormalizedAppliesTo {
  raw: string;
  value: string;
  kind: 'empty' | 'path' | 'glob' | 'symbol';
}

export function normalizeProjectPath(projectRoot: string, value: string): string {
  const trimmed = value.trim().replace(/\\/g, '/');
  if (trimmed === '') return '';
  if (path.isAbsolute(trimmed)) {
    const relative = path.relative(projectRoot, trimmed).split(path.sep).join('/');
    if (!relative.startsWith('..') && !path.isAbsolute(relative)) return stripLeadingDot(relative);
  }
  return stripLeadingDot(trimmed).replace(/^\/+/, '');
}

export function scoreAppliesToEntry(
  projectRoot: string,
  entry: string,
  changedFile: string,
): RelevanceMatch | null {
  const normalized = normalizeAppliesToEntry(projectRoot, entry);
  const file = normalizeProjectPath(projectRoot, changedFile);
  if (normalized.kind === 'empty' || file === '') return null;
  if (normalized.kind === 'glob' && globToRegExp(normalized.value).test(file)) {
    return {
      file,
      score: 0.85,
      reason: RELEVANCE_REASONS.appliesToGlob,
      target: normalized.raw,
    };
  }
  if (normalized.value === file) {
    return {
      file,
      score: 1,
      reason: RELEVANCE_REASONS.appliesToExactPath,
      target: normalized.raw,
    };
  }
  if (normalized.kind === 'path' && isDirectoryPrefix(normalized.value, file)) {
    return {
      file,
      score: 0.85,
      reason: RELEVANCE_REASONS.appliesToDirectoryPrefix,
      target: normalized.raw,
    };
  }
  if (normalized.kind === 'symbol' && matchesSymbolHint(normalized.value, file)) {
    return {
      file,
      score: 0.85,
      reason: RELEVANCE_REASONS.appliesToSymbolHint,
      target: normalized.raw,
    };
  }
  if (file.toLowerCase().includes(normalized.value.toLowerCase())) {
    return {
      file,
      score: 0.3,
      reason: RELEVANCE_REASONS.weakSubstringFallback,
      target: normalized.raw,
    };
  }
  return null;
}

export function scoreDecisionForFiles(
  projectRoot: string,
  decision: Pick<Decision, 'id' | 'appliesTo'>,
  changedFiles: string[],
  graphLinks: GraphDecisionFileLink[] = [],
  threshold = DEFAULT_ATTACH_THRESHOLD,
): DecisionRelevanceResult {
  const candidates: RelevanceMatch[] = [];
  for (const file of changedFiles) {
    for (const entry of decision.appliesTo) {
      const match = scoreAppliesToEntry(projectRoot, entry, file);
      if (match !== null) candidates.push(match);
    }
  }
  for (const link of graphLinks) {
    if (link.decisionId !== decision.id) continue;
    const linkFile = normalizeProjectPath(projectRoot, link.file);
    const matchingFile = changedFiles
      .map((file) => normalizeProjectPath(projectRoot, file))
      .find((file) => file === linkFile || isDirectoryPrefix(linkFile, file));
    if (matchingFile !== undefined) {
      candidates.push({
        file: matchingFile,
        score: GRAPH_RELEVANCE_SCORE,
        reason: RELEVANCE_REASONS.graphEdge,
        target: link.file,
      });
    }
  }
  const bestByFile = mergeBestMatches(candidates);
  return {
    attached: bestByFile.filter((match) => match.score >= threshold),
    bestReviewMatch: bestByFile.length === 0 ? null : (bestByFile[0] ?? null),
  };
}

export function mergeBestMatches(matches: RelevanceMatch[]): RelevanceMatch[] {
  const byFile = new Map<string, RelevanceMatch>();
  for (const match of matches) {
    const existing = byFile.get(match.file);
    if (existing === undefined || compareMatch(match, existing) < 0) byFile.set(match.file, match);
  }
  return [...byFile.values()].sort(compareMatch);
}

export function readGraphDecisionFileLinks(projectRoot: string): GraphDecisionFileLink[] {
  const links: GraphDecisionFileLink[] = [];
  for (const graphPath of [graphifyGraphPath(projectRoot), decisionGraphExportPath(projectRoot)]) {
    if (!fs.existsSync(graphPath)) continue;
    try {
      links.push(
        ...parseGraphDecisionFileLinks(projectRoot, JSON.parse(fs.readFileSync(graphPath, 'utf8'))),
      );
    } catch {
      continue;
    }
  }
  return dedupeGraphLinks(links);
}

export function parseGraphDecisionFileLinks(
  projectRoot: string,
  graph: unknown,
): GraphDecisionFileLink[] {
  if (typeof graph !== 'object' || graph === null) return [];
  const raw = graph as Record<string, unknown>;
  const decisionIds = readDecisionNodeIds(raw['nodes']);
  const rawLinks = Array.isArray(raw['links'])
    ? raw['links']
    : Array.isArray(raw['edges'])
      ? raw['edges']
      : [];
  const output: GraphDecisionFileLink[] = [];
  for (const item of rawLinks) {
    if (typeof item !== 'object' || item === null) continue;
    const link = item as Record<string, unknown>;
    const source = readEndpoint(link['source'] ?? link['from']);
    const target = readEndpoint(link['target'] ?? link['to']);
    const rawRelation = link['relation'] ?? link['type'] ?? link['label'];
    const relation = typeof rawRelation === 'string' ? rawRelation.toUpperCase() : '';
    if (source === '' || target === '') continue;
    if (!['APPLIES_TO', 'CHANGED_FILE', 'TRACE_FOR'].includes(relation)) continue;
    const sourceIsDecision = decisionIds.has(source) || source.startsWith('DEC');
    const targetIsDecision = decisionIds.has(target) || target.startsWith('DEC');
    if (sourceIsDecision && !targetIsDecision) {
      output.push({
        source,
        target,
        relation,
        decisionId: source,
        file: normalizeGraphFile(projectRoot, target),
      });
    } else if (targetIsDecision && !sourceIsDecision) {
      output.push({
        source,
        target,
        relation,
        decisionId: target,
        file: normalizeGraphFile(projectRoot, source),
      });
    }
  }
  return output;
}

function normalizeAppliesToEntry(projectRoot: string, entry: string): NormalizedAppliesTo {
  const value = normalizeProjectPath(projectRoot, entry);
  if (value === '') return { raw: entry, value, kind: 'empty' };
  if (hasGlob(value)) return { raw: entry, value, kind: 'glob' };
  if (isPathHint(value)) return { raw: entry, value: value.replace(/\/+$/, ''), kind: 'path' };
  return { raw: entry, value, kind: 'symbol' };
}

function stripLeadingDot(value: string): string {
  return value.replace(/^\.\/+/, '');
}

function hasGlob(value: string): boolean {
  return /[*?[\]{}]/.test(value);
}

function isPathHint(value: string): boolean {
  return value.includes('/') || /^\.?[A-Za-z]:/.test(value) || /\.[A-Za-z0-9]+$/.test(value);
}

function isDirectoryPrefix(prefix: string, file: string): boolean {
  const normalizedPrefix = prefix.replace(/\/+$/, '');
  if (normalizedPrefix === '' || normalizedPrefix === file) return false;
  return file.startsWith(`${normalizedPrefix}/`);
}

function matchesSymbolHint(symbol: string, file: string): boolean {
  const stem = file
    .split('/')
    .pop()
    ?.replace(/\.[^.]+$/, '')
    .toLowerCase();
  return stem === symbol.toLowerCase();
}

function globToRegExp(glob: string): RegExp {
  let pattern = '';
  for (let index = 0; index < glob.length; index += 1) {
    const char = glob[index];
    const next = glob[index + 1];
    const afterNext = glob[index + 2];
    if (char === '*' && next === '*' && afterNext === '/') {
      pattern += '(?:.*/)?';
      index += 2;
    } else if (char === '*' && next === '*') {
      pattern += '.*';
      index += 1;
    } else if (char === '*') {
      pattern += '[^/]*';
    } else if (char === '?') {
      pattern += '[^/]';
    } else if (char !== undefined) {
      pattern += char.replace(/[.+^${}()|[\]\\]/g, '\\$&');
    }
  }
  return new RegExp(`^${pattern}$`);
}

function compareMatch(a: RelevanceMatch, b: RelevanceMatch): number {
  if (a.score !== b.score) return b.score - a.score;
  if (a.reason !== b.reason) return a.reason.localeCompare(b.reason);
  return a.file.localeCompare(b.file);
}

function readDecisionNodeIds(nodes: unknown): Set<string> {
  const ids = new Set<string>();
  if (!Array.isArray(nodes)) return ids;
  for (const node of nodes) {
    if (typeof node !== 'object' || node === null) continue;
    const raw = node as Record<string, unknown>;
    if (typeof raw['type'] === 'string' && raw['type'].toLowerCase() === 'decision') {
      const id = readEndpoint(raw['id']);
      if (id !== '') ids.add(id);
    }
  }
  return ids;
}

function readEndpoint(value: unknown): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && value !== null && 'id' in value) {
    const id = (value as Record<string, unknown>)['id'];
    return typeof id === 'string' ? id : '';
  }
  return '';
}

function normalizeGraphFile(projectRoot: string, file: string): string {
  if (path.isAbsolute(file)) return toRelativePath(projectRoot, file);
  return normalizeProjectPath(projectRoot, file);
}

function dedupeGraphLinks(links: GraphDecisionFileLink[]): GraphDecisionFileLink[] {
  const seen = new Set<string>();
  const output: GraphDecisionFileLink[] = [];
  for (const link of links) {
    const key = `${link.decisionId}\0${link.file}\0${link.relation}`;
    if (seen.has(key)) continue;
    seen.add(key);
    output.push(link);
  }
  return output;
}
