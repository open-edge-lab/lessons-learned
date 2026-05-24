#!/usr/bin/env bash
# Install the lessons-learned skills into ~/.codex/skills/.
#
# Codex CLI loads skills from $CODEX_HOME/skills/<skill-name>/ (default
# ~/.codex/skills/). This script symlinks (or copies) one directory per
# skill from this plugin into that location.
#
# Idempotent — re-runs replace existing symlinks/dirs without erroring.
# Uses symlinks by default so edits in the cloned repo land in Codex
# immediately; falls back to recursive copies if symlinks fail (rare).
#
# Usage:
#   ./install.sh             # install symlinks (or copies on failure)
#   ./install.sh --copy      # always copy, never symlink
#   ./install.sh --uninstall # remove the six skill dirs from ~/.codex/skills/

set -euo pipefail

mode="link"
case "${1:-}" in
  --copy)      mode="copy" ;;
  --uninstall) mode="uninstall" ;;
  -h|--help)
    awk '/^set /{exit} /^#!/{next} /^#/{sub(/^# ?/, ""); print}' "$0"
    exit 0
    ;;
  "") ;;
  *)
    echo "unknown argument: $1 (try --help)" >&2
    exit 2
    ;;
esac

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
skills_src="$script_dir/skills"
codex_home="${CODEX_HOME:-$HOME/.codex}"
skills_dst="$codex_home/skills"

# Skills installed by this plugin. Names must match the `name:` field in
# each SKILL.md frontmatter and the on-disk directory name.
skills=(consulting-lessons recording-lesson lesson-init lesson-search lesson-add lesson-lint)

# Sanity check: every skill must have a SKILL.md. References (templates,
# snippets) are populated by scripts/sync-core.mjs — bail with a clear
# message if they're missing for the skills that need them.
for name in "${skills[@]}"; do
  if [[ ! -f "$skills_src/$name/SKILL.md" ]]; then
    echo "missing $skills_src/$name/SKILL.md" >&2
    exit 1
  fi
done
for needs_refs in lesson-init lesson-add recording-lesson; do
  if [[ ! -d "$skills_src/$needs_refs/references" ]]; then
    echo "missing $skills_src/$needs_refs/references/" >&2
    echo "run 'node scripts/sync-core.mjs' from the repo root first." >&2
    exit 1
  fi
done

remove_existing() {
  local target="$1"
  # Handle file, directory, and (possibly broken) symlink uniformly.
  if [[ -L "$target" ]]; then
    rm -f -- "$target"
  elif [[ -d "$target" ]]; then
    rm -rf -- "$target"
  elif [[ -e "$target" ]]; then
    rm -f -- "$target"
  fi
}

if [[ "$mode" == "uninstall" ]]; then
  for name in "${skills[@]}"; do
    target="$skills_dst/$name"
    if [[ -e "$target" || -L "$target" ]]; then
      remove_existing "$target"
      echo "removed $target"
    fi
  done
  exit 0
fi

mkdir -p "$skills_dst"

for name in "${skills[@]}"; do
  src="$skills_src/$name"
  target="$skills_dst/$name"

  remove_existing "$target"

  if [[ "$mode" == "link" ]]; then
    if ln -s -- "$src" "$target" 2>/dev/null; then
      echo "linked  $target -> $src"
      continue
    fi
    echo "symlink failed for $target, falling back to copy" >&2
  fi

  cp -R -- "$src" "$target"
  echo "copied  $target"
done

echo
echo "Installed ${#skills[@]} skills into $skills_dst."
echo "Restart Codex (close any open sessions) to pick up the new skills."
echo "Invoke explicitly with \$consulting-lessons, \$recording-lesson,"
echo "\$lesson-init, \$lesson-search, \$lesson-add, \$lesson-lint — or let"
echo "Codex auto-fire them based on the task description."
