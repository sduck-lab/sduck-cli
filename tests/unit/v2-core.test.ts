import { mkdir, readFile, writeFile } from 'node:fs/promises';
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
});
