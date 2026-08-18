# sduck 0.8.0 — Cross-worktree ID safety, category taxonomy, and recall/graph improvements

Version 0.8.0 hardens `.decision` for multi-worktree use, adds a small project-wide category taxonomy for LLM-wiki-style browsing, and widens `recall`'s coverage and ranking signal.

## Cross-worktree ID safety

- Git worktrees each have their own working directory, so uncommitted `.decision/` files in one worktree are invisible to another. Two worktrees branched from the same base could previously compute the same "next `DEC-`/`IMPL-`/`EVAL-` number" and collide.
- `nextSourceEntityId` now reserves the next number from a counter file stored under the repository's Git common dir — the one location every worktree of a repo actually shares — instead of scanning only the local `.decision/` directory. The higher of the local scan and the shared counter, plus one, is always used.
- Outside a Git repository (for example, test fixtures under a temp directory), numbering falls back to the prior local-only behavior unchanged.

## Category taxonomy

- `sduck categories suggest|set|list|browse|tag` manage a small, fixed, project-wide category list stored in `.decision/policy.json`. `submit` and `tag` reject any category outside the configured list.
- `browse` applies no ranking, filtering, or summarization — every id and title in a category (or the uncategorized bucket) is returned as-is, so an agent can read the full table of contents and judge relevance directly, in the spirit of an LLM-readable wiki index. A default 500-item limit is overridable per call via `--limit` and is reported honestly with a `truncated` flag rather than a silent cut.
- `tag --stdin` retroactively assigns categories to existing decisions, including already-confirmed ones, in an all-or-nothing bulk update.

## Recall and graph improvements

- `recall` now uses FTS5 with trigram tokenization together with multi-hop graph traversal, fusing keyword and graph-derived matches; queries under three characters keep the previous `LIKE`-based path. English stopwords are filtered from search terms.
- Graph expansion depth is exposed as `--depth` on both `recall` and `graph show`, sharing the same maximum-depth cap.
- `recall`'s decision lookups now include `DRAFT` decisions in addition to `CONFIRMED` ones, since a decision that is real but not yet confirmed was previously invisible to search purely because of its status.
- Every decision's `sourceRefs` (not only `CARRIED` decisions) now becomes a graph edge — `CARRIED_FROM` for carried decisions, and a new `CITES` kind for every other reference — so `recall`'s graph-distance signal reaches most real citations instead of a small minority of them.
- `graph show --mermaid` prints a Mermaid flowchart of the local graph projection for human reading, alongside the existing text and `--json` output.

## Safety and compatibility

- All of the above are read/write operations on the existing local SQLite cache and canonical Markdown source, using the same staged-validate-atomic-swap-with-rollback path as prior mutations. No new daemon, background process, or network call is introduced.
- Existing `.decision/policy.json` files without a `categories` field are unaffected; the category commands simply have nothing configured until `sduck categories set` is run.
- English and Korean CLI surfaces cover all new commands and options.

## Intentionally not included

This release does not add automatic category inference, cross-project ID coordination, or any ranking model beyond FTS5/BM25 and bounded graph-distance fusion. It does not change `.decision/policy.json` defaults for existing workspaces beyond the optional `categories` field.

See [README.md](../README.md) for full command reference and quick start updates.
