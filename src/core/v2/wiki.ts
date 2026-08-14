import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import * as fs from 'node:fs';
import * as path from 'node:path';

import { DecisionWorkspace } from './decision-workspace.js';
import { assertWikiEnabled, readWikiPolicyStatus } from './policy.js';
import { scoreDecisionForFiles } from './relevance.js';
import { loadSourceBundle } from './source-store.js';

import type { SourceBundle } from './source-types.js';

export const WIKI_SCHEMA_VERSION = 'sduck-wiki/v1' as const;
export const WIKI_ROOT = 'docs/wiki' as const;
export const WIKI_MANIFEST_PATH = `${WIKI_ROOT}/.sduck-wiki.json` as const;

export type WikiPageKind =
  | 'overview'
  | 'glossary'
  | 'capabilities'
  | 'architecture-and-flows'
  | 'decisions-and-recent-changes';

export type WikiBlockType =
  | 'explanation'
  | 'decision-intent'
  | 'implementation-claim'
  | 'change-tracking'
  | 'validation-report'
  | 'semantic-conflict';

const WIKI_BLOCK_TYPES: readonly WikiBlockType[] = [
  'explanation',
  'decision-intent',
  'implementation-claim',
  'change-tracking',
  'validation-report',
  'semantic-conflict',
];

export interface WikiPayloadBlock {
  type: WikiBlockType;
  markdown: string;
  sourceIds: string[];
}

export interface WikiPayloadSection {
  id: string;
  blocks: WikiPayloadBlock[];
}

export interface WikiPayloadPage {
  kind: WikiPageKind;
  slug: string;
  sections: WikiPayloadSection[];
}

export interface WikiPayload {
  schemaVersion: typeof WIKI_SCHEMA_VERSION;
  pages: WikiPayloadPage[];
}

export interface WikiWriteResult {
  written: string[];
  unchanged: string[];
}

export interface WikiSyncOptions {
  force?: boolean;
}

export type WikiStatusReason =
  | 'wiki-not-built'
  | 'page-missing'
  | 'page-schema-invalid'
  | 'source-missing'
  | 'source-superseded'
  | 'source-digest-changed'
  | 'generated-section-edited'
  | 'generated-digest-changed'
  | 'new-decision'
  | 'new-trace'
  | 'unmapped-decision'
  | 'external-relevant-change';

export interface WikiPageStatus {
  kind: WikiPageKind;
  slug: string;
  path: string;
  dirty: boolean;
  stale: boolean;
  conflict: boolean;
  reasons: WikiStatusReason[];
  missingSourceIds: string[];
  supersededSourceIds: string[];
  editedGeneratedSections: string[];
  unmappedDecisionIds: string[];
  externalChangedFiles: string[];
}

export interface WikiStatus {
  enabled: boolean;
  wikiRoot: string;
  manifestExists: boolean;
  head: string | null;
  pages: WikiPageStatus[];
  dirtyCount: number;
  staleCount: number;
  conflictCount: number;
  externalChangedFiles: string[];
}

export type WikiLintSeverity = 'error' | 'warning';

export interface WikiLintIssue {
  code: string;
  severity: WikiLintSeverity;
  page?: string;
  detail: string;
}

export interface WikiLintResult {
  ok: boolean;
  issues: WikiLintIssue[];
  errors: number;
  warnings: number;
}

interface WikiPageDefinition {
  kind: WikiPageKind;
  slug: string;
  fileName: string;
  title: string;
  sections: readonly { id: string; title: string }[];
}

interface WikiSource {
  id: string;
  kind: 'task' | 'decision' | 'evidence' | 'trace' | 'evaluation';
  value: unknown;
  relativePath: string;
}

interface WikiManifestPage {
  kind: WikiPageKind;
  slug: string;
  path: string;
  sourceIds: string[];
  sourceDigest: string;
  generatedDigest: string;
  lastSyncedCommit: string | null;
  observedDecisionIds: string[];
  observedTraceIds: string[];
}

interface WikiManifest {
  schemaVersion: typeof WIKI_SCHEMA_VERSION;
  wikiRoot: typeof WIKI_ROOT;
  lastSyncedCommit: string | null;
  pages: WikiManifestPage[];
}

export const WIKI_PAGE_DEFINITIONS: readonly WikiPageDefinition[] = [
  {
    kind: 'overview',
    slug: 'overview',
    fileName: 'README.md',
    title: 'Overview',
    sections: [
      { id: 'purpose', title: 'Purpose' },
      { id: 'users-and-success', title: 'Users & Success' },
      { id: 'scope-and-constraints', title: 'Scope & Constraints' },
    ],
  },
  {
    kind: 'glossary',
    slug: 'glossary',
    fileName: 'glossary.md',
    title: 'Glossary',
    sections: [{ id: 'terms', title: 'Terms' }],
  },
  {
    kind: 'capabilities',
    slug: 'capabilities',
    fileName: 'capabilities.md',
    title: 'Capabilities',
    sections: [
      { id: 'capabilities', title: 'Capabilities' },
      { id: 'boundaries', title: 'Boundaries' },
    ],
  },
  {
    kind: 'architecture-and-flows',
    slug: 'architecture-and-flows',
    fileName: 'architecture-and-flows.md',
    title: 'Architecture & Flows',
    sections: [
      { id: 'architecture', title: 'Architecture' },
      { id: 'flows', title: 'Flows' },
    ],
  },
  {
    kind: 'decisions-and-recent-changes',
    slug: 'decisions-and-recent-changes',
    fileName: 'decisions-and-recent-changes.md',
    title: 'Decisions & Recent Changes',
    sections: [
      { id: 'decisions', title: 'Decisions' },
      { id: 'recent-changes', title: 'Recent Changes' },
      { id: 'validation-reports', title: 'Validation Reports' },
    ],
  },
] as const;

export function buildWiki(projectRoot: string, input: string): WikiWriteResult {
  assertWikiEnabled(projectRoot);
  const payload = parseWikiPayload(input, true);

  return new DecisionWorkspace(projectRoot).mutate(({ artifacts, bundle }) => {
    const manifestPath = path.join(projectRoot, WIKI_MANIFEST_PATH);
    if (fs.existsSync(manifestPath)) {
      throw new Error('Wiki already exists. Use `sduck wiki sync --stdin`.');
    }
    const existingPage = WIKI_PAGE_DEFINITIONS.map((definition) =>
      path.join(projectRoot, WIKI_ROOT, definition.fileName),
    ).find((pagePath) => fs.existsSync(pagePath));
    if (existingPage !== undefined) {
      throw new Error(
        `Wiki build target already exists and will not be overwritten: ${path.relative(projectRoot, existingPage)}`,
      );
    }
    const sources = collectWikiSources(bundle);
    const head = currentHead(projectRoot);
    const manifestPages: WikiManifestPage[] = [];
    const pageArtifacts: { absolutePath: string; relativePath: string; content: string }[] = [];

    for (const definition of WIKI_PAGE_DEFINITIONS) {
      const page = payload.pages.find((item) => item.kind === definition.kind);
      if (page === undefined) throw new Error(`Missing Wiki page: ${definition.kind}`);
      const rendered = renderNewPage(definition, page, sources);
      const relativePath = `${WIKI_ROOT}/${definition.fileName}`;
      pageArtifacts.push({
        absolutePath: path.join(projectRoot, relativePath),
        relativePath,
        content: rendered.content,
      });
      manifestPages.push({
        kind: definition.kind,
        slug: definition.slug,
        path: relativePath,
        sourceIds: rendered.sourceIds,
        sourceDigest: sourceDigest(rendered.sourceIds, sources),
        generatedDigest: rendered.generatedDigest,
        lastSyncedCommit: head,
        observedDecisionIds: bundle.decisions
          .filter((item) => item.status === 'CONFIRMED')
          .map((item) => item.id)
          .sort(),
        observedTraceIds: bundle.implementationTraces.map((item) => item.id).sort(),
      });
    }

    const manifest: WikiManifest = {
      schemaVersion: WIKI_SCHEMA_VERSION,
      wikiRoot: WIKI_ROOT,
      lastSyncedCommit: head,
      pages: manifestPages,
    };
    artifacts.set(WIKI_MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`);
    for (const page of pageArtifacts) artifacts.set(page.relativePath, page.content);
    return {
      written: [manifestPath, ...pageArtifacts.map((item) => item.absolutePath)],
      unchanged: [],
    };
  });
}

export function syncWiki(
  projectRoot: string,
  input: string,
  options: WikiSyncOptions = {},
): WikiWriteResult {
  assertWikiEnabled(projectRoot);
  const payload = parseWikiPayload(input, false);
  if (payload.pages.length === 0) throw new Error('Wiki sync requires at least one page.');

  return new DecisionWorkspace(projectRoot).mutate(({ artifacts, bundle }) => {
    const manifestPath = path.join(projectRoot, WIKI_MANIFEST_PATH);
    const manifest = readWikiManifest(manifestPath);
    const sources = collectWikiSources(bundle);
    const head = currentHead(projectRoot);
    const nextPages = [...manifest.pages];
    const written: string[] = [];
    const unchanged: string[] = [];

    for (const definition of WIKI_PAGE_DEFINITIONS) {
      const page = payload.pages.find((item) => item.kind === definition.kind);
      if (page === undefined) continue;
      const entryIndex = nextPages.findIndex((item) => item.kind === definition.kind);
      if (entryIndex === -1) throw new Error(`Wiki manifest is missing page ${definition.kind}.`);
      const entry = nextPages[entryIndex];
      if (entry === undefined) {
        throw new Error(`Wiki manifest is missing page ${definition.kind}.`);
      }
      if (entry.slug !== definition.slug || entry.path !== `${WIKI_ROOT}/${definition.fileName}`) {
        throw new Error(`Wiki manifest page identity is invalid for ${definition.kind}.`);
      }
      const absolutePath = path.join(projectRoot, entry.path);
      if (!fs.existsSync(absolutePath)) throw new Error(`Wiki page is missing: ${entry.path}`);
      const current = fs.readFileSync(absolutePath, 'utf8');
      const rendered = renderUpdatedPage(
        current,
        definition,
        page,
        sources,
        options.force === true,
      );
      if (
        rendered.content !== current &&
        options.force !== true &&
        !manifestEntryHasDirtyEvidence(projectRoot, definition, entry, bundle, sources, head)
      ) {
        throw new Error(
          `Wiki page ${definition.slug} is not dirty; use --force for an intentional generated-prose rewrite.`,
        );
      }
      if (rendered.content === current) {
        unchanged.push(absolutePath);
      } else {
        artifacts.set(entry.path, rendered.content);
        written.push(absolutePath);
      }
      nextPages[entryIndex] = {
        ...entry,
        sourceIds: rendered.sourceIds,
        sourceDigest: sourceDigest(rendered.sourceIds, sources),
        generatedDigest: rendered.generatedDigest,
        lastSyncedCommit: head,
        observedDecisionIds: bundle.decisions
          .filter((item) => item.status === 'CONFIRMED')
          .map((item) => item.id)
          .sort(),
        observedTraceIds: bundle.implementationTraces.map((item) => item.id).sort(),
      };
    }

    const nextManifest: WikiManifest = {
      ...manifest,
      lastSyncedCommit: head,
      pages: WIKI_PAGE_DEFINITIONS.map((definition) => {
        const entry = nextPages.find((item) => item.kind === definition.kind);
        if (entry === undefined) throw new Error(`Wiki manifest is missing ${definition.kind}.`);
        return entry;
      }),
    };
    const currentManifest = fs.readFileSync(manifestPath, 'utf8');
    const nextManifestContent = `${JSON.stringify(nextManifest, null, 2)}\n`;
    if (nextManifestContent === currentManifest) {
      unchanged.unshift(manifestPath);
    } else {
      artifacts.set(WIKI_MANIFEST_PATH, nextManifestContent);
      written.unshift(manifestPath);
    }
    return { written, unchanged };
  });
}

export function getWikiStatus(projectRoot: string): WikiStatus {
  const policy = readWikiPolicyStatus(projectRoot);
  const head = currentHead(projectRoot);
  if (!policy.enabled) {
    return {
      enabled: false,
      wikiRoot: policy.root,
      manifestExists: false,
      head,
      pages: [],
      dirtyCount: 0,
      staleCount: 0,
      conflictCount: 0,
      externalChangedFiles: [],
    };
  }
  const manifestPath = path.join(projectRoot, WIKI_MANIFEST_PATH);
  if (!fs.existsSync(manifestPath)) {
    const pages = WIKI_PAGE_DEFINITIONS.map((definition) => ({
      kind: definition.kind,
      slug: definition.slug,
      path: `${WIKI_ROOT}/${definition.fileName}`,
      dirty: true,
      stale: false,
      conflict: false,
      reasons: ['wiki-not-built'] as WikiStatusReason[],
      missingSourceIds: [],
      supersededSourceIds: [],
      editedGeneratedSections: [],
      unmappedDecisionIds: [],
      externalChangedFiles: [],
    }));
    return {
      enabled: true,
      wikiRoot: WIKI_ROOT,
      manifestExists: false,
      head,
      pages,
      dirtyCount: pages.length,
      staleCount: 0,
      conflictCount: 0,
      externalChangedFiles: [],
    };
  }

  const manifest = readWikiManifest(manifestPath);
  const bundle = loadSourceBundle(projectRoot);
  const sources = collectWikiSources(bundle);
  const confirmedDecisionIds = bundle.decisions
    .filter((decision) => decision.status === 'CONFIRMED')
    .map((decision) => decision.id)
    .sort();
  const traceIds = bundle.implementationTraces.map((trace) => trace.id).sort();
  const allExternalChangedFiles = new Set<string>();
  const pages = WIKI_PAGE_DEFINITIONS.map((definition) => {
    const entry = manifest.pages.find((item) => item.kind === definition.kind);
    if (entry === undefined) {
      return pageStatus(definition, ['page-missing'], { stale: true });
    }
    const reasons: WikiStatusReason[] = [];
    const missingSourceIds = entry.sourceIds.filter((id) => !sources.has(id));
    const supersededSourceIds = entry.sourceIds.filter((id) => {
      const source = sources.get(id);
      return (
        source?.kind === 'decision' &&
        isRecord(source.value) &&
        source.value['status'] === 'SUPERSEDED'
      );
    });
    if (missingSourceIds.length > 0) reasons.push('source-missing');
    if (supersededSourceIds.length > 0) reasons.push('source-superseded');
    if (
      missingSourceIds.length === 0 &&
      sourceDigest(entry.sourceIds, sources) !== entry.sourceDigest
    ) {
      reasons.push('source-digest-changed');
    }

    const absolutePath = path.join(projectRoot, entry.path);
    let editedGeneratedSections: string[] = [];
    if (!fs.existsSync(absolutePath)) {
      reasons.push('page-missing');
    } else {
      const inspection = inspectPage(fs.readFileSync(absolutePath, 'utf8'), definition);
      if (!inspection.valid) reasons.push('page-schema-invalid');
      editedGeneratedSections = inspection.editedGeneratedSections;
      if (editedGeneratedSections.length > 0) reasons.push('generated-section-edited');
      if (
        inspection.generatedDigest !== null &&
        inspection.generatedDigest !== entry.generatedDigest
      ) {
        reasons.push('generated-digest-changed');
      }
    }

    const newDecisionIds = confirmedDecisionIds.filter(
      (id) => !entry.observedDecisionIds.includes(id),
    );
    const newTraceIds = traceIds.filter((id) => !entry.observedTraceIds.includes(id));
    const isGlobal = definition.kind === 'decisions-and-recent-changes';
    if (isGlobal && newDecisionIds.length > 0) reasons.push('new-decision');
    const referencedDecisions = bundle.decisions.filter(
      (decision) => entry.sourceIds.includes(decision.id) && decision.status !== 'SUPERSEDED',
    );
    const referencedDecisionIds = new Set(referencedDecisions.map((decision) => decision.id));
    const relevantNewTraces = bundle.implementationTraces.filter((trace) => {
      if (!newTraceIds.includes(trace.id)) return false;
      if (isGlobal) return true;
      if (trace.decisionIds.some((id) => referencedDecisionIds.has(id))) return true;
      return referencedDecisions.some(
        (decision) =>
          scoreDecisionForFiles(projectRoot, decision, trace.filesChanged).attached.length > 0,
      );
    });
    if (relevantNewTraces.length > 0) reasons.push('new-trace');
    const unmappedDecisionIds = [
      ...new Set(
        relevantNewTraces.flatMap(
          (trace) => trace.unmappedDecisions?.map((item) => item.decisionId) ?? [],
        ),
      ),
    ].sort();
    if (unmappedDecisionIds.length > 0) reasons.push('unmapped-decision');
    const committedChanges = filesChangedBetween(projectRoot, entry.lastSyncedCommit, head);
    for (const file of committedChanges) allExternalChangedFiles.add(file);
    const externalChangedFiles = [
      ...new Set(
        bundle.decisions
          .filter(
            (decision) => entry.sourceIds.includes(decision.id) && decision.status !== 'SUPERSEDED',
          )
          .flatMap((decision) =>
            scoreDecisionForFiles(projectRoot, decision, committedChanges).attached.map(
              (match) => match.file,
            ),
          ),
      ),
    ].sort();
    if (externalChangedFiles.length > 0) reasons.push('external-relevant-change');

    const staleReasons = new Set<WikiStatusReason>([
      'page-missing',
      'page-schema-invalid',
      'source-missing',
      'source-superseded',
      'source-digest-changed',
      'generated-section-edited',
      'generated-digest-changed',
    ]);
    return {
      kind: definition.kind,
      slug: definition.slug,
      path: entry.path,
      dirty: reasons.length > 0,
      stale: reasons.some((reason) => staleReasons.has(reason)),
      conflict: editedGeneratedSections.length > 0 || reasons.includes('generated-digest-changed'),
      reasons,
      missingSourceIds,
      supersededSourceIds,
      editedGeneratedSections,
      unmappedDecisionIds,
      externalChangedFiles,
    };
  });
  return {
    enabled: true,
    wikiRoot: manifest.wikiRoot,
    manifestExists: true,
    head,
    pages,
    dirtyCount: pages.filter((page) => page.dirty).length,
    staleCount: pages.filter((page) => page.stale).length,
    conflictCount: pages.filter((page) => page.conflict).length,
    externalChangedFiles: [...allExternalChangedFiles].sort(),
  };
}

export function lintWiki(projectRoot: string): WikiLintResult {
  const policy = readWikiPolicyStatus(projectRoot);
  if (!policy.enabled) {
    return lintResult([
      {
        code: 'wiki-disabled',
        severity: 'warning',
        detail: 'Wiki policy is disabled; run `sduck update` to migrate this workspace.',
      },
    ]);
  }
  const manifestPath = path.join(projectRoot, WIKI_MANIFEST_PATH);
  if (!fs.existsSync(manifestPath)) {
    return lintResult([
      {
        code: 'wiki-not-built',
        severity: 'error',
        detail: 'Wiki manifest is missing; run `sduck wiki build --stdin`.',
      },
    ]);
  }

  let manifest: WikiManifest;
  let status: WikiStatus;
  try {
    manifest = readWikiManifest(manifestPath);
    status = getWikiStatus(projectRoot);
  } catch (error) {
    return lintResult([
      {
        code: 'manifest-invalid',
        severity: 'error',
        detail: formatError(error),
      },
    ]);
  }
  const baselineManifest = readHeadWikiManifest(projectRoot);
  const issues: WikiLintIssue[] = [];
  for (const pageStatusView of status.pages) {
    const reasonCodes: Partial<Record<WikiStatusReason, string>> = {
      'page-missing': 'page-missing',
      'page-schema-invalid': 'page-schema-invalid',
      'source-missing': 'source-id-missing',
      'source-superseded': 'source-superseded',
      'source-digest-changed': 'source-digest-stale',
      'generated-section-edited': 'generated-section-edited',
      'generated-digest-changed': 'generated-manifest-digest-stale',
    };
    for (const reason of pageStatusView.reasons) {
      const code = reasonCodes[reason];
      if (code === undefined) continue;
      issues.push({
        code,
        severity: 'error',
        page: pageStatusView.path,
        detail: `${pageStatusView.slug}: ${reason}`,
      });
    }
    const definition = WIKI_PAGE_DEFINITIONS.find((item) => item.kind === pageStatusView.kind);
    if (definition === undefined) {
      throw new Error(`Unknown Wiki page kind: ${pageStatusView.kind}`);
    }
    const entry = manifest.pages.find((item) => item.kind === definition.kind);
    if (entry === undefined) continue;
    const absolutePath = path.join(projectRoot, entry.path);
    if (!fs.existsSync(absolutePath)) continue;
    const content = fs.readFileSync(absolutePath, 'utf8');
    if (!ownershipMarkersValid(content, definition)) {
      issues.push({
        code: 'ownership-marker-invalid',
        severity: 'error',
        page: entry.path,
        detail: 'Generated ownership markers are malformed, duplicated, or out of order.',
      });
    }
    for (const target of markdownLinkTargets(content)) {
      const broken = brokenInternalLink(projectRoot, absolutePath, target);
      if (broken !== null) {
        issues.push({
          code: 'broken-link',
          severity: 'error',
          page: entry.path,
          detail: broken,
        });
      }
    }
    const baselineContent = gitShowFile(projectRoot, 'HEAD', entry.path);
    if (baselineContent !== null) {
      const generatedChanged =
        generatedRegionProjection(baselineContent) !== generatedRegionProjection(content);
      if (generatedChanged) {
        const baselineEntry = baselineManifest?.pages.find((item) => item.kind === definition.kind);
        if (baselineEntry?.sourceDigest === entry.sourceDigest) {
          issues.push({
            code: 'generated-change-without-source-change',
            severity: 'error',
            page: entry.path,
            detail: 'Generated prose changed while the recorded canonical source digest did not.',
          });
          issues.push({
            code: 'clean-page-generated-change',
            severity: 'error',
            page: entry.path,
            detail: 'Generated prose changed even though the committed page sources were clean.',
          });
        }
      }
      const diff = gitDiffLineCounts(projectRoot, entry.path);
      if (diff !== null) {
        const changedLines = diff.added + diff.deleted;
        const baselineLines = Math.max(1, baselineContent.split('\n').length);
        if (changedLines >= 20 && changedLines / baselineLines >= 0.8) {
          issues.push({
            code: 'whole-page-rewrite',
            severity: 'warning',
            page: entry.path,
            detail: `Wiki diff rewrites ${String(changedLines)} line(s) relative to a ${String(baselineLines)}-line page.`,
          });
        }
        if (changedLines > 400) {
          issues.push({
            code: 'large-wiki-diff',
            severity: 'warning',
            page: entry.path,
            detail: `Wiki diff changes ${String(changedLines)} line(s).`,
          });
        }
      }
    }
  }
  return lintResult(dedupeLintIssues(issues));
}

function lintResult(issues: WikiLintIssue[]): WikiLintResult {
  const errors = issues.filter((issue) => issue.severity === 'error').length;
  const warnings = issues.filter((issue) => issue.severity === 'warning').length;
  return { ok: errors === 0, issues, errors, warnings };
}

function pageStatus(
  definition: WikiPageDefinition,
  reasons: WikiStatusReason[],
  options: { stale: boolean },
): WikiPageStatus {
  return {
    kind: definition.kind,
    slug: definition.slug,
    path: `${WIKI_ROOT}/${definition.fileName}`,
    dirty: reasons.length > 0,
    stale: options.stale,
    conflict: false,
    reasons,
    missingSourceIds: [],
    supersededSourceIds: [],
    editedGeneratedSections: [],
    unmappedDecisionIds: [],
    externalChangedFiles: [],
  };
}

function parseWikiPayload(input: string, requireAllPages: boolean): WikiPayload {
  let parsed: unknown;
  try {
    parsed = JSON.parse(input) as unknown;
  } catch (error) {
    throw new Error(`Wiki payload JSON is malformed: ${formatError(error)}`);
  }
  if (!isRecord(parsed) || parsed['schemaVersion'] !== WIKI_SCHEMA_VERSION) {
    throw new Error(`Wiki payload schemaVersion must be ${WIKI_SCHEMA_VERSION}.`);
  }
  if (!Array.isArray(parsed['pages'])) throw new Error('Wiki payload pages must be an array.');
  const pages = parsed['pages'].map(parsePayloadPage);
  const kinds = new Set(pages.map((page) => page.kind));
  const slugs = new Set(pages.map((page) => page.slug));
  if (kinds.size !== pages.length) throw new Error('Wiki payload contains duplicate page kinds.');
  if (slugs.size !== pages.length) throw new Error('Wiki payload contains duplicate slugs.');
  if (requireAllPages && pages.length !== WIKI_PAGE_DEFINITIONS.length) {
    throw new Error('Wiki build requires all canonical pages.');
  }
  return { schemaVersion: WIKI_SCHEMA_VERSION, pages };
}

function parsePayloadPage(value: unknown): WikiPayloadPage {
  if (!isRecord(value)) throw new Error('Wiki payload page must be an object.');
  const definition = WIKI_PAGE_DEFINITIONS.find((item) => item.kind === value['kind']);
  if (definition === undefined) throw new Error(`Invalid Wiki page kind: ${String(value['kind'])}`);
  if (value['slug'] !== definition.slug) {
    throw new Error(`Wiki page ${definition.kind} must use slug ${definition.slug}.`);
  }
  if (!Array.isArray(value['sections'])) {
    throw new Error(`Wiki page ${definition.kind} sections must be an array.`);
  }
  const rawSections = value['sections'].map(parsePayloadSection);
  const byId = new Map(rawSections.map((section) => [section.id, section]));
  if (byId.size !== rawSections.length) {
    throw new Error(`Wiki page ${definition.kind} contains duplicate sections.`);
  }
  if (
    rawSections.length !== definition.sections.length ||
    definition.sections.some((section) => !byId.has(section.id))
  ) {
    throw new Error(`Wiki page ${definition.kind} must contain its fixed section set.`);
  }
  return {
    kind: definition.kind,
    slug: definition.slug,
    sections: definition.sections.map((section) => {
      const parsedSection = byId.get(section.id);
      if (parsedSection === undefined) {
        throw new Error(`Missing Wiki section: ${section.id}`);
      }
      return parsedSection;
    }),
  };
}

function parsePayloadSection(value: unknown): WikiPayloadSection {
  if (!isRecord(value) || typeof value['id'] !== 'string' || value['id'].trim() === '') {
    throw new Error('Wiki section id must be a non-empty string.');
  }
  if (!Array.isArray(value['blocks']) || value['blocks'].length === 0) {
    throw new Error(`Wiki section ${value['id']} blocks must be a non-empty array.`);
  }
  return { id: value['id'], blocks: value['blocks'].map(parsePayloadBlock) };
}

function parsePayloadBlock(value: unknown): WikiPayloadBlock {
  if (!isRecord(value)) throw new Error('Wiki block must be an object.');
  if (!WIKI_BLOCK_TYPES.includes(value['type'] as WikiBlockType)) {
    throw new Error(`Invalid Wiki block type: ${String(value['type'])}`);
  }
  if (typeof value['markdown'] !== 'string' || value['markdown'].trim() === '') {
    throw new Error('Wiki block markdown must be a non-empty string.');
  }
  if (value['markdown'].includes('<!-- sduck:generated:')) {
    throw new Error('Wiki block markdown cannot contain ownership markers.');
  }
  if (
    !Array.isArray(value['sourceIds']) ||
    value['sourceIds'].length === 0 ||
    !value['sourceIds'].every((item) => typeof item === 'string' && item.trim() !== '')
  ) {
    throw new Error('Wiki block sourceIds must be a non-empty string array.');
  }
  return {
    type: value['type'] as WikiBlockType,
    markdown: value['markdown'].trim(),
    sourceIds: [...new Set(value['sourceIds'] as string[])].sort(),
  };
}

function collectWikiSources(bundle: SourceBundle): Map<string, WikiSource> {
  const sources = new Map<string, WikiSource>();
  for (const task of bundle.tasks) {
    sources.set(task.id, {
      id: task.id,
      kind: 'task',
      value: task,
      relativePath: `.decision/exports/markdown/tasks/${task.id}.md`,
    });
  }
  for (const decision of bundle.decisions) {
    sources.set(decision.id, {
      id: decision.id,
      kind: 'decision',
      value: decision,
      relativePath: `.decision/exports/markdown/decisions/${decision.id}.md`,
    });
  }
  for (const evidence of bundle.evidence) {
    sources.set(evidence.id, {
      id: evidence.id,
      kind: 'evidence',
      value: evidence,
      relativePath: `.decision/exports/markdown/tasks/${evidence.taskId}.md`,
    });
  }
  for (const trace of bundle.implementationTraces) {
    sources.set(trace.id, {
      id: trace.id,
      kind: 'trace',
      value: trace,
      relativePath: `.decision/exports/markdown/implementations/${trace.id}.md`,
    });
  }
  for (const evaluation of bundle.evaluations) {
    sources.set(evaluation.id, {
      id: evaluation.id,
      kind: 'evaluation',
      value: evaluation,
      relativePath: `.decision/exports/markdown/tasks/${evaluation.taskId}.md`,
    });
  }
  return sources;
}

function renderNewPage(
  definition: WikiPageDefinition,
  page: WikiPayloadPage,
  sources: Map<string, WikiSource>,
): { content: string; sourceIds: string[]; generatedDigest: string } {
  const sourceIds = collectPageSourceIds(page);
  assertSourcesExist(sourceIds, sources);
  const generatedByKey = new Map(
    page.sections.map((section) => [section.id, renderBlocks(section.blocks, sources)]),
  );
  const renderedSections = definition.sections.map((sectionDefinition) => {
    const generated = generatedByKey.get(sectionDefinition.id);
    if (generated === undefined) {
      throw new Error(`Missing Wiki section: ${sectionDefinition.id}`);
    }
    const digest = sha256(generated);
    return `## ${sectionDefinition.title}\n\n<!-- sduck:generated:start key=${sectionDefinition.id} digest=${digest} -->\n${generated}\n<!-- sduck:generated:end -->`;
  });
  const generatedDigest = digestGeneratedSections(definition, generatedByKey);
  const frontmatter = [
    '---',
    `schema_version: ${WIKI_SCHEMA_VERSION}`,
    `page_kind: ${definition.kind}`,
    `slug: ${definition.slug}`,
    'section_order:',
    ...definition.sections.map((section) => `  - ${section.id}`),
    '---',
  ].join('\n');
  const content = `${frontmatter}\n# ${definition.title}\n\n${renderedSections.join('\n\n')}\n\n## Team Notes\n\nAdd team-owned notes here. This area is never changed by sduck Wiki sync.\n`;
  return { content, sourceIds, generatedDigest };
}

function renderUpdatedPage(
  current: string,
  definition: WikiPageDefinition,
  page: WikiPayloadPage,
  sources: Map<string, WikiSource>,
  force: boolean,
): { content: string; sourceIds: string[]; generatedDigest: string } {
  assertPageIdentity(current, definition);
  const regionPattern = generatedRegionPattern();
  const regions = [...current.matchAll(regionPattern)];
  const startCount = current.match(/<!-- sduck:generated:start\b/g)?.length ?? 0;
  const endCount = current.match(/<!-- sduck:generated:end -->/g)?.length ?? 0;
  if (
    regions.length !== definition.sections.length ||
    startCount !== regions.length ||
    endCount !== regions.length
  ) {
    throw new Error(`Malformed ownership markers in Wiki page ${definition.slug}.`);
  }
  const expectedKeys = definition.sections.map((section) => section.id);
  const actualKeys = regions.map((match) => match[1]);
  if (actualKeys.some((key, index) => key !== expectedKeys[index])) {
    throw new Error(`Generated section order is invalid in Wiki page ${definition.slug}.`);
  }
  for (const region of regions) {
    const key = matchGroup(region, 1);
    const storedDigest = matchGroup(region, 2);
    const content = matchGroup(region, 3);
    if (sha256(content) !== storedDigest && !force) {
      throw new Error(
        `Generated section ${key} in Wiki page ${definition.slug} was edited; rerun with --force to replace it.`,
      );
    }
  }

  const generatedByKey = new Map(
    page.sections.map((section) => [section.id, renderBlocks(section.blocks, sources)]),
  );
  const content = current.replace(regionPattern, (_match, key: string) => {
    const generated = generatedByKey.get(key);
    if (generated === undefined) throw new Error(`Missing Wiki payload section: ${key}`);
    return `<!-- sduck:generated:start key=${key} digest=${sha256(generated)} -->\n${generated}\n<!-- sduck:generated:end -->`;
  });
  const sourceIds = collectPageSourceIds(page);
  assertSourcesExist(sourceIds, sources);
  const generatedDigest = digestGeneratedSections(definition, generatedByKey);
  return { content, sourceIds, generatedDigest };
}

function collectPageSourceIds(page: WikiPayloadPage): string[] {
  return [
    ...new Set(
      page.sections.flatMap((section) => section.blocks.flatMap((block) => block.sourceIds)),
    ),
  ].sort();
}

function digestGeneratedSections(
  definition: WikiPageDefinition,
  generatedByKey: ReadonlyMap<string, string>,
): string {
  const digestInput = definition.sections.map((section) => {
    const generated = generatedByKey.get(section.id);
    if (generated === undefined) throw new Error(`Missing Wiki section: ${section.id}`);
    return `${section.id}:${sha256(generated)}`;
  });
  return sha256(digestInput.join('\n'));
}

function assertPageIdentity(content: string, definition: WikiPageDefinition): void {
  const expectedOrder = definition.sections.map((section) => `  - ${section.id}`).join('\n');
  if (
    !content.startsWith('---\n') ||
    !content.includes(`schema_version: ${WIKI_SCHEMA_VERSION}\n`) ||
    !content.includes(`page_kind: ${definition.kind}\n`) ||
    !content.includes(`slug: ${definition.slug}\n`) ||
    !content.includes(`section_order:\n${expectedOrder}\n---\n`) ||
    !content.includes(`# ${definition.title}\n`)
  ) {
    throw new Error(`Wiki page schema or fixed section order is invalid: ${definition.slug}.`);
  }
}

function inspectPage(
  content: string,
  definition: WikiPageDefinition,
): { valid: boolean; editedGeneratedSections: string[]; generatedDigest: string | null } {
  try {
    assertPageIdentity(content, definition);
  } catch {
    return { valid: false, editedGeneratedSections: [], generatedDigest: null };
  }
  const regionPattern = generatedRegionPattern();
  const regions = [...content.matchAll(regionPattern)];
  const startCount = content.match(/<!-- sduck:generated:start\b/g)?.length ?? 0;
  const endCount = content.match(/<!-- sduck:generated:end -->/g)?.length ?? 0;
  const expectedKeys = definition.sections.map((section) => section.id);
  const actualKeys = regions.map((region) => region[1]);
  if (
    regions.length !== expectedKeys.length ||
    startCount !== regions.length ||
    endCount !== regions.length ||
    actualKeys.some((key, index) => key !== expectedKeys[index])
  ) {
    return { valid: false, editedGeneratedSections: [], generatedDigest: null };
  }
  return {
    valid: true,
    editedGeneratedSections: regions
      .filter((region) => sha256(matchGroup(region, 3)) !== matchGroup(region, 2))
      .map((region) => matchGroup(region, 1)),
    generatedDigest: sha256(
      regions
        .map((region) => `${matchGroup(region, 1)}:${sha256(matchGroup(region, 3))}`)
        .join('\n'),
    ),
  };
}

function ownershipMarkersValid(content: string, definition: WikiPageDefinition): boolean {
  const regionPattern = generatedRegionPattern();
  const regions = [...content.matchAll(regionPattern)];
  const starts = content.match(/<!-- sduck:generated:start\b/g)?.length ?? 0;
  const ends = content.match(/<!-- sduck:generated:end -->/g)?.length ?? 0;
  const keys = regions.map((region) => region[1]);
  return (
    starts === definition.sections.length &&
    ends === definition.sections.length &&
    regions.length === definition.sections.length &&
    keys.every((key, index) => key === definition.sections[index]?.id)
  );
}

function markdownLinkTargets(content: string): string[] {
  const targets: string[] = [];
  const pattern = /\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
  for (const match of content.matchAll(pattern)) {
    if (match[1] !== undefined) targets.push(match[1]);
  }
  return targets;
}

function brokenInternalLink(
  projectRoot: string,
  pagePath: string,
  rawTarget: string,
): string | null {
  if (/^(?:https?:|mailto:|tel:)/i.test(rawTarget) || rawTarget.startsWith('#')) return null;
  const target = rawTarget.replace(/^<|>$/g, '').split('#')[0]?.split('?')[0] ?? '';
  if (target === '') return null;
  let decoded: string;
  try {
    decoded = decodeURIComponent(target);
  } catch {
    return `Malformed link target: ${rawTarget}`;
  }
  const resolved = path.resolve(path.dirname(pagePath), decoded);
  const relative = path.relative(projectRoot, resolved);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    return `Link escapes the project: ${rawTarget}`;
  }
  if (!fs.existsSync(resolved)) return `Link target does not exist: ${rawTarget}`;
  return null;
}

function dedupeLintIssues(issues: WikiLintIssue[]): WikiLintIssue[] {
  const seen = new Set<string>();
  return issues.filter((issue) => {
    const key = `${issue.code}\0${issue.page ?? ''}\0${issue.detail}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function generatedRegionProjection(content: string): string {
  const regionPattern = generatedRegionPattern();
  return [...content.matchAll(regionPattern)]
    .map((region) => `${region[1] ?? ''}\n${region[3] ?? ''}`)
    .join('\n---\n');
}

function generatedRegionPattern(): RegExp {
  return /<!-- sduck:generated:start key=([a-z0-9-]+) digest=(sha256:[0-9a-f]{64}) -->\n([\s\S]*?)\n<!-- sduck:generated:end -->/g;
}

function readHeadWikiManifest(projectRoot: string): WikiManifest | null {
  const content = gitShowFile(projectRoot, 'HEAD', WIKI_MANIFEST_PATH);
  if (content === null) return null;
  try {
    const parsed = JSON.parse(content) as unknown;
    if (!isRecord(parsed) || !Array.isArray(parsed['pages'])) return null;
    return parsed as unknown as WikiManifest;
  } catch {
    return null;
  }
}

function gitShowFile(projectRoot: string, revision: string, relativePath: string): string | null {
  try {
    return execFileSync('git', ['show', `${revision}:${relativePath}`], {
      cwd: projectRoot,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
  } catch {
    return null;
  }
}

function gitDiffLineCounts(
  projectRoot: string,
  relativePath: string,
): { added: number; deleted: number } | null {
  try {
    const output = execFileSync('git', ['diff', '--numstat', 'HEAD', '--', relativePath], {
      cwd: projectRoot,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    if (output === '') return null;
    const [added, deleted] = output.split(/\s+/);
    if (!/^\d+$/.test(added ?? '') || !/^\d+$/.test(deleted ?? '')) return null;
    return { added: Number(added), deleted: Number(deleted) };
  } catch {
    return null;
  }
}

function readWikiManifest(manifestPath: string): WikiManifest {
  if (!fs.existsSync(manifestPath)) {
    throw new Error('Wiki manifest is missing. Run `sduck wiki build --stdin`.');
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(fs.readFileSync(manifestPath, 'utf8')) as unknown;
  } catch (error) {
    throw new Error(`Wiki manifest JSON is malformed: ${formatError(error)}`);
  }
  if (
    !isRecord(parsed) ||
    parsed['schemaVersion'] !== WIKI_SCHEMA_VERSION ||
    parsed['wikiRoot'] !== WIKI_ROOT ||
    (typeof parsed['lastSyncedCommit'] !== 'string' && parsed['lastSyncedCommit'] !== null) ||
    !Array.isArray(parsed['pages'])
  ) {
    throw new Error('Wiki manifest schema is invalid.');
  }
  const pages = parsed['pages'];
  if (
    pages.length !== WIKI_PAGE_DEFINITIONS.length ||
    !pages.every(isWikiManifestPage) ||
    WIKI_PAGE_DEFINITIONS.some((definition) => {
      const matches = pages.filter((page) => page.kind === definition.kind);
      const match = matches[0];
      return (
        matches.length !== 1 ||
        match?.slug !== definition.slug ||
        match.path !== `${WIKI_ROOT}/${definition.fileName}`
      );
    })
  ) {
    throw new Error('Wiki manifest pages are invalid.');
  }
  return parsed as unknown as WikiManifest;
}

function isWikiManifestPage(value: unknown): value is WikiManifestPage {
  if (!isRecord(value)) return false;
  return (
    WIKI_PAGE_DEFINITIONS.some((item) => item.kind === value['kind']) &&
    typeof value['slug'] === 'string' &&
    typeof value['path'] === 'string' &&
    Array.isArray(value['sourceIds']) &&
    value['sourceIds'].every((item) => typeof item === 'string') &&
    isSha256Digest(value['sourceDigest']) &&
    isSha256Digest(value['generatedDigest']) &&
    (typeof value['lastSyncedCommit'] === 'string' || value['lastSyncedCommit'] === null) &&
    Array.isArray(value['observedDecisionIds']) &&
    value['observedDecisionIds'].every((item) => typeof item === 'string') &&
    Array.isArray(value['observedTraceIds']) &&
    value['observedTraceIds'].every((item) => typeof item === 'string')
  );
}

function renderBlocks(blocks: WikiPayloadBlock[], sources: Map<string, WikiSource>): string {
  return blocks
    .map((block) => {
      assertSourcesExist(block.sourceIds, sources);
      validateBlockSources(block, sources);
      const links = block.sourceIds
        .map((id) => {
          const source = sources.get(id);
          if (source === undefined) throw new Error(`Unknown Wiki source ID: ${id}`);
          return `[${id}](../../${source.relativePath})`;
        })
        .join(', ');
      return `> **${blockLabel(block.type)}**\n\n${block.markdown}\n\n_Sources: ${links}_`;
    })
    .join('\n\n');
}

function validateBlockSources(block: WikiPayloadBlock, sources: Map<string, WikiSource>): void {
  const kinds = new Set(block.sourceIds.map((id) => sources.get(id)?.kind));
  if (block.type === 'decision-intent' && !kinds.has('decision')) {
    throw new Error('decision-intent blocks require a decision source.');
  }
  if (block.type === 'change-tracking' && !kinds.has('trace')) {
    throw new Error('change-tracking blocks require a trace source.');
  }
  if (block.type === 'validation-report' && !kinds.has('evaluation')) {
    throw new Error('validation-report blocks require an evaluation source.');
  }
}

function blockLabel(type: WikiBlockType): string {
  const labels: Record<WikiBlockType, string> = {
    explanation: 'Explanation',
    'decision-intent': 'Decision intent',
    'implementation-claim': 'Recorded implementation claim (not code-verified by sduck)',
    'change-tracking': 'Changed files recorded by trace',
    'validation-report': 'Validation outcome reported to sduck',
    'semantic-conflict': 'Agent-proposed semantic conflict (not CLI-verified)',
  };
  return labels[type];
}

function sourceDigest(sourceIds: string[], sources: Map<string, WikiSource>): string {
  return sha256(
    stableStringify(
      sourceIds.map((id) => {
        const source = sources.get(id);
        if (source === undefined) throw new Error(`Unknown Wiki source ID: ${id}`);
        return { id: source.id, kind: source.kind, value: source.value };
      }),
    ),
  );
}

function manifestEntryHasDirtyEvidence(
  projectRoot: string,
  definition: WikiPageDefinition,
  entry: WikiManifestPage,
  bundle: SourceBundle,
  sources: Map<string, WikiSource>,
  head: string | null,
): boolean {
  if (entry.sourceIds.some((id) => !sources.has(id))) return true;
  if (
    entry.sourceIds.some((id) => {
      const source = sources.get(id);
      return (
        source?.kind === 'decision' &&
        isRecord(source.value) &&
        source.value['status'] === 'SUPERSEDED'
      );
    })
  ) {
    return true;
  }
  if (sourceDigest(entry.sourceIds, sources) !== entry.sourceDigest) return true;
  const newDecisionIds = bundle.decisions
    .filter((decision) => decision.status === 'CONFIRMED')
    .map((decision) => decision.id)
    .filter((id) => !entry.observedDecisionIds.includes(id));
  const newTraces = bundle.implementationTraces.filter(
    (trace) => !entry.observedTraceIds.includes(trace.id),
  );
  if (definition.kind === 'decisions-and-recent-changes') {
    if (newDecisionIds.length > 0 || newTraces.length > 0) return true;
  }
  const referencedDecisions = bundle.decisions.filter(
    (decision) => entry.sourceIds.includes(decision.id) && decision.status !== 'SUPERSEDED',
  );
  const referencedDecisionIds = new Set(referencedDecisions.map((decision) => decision.id));
  if (
    newTraces.some(
      (trace) =>
        trace.decisionIds.some((id) => referencedDecisionIds.has(id)) ||
        referencedDecisions.some(
          (decision) =>
            scoreDecisionForFiles(projectRoot, decision, trace.filesChanged).attached.length > 0,
        ),
    )
  ) {
    return true;
  }
  const committedChanges = filesChangedBetween(projectRoot, entry.lastSyncedCommit, head);
  return referencedDecisions.some(
    (decision) =>
      scoreDecisionForFiles(projectRoot, decision, committedChanges).attached.length > 0,
  );
}

function assertSourcesExist(sourceIds: string[], sources: Map<string, WikiSource>): void {
  const missing = sourceIds.filter((id) => !sources.has(id));
  if (missing.length > 0) throw new Error(`Unknown Wiki source ID(s): ${missing.join(', ')}`);
  const superseded = sourceIds.filter((id) => {
    const source = sources.get(id);
    return (
      source?.kind === 'decision' &&
      isRecord(source.value) &&
      source.value['status'] === 'SUPERSEDED'
    );
  });
  if (superseded.length > 0) {
    throw new Error(`Superseded Wiki source decision(s): ${superseded.join(', ')}`);
  }
}

function currentHead(projectRoot: string): string | null {
  try {
    return execFileSync('git', ['rev-parse', 'HEAD'], {
      cwd: projectRoot,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch {
    return null;
  }
}

function filesChangedBetween(
  projectRoot: string,
  base: string | null,
  head: string | null,
): string[] {
  if (base === null || head === null || base === head) return [];
  try {
    const output = execFileSync('git', ['diff', '--name-only', `${base}..${head}`, '--'], {
      cwd: projectRoot,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    if (output === '') return [];
    return [...new Set(output.split('\n').map((file) => file.trim().replaceAll('\\', '/')))]
      .filter(
        (file) =>
          file !== '' &&
          !file.startsWith(`${WIKI_ROOT}/`) &&
          file !== WIKI_ROOT &&
          !file.startsWith('.decision/'),
      )
      .sort();
  } catch {
    return [];
  }
}

function sha256(content: string): string {
  return `sha256:${createHash('sha256').update(content).digest('hex')}`;
}

function matchGroup(match: RegExpMatchArray, index: number): string {
  const value = match[index];
  if (value === undefined) throw new Error('Malformed generated ownership marker.');
  return value;
}

function isSha256Digest(value: unknown): value is string {
  return typeof value === 'string' && /^sha256:[0-9a-f]{64}$/.test(value);
}

function stableStringify(value: unknown): string {
  return JSON.stringify(sortJsonValue(value));
}

function sortJsonValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortJsonValue);
  if (!isRecord(value)) return value;
  return Object.fromEntries(
    Object.keys(value)
      .sort()
      .map((key) => [key, sortJsonValue(value[key])]),
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function formatError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
