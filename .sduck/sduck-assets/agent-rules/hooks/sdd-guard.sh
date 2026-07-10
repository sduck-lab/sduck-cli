#!/usr/bin/env bash
# Advisory Claude Code guard. CLI/CI lifecycle validation is authoritative.

set -euo pipefail

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')
CWD=$(echo "$INPUT" | jq -r '.cwd // empty')

# Bash and tools without a concrete file path cannot be enforced reliably.
[[ -z "$FILE_PATH" || -z "$CWD" ]] && exit 0

PROJECT_ROOT="$CWD"
if [[ -f "$CWD/.git" ]]; then
  GITDIR_LINE=$(grep '^gitdir:' "$CWD/.git" 2>/dev/null | head -1 || true)
  GITDIR=${GITDIR_LINE#gitdir: }
  if [[ -n "$GITDIR" ]]; then
    [[ "$GITDIR" != /* ]] && GITDIR="$CWD/$GITDIR"
    PROJECT_ROOT=$(echo "$GITDIR" | sed 's|/.git/worktrees/.*||')
  fi
fi

STATE_PATH="$PROJECT_ROOT/.sduck/sduck-state.yml"
[[ -f "$STATE_PATH" ]] || exit 0
CURRENT_WORK_ID=$(sed -n 's/^current_work_id:[[:space:]]*//p' "$STATE_PATH" | head -1)
CURRENT_WORK_ID=$(echo "$CURRENT_WORK_ID" | sed 's/^['"'"'"]//; s/['"'"'"]$//')
case "$CURRENT_WORK_ID" in
  ''|null|'~') exit 0 ;;
esac

TASK_DIR="$PROJECT_ROOT/.sduck/sduck-workspace/$CURRENT_WORK_ID"
META_PATH="$TASK_DIR/meta.yml"
[[ -f "$META_PATH" ]] || exit 0
STATUS=$(sed -n 's/^status:[[:space:]]*//p' "$META_PATH" | head -1)

REL_PATH=${FILE_PATH#"$PROJECT_ROOT"/}
case "$REL_PATH" in
  .sduck/sduck-assets/*|.sduck/sduck-archive/*|*/meta.yml|CLAUDE.md|AGENTS.md|GEMINI.md|.cursor/*|.agents/*|.claude/*|.serena/*)
    exit 0
    ;;
esac

IS_SPEC=false
IS_PLAN=false
IS_REVIEW=false
[[ "$FILE_PATH" == "$TASK_DIR/spec.md" ]] && IS_SPEC=true
[[ "$FILE_PATH" == "$TASK_DIR/plan.md" ]] && IS_PLAN=true
[[ "$FILE_PATH" == "$TASK_DIR/review.md" ]] && IS_REVIEW=true

case "$STATUS" in
  PENDING_SPEC_APPROVAL)
    $IS_SPEC && exit 0
    echo "[sduck advisory] spec approval is required before implementation." >&2
    exit 2
    ;;
  SPEC_APPROVED|PENDING_PLAN_APPROVAL)
    $IS_PLAN && exit 0
    echo "[sduck advisory] plan approval is required before implementation." >&2
    exit 2
    ;;
  IN_PROGRESS)
    # Allow spec completion-checkbox evidence; CLI review/done validates the result.
    $IS_PLAN && { echo "[sduck advisory] approved plan content is read-only." >&2; exit 2; }
    exit 0
    ;;
  REVIEW_READY)
    ($IS_SPEC || $IS_REVIEW) && exit 0
    echo "[sduck advisory] reopen the current task before implementation changes." >&2
    exit 2
    ;;
  DONE|ABANDONED)
    echo "[sduck advisory] the current legacy task is terminal." >&2
    exit 2
    ;;
esac

exit 0
