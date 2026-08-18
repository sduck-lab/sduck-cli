import { ensureReadableCache } from './cache.js';
import { DecisionWorkspace } from './decision-workspace.js';
import { V2ExpectedError } from './errors.js';
import { nowIso } from './ids.js';
import { readCategoriesStatus } from './policy.js';
import { openDatabase } from './store.js';

export interface CategoryCount {
  category: string;
  count: number;
}

export interface CategoryListView {
  configured: string[];
  counts: CategoryCount[];
  uncategorized: number;
}

export interface CategoryBrowseItem {
  id: string;
  title: string;
  status: string;
}

export interface CategoryBrowseView {
  category: string | null;
  items: CategoryBrowseItem[];
  truncated: boolean;
}

export const DEFAULT_BROWSE_LIMIT = 500;

// Counts use the same visibility rule as recall() (status IN CONFIRMED/DRAFT, task not
// ABANDONED) so the numbers shown here match what an agent would actually be able to find --
// a category showing "12" that recall can only surface 3 of would be actively misleading.
export function listCategoryCounts(projectRoot: string): CategoryListView {
  const configured = readCategoriesStatus(projectRoot).categories;
  ensureReadableCache(projectRoot);
  const db = openDatabase(projectRoot);
  try {
    const rows = db
      .prepare(
        `SELECT d.category AS category, COUNT(*) AS count
         FROM decisions d
         JOIN tasks t ON t.id = d.task_id
         WHERE d.status IN ('CONFIRMED', 'DRAFT') AND t.status != 'ABANDONED'
         GROUP BY d.category`,
      )
      .all() as { category: string | null; count: number }[];
    const countByCategory = new Map<string, number>();
    let uncategorized = 0;
    for (const row of rows) {
      if (row.category === null) uncategorized = row.count;
      else countByCategory.set(row.category, row.count);
    }
    return {
      configured,
      counts: configured.map((category) => ({
        category,
        count: countByCategory.get(category) ?? 0,
      })),
      uncategorized,
    };
  } finally {
    db.close();
  }
}

// No ranking, no FTS, no graph -- the whole point is the Karpathy LLM-Wiki pattern: hand the
// agent every title in the bucket and let it read and judge relevance directly, instead of an
// algorithm pre-filtering before the agent ever sees what exists. `category: null` browses the
// uncategorized bucket. A category name is validated against the configured taxonomy first so a
// typo doesn't silently return an always-empty list.
export function browseCategory(
  projectRoot: string,
  category: string | null,
  limit: number = DEFAULT_BROWSE_LIMIT,
): CategoryBrowseView {
  if (!Number.isInteger(limit) || limit < 1) {
    throw new V2ExpectedError('BROWSE_LIMIT_INVALID', { limit: String(limit) });
  }
  if (category !== null) {
    const configured = readCategoriesStatus(projectRoot).categories;
    if (!configured.includes(category)) {
      throw new V2ExpectedError('CATEGORY_NOT_FOUND', { category });
    }
  }
  ensureReadableCache(projectRoot);
  const db = openDatabase(projectRoot);
  try {
    const whereCategory = category === null ? 'd.category IS NULL' : 'd.category = ?';
    const params = category === null ? [] : [category];
    const rows = db
      .prepare(
        `SELECT d.id, d.title, d.status FROM decisions d
         JOIN tasks t ON t.id = d.task_id
         WHERE d.status IN ('CONFIRMED', 'DRAFT') AND t.status != 'ABANDONED' AND ${whereCategory}
         ORDER BY d.created_at ASC
         LIMIT ${String(limit + 1)}`,
      )
      .all(...params) as unknown as CategoryBrowseItem[];
    return {
      category,
      items: rows.slice(0, limit),
      truncated: rows.length > limit,
    };
  } finally {
    db.close();
  }
}

export interface CategoryAssignment {
  id: string;
  category: string;
}

export interface TagCategoriesResult {
  updated: string[];
}

// Retroactively sets `category` on existing decisions, including already-CONFIRMED ones. Unlike
// a corrected IMPL trace (a factual claim about what happened, left as-is and superseded by a new
// record), a category is organizational metadata for retrieval -- updating it in place isn't a
// history rewrite, and git history is the audit trail. Reuses DecisionWorkspace.mutate so the
// canonical markdown gets the same staged-validate-atomic-swap-with-rollback treatment as every
// other v2 mutation; only `category`/`updatedAt` change, every other field is left untouched.
// All-or-nothing: an unknown id or a category outside the configured taxonomy fails the whole
// call before anything is written.
export function tagDecisionCategories(
  projectRoot: string,
  assignments: CategoryAssignment[],
): TagCategoriesResult {
  if (assignments.length === 0) return { updated: [] };
  const allowedCategories = readCategoriesStatus(projectRoot).categories;
  for (const assignment of assignments) {
    if (!allowedCategories.includes(assignment.category)) {
      throw new V2ExpectedError('DRAFT_CATEGORY_INVALID', {
        category: assignment.category,
        allowed: allowedCategories.join(', '),
      });
    }
  }
  return new DecisionWorkspace(projectRoot).mutate(({ bundle }) => {
    const categoryById = new Map(
      assignments.map((assignment) => [assignment.id, assignment.category]),
    );
    const now = nowIso();
    const updated: string[] = [];
    bundle.decisions = bundle.decisions.map((decision) => {
      const category = categoryById.get(decision.id);
      if (category === undefined) return decision;
      updated.push(decision.id);
      return { ...decision, category, updatedAt: now };
    });
    const missing = assignments.filter((assignment) => !updated.includes(assignment.id));
    if (missing.length > 0) {
      throw new V2ExpectedError('DECISION_NOT_FOUND', {
        id: missing.map((assignment) => assignment.id).join(', '),
      });
    }
    return { updated };
  });
}
