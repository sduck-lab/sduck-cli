import { execFileSync } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

import { createTempWorkspace, removeTempWorkspace } from '../helpers/temp-workspace.js';

const supportsNodeSqlite = (() => {
  const [major = '0', minor = '0'] = process.versions.node.split('.');
  return Number(major) > 22 || (Number(major) === 22 && Number(minor) >= 13);
})();

const describeIfSqlite = supportsNodeSqlite ? describe : describe.skip;

function isolatedGitEnv(): NodeJS.ProcessEnv {
  const env: NodeJS.ProcessEnv = {
    ...process.env,
    GIT_AUTHOR_NAME: 't',
    GIT_AUTHOR_EMAIL: 't@example.com',
    GIT_COMMITTER_NAME: 't',
    GIT_COMMITTER_EMAIL: 't@example.com',
  };
  delete env['GIT_DIR'];
  delete env['GIT_WORK_TREE'];
  delete env['GIT_INDEX_FILE'];
  delete env['GIT_PREFIX'];
  return env;
}

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

  it('maps trace decisions only when relevance reaches threshold', async () => {
    workspace = await createTempWorkspace('v2-trace-relevance-');
    execFileSync('git', ['init'], { cwd: workspace, env: isolatedGitEnv() });
    await mkdir(join(workspace, 'src', 'components'), { recursive: true });
    await writeFile(join(workspace, 'src', 'exact.ts'), 'export const exact = 1;\n');
    await writeFile(
      join(workspace, 'src', 'components', 'Button.ts'),
      'export const button = 1;\n',
    );
    await writeFile(join(workspace, 'src', 'feature-details.ts'), 'export const feature = 1;\n');
    execFileSync('git', ['add', 'src'], { cwd: workspace, env: isolatedGitEnv() });
    execFileSync('git', ['commit', '-m', 'initial'], { cwd: workspace, env: isolatedGitEnv() });
    await writeFile(join(workspace, 'src', 'exact.ts'), 'export const exact = 2;\n');
    await writeFile(
      join(workspace, 'src', 'components', 'Button.ts'),
      'export const button = 2;\n',
    );
    await writeFile(join(workspace, 'src', 'feature-details.ts'), 'export const feature = 2;\n');

    const { initDecisionWorkspace } = await import('../../src/core/v2/workspace.js');
    const { createTask } = await import('../../src/core/v2/task.js');
    const { submitDraft } = await import('../../src/core/v2/draft.js');
    const { createImplementationTrace } = await import('../../src/core/v2/trace.js');
    const { RELEVANCE_REASONS } = await import('../../src/core/v2/relevance.js');

    initDecisionWorkspace(workspace);
    const task = createTask(workspace, 'trace relevance');
    submitDraft(
      workspace,
      JSON.stringify({
        schemaVersion: 'v2alpha1',
        taskId: task.id,
        decisions: [
          {
            id: 'DEC-exact',
            title: 'Exact appliesTo',
            kind: 'EXPLICIT',
            status: 'CONFIRMED',
            summary: 'Exact file decision',
            appliesTo: ['./src/exact.ts'],
          },
          {
            id: 'DEC-glob',
            title: 'Glob appliesTo',
            kind: 'EXPLICIT',
            status: 'CONFIRMED',
            summary: 'Glob file decision',
            appliesTo: ['src/components/*.ts'],
          },
          {
            id: 'DEC-weak',
            title: 'Weak appliesTo',
            kind: 'EXPLICIT',
            status: 'CONFIRMED',
            summary: 'Substring should not attach',
            appliesTo: ['feature'],
          },
          {
            id: 'DEC-wrong',
            title: 'Wrong appliesTo',
            kind: 'EXPLICIT',
            status: 'CONFIRMED',
            summary: 'Wrong file should be reviewed',
            appliesTo: ['src/not-changed.ts'],
          },
        ],
        questions: [],
        evidence: [],
      }),
    );

    const { trace } = createImplementationTrace(workspace);
    expect(trace.decisionToCodeMap).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          decisionId: 'DEC-exact',
          files: ['src/exact.ts'],
          score: 1,
          reason: RELEVANCE_REASONS.appliesToExactPath,
        }),
        expect.objectContaining({
          decisionId: 'DEC-glob',
          files: ['src/components/Button.ts'],
          score: 0.85,
          reason: RELEVANCE_REASONS.appliesToGlob,
        }),
      ]),
    );
    expect(trace.decisionToCodeMap.map((item) => item.decisionId)).not.toContain('DEC-weak');
    expect(trace.decisionToCodeMap.map((item) => item.decisionId)).not.toContain('DEC-wrong');
    expect(trace.unmappedDecisions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          decisionId: 'DEC-weak',
          reason: RELEVANCE_REASONS.weakSubstringFallback,
          score: 0.3,
        }),
        expect.objectContaining({
          decisionId: 'DEC-wrong',
          reason: RELEVANCE_REASONS.noStrongMatch,
        }),
      ]),
    );
  });

  it('uses graph relevance only when graph files intersect current task scope', async () => {
    workspace = await createTempWorkspace('v2-context-graph-');
    await mkdir(join(workspace, '.decision', 'exports', 'graphify'), { recursive: true });
    await writeFile(
      join(workspace, '.decision', 'exports', 'graphify', 'decision-graph.json'),
      JSON.stringify({
        nodes: [
          { id: 'DEC-graph-only', type: 'decision', label: 'Graph-only decision' },
          { id: 'src/graph-only.ts', type: 'file', label: 'src/graph-only.ts' },
        ],
        links: [{ source: 'DEC-graph-only', target: 'src/graph-only.ts', relation: 'APPLIES_TO' }],
      }),
    );
    await mkdir(join(workspace, 'graphify-out'), { recursive: true });
    await writeFile(join(workspace, 'graphify-out', 'graph.json'), '{ malformed');

    const { initDecisionWorkspace } = await import('../../src/core/v2/workspace.js');
    const { createTask } = await import('../../src/core/v2/task.js');
    const { buildContextIndex } = await import('../../src/core/v2/context.js');
    const { RELEVANCE_REASONS } = await import('../../src/core/v2/relevance.js');

    initDecisionWorkspace(workspace);
    const unrelatedTask = createTask(workspace, 'unrelated payment workflow');
    const unrelatedContext = buildContextIndex(workspace, unrelatedTask);
    expect(
      unrelatedContext.some(
        (item) =>
          item.sourceRef === 'DEC-graph-only' &&
          item.metadata['reason'] === RELEVANCE_REASONS.graphEdge,
      ),
    ).toBe(false);

    const task = createTask(workspace, 'description without graph file words');
    const context = buildContextIndex(workspace, { ...task, expectedScope: ['src/graph-only.ts'] });
    const graphItem = context.find(
      (item) =>
        item.sourceType === 'MEMORY' &&
        item.sourceRef === 'DEC-graph-only' &&
        item.metadata['reason'] === RELEVANCE_REASONS.graphEdge,
    );

    expect(graphItem).toBeDefined();
    expect(graphItem?.metadata['score']).toBe(0.7);
  });

  it('does not fail context indexing when graph data is absent or malformed', async () => {
    workspace = await createTempWorkspace('v2-context-malformed-');
    await mkdir(join(workspace, 'graphify-out'), { recursive: true });
    await writeFile(join(workspace, 'graphify-out', 'graph.json'), '{ malformed');

    const { initDecisionWorkspace } = await import('../../src/core/v2/workspace.js');
    const { createTask } = await import('../../src/core/v2/task.js');
    const { buildContextIndex } = await import('../../src/core/v2/context.js');
    const { RELEVANCE_REASONS } = await import('../../src/core/v2/relevance.js');

    initDecisionWorkspace(workspace);
    const task = createTask(workspace, 'malformed graph should not fail');
    const context = buildContextIndex(workspace, task);

    expect(Array.isArray(context)).toBe(true);
    expect(context.some((item) => item.metadata['reason'] === RELEVANCE_REASONS.graphEdge)).toBe(
      false,
    );
  });
});
