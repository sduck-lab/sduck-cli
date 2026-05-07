import { execFileSync } from 'node:child_process';

export function listChangedFiles(projectRoot: string, base?: string): string[] {
  const files = new Set<string>();
  runGit(projectRoot, ['rev-parse', '--is-inside-work-tree']);
  for (const file of runGit(projectRoot, [
    'diff',
    '--name-only',
    ...(base === undefined ? [] : [base]),
  ])) {
    if (file !== '') files.add(file);
  }
  if (base === undefined) {
    for (const file of runGit(projectRoot, ['diff', '--name-only', '--cached'])) {
      if (file !== '') files.add(file);
    }
  }
  for (const line of runGit(projectRoot, ['status', '--short'])) {
    if (line.startsWith('?? ')) files.add(line.slice(3).trim());
  }
  return [...files].sort();
}

function runGit(projectRoot: string, args: string[]): string[] {
  try {
    const output = execFileSync('git', args, { cwd: projectRoot, encoding: 'utf8' });
    return output
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
  } catch {
    throw new Error(`git ${args.join(' ')} failed.`);
  }
}
