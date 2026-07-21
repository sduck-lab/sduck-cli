import { DecisionWorkspace } from './decision-workspace.js';
import { noCurrentTask, taskNotFound } from './errors.js';
import { appendSourceEvent } from './source-store.js';

import type { EventRecord } from '../../types/index.js';

export interface GrillMeView {
  taskId: string;
  recorded: boolean;
  eventId: string;
  prompt: string;
  checklist: readonly string[];
  protocol: readonly string[];
}

export const GRILL_ME_PROTOCOL = [
  'Ask one question at a time.',
  'Do not ask what can be inferred from context.',
  'Provide a recommended answer with rationale.',
  'Separate EXPLICIT, INFERRED, CARRIED, CONFLICT, and OPEN decisions.',
  'Submit structured draft with `sduck submit --stdin`.',
] as const;

export const GRILL_ME_PROMPT = [
  'Interview the user relentlessly about every aspect of this plan until shared understanding is reached.',
  'Walk down each branch of the design tree, resolving dependencies between decisions one-by-one.',
  'Ask one question at a time.',
  'For each question, provide a recommended answer and rationale.',
  'If a question can be answered by exploring the codebase, explore the codebase instead and cite evidence/source refs.',
  'Do not ask what can already be inferred from context.',
  'Classify outcomes as EXPLICIT, INFERRED, CARRIED, CONFLICT, or OPEN decisions.',
  'When the decision tree is sufficiently resolved, submit a structured draft with `sduck submit --stdin`.',
].join('\n');

export const GRILL_ME_CHECKLIST = [
  'Domain/docs: check glossary, ADRs, and contradictions between user claims and code.',
  'Brief quality: keep the final brief durable, behavioral, testable, and explicit about out-of-scope items.',
  'Testing: identify public interfaces, observable behaviors, and test priorities.',
  'Bug/performance: establish feedback loop, reproduction signal, and falsifiable hypotheses before fix choices.',
  'Architecture/refactor: reason in terms of module, interface, seam, locality, and leverage.',
] as const;

export function isGrillMeRequiredForTask(events: readonly EventRecord[], taskId: string): boolean {
  const created = events.find((event) => event.taskId === taskId && event.type === 'TASK_CREATED');
  const policy = created?.payload['policy'];
  return (
    typeof policy === 'object' &&
    policy !== null &&
    (policy as Record<string, unknown>)['grillMeRequired'] === true
  );
}

export function hasGrillMeStarted(events: readonly EventRecord[], taskId: string): boolean {
  return events.some((event) => event.taskId === taskId && event.type === 'GRILL_STARTED');
}

export function hasGrillMeCompleted(events: readonly EventRecord[], taskId: string): boolean {
  return events.some((event) => event.taskId === taskId && event.type === 'GRILL_COMPLETED');
}

export function recordGrillMeStarted(projectRoot: string): GrillMeView {
  return new DecisionWorkspace(projectRoot).mutate(({ bundle, state }) => {
    const taskId = state.currentTaskId;
    if (taskId === null) throw noCurrentTask();
    const task = bundle.tasks.find((item) => item.id === taskId);
    if (task === undefined) throw taskNotFound(taskId);
    const existing = bundle.events.find(
      (event) => event.taskId === taskId && event.type === 'GRILL_STARTED',
    );
    const event =
      existing ??
      appendSourceEvent(bundle, {
        taskId,
        type: 'GRILL_STARTED',
        payload: { prompt: GRILL_ME_PROMPT, protocol: [...GRILL_ME_PROTOCOL] },
      });
    return {
      taskId,
      recorded: existing === undefined,
      eventId: event.id,
      prompt: GRILL_ME_PROMPT,
      checklist: GRILL_ME_CHECKLIST,
      protocol: GRILL_ME_PROTOCOL,
    };
  });
}

export function recordGrillCompleted(
  projectRoot: string,
  input: { reason: string; carried?: string[]; changedAssumption?: string },
): { taskId: string; eventId: string } {
  if (input.reason.trim() === '') throw new Error('grill completion reason is required');
  return new DecisionWorkspace(projectRoot).mutate(({ bundle, state }) => {
    const taskId = state.currentTaskId;
    if (taskId === null) throw noCurrentTask();
    const task = bundle.tasks.find((item) => item.id === taskId);
    if (task === undefined) throw taskNotFound(taskId);
    const event = appendSourceEvent(bundle, {
      taskId,
      type: 'GRILL_COMPLETED',
      payload: {
        reason: input.reason,
        carried: input.carried ?? [],
        ...(input.changedAssumption === undefined
          ? {}
          : { changedAssumption: input.changedAssumption }),
      },
    });
    return { taskId, eventId: event.id };
  });
}
