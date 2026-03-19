import { describe, expect, it } from 'vitest';

import { createAgentCheckboxConfig } from '../../src/commands/init.js';

describe('createAgentCheckboxConfig', () => {
  it('includes explicit interactive instructions', () => {
    const config = createAgentCheckboxConfig();

    expect(config.message).toBe('Select AI agents to generate repository rule files for');
    expect(config.instructions).toContain('space');
    expect(config.instructions).toContain('enter');
    expect(config.required).toBe(true);
  });

  it('rejects empty selections with a clear message', () => {
    const config = createAgentCheckboxConfig();

    expect(config.validate([])).toBe(
      'Select at least one agent. Use space to toggle and enter to submit.',
    );
    expect(config.validate([{ value: 'claude-code' }])).toBe(true);
  });
});
