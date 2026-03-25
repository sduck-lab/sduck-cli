#!/usr/bin/env bash
# sduck SDD guard hook for Claude Code
# Enforces the state-based file access matrix via PreToolUse hook.
# Exit 0 = allow, Exit 2 = block (message sent to Claude via stderr)

set -euo pipefail

INPUT=$(cat)

FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

# No file path (e.g. Bash tool) → allow
if [[ -z "$FILE_PATH" ]]; then
  exit 0
fi

# Resolve relative to cwd
CWD=$(echo "$INPUT" | jq -r '.cwd // empty')
if [[ -z "$CWD" ]]; then
  exit 0
fi

# Resolve project root (handles worktree via .git file)
if [[ -f "$CWD/.git" ]]; then
  GITDIR_LINE=$(grep '^gitdir:' "$CWD/.git" 2>/dev/null | head -1 || true)
  GITDIR=$(echo "$GITDIR_LINE" | sed 's/^gitdir: //' || true)
  if [[ -n "$GITDIR" ]]; then
    [[ "$GITDIR" != /* ]] && GITDIR="$CWD/$GITDIR"
    PROJECT_ROOT=$(echo "$GITDIR" | sed 's|/.git/worktrees/.*||')
  else
    PROJECT_ROOT="$CWD"
  fi
else
  PROJECT_ROOT="$CWD"
fi

WORKSPACE_DIR="$PROJECT_ROOT/.sduck/sduck-workspace"
if [[ ! -d "$WORKSPACE_DIR" ]]; then
  exit 0
fi

# Always-allowed paths (relative check)
REL_PATH="${FILE_PATH#"$PROJECT_ROOT"/}"

# Always allow: meta.yml, sduck assets, agent rule files, editor configs
case "$REL_PATH" in
  */meta.yml|.sduck/sduck-assets/*|.sduck/sduck-archive/*|\
  CLAUDE.md|AGENT.md|GEMINI.md|\
  .cursor/*|.agents/*|.claude/*|\
  .serena/*)
    exit 0
    ;;
esac

# Find the most recent active task (non-DONE)
STATUS=""
TASK_DIR=""
for dir in "$WORKSPACE_DIR"/*/; do
  [[ -d "$dir" ]] || continue
  META="$dir/meta.yml"
  [[ -f "$META" ]] || continue

  TASK_STATUS=$(grep -m1 '^status:' "$META" | sed 's/^status:[[:space:]]*//')

  case "$TASK_STATUS" in
    PENDING_SPEC_APPROVAL|SPEC_APPROVED|PENDING_PLAN_APPROVAL|IN_PROGRESS|REVIEW_READY)
      STATUS="$TASK_STATUS"
      TASK_DIR="$dir"
      ;;
    DONE)
      # Track DONE as fallback if no active task found
      if [[ -z "$STATUS" ]]; then
        STATUS="DONE"
        TASK_DIR="$dir"
      fi
      ;;
  esac
done

# No task at all → allow
if [[ -z "$STATUS" ]]; then
  exit 0
fi

# Check if the file is spec.md or plan.md (within the task workspace)
IS_SPEC=false
IS_PLAN=false
case "$REL_PATH" in
  */spec.md|spec.md) IS_SPEC=true ;;
  */plan.md|plan.md) IS_PLAN=true ;;
esac

# Apply the state-based access matrix
case "$STATUS" in
  PENDING_SPEC_APPROVAL)
    # spec.md, plan.md → allow; implementation files → block
    if $IS_SPEC || $IS_PLAN; then
      exit 0
    fi
    echo "⛔ [sduck] 현재 상태: $STATUS — 스펙 승인 전에는 구현 코드를 작성할 수 없습니다. \`sduck spec approve\`를 먼저 실행하세요." >&2
    exit 2
    ;;
  SPEC_APPROVED|PENDING_PLAN_APPROVAL)
    # plan.md → allow; spec.md, implementation files → block
    if $IS_PLAN; then
      exit 0
    fi
    if $IS_SPEC; then
      echo "⛔ [sduck] 현재 상태: $STATUS — 승인된 스펙은 수정할 수 없습니다. 요구사항이 바뀌었다면 새 태스크를 시작하세요." >&2
      exit 2
    fi
    echo "⛔ [sduck] 현재 상태: $STATUS — 플랜 승인 전에는 구현 코드를 작성할 수 없습니다. \`sduck plan approve\`를 먼저 실행하세요." >&2
    exit 2
    ;;
  IN_PROGRESS)
    # implementation files → allow; spec.md, plan.md → block
    if $IS_SPEC; then
      echo "⛔ [sduck] 현재 상태: IN_PROGRESS — 승인된 스펙은 수정할 수 없습니다. 요구사항이 바뀌었다면 새 태스크를 시작하세요." >&2
      exit 2
    fi
    if $IS_PLAN; then
      echo "⛔ [sduck] 현재 상태: IN_PROGRESS — 승인된 플랜은 수정할 수 없습니다. 요구사항이 바뀌었다면 새 태스크를 시작하세요." >&2
      exit 2
    fi
    exit 0
    ;;
  REVIEW_READY|DONE)
    # everything blocked except always-allowed paths (already handled above)
    if $IS_SPEC || $IS_PLAN; then
      echo "⛔ [sduck] 현재 상태: $STATUS — 완료된 태스크의 문서는 수정할 수 없습니다. \`sduck start\`로 새 태스크를 시작하세요." >&2
      exit 2
    fi
    echo "⛔ [sduck] 현재 상태: $STATUS — 새 코드를 작성하려면 \`sduck start\`로 새 태스크를 시작하세요." >&2
    exit 2
    ;;
esac

exit 0
