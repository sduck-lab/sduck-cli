import * as fs from 'node:fs';

import { dbPath } from './paths.js';
import { rebuildDecisionCache } from './rebuild.js';
import { sourceFileCount, sourceFingerprint } from './source-store.js';
import { getCacheMetadata, openDatabase } from './store.js';

export const SOURCE_FINGERPRINT_METADATA_KEY = 'source_fingerprint';

export function ensureReadableCache(projectRoot: string): void {
  const sourceCount = sourceFileCount(projectRoot);
  const cachePath = dbPath(projectRoot);
  if (sourceCount === 0 && !fs.existsSync(cachePath)) return;
  if (!fs.existsSync(cachePath)) {
    rebuildDecisionCache(projectRoot);
    return;
  }
  const db = openDatabase(projectRoot);
  try {
    const cachedFingerprint = getCacheMetadata(db, SOURCE_FINGERPRINT_METADATA_KEY);
    if (sourceCount === 0 && cachedFingerprint === null) return;
    if (cachedFingerprint === sourceFingerprint(projectRoot)) return;
  } finally {
    db.close();
  }
  rebuildDecisionCache(projectRoot);
}
