#!/usr/bin/env node

import { Command } from 'commander';

import { runInitCommand } from './commands/init.js';
import { runPlanApproveCommand } from './commands/plan-approve.js';
import { runSpecApproveCommand } from './commands/spec-approve.js';
import { runStartCommand } from './commands/start.js';
import {
  CLI_DESCRIPTION,
  CLI_NAME,
  CLI_VERSION,
  PLACEHOLDER_MESSAGE,
  normalizeCommandName,
} from './core/command-metadata.js';

const program = new Command();

program.name(CLI_NAME).description(CLI_DESCRIPTION).version(CLI_VERSION);

program
  .command('init')
  .description('Initialize the current repository for the SDD workflow')
  .option('--force', 'Regenerate the bundled assets in .sduck/sduck-assets')
  .option(
    '--agents <agents>',
    'Comma-separated agents (claude-code,codex,opencode,gemini-cli,cursor,antigravity)',
  )
  .action(async (options: { agents?: string; force?: boolean }) => {
    const initOptions =
      options.agents === undefined
        ? { force: options.force ?? false }
        : { agents: options.agents, force: options.force ?? false };
    const result = await runInitCommand(initOptions, process.cwd());

    if (result.stdout !== '') {
      console.log(result.stdout);
    }

    if (result.stderr !== '') {
      console.error(result.stderr);
    }

    if (result.exitCode !== 0) {
      process.exitCode = result.exitCode;
    }
  });

program
  .command('preview <name>')
  .description('Print the normalized command name for bootstrap verification')
  .action((name: string) => {
    console.log(normalizeCommandName(name));
  });

program
  .command('start <type> <slug>')
  .description('Create a new task workspace from a type template')
  .action(async (type: string, slug: string) => {
    const result = await runStartCommand(type, slug, process.cwd());

    if (result.stdout !== '') {
      console.log(result.stdout);
    }

    if (result.stderr !== '') {
      console.error(result.stderr);
    }

    if (result.exitCode !== 0) {
      process.exitCode = result.exitCode;
    }
  });

program
  .command('spec')
  .description('Manage spec workflow state')
  .command('approve [target]')
  .description('Approve a task spec and move it to plan writing')
  .action(async (target?: string) => {
    const input = target === undefined ? {} : { target };
    const result = await runSpecApproveCommand(input, process.cwd());

    if (result.stdout !== '') {
      console.log(result.stdout);
    }

    if (result.stderr !== '') {
      console.error(result.stderr);
    }

    if (result.exitCode !== 0) {
      process.exitCode = result.exitCode;
    }
  });

program
  .command('plan')
  .description('Manage plan workflow state')
  .command('approve [target]')
  .description('Approve a task plan and move it to implementation')
  .action(async (target?: string) => {
    const input = target === undefined ? {} : { target };
    const result = await runPlanApproveCommand(input, process.cwd());

    if (result.stdout !== '') {
      console.log(result.stdout);
    }

    if (result.stderr !== '') {
      console.error(result.stderr);
    }

    if (result.exitCode !== 0) {
      process.exitCode = result.exitCode;
    }
  });

program
  .command('roadmap')
  .description('Show the current bootstrap status')
  .action(() => {
    console.log(PLACEHOLDER_MESSAGE);
  });

await program.parseAsync(process.argv);
