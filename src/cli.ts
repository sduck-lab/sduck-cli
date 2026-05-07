#!/usr/bin/env node

import { Command } from 'commander';

import {
  readStdinIfRequested,
  runAbandonCommand,
  runAnswerCommand,
  runAskCommand,
  runBriefCommand,
  runCloseCommand,
  runConfirmCommand,
  runContextAddCommand,
  runContextCommand,
  runInitCommand,
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

function printResult(result: { stdout: string; stderr: string; exitCode: number }): void {
  if (result.stdout !== '') console.log(result.stdout);
  if (result.stderr !== '') console.error(result.stderr);
  if (result.exitCode !== 0) process.exitCode = result.exitCode;
}

program
  .command('init')
  .description('Initialize .decision workspace')
  .action(() => {
    printResult(runInitCommand(process.cwd()));
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
  .description('Abandon current task')
  .action(() => {
    printResult(runAbandonCommand(process.cwd()));
  });

program.parseAsync(process.argv).catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
