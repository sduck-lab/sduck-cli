import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { access, mkdir, readFile, unlink, writeFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

import { runCloseCommand } from '../../src/commands/v2/index.js';
import { initProject } from '../../src/core/init.js';
import { updateProject } from '../../src/core/update.js';
import { confirmBrief } from '../../src/core/v2/brief.js';
import { DecisionWorkspace } from '../../src/core/v2/decision-workspace.js';
import { submitDraft } from '../../src/core/v2/draft.js';
import { recordGrillCompleted, recordGrillMeStarted } from '../../src/core/v2/grill.js';
import { policyPath } from '../../src/core/v2/paths.js';
import {
  migrateWikiPolicy,
  readDecisionWorkspacePolicy,
  readWikiPolicyStatus,
  setWorkflowEnabled,
} from '../../src/core/v2/policy.js';
import { createTask, setTerminalStatus } from '../../src/core/v2/task.js';
import { createImplementationTrace } from '../../src/core/v2/trace.js';
import {
  buildWiki,
  getWikiStatus,
  lintWiki,
  syncWiki,
  WIKI_SCHEMA_VERSION,
  type WikiPageKind,
  type WikiPayload,
  type WikiPayloadBlock,
} from '../../src/core/v2/wiki.js';
import { initDecisionWorkspace } from '../../src/core/v2/workspace.js';
import { createTempWorkspace, removeTempWorkspace } from '../helpers/temp-workspace.js';

const PAGE_SECTIONS = {
  overview: ['purpose', 'users-and-success', 'scope-and-constraints'],
  glossary: ['terms'],
  capabilities: ['capabilities', 'boundaries'],
  'architecture-and-flows': ['architecture', 'flows'],
  'decisions-and-recent-changes': ['decisions', 'recent-changes', 'validation-reports'],
} as const;

function buildPayload(sourceId: string): WikiPayload {
  return {
    schemaVersion: 'sduck-wiki/v1',
    pages: Object.entries(PAGE_SECTIONS).map(([kind, sectionIds]) => ({
      kind: kind as WikiPayload['pages'][number]['kind'],
      slug: kind,
      sections: sectionIds.map((id) => ({
        id,
        blocks: [
          {
            type: 'explanation' as const,
            markdown: `${id} explanation.`,
            sourceIds: [sourceId],
          },
        ],
      })),
    })),
  };
}

function git(root: string, args: string[]): string {
  return execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();
}

function requireWorkspace(value: string | undefined): string {
  if (value === undefined) throw new Error('Test workspace is not initialized.');
  return value;
}

function replaceGeneratedContent(content: string, key: string, markdown: string): string {
  const digest = `sha256:${createHash('sha256').update(markdown).digest('hex')}`;
  const pattern = new RegExp(
    `<!-- sduck:generated:start key=${key} digest=sha256:[0-9a-f]{64} -->\\n[\\s\\S]*?\\n<!-- sduck:generated:end -->`,
  );
  return content.replace(
    pattern,
    `<!-- sduck:generated:start key=${key} digest=${digest} -->\n${markdown}\n<!-- sduck:generated:end -->`,
  );
}

function humanOwnedProjection(content: string): string {
  return content.replace(
    /<!-- sduck:generated:start key=[a-z0-9-]+ digest=sha256:[0-9a-f]{64} -->\n[\s\S]*?\n<!-- sduck:generated:end -->/g,
    '<!-- generated region -->',
  );
}

describe('Auto Wiki core', () => {
  let workspace: string | undefined;

  afterEach(async () => {
    if (workspace !== undefined) await removeTempWorkspace(workspace);
    workspace = undefined;
  });

  it('builds the canonical five-page materialized view from an agent payload', async () => {
    workspace = await createTempWorkspace('wiki-build-');
    initDecisionWorkspace(workspace);
    const task = createTask(workspace, 'Document the project');
    const payload = buildPayload(task.id);
    payload.pages.reverse();
    for (const page of payload.pages) page.sections.reverse();

    const result = buildWiki(workspace, JSON.stringify(payload));

    expect(result.written.map((file) => relative(requireWorkspace(workspace), file))).toEqual([
      'docs/wiki/.sduck-wiki.json',
      'docs/wiki/README.md',
      'docs/wiki/glossary.md',
      'docs/wiki/capabilities.md',
      'docs/wiki/architecture-and-flows.md',
      'docs/wiki/decisions-and-recent-changes.md',
    ]);

    const manifest = JSON.parse(
      await readFile(join(workspace, 'docs/wiki/.sduck-wiki.json'), 'utf8'),
    ) as {
      schemaVersion: string;
      wikiRoot: string;
      lastSyncedCommit: string | null;
      pages: {
        kind: string;
        path: string;
        sourceIds: string[];
        sourceDigest: string;
        generatedDigest: string;
        lastSyncedCommit: string | null;
      }[];
    };
    expect(manifest.schemaVersion).toBe('sduck-wiki/v1');
    expect(manifest.wikiRoot).toBe('docs/wiki');
    expect(manifest.lastSyncedCommit).toBeNull();
    expect(manifest.pages.map((page) => page.kind)).toEqual(Object.keys(PAGE_SECTIONS));
    expect(manifest.pages.map((page) => page.path)).toEqual([
      'docs/wiki/README.md',
      'docs/wiki/glossary.md',
      'docs/wiki/capabilities.md',
      'docs/wiki/architecture-and-flows.md',
      'docs/wiki/decisions-and-recent-changes.md',
    ]);
    expect(manifest.pages.every((page) => page.sourceIds.includes(task.id))).toBe(true);
    expect(
      manifest.pages.every(
        (page) =>
          /^sha256:[0-9a-f]{64}$/.test(page.sourceDigest) &&
          /^sha256:[0-9a-f]{64}$/.test(page.generatedDigest) &&
          page.lastSyncedCommit === null,
      ),
    ).toBe(true);

    const overview = await readFile(join(workspace, 'docs/wiki/README.md'), 'utf8');
    expect(overview).toContain('page_kind: overview');
    expect(overview).toContain(
      'section_order:\n  - purpose\n  - users-and-success\n  - scope-and-constraints',
    );
    expect(overview.indexOf('## Purpose')).toBeLessThan(overview.indexOf('## Users & Success'));
    expect(overview.indexOf('## Users & Success')).toBeLessThan(
      overview.indexOf('## Scope & Constraints'),
    );
    expect(overview).toContain('<!-- sduck:generated:start key=purpose digest=sha256:');
    expect(overview).toContain('## Team Notes');
    expect(overview).toContain(task.id);
    expect(overview).toContain(`_Sources: [${task.id}](../../.decision/exports/markdown/tasks/`);
  });

  it('updates generated prose without changing human-owned page bytes', async () => {
    workspace = await createTempWorkspace('wiki-human-owned-');
    initDecisionWorkspace(workspace);
    const task = createTask(workspace, 'Preserve team notes');
    const payload = buildPayload(task.id);
    buildWiki(workspace, JSON.stringify(payload));

    const overviewPath = join(workspace, 'docs/wiki/README.md');
    const humanNote = 'Human-owned note with deliberate  spacing.';
    const before = await readFile(overviewPath, 'utf8');
    await writeFile(
      overviewPath,
      before.replace(
        'Add team-owned notes here. This area is never changed by sduck Wiki sync.',
        humanNote,
      ),
    );
    const humanOwnedBefore = humanOwnedProjection(await readFile(overviewPath, 'utf8'));
    const overview = payload.pages.find((page) => page.kind === 'overview');
    if (overview === undefined) throw new Error('Missing test Overview page.');
    const purpose = overview.sections.find((section) => section.id === 'purpose');
    if (purpose === undefined) throw new Error('Missing test purpose section.');
    purpose.blocks[0] = {
      type: 'explanation',
      markdown: 'Updated generated purpose.',
      sourceIds: [task.id],
    };

    syncWiki(workspace, JSON.stringify({ schemaVersion: WIKI_SCHEMA_VERSION, pages: [overview] }), {
      force: true,
    });

    const after = await readFile(overviewPath, 'utf8');
    expect(humanOwnedProjection(after)).toBe(humanOwnedBefore);
    expect(after).toContain('Updated generated purpose.');
    expect(after).toContain(humanNote);
    expect(after.match(/Human-owned note with deliberate {2}spacing\./g)).toHaveLength(1);
  });

  it('refuses to build over an existing human-owned Wiki target', async () => {
    workspace = await createTempWorkspace('wiki-build-collision-');
    initDecisionWorkspace(workspace);
    const task = createTask(workspace, 'Preserve pre-existing Wiki files');
    const overviewPath = join(workspace, 'docs/wiki/README.md');
    const existingContent = '# Existing team Wiki\n\nDo not replace this file.\n';
    await mkdir(join(workspace, 'docs/wiki'), { recursive: true });
    await writeFile(overviewPath, existingContent);

    expect(() =>
      buildWiki(requireWorkspace(workspace), JSON.stringify(buildPayload(task.id))),
    ).toThrow(/will not be overwritten/);

    expect(await readFile(overviewPath, 'utf8')).toBe(existingContent);
    await expect(access(join(workspace, 'docs/wiki/.sduck-wiki.json'))).rejects.toThrow();
    await expect(access(join(workspace, 'docs/wiki/glossary.md'))).rejects.toThrow();
  });

  it('marks pages stale when a referenced canonical source digest changes', async () => {
    workspace = await createTempWorkspace('wiki-source-stale-');
    initDecisionWorkspace(workspace);
    const task = createTask(workspace, 'Track source changes', { guided: true });
    buildWiki(workspace, JSON.stringify(buildPayload(task.id)));

    expect(getWikiStatus(workspace).pages.every((page) => !page.dirty && !page.stale)).toBe(true);

    recordGrillCompleted(workspace, { reason: 'The test scope is explicit.' });
    submitDraft(
      workspace,
      JSON.stringify({
        schemaVersion: 'v2alpha1',
        taskId: task.id,
        decisions: [],
        questions: [],
        evidence: [],
        expectedScope: ['src/**'],
      }),
    );

    const status = getWikiStatus(workspace);
    expect(status.pages.every((page) => page.dirty && page.stale)).toBe(true);
    expect(status.pages[0]?.reasons).toContain('source-digest-changed');
  });

  it('refuses to overwrite an edited generated section without explicit force', async () => {
    workspace = await createTempWorkspace('wiki-generated-conflict-');
    initDecisionWorkspace(workspace);
    const task = createTask(workspace, 'Protect generated edits');
    const payload = buildPayload(task.id);
    buildWiki(workspace, JSON.stringify(payload));
    const overviewPath = join(workspace, 'docs/wiki/README.md');
    const edited = (await readFile(overviewPath, 'utf8')).replace(
      'purpose explanation.',
      'Human edited the generated purpose.',
    );
    await writeFile(overviewPath, edited);

    const status = getWikiStatus(workspace);
    expect(status.pages[0]).toMatchObject({
      conflict: true,
      stale: true,
      editedGeneratedSections: ['purpose'],
    });
    const overview = payload.pages.find((page) => page.kind === 'overview');
    if (overview === undefined) throw new Error('Missing test Overview page.');
    expect(() =>
      syncWiki(
        requireWorkspace(workspace),
        JSON.stringify({ schemaVersion: WIKI_SCHEMA_VERSION, pages: [overview] }),
      ),
    ).toThrow(/was edited/);
    expect(await readFile(overviewPath, 'utf8')).toBe(edited);
  });

  it('rejects unsafe or malformed payloads without creating Wiki artifacts', async () => {
    workspace = await createTempWorkspace('wiki-invalid-payload-');
    initDecisionWorkspace(workspace);
    const task = createTask(workspace, 'Reject unsafe Wiki input');
    const base = buildPayload(task.id);
    const cases: WikiPayload[] = [
      {
        ...base,
        pages: base.pages.map((page, index) =>
          index === 0 ? { ...page, slug: '../../outside' } : page,
        ),
      },
      {
        ...base,
        pages: base.pages.map((page, index) =>
          index === 1 ? { ...page, slug: 'overview' } : page,
        ),
      },
      {
        ...base,
        pages: base.pages.map((page, index) =>
          index === 0 ? { ...page, kind: 'not-a-page' as WikiPageKind } : page,
        ),
      },
      buildPayload('DEC-does-not-exist'),
      {
        ...base,
        pages: base.pages.map((page, pageIndex) =>
          pageIndex === 0
            ? {
                ...page,
                sections: page.sections.map((section, sectionIndex) =>
                  sectionIndex === 0
                    ? {
                        ...section,
                        blocks: [
                          {
                            ...section.blocks[0],
                            markdown: '<!-- sduck:generated:end -->',
                          } as WikiPayloadBlock,
                        ],
                      }
                    : section,
                ),
              }
            : page,
        ),
      },
    ];

    for (const candidate of cases) {
      expect(() => buildWiki(requireWorkspace(workspace), JSON.stringify(candidate))).toThrow();
    }
    await expect(access(join(workspace, 'docs/wiki'))).rejects.toThrow();
  });

  it('keeps typed evidence classes distinct', async () => {
    workspace = await createTempWorkspace('wiki-evidence-types-');
    initDecisionWorkspace(workspace);
    const task = createTask(workspace, 'Keep Wiki evidence language precise');
    const cases: { type: WikiPayloadBlock['type']; expected: RegExp }[] = [
      { type: 'decision-intent', expected: /decision source/ },
      { type: 'change-tracking', expected: /trace source/ },
      { type: 'validation-report', expected: /evaluation source/ },
    ];

    for (const candidate of cases) {
      const payload = buildPayload(task.id);
      const firstBlock = payload.pages[0]?.sections[0]?.blocks[0];
      if (firstBlock === undefined) throw new Error('Missing fixture block.');
      firstBlock.type = candidate.type;
      expect(() => buildWiki(requireWorkspace(workspace), JSON.stringify(payload))).toThrow(
        candidate.expected,
      );
    }

    const payload = buildPayload(task.id);
    const overview = payload.pages[0];
    if (overview === undefined) throw new Error('Missing fixture Overview.');
    overview.sections[0]?.blocks.splice(0, 1, {
      type: 'implementation-claim',
      markdown: 'The agent recorded an implementation claim.',
      sourceIds: [task.id],
    });
    overview.sections[1]?.blocks.splice(0, 1, {
      type: 'semantic-conflict',
      markdown: 'The agent proposes a possible meaning conflict.',
      sourceIds: [task.id],
    });

    buildWiki(workspace, JSON.stringify(payload));

    const content = await readFile(join(workspace, 'docs/wiki/README.md'), 'utf8');
    expect(content).toContain('Recorded implementation claim (not code-verified by sduck)');
    expect(content).toContain('Agent-proposed semantic conflict (not CLI-verified)');
  });

  it('keeps identical sync idempotent and unrelated pages unchanged', async () => {
    workspace = await createTempWorkspace('wiki-selective-sync-');
    initDecisionWorkspace(workspace);
    const task = createTask(workspace, 'Sync one Wiki page');
    const payload = buildPayload(task.id);
    buildWiki(workspace, JSON.stringify(payload));
    const overview = payload.pages.find((page) => page.kind === 'overview');
    if (overview === undefined) throw new Error('Missing test Overview page.');
    const glossaryPath = join(workspace, 'docs/wiki/glossary.md');
    const glossaryBefore = await readFile(glossaryPath, 'utf8');

    const first = syncWiki(
      workspace,
      JSON.stringify({ schemaVersion: WIKI_SCHEMA_VERSION, pages: [overview] }),
    );
    expect(first.written).toEqual([]);

    const purpose = overview.sections.find((section) => section.id === 'purpose');
    if (purpose === undefined) throw new Error('Missing test purpose section.');
    purpose.blocks[0] = {
      type: 'explanation',
      markdown: 'Only Overview changes.',
      sourceIds: [task.id],
    };
    syncWiki(workspace, JSON.stringify({ schemaVersion: WIKI_SCHEMA_VERSION, pages: [overview] }), {
      force: true,
    });

    expect(await readFile(glossaryPath, 'utf8')).toBe(glossaryBefore);
    expect(await readFile(join(workspace, 'docs/wiki/README.md'), 'utf8')).toContain(
      'Only Overview changes.',
    );
  });

  it('requires force to rewrite generated prose on a clean page', async () => {
    workspace = await createTempWorkspace('wiki-clean-rewrite-');
    initDecisionWorkspace(workspace);
    const task = createTask(workspace, 'Reject clean-page rewrite');
    const payload = buildPayload(task.id);
    buildWiki(workspace, JSON.stringify(payload));
    const overview = payload.pages.find((page) => page.kind === 'overview');
    if (overview === undefined) throw new Error('Missing test Overview page.');
    const purpose = overview.sections.find((section) => section.id === 'purpose');
    if (purpose === undefined) throw new Error('Missing test purpose section.');
    purpose.blocks[0] = {
      type: 'explanation',
      markdown: 'A speculative clean-page rewrite.',
      sourceIds: [task.id],
    };
    const overviewPath = join(workspace, 'docs/wiki/README.md');
    const before = await readFile(overviewPath, 'utf8');

    expect(() =>
      syncWiki(
        requireWorkspace(workspace),
        JSON.stringify({ schemaVersion: WIKI_SCHEMA_VERSION, pages: [overview] }),
      ),
    ).toThrow(/not dirty/);
    expect(await readFile(overviewPath, 'utf8')).toBe(before);
  });

  it('keeps multi-page sync atomic when a later page is invalid', async () => {
    workspace = await createTempWorkspace('wiki-sync-atomic-');
    initDecisionWorkspace(workspace);
    const task = createTask(workspace, 'Reject partial Wiki sync');
    const payload = buildPayload(task.id);
    buildWiki(workspace, JSON.stringify(payload));
    const overview = payload.pages.find((page) => page.kind === 'overview');
    const glossary = payload.pages.find((page) => page.kind === 'glossary');
    if (overview === undefined || glossary === undefined) throw new Error('Missing fixture page.');
    const purpose = overview.sections.find((section) => section.id === 'purpose');
    if (purpose === undefined) throw new Error('Missing fixture purpose section.');
    purpose.blocks[0] = {
      type: 'explanation',
      markdown: 'This valid earlier update must not commit.',
      sourceIds: [task.id],
    };
    glossary.sections[0]?.blocks.splice(0, 1, {
      type: 'explanation',
      markdown: 'This later page has an invalid source.',
      sourceIds: ['DEC-missing-from-sync'],
    });
    const manifestPath = join(workspace, 'docs/wiki/.sduck-wiki.json');
    const overviewPath = join(workspace, 'docs/wiki/README.md');
    const before = await Promise.all([
      readFile(manifestPath, 'utf8'),
      readFile(overviewPath, 'utf8'),
    ]);

    expect(() =>
      syncWiki(
        requireWorkspace(workspace),
        JSON.stringify({
          schemaVersion: WIKI_SCHEMA_VERSION,
          pages: [overview, glossary],
        }),
        { force: true },
      ),
    ).toThrow(/Unknown Wiki source/);
    expect(
      await Promise.all([readFile(manifestPath, 'utf8'), readFile(overviewPath, 'utf8')]),
    ).toEqual(before);
  });

  it('reports missing and superseded canonical source IDs as stale', async () => {
    workspace = await createTempWorkspace('wiki-source-integrity-');
    initDecisionWorkspace(workspace);
    const task = createTask(workspace, 'Track decision integrity', { guided: true });
    recordGrillCompleted(workspace, { reason: 'The two fixture decisions are explicit.' });
    submitDraft(
      workspace,
      JSON.stringify({
        schemaVersion: 'v2alpha1',
        taskId: task.id,
        decisions: [
          {
            id: 'DEC-wiki-missing',
            title: 'Missing source fixture',
            kind: 'EXPLICIT',
            summary: 'This decision will be removed by fixture setup.',
          },
          {
            id: 'DEC-wiki-superseded',
            title: 'Superseded source fixture',
            kind: 'EXPLICIT',
            summary: 'This decision will be superseded by fixture setup.',
          },
        ],
        implementationPlan: ['Create the fixture Wiki.'],
        verificationPlan: ['Inspect deterministic status.'],
      }),
    );
    confirmBrief(workspace);
    const payload = buildPayload('DEC-wiki-missing');
    for (const page of payload.pages) {
      for (const section of page.sections) {
        section.blocks[0] = {
          type: 'explanation',
          markdown: `${section.id} decision explanation.`,
          sourceIds: ['DEC-wiki-missing', 'DEC-wiki-superseded'],
        };
      }
    }
    buildWiki(workspace, JSON.stringify(payload));

    new DecisionWorkspace(workspace).mutate(({ bundle }) => {
      bundle.decisions = bundle.decisions
        .filter((decision) => decision.id !== 'DEC-wiki-missing')
        .map((decision) =>
          decision.id === 'DEC-wiki-superseded'
            ? { ...decision, status: 'SUPERSEDED' as const }
            : decision,
        );
    });

    const page = getWikiStatus(workspace).pages[0];
    expect(page).toMatchObject({
      dirty: true,
      stale: true,
      missingSourceIds: ['DEC-wiki-missing'],
      supersededSourceIds: ['DEC-wiki-superseded'],
    });
    expect(page?.reasons).toEqual(expect.arrayContaining(['source-missing', 'source-superseded']));
  });

  it('reports relevant files changed after the page last-synced commit', async () => {
    workspace = await createTempWorkspace('wiki-external-commit-');
    git(workspace, ['init']);
    git(workspace, ['config', 'user.email', 'wiki-test@example.com']);
    git(workspace, ['config', 'user.name', 'Wiki Test']);
    await writeFile(join(workspace, 'README.md'), '# Fixture\n');
    git(workspace, ['add', 'README.md']);
    git(workspace, ['commit', '-m', 'initial']);
    initDecisionWorkspace(workspace);
    const task = createTask(workspace, 'Track payment changes', { guided: true });
    recordGrillCompleted(workspace, { reason: 'The fixture decision is explicit.' });
    submitDraft(
      workspace,
      JSON.stringify({
        schemaVersion: 'v2alpha1',
        taskId: task.id,
        decisions: [
          {
            id: 'DEC-payment-wiki',
            title: 'Document payment changes',
            kind: 'EXPLICIT',
            summary: 'Payment changes update the related Wiki page.',
            appliesTo: ['src/payment.ts'],
          },
        ],
        implementationPlan: ['Create the fixture.'],
        verificationPlan: ['Inspect Wiki status.'],
      }),
    );
    confirmBrief(workspace);
    buildWiki(workspace, JSON.stringify(buildPayload('DEC-payment-wiki')));

    await mkdir(join(workspace, 'src'), { recursive: true });
    await writeFile(join(workspace, 'src/payment.ts'), 'export const retries = 3;\n');
    git(workspace, ['add', 'src/payment.ts']);
    git(workspace, ['commit', '-m', 'change payment']);

    const status = getWikiStatus(workspace);
    expect(status.externalChangedFiles).toEqual(['src/payment.ts']);
    expect(status.pages[0]).toMatchObject({
      dirty: true,
      externalChangedFiles: ['src/payment.ts'],
    });
    expect(status.pages[0]?.reasons).toContain('external-relevant-change');
  });

  it('uses new trace decision IDs and exposes unmapped decisions', async () => {
    workspace = await createTempWorkspace('wiki-new-trace-');
    git(workspace, ['init']);
    git(workspace, ['config', 'user.email', 'wiki-test@example.com']);
    git(workspace, ['config', 'user.name', 'Wiki Test']);
    await writeFile(join(workspace, 'README.md'), '# Fixture\n');
    git(workspace, ['add', 'README.md']);
    git(workspace, ['commit', '-m', 'initial']);
    initDecisionWorkspace(workspace);
    const task = createTask(workspace, 'Track an unmapped change', { guided: true });
    recordGrillCompleted(workspace, { reason: 'The fixture decision is explicit.' });
    submitDraft(
      workspace,
      JSON.stringify({
        schemaVersion: 'v2alpha1',
        taskId: task.id,
        decisions: [
          {
            id: 'DEC-unmapped-wiki',
            title: 'Expected implementation path',
            kind: 'EXPLICIT',
            summary: 'The decision expects a different implementation path.',
            appliesTo: ['src/expected.ts'],
          },
        ],
        implementationPlan: ['Create the fixture.'],
        verificationPlan: ['Inspect Wiki status.'],
      }),
    );
    confirmBrief(workspace);
    buildWiki(workspace, JSON.stringify(buildPayload('DEC-unmapped-wiki')));
    await mkdir(join(workspace, 'src'), { recursive: true });
    await writeFile(join(workspace, 'src/actual.ts'), 'export const actual = true;\n');

    createImplementationTrace(workspace);

    const status = getWikiStatus(workspace);
    expect(status.pages[0]?.reasons).toContain('new-trace');
    const globalPage = status.pages.find((page) => page.kind === 'decisions-and-recent-changes');
    expect(globalPage?.reasons).toEqual(expect.arrayContaining(['new-trace', 'unmapped-decision']));
    expect(globalPage?.unmappedDecisionIds).toEqual(['DEC-unmapped-wiki']);
  });

  it('defaults new workspaces on but requires explicit migration for durable policy-less workspaces', async () => {
    workspace = await createTempWorkspace('wiki-policy-migration-');
    initDecisionWorkspace(workspace);
    expect(readWikiPolicyStatus(workspace)).toMatchObject({ enabled: true, initialized: true });
    const task = createTask(workspace, 'Create durable source before policy removal');
    await unlink(policyPath(workspace));

    initDecisionWorkspace(workspace);
    expect(readWikiPolicyStatus(workspace)).toMatchObject({ enabled: false, initialized: false });
    expect(getWikiStatus(workspace)).toMatchObject({ enabled: false, pages: [] });
    expect(() =>
      buildWiki(requireWorkspace(workspace), JSON.stringify(buildPayload(task.id))),
    ).toThrow(/update/);
    await expect(access(join(workspace, 'docs/wiki'))).rejects.toThrow();

    expect(migrateWikiPolicy(workspace)).toMatchObject({ enabled: true, initialized: true });
    expect(getWikiStatus(workspace)).toMatchObject({ enabled: true, manifestExists: false });
    await expect(access(join(workspace, 'docs/wiki'))).rejects.toThrow();
  });

  it('does not introduce Wiki policy through unrelated workflow toggles', async () => {
    workspace = await createTempWorkspace('wiki-policy-toggle-');
    initDecisionWorkspace(workspace);
    createTask(workspace, 'Keep a durable policy-less workspace compatible');
    setTerminalStatus(workspace, 'ABANDONED');
    await unlink(policyPath(workspace));

    setWorkflowEnabled(workspace, false);

    expect(readDecisionWorkspacePolicy(workspace)).toMatchObject({
      requireGrillMe: true,
      workflowEnabled: false,
    });
    expect(readWikiPolicyStatus(workspace)).toMatchObject({ enabled: false, initialized: false });
    await expect(access(join(workspace, 'docs/wiki'))).rejects.toThrow();
  });

  it('preserves existing legacy policy fields during explicit Wiki migration', async () => {
    workspace = await createTempWorkspace('wiki-policy-preserve-');
    initDecisionWorkspace(workspace);
    await writeFile(
      policyPath(workspace),
      `${JSON.stringify({
        schemaVersion: 'v2alpha1',
        requireGrillMe: false,
        workflowEnabled: false,
      })}\n`,
    );

    migrateWikiPolicy(workspace);

    expect(readDecisionWorkspacePolicy(workspace)).toEqual({
      schemaVersion: 'v2alpha1',
      requireGrillMe: false,
      workflowEnabled: false,
      wiki: { enabled: true, root: 'docs/wiki' },
    });
    await expect(access(join(workspace, 'docs/wiki'))).rejects.toThrow();
  });

  it('migrates Wiki policy through sduck update without rewriting canonical task source', async () => {
    workspace = await createTempWorkspace('wiki-update-migration-');
    await initProject({ force: true, agents: [] }, workspace);
    initDecisionWorkspace(workspace);
    const task = createTask(workspace, 'Preserve this durable task');
    const taskPath = join(workspace, '.decision/exports/markdown/tasks', `${task.id}.md`);
    const taskBefore = await readFile(taskPath, 'utf8');
    await unlink(policyPath(workspace));

    const result = await updateProject({ dryRun: false }, workspace);

    expect(result.didChange).toBe(true);
    expect(result.summary.rows).toContainEqual({
      path: '.decision/policy.json',
      status: 'created',
    });
    expect(readWikiPolicyStatus(workspace)).toMatchObject({ enabled: true, initialized: true });
    expect(await readFile(taskPath, 'utf8')).toBe(taskBefore);
    await expect(access(join(workspace, 'docs/wiki'))).rejects.toThrow();
  });

  it('lints malformed ownership markers and broken internal links', async () => {
    workspace = await createTempWorkspace('wiki-lint-integrity-');
    initDecisionWorkspace(workspace);
    const task = createTask(workspace, 'Lint Wiki integrity');
    buildWiki(workspace, JSON.stringify(buildPayload(task.id)));
    const overviewPath = join(workspace, 'docs/wiki/README.md');
    const malformed = (await readFile(overviewPath, 'utf8'))
      .replace('<!-- sduck:generated:end -->', '')
      .replace('## Team Notes', '## Team Notes\n\n[Missing page](./missing.md)');
    await writeFile(overviewPath, malformed);

    const result = lintWiki(workspace);

    expect(result.ok).toBe(false);
    expect(result.issues.map((issue) => issue.code)).toEqual(
      expect.arrayContaining(['ownership-marker-invalid', 'broken-link']),
    );
  });

  it('lints fixed page slug and section-order changes', async () => {
    workspace = await createTempWorkspace('wiki-lint-page-schema-');
    initDecisionWorkspace(workspace);
    const task = createTask(workspace, 'Lint fixed Wiki page identity');
    buildWiki(workspace, JSON.stringify(buildPayload(task.id)));
    const overviewPath = join(workspace, 'docs/wiki/README.md');
    const original = await readFile(overviewPath, 'utf8');

    await writeFile(overviewPath, original.replace('slug: overview', 'slug: moved-overview'));
    expect(lintWiki(workspace).issues.map((issue) => issue.code)).toContain('page-schema-invalid');

    await writeFile(
      overviewPath,
      original.replace('  - purpose\n  - users-and-success', '  - users-and-success\n  - purpose'),
    );
    expect(lintWiki(workspace).issues.map((issue) => issue.code)).toContain('page-schema-invalid');
  });

  it('lints generated prose changes when canonical sources did not change', async () => {
    workspace = await createTempWorkspace('wiki-lint-source-noise-');
    git(workspace, ['init']);
    git(workspace, ['config', 'user.email', 'wiki-test@example.com']);
    git(workspace, ['config', 'user.name', 'Wiki Test']);
    initDecisionWorkspace(workspace);
    const task = createTask(workspace, 'Detect generated diff noise');
    buildWiki(workspace, JSON.stringify(buildPayload(task.id)));
    git(workspace, ['add', '.decision/exports', 'docs/wiki']);
    git(workspace, ['commit', '-m', 'build wiki']);
    const overviewPath = join(workspace, 'docs/wiki/README.md');
    const rewritten = replaceGeneratedContent(
      await readFile(overviewPath, 'utf8'),
      'purpose',
      'Rewritten prose with a matching marker digest but unchanged sources.',
    );
    await writeFile(overviewPath, rewritten);

    const result = lintWiki(workspace);

    expect(result.ok).toBe(false);
    expect(result.issues.map((issue) => issue.code)).toEqual(
      expect.arrayContaining([
        'generated-change-without-source-change',
        'clean-page-generated-change',
      ]),
    );
  });

  it('reports whole-page and unusually large Wiki diffs as warnings', async () => {
    workspace = await createTempWorkspace('wiki-lint-large-diff-');
    git(workspace, ['init']);
    git(workspace, ['config', 'user.email', 'wiki-test@example.com']);
    git(workspace, ['config', 'user.name', 'Wiki Test']);
    initDecisionWorkspace(workspace);
    const task = createTask(workspace, 'Warn about large Wiki diffs');
    buildWiki(workspace, JSON.stringify(buildPayload(task.id)));
    git(workspace, ['add', '.decision/exports', 'docs/wiki']);
    git(workspace, ['commit', '-m', 'build wiki']);
    const overviewPath = join(workspace, 'docs/wiki/README.md');
    const largeContent = Array.from(
      { length: 450 },
      (_, index) => `Generated line ${String(index + 1)}.`,
    ).join('\n');
    await writeFile(
      overviewPath,
      replaceGeneratedContent(await readFile(overviewPath, 'utf8'), 'purpose', largeContent),
    );

    const result = lintWiki(workspace);
    const issues = result.issues.filter((issue) =>
      ['whole-page-rewrite', 'large-wiki-diff'].includes(issue.code),
    );

    expect(issues.map((issue) => issue.code)).toEqual(
      expect.arrayContaining(['whole-page-rewrite', 'large-wiki-diff']),
    );
    expect(issues.every((issue) => issue.severity === 'warning')).toBe(true);
  });

  it('closes successfully while reporting newly stale Wiki pages as advisory', async () => {
    workspace = await createTempWorkspace('wiki-close-advisory-');
    initDecisionWorkspace(workspace);
    const task = createTask(workspace, 'Close without making Wiki a gate');
    recordGrillMeStarted(workspace);
    submitDraft(
      workspace,
      JSON.stringify({
        schemaVersion: 'v2alpha1',
        taskId: task.id,
        decisions: [
          {
            id: 'DEC-close-wiki-advisory',
            title: 'Keep close non-gating',
            kind: 'EXPLICIT',
            summary: 'Wiki dirtiness is advisory.',
          },
        ],
      }),
    );
    confirmBrief(workspace);
    buildWiki(workspace, JSON.stringify(buildPayload(task.id)));

    const closed = runCloseCommand(workspace);

    expect(closed.exitCode).toBe(0);
    expect(closed.stdout).toContain(`Decision task closed: ${task.id}`);
    expect(closed.stdout).toContain('Wiki advisory: 5 dirty page(s), 5 stale page(s)');
    expect(closed.stdout).toContain('sd-sync-wiki');
  });
});
