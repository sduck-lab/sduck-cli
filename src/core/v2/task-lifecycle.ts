import type { SourceBundle } from './source-types.js';
import type { Task, TaskStatus } from '../../types/index.js';

export type DecisionTaskCommand =
  | 'answer'
  | 'confirm'
  | 'context'
  | 'submit'
  | 'trace'
  | 'close'
  | 'abandon'
  | 'resume';

const COMMAND_STATUSES: Record<DecisionTaskCommand, readonly TaskStatus[]> = {
  answer: ['OPEN', 'BRIEF_READY'],
  confirm: ['BRIEF_READY'],
  context: ['OPEN', 'BRIEF_READY', 'CONFIRMED'],
  submit: ['OPEN', 'BRIEF_READY'],
  trace: ['CONFIRMED'],
  close: ['CONFIRMED'],
  abandon: ['OPEN', 'BRIEF_READY', 'CONFIRMED'],
  resume: ['OPEN', 'BRIEF_READY', 'CONFIRMED'],
};

/** Owns every v2 decision-task transition and command guard. */
export class TaskLifecycle {
  readonly task: Task;

  constructor(
    private readonly bundle: SourceBundle,
    readonly taskId: string,
  ) {
    const task = bundle.tasks.find((item) => item.id === taskId);
    if (task === undefined) throw new Error(`Task not found: ${taskId}`);
    this.task = task;
  }

  assertAllowed(command: DecisionTaskCommand): void {
    const allowed = COMMAND_STATUSES[command];
    if (allowed.includes(this.task.status)) return;

    throw new Error(
      `Cannot ${command} task ${this.task.id}: status is ${this.task.status}. Expected: ${allowed.join(', ')}.`,
    );
  }

  reconcileBriefReadiness(updatedAt: string): TaskStatus {
    if (this.task.status !== 'OPEN' && this.task.status !== 'BRIEF_READY') return this.task.status;

    const questionsOpen = this.bundle.questions.some(
      (question) => question.taskId === this.taskId && !question.answered,
    );
    const activeDecisions = this.bundle.decisions.filter(
      (decision) =>
        decision.taskId === this.taskId &&
        (decision.status === 'DRAFT' || decision.status === 'CONFIRMED'),
    );
    const unresolvedDecision = activeDecisions.some(
      (decision) => decision.kind === 'OPEN' || decision.kind === 'CONFLICT',
    );
    const status: TaskStatus =
      !questionsOpen && !unresolvedDecision && activeDecisions.length > 0 ? 'BRIEF_READY' : 'OPEN';
    this.setStatus(status, updatedAt);
    return status;
  }

  confirm(updatedAt: string): void {
    const openQuestions = this.bundle.questions.filter(
      (question) => question.taskId === this.taskId && !question.answered,
    );
    if (openQuestions.length > 0) {
      throw new Error(
        `Cannot confirm task ${this.taskId}: ${String(openQuestions.length)} open question(s) remain.`,
      );
    }

    const unresolved = this.bundle.decisions.filter(
      (decision) =>
        decision.taskId === this.taskId &&
        (decision.status === 'DRAFT' || decision.status === 'CONFIRMED') &&
        (decision.kind === 'OPEN' || decision.kind === 'CONFLICT'),
    );
    if (unresolved.length > 0) {
      throw new Error(
        `Cannot confirm task ${this.taskId}: unresolved ${unresolved.map((item) => `${item.kind} ${item.id}`).join(', ')}.`,
      );
    }

    this.assertAllowed('confirm');
    this.bundle.decisions = this.bundle.decisions.map((decision) =>
      decision.taskId === this.taskId && decision.status === 'DRAFT'
        ? { ...decision, status: 'CONFIRMED', updatedAt }
        : decision,
    );
    this.setStatus('CONFIRMED', updatedAt);
  }

  setTerminal(status: 'CLOSED' | 'ABANDONED', updatedAt: string): void {
    this.assertAllowed(status === 'CLOSED' ? 'close' : 'abandon');
    this.setStatus(status, updatedAt);
  }

  private setStatus(status: TaskStatus, updatedAt: string): void {
    this.bundle.tasks = this.bundle.tasks.map((task) =>
      task.id === this.taskId ? { ...task, status, updatedAt } : task,
    );
    this.task.status = status;
    this.task.updatedAt = updatedAt;
  }
}
