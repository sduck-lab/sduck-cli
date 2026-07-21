import { taskNotFound, V2ExpectedError } from './errors.js';
import { hasGrillMeCompleted, hasGrillMeStarted, isGrillMeRequiredForTask } from './grill.js';

import type { SourceBundle } from './source-types.js';
import type { Task, TaskStatus } from '../../types/index.js';

export type DecisionTaskCommand =
  'answer' | 'confirm' | 'context' | 'submit' | 'trace' | 'close' | 'abandon' | 'resume';

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
    if (task === undefined) throw taskNotFound(taskId);
    this.task = task;
  }

  assertAllowed(command: DecisionTaskCommand): void {
    const allowed = COMMAND_STATUSES[command];
    if (allowed.includes(this.task.status)) {
      this.assertGrillMeSatisfied(command);
      return;
    }

    throw new V2ExpectedError('TASK_STATUS_NOT_ALLOWED', {
      command,
      taskId: this.task.id,
      status: this.task.status,
      expected: allowed.join(', '),
    });
  }

  private assertGrillMeSatisfied(command: DecisionTaskCommand): void {
    if (command !== 'submit' && command !== 'confirm') return;
    if (this.isGuided()) {
      if (hasGrillMeCompleted(this.bundle.events, this.taskId)) return;
      throw new V2ExpectedError('GRILL_ME_REQUIRED', {
        command,
        taskId: this.taskId,
        completion: true,
      });
    }
    if (!isGrillMeRequiredForTask(this.bundle.events, this.taskId)) return;
    if (hasGrillMeStarted(this.bundle.events, this.taskId)) return;
    throw new V2ExpectedError('GRILL_ME_REQUIRED', { command, taskId: this.taskId });
  }

  reconcileBriefReadiness(updatedAt: string): TaskStatus {
    if (this.task.status !== 'OPEN' && this.task.status !== 'BRIEF_READY') return this.task.status;
    const status: TaskStatus = this.computeBriefReadiness();
    this.setStatus(status, updatedAt);
    return status;
  }

  confirm(updatedAt: string): void {
    this.assertGrillMeSatisfied('confirm');
    const openQuestions = this.bundle.questions.filter(
      (question) => question.taskId === this.taskId && !question.answered,
    );
    if (openQuestions.length > 0) {
      throw new V2ExpectedError('CONFIRM_OPEN_QUESTIONS', {
        taskId: this.taskId,
        count: openQuestions.length,
      });
    }

    const unresolved = this.bundle.decisions.filter(
      (decision) =>
        decision.taskId === this.taskId &&
        (decision.status === 'DRAFT' || decision.status === 'CONFIRMED') &&
        (decision.kind === 'OPEN' || decision.kind === 'CONFLICT'),
    );
    if (unresolved.length > 0) {
      throw new V2ExpectedError('CONFIRM_UNRESOLVED_DECISIONS', {
        taskId: this.taskId,
        items: unresolved.map((item) => `${item.kind} ${item.id}`).join(', '),
      });
    }
    if (this.computeBriefReadiness() !== 'BRIEF_READY') {
      throw new V2ExpectedError('CONFIRM_BRIEF_NOT_READY', { taskId: this.taskId });
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
    if (status === 'CLOSED' && this.isGuided()) this.assertGuidedCloseReady();
    this.setStatus(status, updatedAt);
  }

  private setStatus(status: TaskStatus, updatedAt: string): void {
    this.bundle.tasks = this.bundle.tasks.map((task) =>
      task.id === this.taskId ? { ...task, status, updatedAt } : task,
    );
    this.task.status = status;
    this.task.updatedAt = updatedAt;
  }

  private computeBriefReadiness(): TaskStatus {
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
    const planReady =
      !this.isGuided() ||
      ((this.task.implementationPlan ?? []).length > 0 &&
        (this.task.verificationPlan ?? []).length > 0);
    const grillReady = !this.isGuided() || hasGrillMeCompleted(this.bundle.events, this.taskId);
    return !questionsOpen &&
      !unresolvedDecision &&
      activeDecisions.length > 0 &&
      planReady &&
      grillReady
      ? 'BRIEF_READY'
      : 'OPEN';
  }

  private isGuided(): boolean {
    return this.task.guided === true;
  }

  private assertGuidedCloseReady(): void {
    const traces = this.bundle.implementationTraces.filter((trace) => trace.taskId === this.taskId);
    const latest = traces.at(-1);
    if (latest === undefined)
      throw new V2ExpectedError('CLOSE_REQUIRES_TRACE', { taskId: this.taskId });
    const evaluated = this.bundle.evaluations.some(
      (evaluation) => evaluation.taskId === this.taskId && evaluation.traceId === latest.id,
    );
    if (!evaluated)
      throw new V2ExpectedError('CLOSE_REQUIRES_EVALUATION', {
        taskId: this.taskId,
        traceId: latest.id,
      });
  }
}
