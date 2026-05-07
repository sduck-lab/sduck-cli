import * as fs from 'node:fs';
import { DatabaseSync } from 'node:sqlite';

import { dbPath, decisionRoot } from './paths.js';

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

export function openDatabase(projectRoot: string): DatabaseSync {
  fs.mkdirSync(decisionRoot(projectRoot), { recursive: true });
  const db = new DatabaseSync(dbPath(projectRoot));
  ensureSchema(db);
  return db;
}

export function ensureSchema(db: DatabaseSync): void {
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
  `);
}
