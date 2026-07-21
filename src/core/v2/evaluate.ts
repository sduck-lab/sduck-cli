import { DecisionWorkspace } from './decision-workspace.js';
import { noCurrentTask, V2ExpectedError } from './errors.js';
import { nowIso } from './ids.js';
import { appendSourceEvent, nextSourceEntityId } from './source-store.js';

import type { EvaluationRecord } from '../../types/index.js';

export function recordEvaluation(
  projectRoot: string,
  input: { checks: { name: string; outcome: string }[]; limitations?: string[] },
): EvaluationRecord {
  if (input.checks.length === 0)
    throw new V2ExpectedError('EVALUATION_REQUIRED', { field: 'checks' });
  for (const check of input.checks) {
    if (check.name.trim() === '' || check.outcome.trim() === '')
      throw new V2ExpectedError('EVALUATION_REQUIRED', { field: 'check' });
  }
  return new DecisionWorkspace(projectRoot).mutate(({ bundle, state }) => {
    const taskId = state.currentTaskId;
    if (taskId === null) throw noCurrentTask();
    const trace = bundle.implementationTraces.filter((item) => item.taskId === taskId).at(-1);
    if (trace === undefined) throw new V2ExpectedError('EVALUATION_REQUIRED', { field: 'trace' });
    const evaluation: EvaluationRecord = {
      id: nextSourceEntityId(
        bundle.evaluations.map((item) => item.id),
        'EVAL',
      ),
      taskId,
      traceId: trace.id,
      checks: input.checks,
      ...(input.limitations === undefined ? {} : { limitations: input.limitations }),
      createdAt: nowIso(),
    };
    bundle.evaluations.push(evaluation);
    appendSourceEvent(bundle, {
      taskId,
      type: 'EVALUATION_RECORDED',
      payload: { evaluationId: evaluation.id, traceId: trace.id },
    });
    return evaluation;
  });
}
