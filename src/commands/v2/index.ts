import { readFileSync } from 'node:fs';

import { isV2CommandError, V2CommandError } from './errors.js';
import { readGlobalConfig, setGlobalLocale } from '../../config/global-config.js';
import { confirmBrief, buildBriefView } from '../../core/v2/brief.js';
import { ensureReadableCache } from '../../core/v2/cache.js';
import { addContextPath, buildContextIndex, getContextPack } from '../../core/v2/context.js';
import { doctorDecisionWorkspace } from '../../core/v2/doctor.js';
import { submitDraft } from '../../core/v2/draft.js';
import { isV2ExpectedError } from '../../core/v2/errors.js';
import { recordGrillMeStarted, type GrillMeView } from '../../core/v2/grill.js';
import { answerQuestion, getNextOpenQuestion } from '../../core/v2/question.js';
import { rebuildDecisionCache } from '../../core/v2/rebuild.js';
import { recall } from '../../core/v2/recall.js';
import { remember } from '../../core/v2/remember.js';
import { fail, ok } from '../../core/v2/result.js';
import { getCurrentTaskId } from '../../core/v2/state.js';
import { buildStatusView } from '../../core/v2/status.js';
import { openDatabase } from '../../core/v2/store.js';
import { createTask, resumeTask, setTerminalStatus } from '../../core/v2/task.js';
import { createImplementationTrace } from '../../core/v2/trace.js';
import { initDecisionWorkspace } from '../../core/v2/workspace.js';
import { enV2Messages, getV2Messages } from '../../ui/v2/messages.js';
import { promptForQuestionAnswer } from '../../ui/v2/prompts.js';
import {
  renderBriefTerminal,
  renderDoctorResult,
  renderContextPack,
  renderRecallLocalized,
  renderRebuildResult,
  renderRememberResult,
  renderStatus,
  renderTrace,
} from '../../ui/v2/render.js';

import type { Locale, GlobalConfigWarning } from '../../config/global-config.js';
import type { V2ExpectedError } from '../../core/v2/errors.js';
import type { CommandResult } from '../../core/v2/result.js';
import type { V2MessageCatalog } from '../../ui/v2/messages.js';

export interface V2Runtime {
  locale: Locale;
  messages: V2MessageCatalog;
  configWarning?: GlobalConfigWarning;
}

const DEFAULT_RUNTIME: V2Runtime = { locale: 'en', messages: enV2Messages };

export function createV2Runtime(): V2Runtime {
  const config = readGlobalConfig();
  return {
    locale: config.locale,
    messages: getV2Messages(config.locale),
    ...(config.warning === undefined ? {} : { configWarning: config.warning }),
  };
}

export function renderConfigWarning(
  warning: GlobalConfigWarning,
  messages: V2MessageCatalog,
): string {
  if (warning.code === 'UNSUPPORTED_SCHEMA') {
    return messages.config.unsupportedWarning(warning.path, warning.schemaVersion ?? 0);
  }
  return messages.config.malformedWarning(warning.path, warning.detail ?? 'invalid-json');
}

export function runInitCommand(
  projectRoot: string,
  runtime: V2Runtime = DEFAULT_RUNTIME,
): CommandResult {
  try {
    const result = initDecisionWorkspace(projectRoot);
    const messages = runtime.messages;
    return ok(
      [
        messages.commands.initDone,
        `${messages.common.created}:`,
        ...result.created.map((item) => `  ${item}`),
        `${messages.common.next}:`,
        `  sduck ${messages.workflow.work} "<task description>"`,
      ].join('\n'),
    );
  } catch (error) {
    return fail(formatError(error, runtime));
  }
}

export function runWorkCommand(
  projectRoot: string,
  description: string,
  runtime: V2Runtime = DEFAULT_RUNTIME,
): CommandResult {
  try {
    initDecisionWorkspace(projectRoot);
    const task = createTask(projectRoot, description);
    const contextItems = buildContextIndex(projectRoot, task);
    const status = buildStatusView(projectRoot);
    const messages = runtime.messages;
    const grillMeStep = status.indicators.grillMeRequired
      ? `  sduck ${messages.workflow.grillMe}`
      : `  sduck ${messages.workflow.grillMe} (${messages.labels.grillMePermissive})`;
    return ok(
      [
        messages.commands.workStarted,
        `${messages.common.task}: ${task.id}`,
        messages.task.title(task.title),
        `${messages.labels.contextItems}: ${String(contextItems.length)}`,
        '',
        messages.commands.nextForAgent,
        `  sduck ${messages.workflow.context}`,
        grillMeStep,
        `  sduck ${messages.workflow.submit} --stdin < draft.json`,
        `  sduck ${messages.workflow.ask}`,
      ].join('\n'),
    );
  } catch (error) {
    return fail(formatError(error, runtime));
  }
}

export function runGrillMeCommand(
  projectRoot: string,
  asJson: boolean,
  runtime: V2Runtime = DEFAULT_RUNTIME,
): CommandResult {
  try {
    const view = recordGrillMeStarted(projectRoot);
    return ok(asJson ? JSON.stringify(view, null, 2) : renderGrillMe(view, runtime.messages));
  } catch (error) {
    return fail(formatError(error, runtime));
  }
}

export function runStatusCommand(
  projectRoot: string,
  asJson: boolean,
  runtime: V2Runtime = DEFAULT_RUNTIME,
): CommandResult {
  try {
    const view = buildStatusView(projectRoot);
    return ok(asJson ? JSON.stringify(view, null, 2) : renderStatus(view, runtime.messages));
  } catch (error) {
    return fail(formatError(error, runtime));
  }
}

export function runResumeCommand(
  projectRoot: string,
  taskId: string,
  runtime: V2Runtime = DEFAULT_RUNTIME,
): CommandResult {
  try {
    const task = resumeTask(projectRoot, taskId);
    return ok(
      `${runtime.messages.task.resumed(task.id)}\n${runtime.messages.task.status(task.status)}`,
    );
  } catch (error) {
    return fail(formatError(error, runtime));
  }
}

export function runContextCommand(
  projectRoot: string,
  asJson: boolean,
  runtime: V2Runtime = DEFAULT_RUNTIME,
): CommandResult {
  try {
    const pack = getContextPack(projectRoot);
    if (asJson) return ok(JSON.stringify(pack, null, 2));
    const status = buildStatusView(projectRoot);
    const next =
      status.indicators.grillMeRequired && !status.indicators.grillMeStarted
        ? runtime.messages.workflow.nextGrillMe
        : runtime.messages.workflow.nextSubmit;
    return ok(renderContextPack(pack, runtime.messages, next));
  } catch (error) {
    return fail(formatError(error, runtime));
  }
}

export function runContextAddCommand(
  projectRoot: string,
  pathOrGlob: string,
  runtime: V2Runtime = DEFAULT_RUNTIME,
): CommandResult {
  try {
    const items = addContextPath(projectRoot, pathOrGlob);
    return ok(runtime.messages.commands.contextAdded(items.length));
  } catch (error) {
    return fail(formatError(error, runtime));
  }
}

export function runSubmitCommand(
  projectRoot: string,
  stdin: string,
  runtime: V2Runtime = DEFAULT_RUNTIME,
): CommandResult {
  try {
    if (stdin.trim() === '') throw new V2CommandError('NO_DRAFT_STDIN');
    const result = submitDraft(projectRoot, stdin);
    return ok(
      `${runtime.messages.commands.draftSubmitted}\n${runtime.messages.labels.decisions}: ${String(result.decisions)}\n${runtime.messages.labels.questions}: ${String(result.questions)}\n${runtime.messages.labels.evidence}: ${String(result.evidence)}\n${runtime.messages.workflow.nextAsk}`,
    );
  } catch (error) {
    return fail(formatError(error, runtime));
  }
}

export async function runAskCommand(
  projectRoot: string,
  runtime: V2Runtime = DEFAULT_RUNTIME,
): Promise<CommandResult> {
  let db: ReturnType<typeof openDatabase> | null = null;
  try {
    ensureReadableCache(projectRoot);
    db = openDatabase(projectRoot);
    const taskId = getCurrentTaskId(projectRoot);
    if (taskId === null) throw new V2CommandError('NO_CURRENT_TASK');
    const question = getNextOpenQuestion(db, taskId);
    db.close();
    db = null;
    if (question === null)
      return ok(
        `${runtime.messages.commands.noOpenQuestions}\n${runtime.messages.workflow.nextBriefConfirm}`,
      );
    const header = [
      runtime.messages.prompt.question(question.id),
      question.text,
      runtime.messages.prompt.recommended,
      `  ${question.recommendedAnswer}`,
      runtime.messages.prompt.rationale,
      ...question.rationale.map((item) => `  - ${item}`),
      '',
    ].join('\n');
    if (!process.stdin.isTTY)
      return ok(
        `${header}${runtime.messages.common.use}: sduck answer ${question.id} --option <n> or --text "..."`,
      );
    process.stdout.write(`${header}\n`);
    const answerInput = await promptForQuestionAnswer(question, runtime.messages);
    const answered = answerQuestion(projectRoot, question.id, answerInput);
    const status = buildStatusView(projectRoot);
    const next =
      status.indicators.questionsOpen > 0
        ? runtime.messages.workflow.nextAsk
        : runtime.messages.workflow.nextBriefConfirm;
    return ok(
      `${runtime.messages.commands.answerSaved(answered.question.id, answered.answer)}\n${next}`,
    );
  } catch (error) {
    return fail(formatError(error, runtime));
  } finally {
    db?.close();
  }
}

export function runAnswerCommand(
  projectRoot: string,
  questionId: string,
  options: { option?: string; text?: string },
  runtime: V2Runtime = DEFAULT_RUNTIME,
): CommandResult {
  try {
    const hasOption = options.option !== undefined;
    const hasText = options.text !== undefined;
    if (hasOption === hasText) throw new V2CommandError('ANSWER_INPUT_CONFLICT');
    const answerInput =
      options.option === undefined
        ? { text: options.text ?? '' }
        : { optionIndex: Number.parseInt(options.option, 10) };
    const result = answerQuestion(projectRoot, questionId, answerInput);
    const status = buildStatusView(projectRoot);
    const next =
      status.indicators.questionsOpen > 0
        ? runtime.messages.workflow.nextAsk
        : runtime.messages.workflow.nextBriefConfirm;
    return ok(
      `${runtime.messages.commands.answerSaved(result.question.id, result.answer)}\n${next}`,
    );
  } catch (error) {
    return fail(formatError(error, runtime));
  }
}

export function runBriefCommand(
  projectRoot: string,
  asJson: boolean,
  runtime: V2Runtime = DEFAULT_RUNTIME,
): CommandResult {
  try {
    const view = buildBriefView(projectRoot);
    return ok(asJson ? JSON.stringify(view, null, 2) : renderBriefTerminal(view, runtime.messages));
  } catch (error) {
    return fail(formatError(error, runtime));
  }
}

export function runConfirmCommand(
  projectRoot: string,
  runtime: V2Runtime = DEFAULT_RUNTIME,
): CommandResult {
  try {
    const snapshot = confirmBrief(projectRoot);
    return ok(
      `${runtime.messages.commands.briefConfirmed}\n${runtime.messages.common.snapshot}: ${snapshot.id}\n${runtime.messages.workflow.nextImplementTrace}`,
    );
  } catch (error) {
    return fail(formatError(error, runtime));
  }
}

export function runTraceCommand(
  projectRoot: string,
  options: { base?: string; json?: boolean },
  runtime: V2Runtime = DEFAULT_RUNTIME,
): CommandResult {
  try {
    const traceOptions = options.base === undefined ? {} : { base: options.base };
    const view = createImplementationTrace(projectRoot, traceOptions);
    return ok(
      options.json === true
        ? JSON.stringify(view, null, 2)
        : `${renderTrace(view, runtime.messages)}\n\n${runtime.messages.workflow.nextRemember}`,
    );
  } catch (error) {
    return fail(formatError(error, runtime));
  }
}

export function runRememberCommand(
  projectRoot: string,
  runtime: V2Runtime = DEFAULT_RUNTIME,
): CommandResult {
  try {
    const result = remember(projectRoot);
    return ok(renderRememberResult(result, runtime.messages));
  } catch (error) {
    return fail(formatError(error, runtime));
  }
}

export function runRebuildCommand(
  projectRoot: string,
  runtime: V2Runtime = DEFAULT_RUNTIME,
): CommandResult {
  try {
    return ok(renderRebuildResult(rebuildDecisionCache(projectRoot), runtime.messages));
  } catch (error) {
    return fail(formatError(error, runtime));
  }
}

export function runDoctorCommand(
  projectRoot: string,
  repair: boolean,
  runtime: V2Runtime = DEFAULT_RUNTIME,
): CommandResult {
  try {
    const result = doctorDecisionWorkspace(projectRoot, { repair });
    const output = renderDoctorResult(result, runtime.messages);
    return result.healthy ? ok(output) : fail(output);
  } catch (error) {
    return fail(formatError(error, runtime));
  }
}

export function runRecallCommand(
  projectRoot: string,
  query: string,
  runtime: V2Runtime = DEFAULT_RUNTIME,
): CommandResult {
  try {
    return ok(renderRecallLocalized(recall(projectRoot, query), runtime.messages));
  } catch (error) {
    return fail(formatError(error, runtime));
  }
}

export function runCloseCommand(
  projectRoot: string,
  runtime: V2Runtime = DEFAULT_RUNTIME,
): CommandResult {
  try {
    const task = setTerminalStatus(projectRoot, 'CLOSED');
    return ok(runtime.messages.task.closed(task.id));
  } catch (error) {
    return fail(formatError(error, runtime));
  }
}

export function runAbandonCommand(
  projectRoot: string,
  runtime: V2Runtime = DEFAULT_RUNTIME,
): CommandResult {
  try {
    const task = setTerminalStatus(projectRoot, 'ABANDONED');
    return ok(runtime.messages.task.abandoned(task.id));
  } catch (error) {
    return fail(formatError(error, runtime));
  }
}

export function runConfigLocaleCommand(
  locale: Locale,
  runtime: V2Runtime = DEFAULT_RUNTIME,
): CommandResult {
  const result = setGlobalLocale(locale);
  const messages = getV2Messages(result.ok ? locale : runtime.locale);
  if (!result.ok) {
    return fail(
      messages.config.unsupportedRefuse(result.warning.path, result.warning.schemaVersion ?? 0),
    );
  }
  return ok(messages.config.localeSet(locale, result.path));
}

export function readStdinIfRequested(
  stdin: boolean | undefined,
  runtime: V2Runtime = DEFAULT_RUNTIME,
): string {
  if (stdin !== true) throw new V2CommandError('USE_STDIN', { locale: runtime.locale });
  return readFileSync(0, 'utf8');
}

function formatError(error: unknown, runtime: V2Runtime = DEFAULT_RUNTIME): string {
  if (isV2CommandError(error)) return renderV2CommandError(error, runtime.messages);
  if (isV2ExpectedError(error)) return renderV2ExpectedError(error, runtime.messages);
  const detail = error instanceof Error ? error.message : String(error);
  return runtime.messages.errors.unexpected(detail);
}

export function renderV2ExpectedError(error: V2ExpectedError, messages: V2MessageCatalog): string {
  return messages.errors.expected(error.code, error.params);
}

export function renderV2CommandError(error: V2CommandError, messages: V2MessageCatalog): string {
  switch (error.code) {
    case 'NO_DRAFT_STDIN':
      return messages.errors.noDraftStdin;
    case 'USE_STDIN':
      return messages.errors.useStdin;
    case 'ANSWER_INPUT_CONFLICT':
      return messages.errors.provideOneAnswer;
    case 'NO_CURRENT_TASK':
      return messages.errors.noCurrentTask;
    case 'INVALID_LOCALE':
      return messages.errors.invalidLocale(String(error.params['locale'] ?? ''));
  }
}

function renderGrillMe(view: GrillMeView, messages: V2MessageCatalog): string {
  const lines = [
    view.recorded ? messages.commands.grillStarted : messages.commands.grillAlreadyStarted,
    `${messages.common.task}: ${view.taskId}`,
    `${messages.labels.event}: ${view.eventId}`,
    '',
    `${messages.labels.agentGrillPrompt}:`,
    view.prompt,
    '',
    `${messages.labels.checklist}:`,
    ...view.checklist.map((item) => `  - ${item}`),
    '',
    `${messages.labels.grillProtocol}:`,
    ...view.protocol.map((item) => `  - ${item}`),
    '',
    messages.workflow.nextSubmit,
  ];
  return lines.join('\n');
}
