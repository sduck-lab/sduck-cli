import { mkdir, readFile, unlink, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

import { createTempWorkspace, removeTempWorkspace } from '../helpers/temp-workspace.js';

const supportsNodeSqlite = (() => {
  const [major = '0', minor = '0'] = process.versions.node.split('.');
  return Number(major) > 22 || (Number(major) === 22 && Number(minor) >= 13);
})();

const describeIfSqlite = supportsNodeSqlite ? describe : describe.skip;

describeIfSqlite('v2 core workflow', () => {
  let workspace: string | null = null;

  afterEach(async () => {
    if (workspace !== null) await removeTempWorkspace(workspace);
    workspace = null;
  });

  it('initializes workspace, submits draft, answers, confirms, remembers, and recalls', async () => {
    workspace = await createTempWorkspace('v2-core-');
    await mkdir(join(workspace, 'src'), { recursive: true });
    await writeFile(join(workspace, 'src', 'paymentService.ts'), 'export const payment = true;\n');

    const { initDecisionWorkspace } = await import('../../src/core/v2/workspace.js');
    const { createTask } = await import('../../src/core/v2/task.js');
    const {
      buildContextIndex,
      getContextPack,
      GRILL_ME_CHECKLIST,
      GRILL_ME_PROMPT,
      GRILL_ME_PROTOCOL,
    } = await import('../../src/core/v2/context.js');
    const { submitDraft } = await import('../../src/core/v2/draft.js');
    const { answerQuestion } = await import('../../src/core/v2/question.js');
    const { buildBriefView, confirmBrief } = await import('../../src/core/v2/brief.js');
    const { remember } = await import('../../src/core/v2/remember.js');
    const { recall } = await import('../../src/core/v2/recall.js');
    const { rebuildDecisionCache } = await import('../../src/core/v2/rebuild.js');

    initDecisionWorkspace(workspace);
    const task = createTask(workspace, 'payment retry 추가');
    const context = buildContextIndex(workspace, task);
    expect(context.some((item) => item.sourceRef.includes('paymentService'))).toBe(true);

    const contextPack = getContextPack(workspace);
    expect(contextPack.grillMeProtocol).toEqual([...GRILL_ME_PROTOCOL]);
    expect(contextPack.grillMePrompt).toBe(GRILL_ME_PROMPT);
    expect(contextPack.grillMeChecklist).toEqual([...GRILL_ME_CHECKLIST]);
    expect(contextPack.grillMePrompt).toContain('Interview the user relentlessly');
    expect(contextPack.grillMePrompt).toContain('design tree');
    expect(contextPack.grillMePrompt).toContain('recommended answer');
    expect(contextPack.grillMePrompt).toContain('sduck submit --stdin');
    expect(contextPack.grillMeChecklist).toEqual(
      expect.arrayContaining([
        expect.stringContaining('glossary'),
        expect.stringContaining('public interfaces'),
        expect.stringContaining('feedback loop'),
        expect.stringContaining('module'),
        expect.stringContaining('out-of-scope'),
      ]),
    );

    const submitted = submitDraft(
      workspace,
      JSON.stringify({
        schemaVersion: 'v2alpha1',
        taskId: task.id,
        decisions: [
          {
            id: 'DEC-service-retry',
            title: 'Retry는 service policy에 둔다',
            kind: 'INFERRED',
            summary: 'Controller retry loop는 피한다.',
            confidence: 0.8,
            rationale: ['기존 파일명이 service 중심이다.'],
            appliesTo: ['src/paymentService.ts'],
            avoids: ['src/paymentController.ts'],
          },
        ],
        questions: [
          {
            id: 'Q-retry-target',
            text: 'retry 대상 error는 어디까지로 할까?',
            recommendedAnswer: 'timeout / transient network error만 retry',
            rationale: ['validation error는 retry 가치가 낮다.'],
            options: ['추천안 사용', 'timeout만 retry'],
          },
        ],
        evidence: [],
        expectedScope: ['src/paymentService.ts'],
        avoidScope: ['src/paymentController.ts'],
      }),
    );
    expect(submitted.questions).toBe(1);

    const answered = answerQuestion(workspace, 'Q-retry-target', { optionIndex: 1 });
    expect(answered.answer).toContain('transient');

    const brief = buildBriefView(workspace);
    expect(brief.decisions.EXPLICIT).toHaveLength(1);
    expect(brief.decisions.INFERRED).toHaveLength(1);
    expect(brief.openQuestionCount).toBe(0);

    const snapshot = confirmBrief(workspace);
    expect(snapshot.renderedMarkdown).toContain('Implementation Brief');

    const exported = remember(workspace);
    expect(exported.created.some((file) => file.endsWith('decision-graph.json'))).toBe(true);
    const graph = await readFile(
      join(workspace, '.decision', 'exports', 'graphify', 'decision-graph.json'),
      'utf8',
    );
    expect(graph).toContain('DEC-service-retry');

    const recalled = recall(workspace, 'Retry');
    expect(recalled.decisions.length).toBeGreaterThan(0);

    const beforeStatus = buildBriefView(workspace);
    await unlink(join(workspace, '.decision', 'db.sqlite'));
    const rebuilt = rebuildDecisionCache(workspace);
    expect(rebuilt.tasks).toBe(1);
    expect(rebuilt.decisions).toBeGreaterThanOrEqual(2);
    const afterStatus = buildBriefView(workspace);
    expect(afterStatus.task.id).toBe(beforeStatus.task.id);
    expect(afterStatus.decisions.EXPLICIT.map((decision) => decision.summary)).toEqual(
      beforeStatus.decisions.EXPLICIT.map((decision) => decision.summary),
    );
    expect(recall(workspace, 'Retry').decisions.length).toBe(recalled.decisions.length);

    await unlink(join(workspace, '.decision', 'db.sqlite'));
    expect(buildBriefView(workspace).task.id).toBe(task.id);
  });

  it('parses markdown fenced json draft', async () => {
    workspace = await createTempWorkspace('v2-markdown-');
    const { initDecisionWorkspace } = await import('../../src/core/v2/workspace.js');
    const { createTask } = await import('../../src/core/v2/task.js');
    const { submitDraft } = await import('../../src/core/v2/draft.js');

    initDecisionWorkspace(workspace);
    const task = createTask(workspace, 'markdown draft');
    const result = submitDraft(
      workspace,
      `# Draft\n\n\`\`\`json sduck-draft\n{"schemaVersion":"v2alpha1","taskId":"${task.id}","questions":[],"decisions":[],"evidence":[]}\n\`\`\`\n`,
    );
    expect(result.taskId).toBe(task.id);
  });

  it('reports source parse errors with file and field details', async () => {
    workspace = await createTempWorkspace('v2-source-parse-');
    const root = workspace;
    const { initDecisionWorkspace } = await import('../../src/core/v2/workspace.js');
    const { rebuildDecisionCache } = await import('../../src/core/v2/rebuild.js');

    initDecisionWorkspace(root);
    const sourceFile = join(root, '.decision', 'exports', 'markdown', 'tasks', 'broken.md');
    await writeFile(
      sourceFile,
      '---\nid: TASK-broken\ntype: task\nstatus: OPEN\ncreated_at: 2026-01-01T00:00:00.000Z\n---\n# Broken\n\n```json sduck-source\n{"task":{"id":"TASK-broken"},"questions":[],"evidence":[],"contextItems":[],"briefSnapshots":[],"events":[]}\n```\n',
    );

    expect(() => rebuildDecisionCache(root)).toThrow(/broken\.md: task\.title/);
  });

  it('auto rebuild is deletion-aware and does not resurrect deleted source on write', async () => {
    workspace = await createTempWorkspace('v2-delete-stale-');
    const root = workspace;
    const { initDecisionWorkspace } = await import('../../src/core/v2/workspace.js');
    const { createTask } = await import('../../src/core/v2/task.js');
    const { submitDraft } = await import('../../src/core/v2/draft.js');
    const { recall } = await import('../../src/core/v2/recall.js');

    initDecisionWorkspace(root);
    const task = createTask(root, 'delete stale source');
    submitDraft(
      root,
      JSON.stringify({
        schemaVersion: 'v2alpha1',
        taskId: task.id,
        decisions: [
          {
            id: 'DEC-delete-me',
            title: 'Delete me decision',
            kind: 'INFERRED',
            summary: 'This source will be deleted.',
          },
        ],
        questions: [],
        evidence: [],
      }),
    );
    expect(recall(root, 'Delete me').decisions.map((decision) => decision.id)).toContain(
      'DEC-delete-me',
    );

    await unlink(join(root, '.decision', 'exports', 'markdown', 'decisions', 'DEC-delete-me.md'));
    expect(recall(root, 'Delete me').decisions.map((decision) => decision.id)).not.toContain(
      'DEC-delete-me',
    );

    submitDraft(
      root,
      JSON.stringify({
        schemaVersion: 'v2alpha1',
        taskId: task.id,
        decisions: [],
        questions: [],
        evidence: [],
      }),
    );
    await expect(
      readFile(join(root, '.decision', 'exports', 'markdown', 'decisions', 'DEC-delete-me.md'), 'utf8'),
    ).rejects.toThrow();
  });

  it('reports nested source parse errors before rebuilding cache', async () => {
    workspace = await createTempWorkspace('v2-nested-parse-');
    const root = workspace;
    const { initDecisionWorkspace } = await import('../../src/core/v2/workspace.js');
    const { rebuildDecisionCache } = await import('../../src/core/v2/rebuild.js');

    initDecisionWorkspace(root);
    const sourceFile = join(root, '.decision', 'exports', 'markdown', 'tasks', 'nested.md');
    await writeFile(
      sourceFile,
      '---\nid: TASK-nested\ntype: task\nstatus: OPEN\ncreated_at: 2026-01-01T00:00:00.000Z\n---\n# Nested\n\n```json sduck-source\n{"task":{"id":"TASK-nested","title":"Nested","description":"Nested","status":"OPEN","expectedScope":[],"avoidScope":[],"createdAt":"2026-01-01T00:00:00.000Z","updatedAt":"2026-01-01T00:00:00.000Z"},"questions":[{"id":"Q-bad","taskId":"TASK-nested","text":"Bad?","rationale":[],"options":[],"answered":false,"answer":null,"createdAt":"2026-01-01T00:00:00.000Z"}],"evidence":[],"contextItems":[],"briefSnapshots":[],"events":[]}\n```\n',
    );

    expect(() => rebuildDecisionCache(root)).toThrow(/nested\.md: questions\[0\]\.recommendedAnswer/);
  });
});
