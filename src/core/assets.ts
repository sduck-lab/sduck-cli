import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { getFsEntryKind } from './fs.js';

export type SupportedTaskType = 'build' | 'feature' | 'fix' | 'refactor' | 'chore';

export const SUPPORTED_TASK_TYPES: readonly SupportedTaskType[] = [
  'build',
  'feature',
  'fix',
  'refactor',
  'chore',
];

export const EVAL_ASSET_RELATIVE_PATHS = {
  plan: join('eval', 'plan.yml'),
  spec: join('eval', 'spec.yml'),
} as const;

export const SPEC_TEMPLATE_RELATIVE_PATHS: Record<SupportedTaskType, string> = {
  build: join('types', 'build.md'),
  feature: join('types', 'feature.md'),
  fix: join('types', 'fix.md'),
  refactor: join('types', 'refactor.md'),
  chore: join('types', 'chore.md'),
};

export const INIT_ASSET_RELATIVE_PATHS = [
  EVAL_ASSET_RELATIVE_PATHS.spec,
  EVAL_ASSET_RELATIVE_PATHS.plan,
  ...Object.values(SPEC_TEMPLATE_RELATIVE_PATHS),
] as const;

export async function getBundledAssetsRoot(): Promise<string> {
  const currentDirectoryPath = dirname(fileURLToPath(import.meta.url));
  const candidatePaths = [
    join(currentDirectoryPath, '..', '..', '.sduck', 'sduck-assets'),
    join(currentDirectoryPath, '..', '.sduck', 'sduck-assets'),
  ];

  for (const candidatePath of candidatePaths) {
    if ((await getFsEntryKind(candidatePath)) === 'directory') {
      return candidatePath;
    }
  }

  throw new Error('Unable to locate bundled .sduck/sduck-assets directory.');
}

export function isSupportedTaskType(value: string): value is SupportedTaskType {
  return SUPPORTED_TASK_TYPES.includes(value as SupportedTaskType);
}

export function resolveSpecTemplateRelativePath(type: SupportedTaskType): string {
  return SPEC_TEMPLATE_RELATIVE_PATHS[type];
}
