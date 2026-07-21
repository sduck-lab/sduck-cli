import * as fs from 'node:fs';
import { createRequire } from 'node:module';
import * as path from 'node:path';

import { dbPath, dbSidecarPaths, decisionRoot } from './paths.js';

import type { DatabaseSync as DatabaseSyncType } from 'node:sqlite';

const require = createRequire(import.meta.url);
const { DatabaseSync } = require('node:sqlite') as {
  DatabaseSync: new (location: string) => DatabaseSyncType;
};

export function encodeJson(value: unknown): string {
  return JSON.stringify(value ?? null);
}

export function decodeJson<T>(value: string | null | undefined, fallback: T): T {
  if (value === null || value === undefined || value === '') {
    return fallback;
  }
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function openDatabase(projectRoot: string): DatabaseSyncType {
  return openDatabaseFile(dbPath(projectRoot));
}

export function openDatabaseFile(location: string): DatabaseSyncType {
  fs.mkdirSync(path.dirname(location), { recursive: true });
  const db = new DatabaseSync(location);
  db.exec('PRAGMA busy_timeout = 5000; PRAGMA journal_mode = DELETE;');
  ensureSchema(db);
  return db;
}

export function resetDatabaseCache(projectRoot: string): DatabaseSyncType {
  fs.mkdirSync(decisionRoot(projectRoot), { recursive: true });
  for (const filePath of dbSidecarPaths(projectRoot)) {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }
  return openDatabase(projectRoot);
}

export function cacheHasRows(projectRoot: string): boolean {
  if (!fs.existsSync(dbPath(projectRoot))) return false;
  const db = openDatabase(projectRoot);
  try {
    for (const table of [
      'tasks',
      'decisions',
      'questions',
      'evidence',
      'context_items',
      'brief_snapshots',
      'implementation_traces',
      'events',
    ]) {
      const row = db.prepare(`SELECT COUNT(*) AS count FROM ${table}`).get() as { count: number };
      if (row.count > 0) return true;
    }
    return false;
  } finally {
    db.close();
  }
}

export function getCacheMetadata(db: DatabaseSyncType, key: string): string | null {
  const row = db.prepare(`SELECT value FROM cache_metadata WHERE key = ?`).get(key) as
    { value: string } | undefined;
  return row?.value ?? null;
}

export function setCacheMetadata(db: DatabaseSyncType, key: string, value: string): void {
  db.prepare(`INSERT OR REPLACE INTO cache_metadata (key, value) VALUES (?, ?)`).run(key, value);
}

export function ensureSchema(db: DatabaseSyncType): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      status TEXT NOT NULL,
      expected_scope_json TEXT NOT NULL,
      avoid_scope_json TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS decisions (
      id TEXT PRIMARY KEY,
      task_id TEXT NOT NULL,
      title TEXT NOT NULL,
      kind TEXT NOT NULL,
      status TEXT NOT NULL,
      confidence REAL NOT NULL,
      summary TEXT NOT NULL,
      rationale_json TEXT NOT NULL,
      applies_to_json TEXT NOT NULL,
      avoids_json TEXT NOT NULL,
      source_refs_json TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS questions (
      id TEXT PRIMARY KEY,
      task_id TEXT NOT NULL,
      decision_id TEXT,
      text TEXT NOT NULL,
      recommended_answer TEXT NOT NULL,
      rationale_json TEXT NOT NULL,
      options_json TEXT NOT NULL,
      answered INTEGER NOT NULL,
      answer TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS evidence (
      id TEXT PRIMARY KEY,
      task_id TEXT NOT NULL,
      decision_id TEXT,
      source_type TEXT NOT NULL,
      source_ref TEXT NOT NULL,
      summary TEXT NOT NULL,
      confidence REAL NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS context_items (
      id TEXT PRIMARY KEY,
      task_id TEXT NOT NULL,
      source_type TEXT NOT NULL,
      source_ref TEXT NOT NULL,
      summary TEXT NOT NULL,
      metadata_json TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS brief_snapshots (
      id TEXT PRIMARY KEY,
      task_id TEXT NOT NULL,
      snapshot_json TEXT NOT NULL,
      rendered_markdown TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS implementation_traces (
      id TEXT PRIMARY KEY,
      task_id TEXT NOT NULL,
      decision_ids_json TEXT NOT NULL,
      files_changed_json TEXT NOT NULL,
      summary TEXT NOT NULL,
      decision_to_code_map_json TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      task_id TEXT,
      type TEXT NOT NULL,
      payload_json TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS cache_metadata (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);
  ensureColumn(db, 'tasks', 'implementation_plan_json', 'TEXT');
  ensureColumn(db, 'tasks', 'verification_plan_json', 'TEXT');
  ensureColumn(db, 'tasks', 'guided', 'INTEGER');
  ensureColumn(db, 'tasks', 'retrospective', 'INTEGER');
  db.exec(`
    CREATE TABLE IF NOT EXISTS evaluations (
      id TEXT PRIMARY KEY,
      task_id TEXT NOT NULL,
      trace_id TEXT NOT NULL,
      checks_json TEXT NOT NULL,
      limitations_json TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS graph_nodes (
      id TEXT PRIMARY KEY,
      kind TEXT NOT NULL,
      label TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS graph_edges (
      id TEXT PRIMARY KEY,
      from_id TEXT NOT NULL,
      to_id TEXT NOT NULL,
      kind TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS graph_edges_from_idx ON graph_edges(from_id, kind, to_id);
    CREATE INDEX IF NOT EXISTS graph_edges_to_idx ON graph_edges(to_id, kind, from_id);
  `);
}

function ensureColumn(db: DatabaseSyncType, table: string, column: string, spec: string): void {
  const rows = db.prepare(`PRAGMA table_info(${table})`).all() as { name: string }[];
  if (rows.some((row) => row.name === column)) return;
  db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${spec}`);
}
