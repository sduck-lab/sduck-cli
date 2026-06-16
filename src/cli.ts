#!/usr/bin/env node

import { Command, InvalidArgumentError } from 'commander';

import { runAbandonCommand as runSddAbandonCommand } from './commands/abandon.js';
import { runArchiveCommand } from './commands/archive.js';
import { runCleanCommand } from './commands/clean.js';
import { runDoneCommand } from './commands/done.js';
import { runFastTrackCommand } from './commands/fast-track.js';
import { runImplementCommand } from './commands/implement.js';
import { runInitCommand as runSddInitCommand } from './commands/init.js';
import { runPlanApproveCommand } from './commands/plan-approve.js';
import { runReopenCommand } from './commands/reopen.js';
import { runReviewReadyCommand } from './commands/review.js';
import { runSpecApproveCommand } from './commands/spec-approve.js';
import { runStartCommand } from './commands/start.js';
import { runStepCommand } from './commands/step.js';
import { runUpdateCommand } from './commands/update.js';
import { runUseCommand } from './commands/use.js';
import {
  readStdinIfRequested,
  runAbandonCommand as runV2AbandonCommand,
  runAnswerCommand,
  runAskCommand,
  runBriefCommand,
  runCloseCommand,
  runConfirmCommand,
  runContextAddCommand,
  runContextCommand,
  runRecallCommand,
  runRememberCommand,
  runStatusCommand,
  runSubmitCommand,
  runTraceCommand,
  runWorkCommand,
} from './commands/v2/index.js';
import { CLI_DESCRIPTION, CLI_NAME, CLI_VERSION } from './core/command-metadata.js';

const program = new Command();

program.name(CLI_NAME).description(CLI_DESCRIPTION).version(CLI_VERSION);

function parseInteger(value: string, label: string, minimum: number): number {
  const parsedValue = Number(value);

  if (!Number.isInteger(parsedValue) || parsedValue < minimum) {
    throw new InvalidArgumentError(
      `${label} must be an integer greater than or equal to ${String(minimum)}.`,
    );
  }

  return parsedValue;
}

function toStartOptions(options: { git?: boolean }): { noGit?: boolean } | undefined {
  return options.git === false ? { noGit: true } : undefined;
}

function withOptionalTarget(target: string | undefined): { target?: string } {
  return target === undefined ? {} : { target };
}

function withOptionalKeep(keep: number | undefined): { keep?: number } {
  return keep === undefined ? {} : { keep };
}

function toInitOptions(options: { agentRules?: boolean; agents?: string; force?: boolean }): {
  agentRules?: boolean;
  agents?: string;
  force: boolean;
} {
  return {
    force: options.force === true,
    ...(options.agentRules === undefined ? {} : { agentRules: options.agentRules }),
    ...(options.agents === undefined ? {} : { agents: options.agents }),
  };
}

function printResult(result: { stdout: string; stderr: string; exitCode: number }): void {
  if (result.stdout !== '') console.log(result.stdout);
  if (result.stderr !== '') console.error(result.stderr);
  if (result.exitCode !== 0) process.exitCode = result.exitCode;
}

program
  .command('init')
  .description('Initialize .decision, .sduck, and agent rule files')
  .option(
    '--agents <list>',
    'Comma-separated agents: claude-code,codex,opencode,gemini-cli,cursor,antigravity',
  )
  .option('--force', 'Overwrite bundled assets and managed rule blocks')
  .option('--no-agent-rules', 'Skip managed agent rule installation')
  .action(async (options: { agentRules?: boolean; agents?: string; force?: boolean }) => {
    printResult(await runSddInitCommand(toInitOptions(options), process.cwd()));
  });

program
  .command('start <type> <slug>')
  .description('Start an SDD task workspace')
  .option('--no-git', 'Skip git worktree/branch allocation')
  .action(async (type: string, slug: string, options: { git?: boolean }) => {
    printResult(await runStartCommand(type, slug, process.cwd(), toStartOptions(options)));
  });

program
  .command('fast-track <type> <slug>')
  .description('Create a minimal SDD task, spec, and plan')
  .option('--no-git', 'Skip git worktree/branch allocation')
  .action(async (type: string, slug: string, options: { git?: boolean }) => {
    printResult(await runFastTrackCommand({ slug, type }, process.cwd(), toStartOptions(options)));
  });

const spec = program.command('spec').description('Legacy SDD spec workflow commands');

spec
  .command('approve [target]')
  .description('Approve an SDD spec')
  .action(async (target?: string) => {
    printResult(await runSpecApproveCommand(withOptionalTarget(target), process.cwd()));
  });

const plan = program.command('plan').description('Legacy SDD plan workflow commands');

plan
  .command('approve [target]')
  .description('Approve an SDD plan')
  .action(async (target?: string) => {
    printResult(await runPlanApproveCommand(withOptionalTarget(target), process.cwd()));
  });

const step = program.command('step').description('Legacy SDD step workflow commands');

step
  .command('done <number> [target]')
  .description('Mark an SDD plan step done')
  .action(async (stepNumberText: string, target?: string) => {
    printResult(
      await runStepCommand(parseInteger(stepNumberText, 'step number', 1), process.cwd(), target),
    );
  });

const review = program.command('review').description('Legacy SDD review workflow commands');

review
  .command('ready [target]')
  .description('Mark an SDD task review ready')
  .action(async (target?: string) => {
    printResult(await runReviewReadyCommand(target, process.cwd()));
  });

program
  .command('done [target]')
  .description('Mark an SDD task done')
  .action(async (target?: string) => {
    printResult(await runDoneCommand(withOptionalTarget(target), process.cwd()));
  });

program
  .command('use <target>')
  .description('Switch current SDD task')
  .action(async (target: string) => {
    printResult(await runUseCommand(target, process.cwd()));
  });

program
  .command('implement [target]')
  .description('Render SDD implementation context')
  .action(async (target?: string) => {
    printResult(await runImplementCommand(process.cwd(), target));
  });

program
  .command('clean [target]')
  .description('Clean archived or abandoned SDD task resources')
  .option('--force', 'Clean without confirmation guards')
  .action(async (target: string | undefined, options: { force?: boolean }) => {
    printResult(await runCleanCommand({ force: options.force, target }, process.cwd()));
  });

program
  .command('reopen [target]')
  .description('Reopen an SDD task')
  .action(async (target?: string) => {
    printResult(await runReopenCommand(withOptionalTarget(target), process.cwd()));
  });

program
  .command('archive')
  .description('Archive DONE SDD tasks')
  .option('--keep <n>', 'Keep the most recent N DONE tasks in workspace', (value: string) =>
    parseInteger(value, '--keep', 0),
  )
  .action(async (options: { keep?: number }) => {
    printResult(await runArchiveCommand(withOptionalKeep(options.keep), process.cwd()));
  });

program
  .command('update')
  .description('Update bundled SDD assets in the current project')
  .option('--dry-run', 'Preview changes without writing files')
  .action(async (options: { dryRun?: boolean }) => {
    printResult(await runUpdateCommand({ dryRun: options.dryRun === true }, process.cwd()));
  });

program
  .command('work <description...>')
  .description('Start a decision briefing task and index context')
  .action((descriptionParts: string[]) => {
    printResult(runWorkCommand(process.cwd(), descriptionParts.join(' ')));
  });

program
  .command('status')
  .description('Show current decision briefing status')
  .option('--json', 'Print machine-readable JSON')
  .action((options: { json?: boolean }) => {
    printResult(runStatusCommand(process.cwd(), options.json === true));
  });

const context = program.command('context').description('Show or extend current context pack');

context.option('--json', 'Print machine-readable JSON').action((options: { json?: boolean }) => {
  printResult(runContextCommand(process.cwd(), options.json === true));
});

context
  .command('add <pathOrGlob>')
  .description('Add file/path context to current task')
  .action((pathOrGlob: string) => {
    printResult(runContextAddCommand(process.cwd(), pathOrGlob));
  });

program
  .command('submit')
  .description('Submit agent-generated JSON or Markdown draft from stdin')
  .option('--stdin', 'Read draft from stdin')
  .action((options: { stdin?: boolean }) => {
    try {
      printResult(runSubmitCommand(process.cwd(), readStdinIfRequested(options.stdin)));
    } catch (error) {
      printResult({
        stdout: '',
        stderr: error instanceof Error ? error.message : String(error),
        exitCode: 1,
      });
    }
  });

program
  .command('ask')
  .description('Ask the next open question')
  .action(async () => {
    printResult(await runAskCommand(process.cwd()));
  });

program
  .command('answer <questionId>')
  .description('Answer a question non-interactively')
  .option('--option <n>', 'Answer with a 1-based option number')
  .option('--text <answer>', 'Answer with free text')
  .action((questionId: string, options: { option?: string; text?: string }) => {
    printResult(runAnswerCommand(process.cwd(), questionId, options));
  });

program
  .command('brief')
  .description('Render the current implementation brief')
  .option('--json', 'Print machine-readable JSON')
  .action((options: { json?: boolean }) => {
    printResult(runBriefCommand(process.cwd(), options.json === true));
  });

program
  .command('confirm')
  .description('Confirm the current implementation brief')
  .action(() => {
    printResult(runConfirmCommand(process.cwd()));
  });

program
  .command('trace')
  .description('Create implementation trace from git changes')
  .option('--base <ref>', 'Diff base ref')
  .option('--json', 'Print machine-readable JSON')
  .action((options: { base?: string; json?: boolean }) => {
    printResult(runTraceCommand(process.cwd(), options));
  });

program
  .command('remember')
  .description('Export markdown and decision graph artifacts')
  .action(() => {
    printResult(runRememberCommand(process.cwd()));
  });

program
  .command('recall <query...>')
  .description('Search prior decisions and implementation traces')
  .action((queryParts: string[]) => {
    printResult(runRecallCommand(process.cwd(), queryParts.join(' ')));
  });

program
  .command('close')
  .description('Close current task')
  .action(() => {
    printResult(runCloseCommand(process.cwd()));
  });

program
  .command('abandon')
  .description('Abandon the current v2 task or a target SDD task')
  .argument('[target]')
  .action(async (target?: string) => {
    printResult(
      target === undefined
        ? runV2AbandonCommand(process.cwd())
        : await runSddAbandonCommand(target, process.cwd()),
    );
  });

program.parseAsync(process.argv).catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
