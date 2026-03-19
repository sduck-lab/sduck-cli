import { constants } from 'node:fs';
import { access, copyFile, mkdir, stat } from 'node:fs/promises';

export type FsEntryKind = 'missing' | 'file' | 'directory';

export async function getFsEntryKind(targetPath: string): Promise<FsEntryKind> {
  try {
    const stats = await stat(targetPath);

    if (stats.isDirectory()) {
      return 'directory';
    }

    if (stats.isFile()) {
      return 'file';
    }

    return 'file';
  } catch {
    return 'missing';
  }
}

export async function ensureDirectory(targetPath: string): Promise<void> {
  await mkdir(targetPath, { recursive: true });
}

export async function ensureReadableFile(targetPath: string): Promise<void> {
  await access(targetPath, constants.R_OK);
}

export async function copyFileIntoPlace(sourcePath: string, targetPath: string): Promise<void> {
  await copyFile(sourcePath, targetPath);
}
