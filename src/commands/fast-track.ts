import { confirm } from '@inquirer/prompts';

import {
  approveFastTrackTask,
  createFastTrackTask,
  isInteractiveApprovalAvailable,
  type FastTrackCommandInput,
  type FastTrackFailureRow,
} from '../core/fast-track.js';
import { type StartTaskOptions } from '../core/start.js';

export interface FastTrackCommandResult {
  exitCode: number;
  stderr: string;
  stdout: string;
}

function formatFailures(rows: readonly FastTrackFailureRow[]): string[] {
  return rows.map((row) => `- ${row.taskId}: ${row.note}`);
}

export async function runFastTrackCommand(
  input: FastTrackCommandInput,
  projectRoot: string,
  startOptions?: StartTaskOptions,
): Promise<FastTrackCommandResult> {
  try {
    const createdTask = await createFastTrackTask(input, projectRoot, startOptions);
    const lines = [
      'fast-track task created',
      `경로: ${createdTask.path}/`,
      'minimal spec: created',
      'minimal plan: created',
    ];

    if (!isInteractiveApprovalAvailable()) {
      lines.push(
        '상태: PENDING_SPEC_APPROVAL',
        '다음 단계: `sduck spec approve <slug>` 후 `sduck plan approve <slug>`를 실행하세요.',
      );

      return {
        exitCode: 0,
        stderr: '',
        stdout: lines.join('\n'),
      };
    }

    const shouldApprove = await confirm({
      default: true,
      message: 'Approve the minimal spec and minimal plan now?',
    });

    if (!shouldApprove) {
      lines.push(
        '상태: PENDING_SPEC_APPROVAL',
        '다음 단계: `sduck spec approve <slug>` 후 `sduck plan approve <slug>`를 실행하세요.',
      );

      return {
        exitCode: 0,
        stderr: '',
        stdout: lines.join('\n'),
      };
    }

    const approvalResult = await approveFastTrackTask(
      {
        id: createdTask.taskId,
        path: createdTask.path,
        slug: input.slug,
        status: 'PENDING_SPEC_APPROVAL',
      },
      projectRoot,
    );

    lines.push(`상태: ${approvalResult.nextStatus}`);

    if (approvalResult.failed.length > 0) {
      lines.push('승인 결과:', ...formatFailures(approvalResult.failed));
    }

    if (approvalResult.approved) {
      lines.push('fast-track 승인 완료 → 바로 작업을 시작할 수 있습니다.');
    } else {
      lines.push('일부 승인 단계가 완료되지 않았습니다. 일반 승인 명령으로 이어서 진행하세요.');
    }

    return {
      exitCode: approvalResult.failed.length > 0 ? 1 : 0,
      stderr: '',
      stdout: lines.join('\n'),
    };
  } catch (error) {
    return {
      exitCode: 1,
      stderr: error instanceof Error ? error.message : 'Unknown fast-track failure.',
      stdout: '',
    };
  }
}
