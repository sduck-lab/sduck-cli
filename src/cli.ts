#!/usr/bin/env node

import { Command } from 'commander';

import { runInitCommand } from './commands/init.js';
import {
  CLI_DESCRIPTION,
  CLI_NAME,
  PLACEHOLDER_MESSAGE,
  normalizeCommandName,
} from './core/command-metadata.js';

const program = new Command();

program.name(CLI_NAME).description(CLI_DESCRIPTION).version('0.1.0');

program
  .command('init')
  .description('Initialize the current repository for the SDD workflow')
  .option('--force', 'Regenerate the bundled assets in sduck-assets')
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
  .command('roadmap')
  .description('Show the current bootstrap status')
  .action(() => {
    console.log(PLACEHOLDER_MESSAGE);
  });

await program.parseAsync(process.argv);
