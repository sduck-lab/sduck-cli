import * as fs from 'node:fs';
import * as path from 'node:path';

import { isV2CommandError, V2CommandError } from './errors.js';
import { readGlobalConfig, setGlobalLocale } from '../../config/global-config.js';
import {
  installRetrospectivePostCommitHookSync,
  type InitExecutionSummary,
} from '../../core/init.js';
import { confirmBrief, buildBriefView } from '../../core/v2/brief.js';
import { ensureReadableCache } from '../../core/v2/cache.js';
import { addContextPath, buildContextIndex, getContextPack } from '../../core/v2/context.js';
import { doctorDecisionWorkspace } from '../../core/v2/doctor.js';
import { submitDraft } from '../../core/v2/draft.js';
import { isV2ExpectedError, V2ExpectedError } from '../../core/v2/errors.js';
import { recordEvaluation } from '../../core/v2/evaluate.js';
import { showGraph } from '../../core/v2/graph.js';
import {
  recordGrillCompleted,
  recordGrillMeStarted,
  type GrillMeView,
} from '../../core/v2/grill.js';
import { policyPath } from '../../core/v2/paths.js';
import {
  DEFAULT_REQUIRED_POLICY,
  getWorkflowStatus,
  readDecisionWorkspacePolicy,
} from '../../core/v2/policy.js';
import { answerQuestion, getNextOpenQuestion } from '../../core/v2/question.js';
import { rebuildDecisionCache } from '../../core/v2/rebuild.js';
import { recall } from '../../core/v2/recall.js';
import { remember } from '../../core/v2/remember.js';
import { fail, ok } from '../../core/v2/result.js';
import {
  captureRetrospective,
  hasRetrospectivePendingMarker,
  withRetrospectiveMarkerPublicationLock,
} from '../../core/v2/retrospective.js';
import { loadSourceBundle } from '../../core/v2/source-store.js';
import { getCurrentTaskId, readState, validateDecisionState } from '../../core/v2/state.js';
import { buildStatusView } from '../../core/v2/status.js';
import { openDatabase } from '../../core/v2/store.js';
import { createTask, resumeTask, setTerminalStatus } from '../../core/v2/task.js';
import { createImplementationTrace } from '../../core/v2/trace.js';
import { withDecisionWorkspaceLock } from '../../core/v2/workspace-lock.js';
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
    const task = createTask(projectRoot, description, { guided: true });
    const contextItems = buildContextIndex(projectRoot, task);
    const status = buildStatusView(projectRoot);
    const messages = runtime.messages;
    const grillMeStep = status.indicators.grillMeRequired
      ? `  sduck grill complete --reason "..."`
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

export function runGrillCompleteCommand(
  projectRoot: string,
  options: { reason?: string; carried?: string[]; changedAssumption?: string },
  runtime: V2Runtime = DEFAULT_RUNTIME,
): CommandResult {
  try {
    if (options.reason === undefined || options.reason.trim() === '')
      throw new V2CommandError('NO_DRAFT_STDIN');
    const result = recordGrillCompleted(projectRoot, {
      reason: options.reason,
      carried: options.carried ?? [],
      ...(options.changedAssumption === undefined
        ? {}
        : { changedAssumption: options.changedAssumption }),
    });
    return ok(
      `${runtime.messages.commands.grillCompleted}\n${runtime.messages.common.task}: ${result.taskId}\n${runtime.messages.labels.event}: ${result.eventId}`,
    );
  } catch (error) {
    return fail(formatError(error, runtime));
  }
}

export function runEvaluateCommand(
  projectRoot: string,
  options: { check?: string[]; limitation?: string[]; json?: boolean },
  runtime: V2Runtime = DEFAULT_RUNTIME,
): CommandResult {
  try {
    const checks = (options.check ?? []).map((item) => {
      const [name, ...rest] = item.split('=');
      return { name: name ?? '', outcome: rest.join('=') };
    });
    const evaluation = recordEvaluation(projectRoot, {
      checks,
      ...(options.limitation === undefined ? {} : { limitations: options.limitation }),
    });
    return ok(
      options.json === true
        ? JSON.stringify(evaluation, null, 2)
        : `${runtime.messages.commands.evaluationRecorded}\n${runtime.messages.labels.evaluation}: ${evaluation.id}\n${runtime.messages.labels.trace}: ${evaluation.traceId}`,
    );
  } catch (error) {
    return fail(formatError(error, runtime));
  }
}

export function runGraphShowCommand(
  projectRoot: string,
  root: string,
  options: { depth?: string; json?: boolean },
  runtime: V2Runtime = DEFAULT_RUNTIME,
): CommandResult {
  try {
    const depthText = options.depth ?? '1';
    const depth = /^\d+$/.test(depthText) ? Number.parseInt(depthText, 10) : Number.NaN;
    const view = showGraph(projectRoot, root, depth);
    if (options.json === true) return ok(JSON.stringify(view, null, 2));
    return ok(
      [
        runtime.messages.commands.graphFor(view.root),
        `${runtime.messages.labels.truncated}: ${String(view.truncated)}`,
        `${runtime.messages.labels.nodes}:`,
        ...view.nodes.map((node) => `  - ${node.id} [${node.kind}] ${node.label}`),
        `${runtime.messages.labels.edges}:`,
        ...view.edges.map((edge) => `  - ${edge.from} -${edge.kind}-> ${edge.to}`),
      ].join('\n'),
    );
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

export function runWorkflowStatusCommand(
  projectRoot: string,
  asJson: boolean,
  runtime: V2Runtime = DEFAULT_RUNTIME,
): CommandResult {
  try {
    const view = getWorkflowStatus(projectRoot);
    return ok(
      asJson
        ? JSON.stringify(view, null, 2)
        : runtime.messages.commands.workflowStatus(view.enabled),
    );
  } catch (error) {
    return fail(formatError(error, runtime));
  }
}

export function runWorkflowEnableCommand(
  projectRoot: string,
  asJson: boolean,
  runtime: V2Runtime = DEFAULT_RUNTIME,
): CommandResult {
  try {
    const view = setWorkflowEnabledSafely(projectRoot, true);
    return ok(asJson ? JSON.stringify(view, null, 2) : runtime.messages.commands.workflowEnabled);
  } catch (error) {
    return fail(formatError(error, runtime));
  }
}

export function runWorkflowDisableCommand(
  projectRoot: string,
  asJson: boolean,
  runtime: V2Runtime = DEFAULT_RUNTIME,
): CommandResult {
  try {
    const hookSummary = createHookInstallSummary();
    const view = setWorkflowEnabledSafely(projectRoot, false);
    try {
      installRetrospectivePostCommitHookSync(projectRoot, hookSummary, 'safe');
    } catch (error) {
      hookSummary.warnings.push(
        `Could not install managed retrospective Git post-commit hook after disabling workflow: ${formatUnknownError(error)}`,
      );
    }
    if (asJson) return ok(JSON.stringify({ ...view, hookWarnings: hookSummary.warnings }, null, 2));
    const warnings = hookSummary.warnings.map((warning) => `Warning: ${warning}`);
    return ok([runtime.messages.commands.workflowDisabled, ...warnings].join('\n'));
  } catch (error) {
    return fail(formatError(error, runtime));
  }
}

interface WorkflowPolicyForWrite {
  schemaVersion: 'v2alpha1';
  requireGrillMe: boolean;
  workflowEnabled: boolean;
  retrospectiveHookState?: 'enabling';
}

function setWorkflowEnabledSafely(
  projectRoot: string,
  enabled: boolean,
): ReturnType<typeof getWorkflowStatus> {
  return withDecisionWorkspaceLock(projectRoot, () => {
    const policy = readDecisionWorkspacePolicy(projectRoot) ?? DEFAULT_REQUIRED_POLICY;
    const state = readState(projectRoot);
    const bundle = loadSourceBundle(projectRoot);
    validateDecisionState(state, bundle);
    if (state.currentTaskId !== null) {
      const task = bundle.tasks.find((item) => item.id === state.currentTaskId);
      if (
        task !== undefined &&
        (task.status === 'OPEN' || task.status === 'BRIEF_READY' || task.status === 'CONFIRMED')
      ) {
        throw new V2ExpectedError('WORKFLOW_TOGGLE_ACTIVE_TASK', {
          taskId: task.id,
          status: task.status,
        });
      }
    }

    if (enabled) {
      return withOptionalRetrospectiveMarkerPublicationLock(projectRoot, () => {
        if (!policy.workflowEnabled) {
          writeWorkflowPolicy(projectRoot, {
            ...policy,
            workflowEnabled: false,
            retrospectiveHookState: 'enabling',
          });
        }
        if (hasRetrospectivePendingMarker(projectRoot)) {
          writeWorkflowPolicy(projectRoot, policy);
          throw new Error(
            'Cannot enable decision workflow while a retrospective pending marker exists. Run `sduck retrospective capture --stdin` or remove the marker after review.',
          );
        }
        writeWorkflowPolicy(projectRoot, { ...policy, workflowEnabled: true });
        return getWorkflowStatus(projectRoot);
      });
    }

    writeWorkflowPolicy(projectRoot, { ...policy, workflowEnabled: false });
    return getWorkflowStatus(projectRoot);
  });
}

function withOptionalRetrospectiveMarkerPublicationLock<T>(
  projectRoot: string,
  operation: () => T,
): T {
  try {
    return withRetrospectiveMarkerPublicationLock(projectRoot, operation);
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.startsWith('Retrospective marker publication lock is unavailable:')
    ) {
      return operation();
    }
    throw error;
  }
}

function writeWorkflowPolicy(projectRoot: string, policy: WorkflowPolicyForWrite): void {
  const target = policyPath(projectRoot);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  const tmp = `${target}.${String(process.pid)}.${String(Date.now())}.tmp`;
  const fd = fs.openSync(tmp, 'w');
  try {
    fs.writeFileSync(fd, `${JSON.stringify(policy, null, 2)}\n`);
    fs.fsyncSync(fd);
  } finally {
    fs.closeSync(fd);
  }
  fs.renameSync(tmp, target);
}

function formatUnknownError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function createHookInstallSummary(): InitExecutionSummary {
  return {
    created: [],
    prepended: [],
    kept: [],
    overwritten: [],
    warnings: [],
    structuredWarnings: [],
    errors: [],
    rows: [],
  };
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
        : status.indicators.grillMeRequired && !status.indicators.grillMeCompleted
          ? runtime.messages.workflow.nextGrillComplete
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

export function runRetrospectiveCaptureCommand(
  projectRoot: string,
  stdin: string,
  runtime: V2Runtime = DEFAULT_RUNTIME,
): CommandResult {
  try {
    if (stdin.trim() === '') throw new V2CommandError('NO_DRAFT_STDIN');
    const result = captureRetrospective(projectRoot, stdin);
    return ok(
      `${runtime.messages.commands.retrospectiveCaptured}\n${runtime.messages.common.task}: ${result.taskId}\nCommit: ${result.commit}\n${runtime.messages.labels.decisions}: ${String(result.decisions)}\n${runtime.messages.labels.evidence}: ${String(result.evidence)}${result.duplicate ? '\nDuplicate: true' : ''}`,
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
        : `${renderTrace(view, runtime.messages)}\n\n${runtime.messages.workflow.nextEvaluate}`,
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
  return fs.readFileSync(0, 'utf8');
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
