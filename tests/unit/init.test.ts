import { describe, expect, it } from 'vitest';

import {
  planInitActions,
  summarizeInitActions,
  type FsEntryKind,
  type InitExecutionResult,
} from '../../src/core/init.js';

function createExistingEntries(entries: Record<string, FsEntryKind>): Map<string, FsEntryKind> {
  return new Map(Object.entries(entries));
}

describe('planInitActions', () => {
  it('creates all assets for an empty project in safe mode', () => {
    const actions = planInitActions('safe', createExistingEntries({}));

    expect(actions).toHaveLength(8);
    expect(actions.every((action) => action.action === 'create')).toBe(true);
  });

  it('keeps existing files in safe mode and overwrites in force mode', () => {
    const existingEntries = createExistingEntries({
      '.sduck/sduck-assets/eval/spec.yml': 'file',
      '.sduck/sduck-assets/eval/plan.yml': 'file',
      '.sduck/sduck-assets/eval/task.yml': 'file',
      '.sduck/sduck-assets/types/build.md': 'file',
    });

    const safeActions = planInitActions('safe', existingEntries);
    const forceActions = planInitActions('force', existingEntries);

    expect(safeActions.filter((action) => action.action === 'keep')).toHaveLength(4);
    expect(forceActions.filter((action) => action.action === 'overwrite')).toHaveLength(4);
  });

  it('marks directory collisions as errors', () => {
    const actions = planInitActions(
      'safe',
      createExistingEntries({
        '.sduck/sduck-assets/types/feature.md': 'directory',
      }),
    );

    const collision = actions.find((action) => action.key === 'type-feature');

    expect(collision).toMatchObject({
      action: 'error',
      collision: 'directory-file-mismatch',
    });
  });
});

describe('summarizeInitActions', () => {
  it('builds categorized summary rows and warnings', () => {
    const summary = summarizeInitActions(
      planInitActions(
        'safe',
        createExistingEntries({
          '.sduck/sduck-assets/types/build.md': 'file',
        }),
      ),
    );

    expect(summary.kept).toContain('.sduck/sduck-assets/types/build.md');
    expect(summary.rows.some((row) => row.status === 'kept')).toBe(true);
    expect(summary.warnings.some((warning) => warning.includes('--force'))).toBe(true);
  });
});

describe('InitExecutionResult', () => {
  it('includes selected agents in the typed result shape', () => {
    const result: InitExecutionResult = {
      mode: 'safe',
      agents: ['claude-code'],
      summary: {
        created: [],
        prepended: [],
        kept: [],
        overwritten: [],
        warnings: [],
        errors: [],
        rows: [],
      },
      didChange: true,
    };

    expect(result.agents).toEqual(['claude-code']);
  });
});
