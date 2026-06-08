import type { DatabaseSync } from 'node:sqlite';

export function nowIso(): string {
  return new Date().toISOString();
}

export function slugify(input: string): string {
  const slug = input
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
  return slug === '' ? 'work' : slug;
}

export function createTaskId(description: string, date = new Date()): string {
  const yyyy = String(date.getFullYear());
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `TASK-${yyyy}${mm}${dd}-${slugify(description)}`;
}

export function nextEntityId(db: DatabaseSync, table: string, prefix: string): string {
  const row = db.prepare(`SELECT COUNT(*) AS count FROM ${table}`).get() as { count: number };
  for (let index = row.count + 1; index <= row.count + 10_000; index += 1) {
    const id = `${prefix}-${String(index).padStart(4, '0')}`;
    const existing = db.prepare(`SELECT id FROM ${table} WHERE id = ?`).get(id) as
      | { id: string }
      | undefined;
    if (existing === undefined) {
      return id;
    }
  }
  throw new Error(`Cannot allocate ${prefix} id for ${table}.`);
}
