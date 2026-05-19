# MOC — plugin-dev

Map of Content for the **plugin-dev** category: Claude Code plugin
development — manifest schema, marketplace structure, hook discovery,
plugin cache, slash command and skill loading.

This file is a navigation aid for Obsidian (optimized graph view +
backlinks). The authoritative source remains [`index.md`](index.md),
read by the `consulting-lessons` / `recording-lesson` workflows and by
the linter.

## Lessons

- [Marketplace and plugin cannot share the same root](pages/2026-05-19-marketplace-plugin-not-in-same-root.md)
  — silent install followed by an empty `/plugin list`. Classic initial
  repo-layout mistake.
- [Hook auto-discovery requires `hooks/hooks.json`](pages/2026-05-19-hooks-auto-discovery-filename.md)
  — a hook with a filename other than `hooks.json` gets skipped with no
  error. Claude Code's convention-over-configuration.
- [Plugin edits require a version bump to reach cache](pages/2026-05-19-plugin-cache-version-bump.md)
  — command/skill edits don't take effect after `/reload-plugins`
  without a `version` bump in `plugin.json`. Dev-loop trap.

## Recurring patterns

**Silent failures**: all three lessons share the same anti-pattern — the
action completes with apparent success, but a sub-component is
invisibly missing or stale. This is the most expensive pattern to
diagnose, and the reason `schema.md` automatically qualifies it as a
noteworthy lesson even when single-layer.

To explore the connections visually: open Obsidian's **graph view**
(`G`) and filter by `path:docs/lessons-learned/pages/plugin-dev` (or use
the `#claude-code` tag filter).

## When to update this MOC

Every new lesson in the `plugin-dev` category should be added here with
the same structure: standard MD link + hook + short note on what makes
the lesson interesting. The "Recurring patterns" section should be
re-read periodically to spot emerging thematic clusters.
