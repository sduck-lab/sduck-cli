import { execFileSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import { AGENT_RULE_ASSET_RELATIVE_PATHS } from '../../src/core/assets.js';
import { ASSET_TEMPLATE_MAP } from '../../src/core/init.js';

const root = process.cwd();

describe('Auto Wiki agent assets', () => {
  it('registers and packages the Wiki skills with explicit Codex rule links', async () => {
    const buildSkillPath = join(
      root,
      '.sduck/sduck-assets/agent-rules/skills/sd-build-wiki/SKILL.md',
    );
    const syncSkillPath = join(
      root,
      '.sduck/sduck-assets/agent-rules/skills/sd-sync-wiki/SKILL.md',
    );
    const [buildSkill, syncSkill, codexRules, coreRules] = await Promise.all([
      readFile(buildSkillPath, 'utf8'),
      readFile(syncSkillPath, 'utf8'),
      readFile(join(root, '.sduck/sduck-assets/agent-rules/codex.md'), 'utf8'),
      readFile(join(root, '.sduck/sduck-assets/agent-rules/core.md'), 'utf8'),
    ]);

    expect(buildSkill).toContain('name: sd-build-wiki');
    expect(buildSkill).toContain('Ask one question at a time');
    expect(buildSkill).toContain('recommended answer');
    expect(buildSkill).toContain('sduck wiki build --stdin');
    expect(syncSkill).toContain('name: sd-sync-wiki');
    expect(syncSkill).toContain('sduck wiki status');
    expect(syncSkill).toContain('sduck wiki sync --stdin');
    expect(syncSkill).toContain('sduck wiki lint');
    expect(syncSkill).toContain('leave the Wiki stale');

    for (const skillName of ['sd-build-wiki', 'sd-sync-wiki']) {
      const relativePath = join('agent-rules', 'skills', skillName, 'SKILL.md');
      expect(AGENT_RULE_ASSET_RELATIVE_PATHS).toContain(relativePath);
      expect(Object.values(ASSET_TEMPLATE_MAP).map((item) => item.relativePath)).toContain(
        join('.sduck', 'sduck-assets', relativePath),
      );
      expect(codexRules).toContain(`.sduck/sduck-assets/agent-rules/skills/${skillName}/SKILL.md`);
      expect(coreRules).toContain(skillName);
    }

    const packed = JSON.parse(
      execFileSync('npm', ['pack', '--dry-run', '--json', '--ignore-scripts'], {
        cwd: root,
        encoding: 'utf8',
      }),
    ) as { files: { path: string }[] }[];
    const files = packed[0]?.files.map((file) => file.path) ?? [];
    expect(files).toEqual(
      expect.arrayContaining([
        '.sduck/sduck-assets/agent-rules/skills/sd-build-wiki/SKILL.md',
        '.sduck/sduck-assets/agent-rules/skills/sd-sync-wiki/SKILL.md',
      ]),
    );
  });
});
