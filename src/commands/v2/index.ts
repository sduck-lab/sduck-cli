import { readFileSync } from 'node:fs';

import { confirmBrief, buildBriefView } from '../../core/v2/brief.js';
import { addContextPath, buildContextIndex, getContextPack } from '../../core/v2/context.js';
import { submitDraft } from '../../core/v2/draft.js';
import { answerQuestion, getNextOpenQuestion } from '../../core/v2/question.js';
import { recall } from '../../core/v2/recall.js';
import { remember } from '../../core/v2/remember.js';
import { fail, ok } from '../../core/v2/result.js';
import { getCurrentTaskId } from '../../core/v2/state.js';
import { buildStatusView } from '../../core/v2/status.js';
import { openDatabase } from '../../core/v2/store.js';
import { createTask, setTerminalStatus } from '../../core/v2/task.js';
import { createImplementationTrace } from '../../core/v2/trace.js';
import { initDecisionWorkspace } from '../../core/v2/workspace.js';
import { promptForQuestionAnswer } from '../../ui/v2/prompts.js';
import {
  renderBrief,
  renderContextPack,
  renderRecall,
  renderStatus,
  renderTrace,
} from '../../ui/v2/render.js';

import type { CommandResult } from '../../core/v2/result.js';

export function runInitCommand(projectRoot: string): CommandResult {
  try {
    const result = initDecisionWorkspace(projectRoot);
    return ok(
      [
        'Decision workspace initialized.',
        'Created:',
        ...result.created.map((item) => `  ${item}`),
        'Next:',
        '  sduck work "작업 설명"',
      ].join('\n'),
    );
  } catch (error) {
    return fail(formatError(error));
  }
}

export function runWorkCommand(projectRoot: string, description: string): CommandResult {
  try {
    initDecisionWorkspace(projectRoot);
    const task = createTask(projectRoot, description);
    const contextItems = buildContextIndex(projectRoot, task);
    return ok(
      [
        '작업을 시작했어.',
        `Task: ${task.id}`,
        `Title: ${task.title}`,
        `Context items: ${String(contextItems.length)}`,
        '',
        'Next for agent:',
        '  sduck context',
        '  sduck submit --stdin < draft.json',
        '  sduck ask',
      ].join('\n'),
    );
  } catch (error) {
    return fail(formatError(error));
  }
}

export function runStatusCommand(projectRoot: string, asJson: boolean): CommandResult {
  try {
    const view = buildStatusView(projectRoot);
    return ok(asJson ? JSON.stringify(view, null, 2) : renderStatus(view));
  } catch (error) {
    return fail(formatError(error));
  }
}

export function runContextCommand(projectRoot: string, asJson: boolean): CommandResult {
  try {
    const pack = getContextPack(projectRoot);
    return ok(asJson ? JSON.stringify(pack, null, 2) : renderContextPack(pack));
  } catch (error) {
    return fail(formatError(error));
  }
}

export function runContextAddCommand(projectRoot: string, pathOrGlob: string): CommandResult {
  try {
    const items = addContextPath(projectRoot, pathOrGlob);
    return ok(`Context item(s) added: ${String(items.length)}`);
  } catch (error) {
    return fail(formatError(error));
  }
}

export function runSubmitCommand(projectRoot: string, stdin: string): CommandResult {
  try {
    if (stdin.trim() === '') return fail('No draft received on stdin.');
    const result = submitDraft(projectRoot, stdin);
    return ok(
      `Draft submitted.\nDecisions: ${String(result.decisions)}\nQuestions: ${String(result.questions)}\nEvidence: ${String(result.evidence)}`,
    );
  } catch (error) {
    return fail(formatError(error));
  }
}

export async function runAskCommand(projectRoot: string): Promise<CommandResult> {
  const db = openDatabase(projectRoot);
  try {
    const taskId = getCurrentTaskId(projectRoot);
    if (taskId === null) return fail('No current task. Run `sduck work "..."` first.');
    const question = getNextOpenQuestion(db, taskId);
    if (question === null) return ok('No open questions.\nNext: sduck brief');
    const header = [
      `질문 ${question.id}`,
      question.text,
      '추천:',
      `  ${question.recommendedAnswer}`,
      '근거:',
      ...question.rationale.map((item) => `  - ${item}`),
      '',
    ].join('\n');
    if (!process.stdin.isTTY)
      return ok(`${header}Use: sduck answer ${question.id} --option <n> or --text "..."`);
    process.stdout.write(`${header}\n`);
    const answerInput = await promptForQuestionAnswer(question);
    const answered = answerQuestion(projectRoot, question.id, answerInput);
    return ok(`Answer saved for ${answered.question.id}: ${answered.answer}`);
  } catch (error) {
    return fail(formatError(error));
  } finally {
    db.close();
  }
}

export function runAnswerCommand(
  projectRoot: string,
  questionId: string,
  options: { option?: string; text?: string },
): CommandResult {
  try {
    const hasOption = options.option !== undefined;
    const hasText = options.text !== undefined;
    if (hasOption === hasText) return fail('Provide exactly one of --option or --text.');
    const answerInput =
      options.option === undefined
        ? { text: options.text ?? '' }
        : { optionIndex: Number.parseInt(options.option, 10) };
    const result = answerQuestion(projectRoot, questionId, answerInput);
    return ok(`Answer saved for ${result.question.id}: ${result.answer}`);
  } catch (error) {
    return fail(formatError(error));
  }
}

export function runBriefCommand(projectRoot: string, asJson: boolean): CommandResult {
  try {
    const view = buildBriefView(projectRoot);
    return ok(asJson ? JSON.stringify(view, null, 2) : renderBrief(view));
  } catch (error) {
    return fail(formatError(error));
  }
}

export function runConfirmCommand(projectRoot: string): CommandResult {
  try {
    const snapshot = confirmBrief(projectRoot);
    return ok(
      `Implementation brief confirmed.\nSnapshot: ${snapshot.id}\nNext: implement, then sduck trace`,
    );
  } catch (error) {
    return fail(formatError(error));
  }
}

export function runTraceCommand(
  projectRoot: string,
  options: { base?: string; json?: boolean },
): CommandResult {
  try {
    const traceOptions = options.base === undefined ? {} : { base: options.base };
    const view = createImplementationTrace(projectRoot, traceOptions);
    return ok(options.json === true ? JSON.stringify(view, null, 2) : renderTrace(view));
  } catch (error) {
    return fail(formatError(error));
  }
}

export function runRememberCommand(projectRoot: string): CommandResult {
  try {
    const result = remember(projectRoot);
    return ok(
      ['문서화 완료.', '생성됨:', ...result.created.map((item) => `  - ${item}`)].join('\n'),
    );
  } catch (error) {
    return fail(formatError(error));
  }
}

export function runRecallCommand(projectRoot: string, query: string): CommandResult {
  try {
    return ok(renderRecall(recall(projectRoot, query)));
  } catch (error) {
    return fail(formatError(error));
  }
}

export function runCloseCommand(projectRoot: string): CommandResult {
  try {
    const task = setTerminalStatus(projectRoot, 'CLOSED');
    return ok(`Task closed: ${task.id}`);
  } catch (error) {
    return fail(formatError(error));
  }
}

export function runAbandonCommand(projectRoot: string): CommandResult {
  try {
    const task = setTerminalStatus(projectRoot, 'ABANDONED');
    return ok(`Task abandoned: ${task.id}`);
  } catch (error) {
    return fail(formatError(error));
  }
}

export function readStdinIfRequested(stdin: boolean | undefined): string {
  if (stdin !== true) throw new Error('Use --stdin to read draft content.');
  return readFileSync(0, 'utf8');
}

function formatError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
