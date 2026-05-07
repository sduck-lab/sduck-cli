import { nextEntityId, nowIso } from './ids.js';
import { decodeJson, encodeJson } from './store.js';

import type { EventRecord, EventType } from '../../types/index.js';
import type { DatabaseSync } from 'node:sqlite';

interface EventRow {
  id: string;
  task_id: string | null;
  type: EventType;
  payload_json: string;
  created_at: string;
}

export function appendEvent(
  db: DatabaseSync,
  input: { taskId: string | null; type: EventType; payload?: Record<string, unknown> },
): EventRecord {
  const event: EventRecord = {
    id: nextEntityId(db, 'events', 'EVT'),
    taskId: input.taskId,
    type: input.type,
    payload: input.payload ?? {},
    createdAt: nowIso(),
  };
  db.prepare(
    `INSERT INTO events (id, task_id, type, payload_json, created_at) VALUES (?, ?, ?, ?, ?)`,
  ).run(event.id, event.taskId, event.type, encodeJson(event.payload), event.createdAt);
  return event;
}

export function listEvents(db: DatabaseSync, taskId: string): EventRecord[] {
  const rows = db
    .prepare(`SELECT * FROM events WHERE task_id = ? ORDER BY created_at ASC`)
    .all(taskId) as unknown as EventRow[];
  return rows.map((row) => ({
    id: row.id,
    taskId: row.task_id,
    type: row.type,
    payload: decodeJson<Record<string, unknown>>(row.payload_json, {}),
    createdAt: row.created_at,
  }));
}
