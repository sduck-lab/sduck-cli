#!/bin/sh
# sduck managed retrospective post-commit hook
# Local post-commit marker hook. It records commit identifiers only.

set -eu

commit_sha=$(git rev-parse --verify HEAD 2>/dev/null) || exit 0
parent_sha=$(git rev-parse --verify HEAD^1 2>/dev/null || true)
marker_path=$(git rev-parse --git-path sduck-retrospective-pending.json 2>/dev/null) || exit 0
lock_path=$(git rev-parse --git-path sduck-retrospective-marker.lock 2>/dev/null) || exit 0
policy_path=$(git rev-parse --show-toplevel 2>/dev/null)/.decision/policy.json || exit 0

case "$marker_path" in
  '') exit 0 ;;
esac

release_lock() {
  if [ -n "${acquired_lock:-}" ] && [ -f "$lock_path/owner.json" ]; then
    owner_content=$(cat "$lock_path/owner.json" 2>/dev/null || true)
    case "$owner_content" in
      *'"pid":'"$$"*) rm -rf "$lock_path" 2>/dev/null || true ;;
    esac
  fi
}
trap release_lock EXIT HUP INT TERM

attempt=0
while ! mkdir "$lock_path" 2>/dev/null; do
  if [ -f "$lock_path/owner.json" ]; then
    owner_content=$(cat "$lock_path/owner.json" 2>/dev/null || true)
    owner_pid=$(printf '%s\n' "$owner_content" | sed -n 's/.*"pid":[ ]*\([0-9][0-9]*\).*/\1/p')
    if [ -n "$owner_pid" ] && ! kill -0 "$owner_pid" 2>/dev/null; then
      rm -rf "$lock_path" 2>/dev/null || true
      continue
    fi
    if [ -z "$owner_pid" ] && [ "$attempt" -ge 1 ]; then
      rm -rf "$lock_path" 2>/dev/null || true
      continue
    fi
  fi
  attempt=$((attempt + 1))
  if [ "$attempt" -ge 10 ]; then
    exit 0
  fi
  sleep 1
done
acquired_lock=1
printf '{"pid":%s,"token":"post-commit-%s"}\n' "$$" "$$" >"$lock_path/owner.json" 2>/dev/null || exit 0

if [ ! -f "$policy_path" ]; then
  exit 0
fi

policy_content=$(cat "$policy_path" 2>/dev/null || true)
case "$policy_content" in
  *'"retrospectiveHookState": "enabling"'*|*'"retrospectiveHookState":"enabling"'*) exit 0 ;;
esac
case "$policy_content" in
  *'"workflowEnabled": false'*|*'"workflowEnabled":false'*) ;;
  *) exit 0 ;;
esac

marker_dir=${marker_path%/*}
if [ "$marker_dir" != "$marker_path" ]; then
  mkdir -p "$marker_dir" 2>/dev/null || exit 0
fi

created_at=$(date -u '+%Y-%m-%dT%H:%M:%SZ')
tmp_path="${marker_path}.$$"

if [ -n "$parent_sha" ]; then
  printf '{"commitSha":"%s","parentSha":"%s","createdAt":"%s"}\n' "$commit_sha" "$parent_sha" "$created_at" >"$tmp_path" || exit 0
else
  printf '{"commitSha":"%s","parentSha":null,"createdAt":"%s"}\n' "$commit_sha" "$created_at" >"$tmp_path" || exit 0
fi

mv "$tmp_path" "$marker_path" 2>/dev/null || rm -f "$tmp_path"
