import { ensureReadableCache } from './cache.js';
import { V2ExpectedError } from './errors.js';
import { openDatabase } from './store.js';

import type { DatabaseSync as DatabaseSyncType } from 'node:sqlite';

export interface GraphShowView {
  root: string;
  nodes: { id: string; kind: string; label: string }[];
  edges: { from: string; to: string; kind: string }[];
  truncated: boolean;
}

export interface GraphExpandResult {
  nodes: { id: string; kind: string; label: string }[];
  edges: { from: string; to: string; kind: string }[];
  truncated: boolean;
}

export const MAX_DEPTH = 4;
const MAX_NODES = 100;
const MAX_EDGES = 200;

export function isGraphDepthValid(depth: number): boolean {
  return Number.isInteger(depth) && depth >= 0 && depth <= MAX_DEPTH;
}

export function expandGraph(
  db: DatabaseSyncType,
  seeds: string[],
  depth: number,
): GraphExpandResult {
  const seen = new Set(seeds);
  const levelById = new Map<string, number>(seeds.map((id) => [id, 0]));
  let frontier = [...seeds];
  const edges: { from: string; to: string; kind: string }[] = [];
  let truncated = false;
  for (let level = 0; level < depth && frontier.length > 0; level += 1) {
    const next: string[] = [];
    for (const id of frontier) {
      const rows = db
        .prepare(
          `SELECT from_id, to_id, kind FROM graph_edges WHERE from_id = ? OR to_id = ? ORDER BY kind, from_id, to_id`,
        )
        .all(id, id) as { from_id: string; to_id: string; kind: string }[];
      for (const row of rows) {
        if (edges.length >= MAX_EDGES) {
          truncated = true;
          continue;
        }
        for (const candidate of [row.from_id, row.to_id]) {
          if (!seen.has(candidate)) {
            if (seen.size >= MAX_NODES) {
              truncated = true;
              continue;
            }
            seen.add(candidate);
            levelById.set(candidate, level + 1);
            next.push(candidate);
          }
        }
        if (seen.has(row.from_id) && seen.has(row.to_id))
          edges.push({ from: row.from_id, to: row.to_id, kind: row.kind });
      }
    }
    frontier = next.sort((a, b) => a.localeCompare(b));
  }
  // Sort by hop-distance from the nearest seed first, not alphabetically -- this order IS the
  // graph-proximity ranking signal that recall() feeds into rankByRrf, and it's also a more
  // useful default read order for `graph show`/`related`.
  const nodes = [...seen]
    .sort((a, b) => (levelById.get(a) ?? 0) - (levelById.get(b) ?? 0) || a.localeCompare(b))
    .map(
      (id) =>
        db.prepare(`SELECT id, kind, label FROM graph_nodes WHERE id = ?`).get(id) as
          { id: string; kind: string; label: string } | undefined,
    )
    .filter((node): node is { id: string; kind: string; label: string } => node !== undefined);
  const admitted = new Set(nodes.map((node) => node.id));
  return {
    nodes,
    edges: [
      ...new Map(edges.map((edge) => [`${edge.from}|${edge.kind}|${edge.to}`, edge])).values(),
    ]
      .filter((edge) => admitted.has(edge.from) && admitted.has(edge.to))
      .slice(0, MAX_EDGES)
      .sort((a, b) => `${a.from}|${a.kind}|${a.to}`.localeCompare(`${b.from}|${b.kind}|${b.to}`)),
    truncated,
  };
}

export function showGraph(projectRoot: string, root: string, depth = 1): GraphShowView {
  if (!/^TASK-|^DEC-/.test(root)) throw new V2ExpectedError('GRAPH_ROOT_NOT_FOUND', { root });
  if (!isGraphDepthValid(depth))
    throw new V2ExpectedError('GRAPH_DEPTH_INVALID', { depth: String(depth) });
  ensureReadableCache(projectRoot);
  const db = openDatabase(projectRoot);
  try {
    const rootNode = db
      .prepare(`SELECT id, kind, label FROM graph_nodes WHERE id = ?`)
      .get(root) as { id: string; kind: string; label: string } | undefined;
    if (rootNode === undefined) throw new V2ExpectedError('GRAPH_ROOT_NOT_FOUND', { root });
    const { nodes, edges, truncated } = expandGraph(db, [root], depth);
    return { root, nodes, edges, truncated };
  } finally {
    db.close();
  }
}
