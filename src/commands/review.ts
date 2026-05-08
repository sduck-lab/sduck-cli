import { runCommand, type CommandResult } from './runner.js';
import { runReviewReadyWorkflow } from '../core/review-ready.js';

export type ReviewReadyCommandResult = CommandResult;

export async function runReviewReadyCommand(
  target: string | undefined,
  projectRoot: string,
): Promise<ReviewReadyCommandResult> {
  return await runCommand(async () => {
    const { workId } = await runReviewReadyWorkflow(projectRoot, target);
    return `리뷰 준비 완료: ${workId}`;
  }, 'Unknown review ready failure.');
}
