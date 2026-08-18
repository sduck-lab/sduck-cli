import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

import { createTempWorkspace, removeTempWorkspace } from '../helpers/temp-workspace.js';

describe('category taxonomy', () => {
  let workspace: string | null = null;

  afterEach(async () => {
    if (workspace !== null) await removeTempWorkspace(workspace);
    workspace = null;
  });

  it('rejects a malformed categories field in policy.json', async () => {
    workspace = await createTempWorkspace('v2-categories-policy-');
    const { initDecisionWorkspace } = await import('../../src/core/v2/workspace.js');
    const { readDecisionWorkspacePolicy } = await import('../../src/core/v2/policy.js');
    const { isV2ExpectedError } = await import('../../src/core/v2/errors.js');

    initDecisionWorkspace(workspace);
    await writeFile(
      join(workspace, '.decision', 'policy.json'),
      JSON.stringify({
        schemaVersion: 'v2alpha1',
        requireGrillMe: true,
        workflowEnabled: true,
        categories: ['ok', ''],
      }),
    );

    try {
      readDecisionWorkspacePolicy(workspace);
      throw new Error('expected POLICY_INVALID to be thrown');
    } catch (error) {
      expect(isV2ExpectedError(error)).toBe(true);
    }
  });

  it('sets categories, rejects an empty list, and lists counts including uncategorized', async () => {
    workspace = await createTempWorkspace('v2-categories-set-');
    const { initDecisionWorkspace } = await import('../../src/core/v2/workspace.js');
    const { setCategories, readCategoriesStatus } = await import('../../src/core/v2/policy.js');
    const { isV2ExpectedError } = await import('../../src/core/v2/errors.js');
    const { createTask } = await import('../../src/core/v2/task.js');
    const { recordGrillMeStarted } = await import('../../src/core/v2/grill.js');
    const { submitDraft } = await import('../../src/core/v2/draft.js');
    const { confirmBrief } = await import('../../src/core/v2/brief.js');
    const { listCategoryCounts } = await import('../../src/core/v2/categories.js');

    initDecisionWorkspace(workspace);

    try {
      setCategories(workspace, []);
      throw new Error('expected CATEGORIES_EMPTY to be thrown');
    } catch (error) {
      expect(isV2ExpectedError(error)).toBe(true);
    }

    setCategories(workspace, ['인증/보안', '결제']);
    expect(readCategoriesStatus(workspace)).toMatchObject({
      configured: true,
      categories: ['인증/보안', '결제'],
    });

    const task = createTask(workspace, '카테고리 테스트');
    recordGrillMeStarted(workspace);
    submitDraft(
      workspace,
      JSON.stringify({
        schemaVersion: 'v2alpha1',
        taskId: task.id,
        decisions: [
          {
            id: 'DEC-cat-auth',
            title: 'Use session cookies',
            kind: 'EXPLICIT',
            summary: 'Auth decision',
            confidence: 1,
            category: '인증/보안',
          },
          {
            id: 'DEC-cat-none',
            title: 'Uncategorized decision',
            kind: 'EXPLICIT',
            summary: 'No category given',
            confidence: 1,
          },
        ],
        questions: [],
        evidence: [],
        expectedScope: [],
        avoidScope: [],
      }),
    );
    confirmBrief(workspace);

    const view = listCategoryCounts(workspace);
    expect(view.configured).toEqual(['인증/보안', '결제']);
    expect(view.counts).toEqual([
      { category: '인증/보안', count: 1 },
      { category: '결제', count: 0 },
    ]);
    expect(view.uncategorized).toBe(1);

    const { browseCategory } = await import('../../src/core/v2/categories.js');

    const auth = browseCategory(workspace, '인증/보안');
    expect(auth.category).toBe('인증/보안');
    expect(auth.truncated).toBe(false);
    expect(auth.items).toEqual([
      { id: 'DEC-cat-auth', title: 'Use session cookies', status: 'CONFIRMED' },
    ]);

    const uncategorized = browseCategory(workspace, null);
    expect(uncategorized.category).toBeNull();
    expect(uncategorized.items.map((item) => item.id)).toContain('DEC-cat-none');

    try {
      browseCategory(workspace, '없는카테고리');
      throw new Error('expected CATEGORY_NOT_FOUND to be thrown');
    } catch (error) {
      expect(isV2ExpectedError(error)).toBe(true);
    }
  });

  it('honors a caller-supplied browse limit, truncating honestly, and rejects a non-positive limit', async () => {
    workspace = await createTempWorkspace('v2-categories-limit-');
    const { initDecisionWorkspace } = await import('../../src/core/v2/workspace.js');
    const { setCategories } = await import('../../src/core/v2/policy.js');
    const { createTask } = await import('../../src/core/v2/task.js');
    const { recordGrillMeStarted } = await import('../../src/core/v2/grill.js');
    const { submitDraft } = await import('../../src/core/v2/draft.js');
    const { confirmBrief } = await import('../../src/core/v2/brief.js');
    const { browseCategory, DEFAULT_BROWSE_LIMIT } =
      await import('../../src/core/v2/categories.js');
    const { isV2ExpectedError } = await import('../../src/core/v2/errors.js');

    initDecisionWorkspace(workspace);
    setCategories(workspace, ['결제']);
    const task = createTask(workspace, '한도 테스트');
    recordGrillMeStarted(workspace);
    submitDraft(
      workspace,
      JSON.stringify({
        schemaVersion: 'v2alpha1',
        taskId: task.id,
        decisions: [1, 2, 3].map((n) => ({
          id: `DEC-limit-${String(n)}`,
          title: `Payment decision ${String(n)}`,
          kind: 'EXPLICIT',
          summary: 'Summary',
          confidence: 1,
          category: '결제',
        })),
        questions: [],
        evidence: [],
        expectedScope: [],
        avoidScope: [],
      }),
    );
    confirmBrief(workspace);

    expect(DEFAULT_BROWSE_LIMIT).toBe(500);

    const full = browseCategory(workspace, '결제');
    expect(full.items).toHaveLength(3);
    expect(full.truncated).toBe(false);

    const limited = browseCategory(workspace, '결제', 2);
    expect(limited.items).toHaveLength(2);
    expect(limited.truncated).toBe(true);

    for (const badLimit of [0, -1, 1.5]) {
      try {
        browseCategory(workspace, '결제', badLimit);
        throw new Error(`expected BROWSE_LIMIT_INVALID for limit=${String(badLimit)}`);
      } catch (error) {
        expect(isV2ExpectedError(error)).toBe(true);
      }
    }
  });

  it('rejects submitting a decision with a category outside the configured taxonomy, and with no taxonomy configured at all', async () => {
    workspace = await createTempWorkspace('v2-categories-invalid-');
    const { initDecisionWorkspace } = await import('../../src/core/v2/workspace.js');
    const { setCategories } = await import('../../src/core/v2/policy.js');
    const { createTask } = await import('../../src/core/v2/task.js');
    const { recordGrillMeStarted } = await import('../../src/core/v2/grill.js');
    const { submitDraft } = await import('../../src/core/v2/draft.js');
    const { isV2ExpectedError } = await import('../../src/core/v2/errors.js');

    initDecisionWorkspace(workspace);
    const task = createTask(workspace, '카테고리 미설정 테스트');
    recordGrillMeStarted(workspace);

    const draft = JSON.stringify({
      schemaVersion: 'v2alpha1',
      taskId: task.id,
      decisions: [
        {
          title: 'Some decision',
          kind: 'EXPLICIT',
          summary: 'Summary',
          confidence: 1,
          category: '없는카테고리',
        },
      ],
      questions: [],
      evidence: [],
      expectedScope: [],
      avoidScope: [],
    });

    // No taxonomy configured yet -- any category value is rejected.
    try {
      submitDraft(workspace, draft);
      throw new Error('expected DRAFT_CATEGORY_INVALID to be thrown');
    } catch (error) {
      expect(isV2ExpectedError(error)).toBe(true);
    }

    // Taxonomy configured, but this category isn't in it.
    setCategories(workspace, ['인증/보안']);
    try {
      submitDraft(workspace, draft);
      throw new Error('expected DRAFT_CATEGORY_INVALID to be thrown');
    } catch (error) {
      expect(isV2ExpectedError(error)).toBe(true);
    }
  });

  it('retroactively tags existing confirmed decisions, touching only category/updatedAt, all-or-nothing', async () => {
    workspace = await createTempWorkspace('v2-categories-tag-');
    const { initDecisionWorkspace } = await import('../../src/core/v2/workspace.js');
    const { setCategories } = await import('../../src/core/v2/policy.js');
    const { createTask } = await import('../../src/core/v2/task.js');
    const { recordGrillMeStarted } = await import('../../src/core/v2/grill.js');
    const { submitDraft } = await import('../../src/core/v2/draft.js');
    const { confirmBrief } = await import('../../src/core/v2/brief.js');
    const { tagDecisionCategories, browseCategory } =
      await import('../../src/core/v2/categories.js');
    const { isV2ExpectedError } = await import('../../src/core/v2/errors.js');
    const { loadSourceBundle } = await import('../../src/core/v2/source-store.js');

    initDecisionWorkspace(workspace);
    setCategories(workspace, ['인증/보안', '결제']);
    const task = createTask(workspace, '소급 태깅 테스트');
    recordGrillMeStarted(workspace);
    submitDraft(
      workspace,
      JSON.stringify({
        schemaVersion: 'v2alpha1',
        taskId: task.id,
        decisions: [
          {
            id: 'DEC-retag-a',
            title: 'Original title A',
            kind: 'EXPLICIT',
            summary: 'Original summary A',
            confidence: 1,
            rationale: ['original rationale'],
          },
          {
            id: 'DEC-retag-b',
            title: 'Original title B',
            kind: 'EXPLICIT',
            summary: 'Original summary B',
            confidence: 1,
          },
        ],
        questions: [],
        evidence: [],
        expectedScope: [],
        avoidScope: [],
      }),
    );
    confirmBrief(workspace);
    const beforeA = loadSourceBundle(workspace).decisions.find((d) => d.id === 'DEC-retag-a');
    if (beforeA === undefined) throw new Error('fixture decision missing');

    const result = tagDecisionCategories(workspace, [
      { id: 'DEC-retag-a', category: '인증/보안' },
      { id: 'DEC-retag-b', category: '결제' },
    ]);
    expect(result.updated.sort()).toEqual(['DEC-retag-a', 'DEC-retag-b']);

    const afterA = loadSourceBundle(workspace).decisions.find((d) => d.id === 'DEC-retag-a');
    expect(afterA?.category).toBe('인증/보안');
    expect(typeof afterA?.updatedAt).toBe('string');
    expect(afterA?.title).toBe(beforeA.title);
    expect(afterA?.summary).toBe(beforeA.summary);
    expect(afterA?.rationale).toEqual(beforeA.rationale);
    expect(afterA?.kind).toBe(beforeA.kind);
    expect(afterA?.confidence).toBe(beforeA.confidence);

    expect(browseCategory(workspace, '인증/보안').items.map((item) => item.id)).toContain(
      'DEC-retag-a',
    );
    expect(browseCategory(workspace, '결제').items.map((item) => item.id)).toContain('DEC-retag-b');

    // All-or-nothing: one unknown id must fail the whole batch, leaving prior tags untouched.
    try {
      tagDecisionCategories(workspace, [
        { id: 'DEC-retag-a', category: '결제' },
        { id: 'DEC-does-not-exist', category: '결제' },
      ]);
      throw new Error('expected DECISION_NOT_FOUND to be thrown');
    } catch (error) {
      expect(isV2ExpectedError(error)).toBe(true);
    }
    expect(
      loadSourceBundle(workspace).decisions.find((d) => d.id === 'DEC-retag-a')?.category,
    ).toBe('인증/보안');

    // Invalid category is rejected before anything is written.
    try {
      tagDecisionCategories(workspace, [{ id: 'DEC-retag-a', category: '없는카테고리' }]);
      throw new Error('expected DRAFT_CATEGORY_INVALID to be thrown');
    } catch (error) {
      expect(isV2ExpectedError(error)).toBe(true);
    }
  });
});
