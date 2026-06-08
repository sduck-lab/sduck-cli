import * as fs from 'node:fs';
import * as path from 'node:path';

export const AGENT_RAILS_FILE_NAME = 'AGENTS.md';
export const AGENT_RAILS_BEGIN_MARKER = '<!-- sduck:v2-agent-rails:begin -->';
export const AGENT_RAILS_END_MARKER = '<!-- sduck:v2-agent-rails:end -->';

export type AgentRailsInstallAction = 'created' | 'updated' | 'appended' | 'unchanged';

export interface AgentRailsInstallResult {
  action: AgentRailsInstallAction;
  path: string;
}

export function renderAgentRailsBlock(): string {
  return `${[
    AGENT_RAILS_BEGIN_MARKER,
    '## sduck v2 agent rails',
    '',
    'When a user asks you to do implementation work in this repository, use the sduck `.decision` workflow as your safety rails. The user does not need to remember the full CLI sequence; you should run the relevant commands and summarize important results.',
    '',
    'Required workflow:',
    '',
    '1. Start by checking `sduck status`.',
    '2. If there is no current task, start one with `sduck work "<user request>"`.',
    '3. Load context with `sduck context --json` before planning edits.',
    '4. When target files are known, run `sduck impact <file...> --json` before editing.',
    '5. Treat impact results as prior-decision evidence only. Do not auto-confirm prior decisions; use them as grounds for `CARRIED` or `CONFLICT` draft proposals.',
    '6. Submit decisions, questions, evidence, expected scope, and avoid scope with `sduck submit --stdin`.',
    '7. If open questions remain, ask the user and record answers with `sduck answer`.',
    '8. Do not implement or run `sduck confirm` while unresolved questions remain.',
    '9. Confirm the implementation brief with `sduck brief` and `sduck confirm` before coding.',
    '10. After implementation, run `sduck trace`, then `sduck remember`.',
    '11. Finish completed work with `sduck close`; use `sduck abandon` only for intentionally discarded work.',
    '12. Never mutate `CLOSED` or `ABANDONED` tasks.',
    '',
    'Keep the brief durable, behavioral, testable, and explicit about out-of-scope work.',
    AGENT_RAILS_END_MARKER,
  ].join('\n')}\n`;
}

export function installAgentRails(projectRoot: string): AgentRailsInstallResult {
  const filePath = path.join(projectRoot, AGENT_RAILS_FILE_NAME);
  const nextBlock = renderAgentRailsBlock();

  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, nextBlock, 'utf8');
    return { action: 'created', path: filePath };
  }

  const current = fs.readFileSync(filePath, 'utf8');
  const next = upsertManagedBlock(current, nextBlock);
  if (next === current) {
    return { action: 'unchanged', path: filePath };
  }

  fs.writeFileSync(filePath, next, 'utf8');
  return {
    action: current.includes(AGENT_RAILS_BEGIN_MARKER) ? 'updated' : 'appended',
    path: filePath,
  };
}

function upsertManagedBlock(content: string, nextBlock: string): string {
  const beginMatches = [
    ...content.matchAll(new RegExp(escapeRegExp(AGENT_RAILS_BEGIN_MARKER), 'g')),
  ];
  const endMatches = [...content.matchAll(new RegExp(escapeRegExp(AGENT_RAILS_END_MARKER), 'g'))];

  if (beginMatches.length !== endMatches.length) {
    throw new Error(`${AGENT_RAILS_FILE_NAME} contains an incomplete sduck agent rails block.`);
  }
  if (beginMatches.length > 1) {
    throw new Error(`${AGENT_RAILS_FILE_NAME} contains multiple sduck agent rails blocks.`);
  }

  if (beginMatches.length === 0) {
    return `${trimTrailingWhitespace(content)}\n\n${nextBlock}`;
  }

  const beginIndex = content.indexOf(AGENT_RAILS_BEGIN_MARKER);
  const endIndex = content.indexOf(AGENT_RAILS_END_MARKER);
  if (endIndex < beginIndex) {
    throw new Error(`${AGENT_RAILS_FILE_NAME} contains an invalid sduck agent rails block.`);
  }
  const replaceEnd = endIndex + AGENT_RAILS_END_MARKER.length;
  const prefix = content.slice(0, beginIndex);
  const suffix = content.slice(replaceEnd);
  return `${prefix}${nextBlock.trimEnd()}${suffix.startsWith('\n') ? suffix : `\n${suffix}`}`;
}

function trimTrailingWhitespace(content: string): string {
  return content.replace(/[\s\n]*$/u, '');
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&');
}
