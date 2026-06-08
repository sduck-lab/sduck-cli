import { resolveInsideProject, toRelativePath } from './paths.js';

export type PathMatchKind = 'exact' | 'prefix' | 'glob';

export interface NormalizedPathTarget {
  kind: 'path' | 'glob';
  original: string;
  path: string;
}

export function normalizeInputPath(projectRoot: string, value: string, label: string): string {
  const trimmed = value.trim();
  if (trimmed === '') {
    throw new Error(`${label} contains an empty path.`);
  }
  if (trimmed.includes('*')) {
    throw new Error(`${label} must be a concrete file path, not a glob: ${value}`);
  }
  const absolute = resolveInsideProject(projectRoot, trimmed);
  const relative = toRelativePath(projectRoot, absolute);
  if (targetIsBroad(relative)) {
    throw new Error(`${label} resolved to an overly broad path: ${value}`);
  }
  return relative;
}

export function normalizePathTargets(
  projectRoot: string,
  targets: readonly string[],
  label: string,
): NormalizedPathTarget[] {
  const output: NormalizedPathTarget[] = [];
  const seen = new Set<string>();
  for (const target of targets) {
    const normalized = normalizePathTarget(projectRoot, target, label);
    if (normalized === null) {
      continue;
    }
    const key = `${normalized.kind}\0${normalized.path}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    output.push(normalized);
  }
  return output;
}

export function matchPathTarget(file: string, target: NormalizedPathTarget): PathMatchKind | null {
  const normalizedFile = normalizeSlashes(file);
  if (target.kind === 'glob') {
    return pathIsInside(normalizedFile, target.path) ? 'glob' : null;
  }
  if (normalizedFile === target.path) {
    return 'exact';
  }
  if (pathIsInside(normalizedFile, target.path) || pathIsInside(target.path, normalizedFile)) {
    return 'prefix';
  }
  return null;
}

export function describePathMatch(matchKind: PathMatchKind): string {
  if (matchKind === 'exact') return 'exact-matched';
  if (matchKind === 'glob') return 'glob-matched';
  return 'prefix-matched';
}

function normalizePathTarget(
  projectRoot: string,
  value: string,
  label: string,
): NormalizedPathTarget | null {
  const trimmed = value.trim();
  if (trimmed === '') {
    throw new Error(`${label} contains an empty path.`);
  }
  if (isGlobAll(trimmed)) {
    return null;
  }
  if (trimmed.endsWith('/**')) {
    const prefix = trimmed.slice(0, -3);
    const path = normalizeConcreteTarget(projectRoot, prefix, label);
    if (targetIsBroad(path)) {
      return null;
    }
    return { kind: 'glob', original: trimmed, path };
  }
  if (trimmed.includes('*')) {
    throw new Error(
      `${label} contains an unsupported glob target: ${value}. Use exact paths, directory prefixes, or src/foo/**.`,
    );
  }
  const path = normalizeConcreteTarget(projectRoot, trimmed, label);
  if (targetIsBroad(path)) {
    return null;
  }
  return { kind: 'path', original: trimmed, path };
}

function normalizeConcreteTarget(projectRoot: string, value: string, label: string): string {
  const absolute = resolveInsideProject(projectRoot, value);
  const relative = normalizeSlashes(toRelativePath(projectRoot, absolute));
  if (relative === '') {
    throw new Error(`${label} resolved to the project root: ${value}`);
  }
  return trimTrailingSlash(relative);
}

function normalizeSlashes(value: string): string {
  return value.replace(/\\+/gu, '/');
}

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$|^\.\/$/gu, '');
}

function pathIsInside(file: string, directory: string): boolean {
  const normalizedDirectory = trimTrailingSlash(directory);
  if (targetIsBroad(normalizedDirectory)) {
    return false;
  }
  return file.startsWith(`${normalizedDirectory}/`);
}

function targetIsBroad(value: string): boolean {
  const normalized = trimTrailingSlash(normalizeSlashes(value));
  if (normalized === '' || normalized === '.' || normalized === '*' || normalized === '**') {
    return true;
  }
  const segments = normalized.split('/').filter(Boolean);
  return segments.length <= 1;
}

function isGlobAll(value: string): boolean {
  const normalized = trimTrailingSlash(normalizeSlashes(value));
  return normalized === '*' || normalized === '**' || normalized === './**';
}
