import { runReviewReadyWorkflow } from '../core/review-ready.js';

export interface ReviewReadyCommandResult {
  exitCode: number;
  stderr: string;
  stdout: string;
}

export async function runReviewReadyCommand(
  target: string | undefined,
  projectRoot: string,
): Promise<ReviewReadyCommandResult> {
  try {
    const { workId } = await runReviewReadyWorkflow(projectRoot, target);

    return {
      exitCode: 0,
      stderr: '',
      stdout: `리뷰 준비 완료: ${workId}`,
    };
  } catch (error) {
    return {
      exitCode: 1,
      stderr: error instanceof Error ? error.message : 'Unknown review ready failure.',
      stdout: '',
    };
  }
}
