import { describe, expect, it } from 'vitest';

import { fail, formatError, ok, renderTable, runCommand } from '../../src/commands/runner.js';

describe('command runner Module', () => {
  it('routes successful command output', async () => {
    await expect(runCommand(() => 'done', 'fallback')).resolves.toEqual(ok('done'));
  });

  it('routes thrown Error and unknown throw values', async () => {
    await expect(
      runCommand(() => {
        throw new Error('specific');
      }, 'fallback'),
    ).resolves.toEqual(fail('specific'));

    expect(formatError('bad', 'fallback')).toBe('fallback');
  });

  it('renders stable tables', () => {
    expect(renderTable(['Result', 'Task'], [['ok', 'task-1']])).toBe(
      [
        '+--------+--------+',
        '| Result | Task   |',
        '+--------+--------+',
        '| ok     | task-1 |',
        '+--------+--------+',
      ].join('\n'),
    );
  });
});
