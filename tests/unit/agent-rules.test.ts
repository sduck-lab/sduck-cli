import { describe, expect, it } from 'vitest';

import {
  hasManagedBlock,
  listAgentRuleTargets,
  parseAgentsOption,
  planAgentRuleActions,
  prependManagedBlock,
  renderAgentRuleContent,
  replaceManagedBlock,
} from '../../src/core/agent-rules.js';

describe('parseAgentsOption', () => {
  it('parses and deduplicates selected agents', () => {
    expect(parseAgentsOption('claude-code,codex,claude-code')).toEqual(['claude-code', 'codex']);
  });

  it('throws on unsupported agents', () => {
    expect(() => parseAgentsOption('unknown-agent')).toThrow('Unsupported agent');
  });
});

describe('listAgentRuleTargets', () => {
  it('maps codex and opencode to a shared AGENT file', () => {
    expect(listAgentRuleTargets(['codex', 'opencode'])).toEqual([
      { agentId: 'codex', outputPath: 'AGENT.md', kind: 'root-file' },
    ]);
  });

  it('returns multiple target files for mixed agents', () => {
    expect(
      listAgentRuleTargets(['claude-code', 'cursor']).map((target) => target.outputPath),
    ).toEqual(['CLAUDE.md', '.cursor/rules/sduck-core.mdc']);
  });
});

describe('renderAgentRuleContent', () => {
  it('renders shared root rules with current CLI commands', async () => {
    const content = await renderAgentRuleContent(
      { agentId: 'codex', outputPath: 'AGENT.md', kind: 'root-file' },
      ['codex', 'opencode'],
    );

    expect(content).toContain('Use `AGENT.md` as project-level instruction context.');
    expect(content).toContain('다음 두 가지 승인은 에이전트가 직접 처리하지 않는다.');
    expect(content).toContain('.sduck/sduck-workspace/');
    expect(content).toContain('.sduck/sduck-assets/eval/spec.yml');
    expect(content).toContain('승인 전에는 어떤 코드도 작성하지 않는다.');
    expect(content).toContain('sduck start <type> <slug>');
    expect(content).toContain('sduck spec approve [target]');
    expect(content).toContain('sduck plan approve [target]');
    expect(content).toContain('Write `plan.md` in detailed implementation units');
  });
});

describe('managed rule block helpers', () => {
  it('prepends a managed block to existing content', () => {
    const result = prependManagedBlock(
      '# Existing file\n',
      '<!-- sduck:begin -->\nrule\n<!-- sduck:end -->',
    );

    expect(result.startsWith('<!-- sduck:begin -->')).toBe(true);
    expect(result).toContain('# Existing file');
  });

  it('replaces an existing managed block without touching user content', () => {
    const existing = '<!-- sduck:begin -->\nold\n<!-- sduck:end -->\n\n# User section\n';
    const replaced = replaceManagedBlock(existing, '<!-- sduck:begin -->\nnew\n<!-- sduck:end -->');

    expect(replaced).toContain('new');
    expect(replaced).toContain('# User section');
    expect(replaced).not.toContain('old');
  });

  it('detects existing managed blocks', () => {
    expect(hasManagedBlock('<!-- sduck:begin -->\nrules\n<!-- sduck:end -->')).toBe(true);
  });
});

describe('planAgentRuleActions', () => {
  it('uses prepend in safe mode for existing root files without managed block', () => {
    const targets = listAgentRuleTargets(['claude-code']);
    const actions = planAgentRuleActions(
      'safe',
      targets,
      new Map([['CLAUDE.md', 'file']]),
      new Map([['CLAUDE.md', '# Existing\n']]),
    );

    expect(actions[0]?.mergeMode).toBe('prepend');
  });

  it('uses replace-block in force mode for existing root files with managed block', () => {
    const targets = listAgentRuleTargets(['claude-code']);
    const actions = planAgentRuleActions(
      'force',
      targets,
      new Map([['CLAUDE.md', 'file']]),
      new Map([['CLAUDE.md', '<!-- sduck:begin -->\nold\n<!-- sduck:end -->\n']]),
    );

    expect(actions[0]?.mergeMode).toBe('replace-block');
  });

  it('keeps managed files in safe mode and overwrites them in force mode', () => {
    const targets = listAgentRuleTargets(['cursor']);
    const safeActions = planAgentRuleActions(
      'safe',
      targets,
      new Map([['.cursor/rules/sduck-core.mdc', 'file']]),
      new Map(),
    );
    const forceActions = planAgentRuleActions(
      'force',
      targets,
      new Map([['.cursor/rules/sduck-core.mdc', 'file']]),
      new Map(),
    );

    expect(safeActions[0]?.mergeMode).toBe('keep');
    expect(forceActions[0]?.mergeMode).toBe('overwrite');
  });
});
