---
title: Plugin edits require a version bump to reach cache
date: 2026-05-19
categories: [plugin-dev]
tags: [claude-code, plugin-cache, dev-loop]
status: active
supersedes: []
related:
  - 2026-05-19-marketplace-plugin-not-in-same-root.md
  - 2026-05-19-hooks-auto-discovery-filename.md
---

# Plugin edits require a version bump to reach cache

## Symptom

You edit a plugin's source file (a slash command's `.md`, a skill's
`SKILL.md`, a hook's JSON) and run:

```
/reload-plugins
```

The reload completes successfully but the behavior of the plugin is
unchanged. The edited command/skill still uses the previous content. There
is no error — the edit just isn't visible to Claude Code.

## Root cause

When `/plugin install` runs, Claude Code **copies** the plugin from its
source location into a versioned cache directory at
`~/.claude/plugins/cache/<plugin-name>/<version>/`. From that point on,
`/reload-plugins` and runtime resolution read from the **cache**, not from
the original source tree.

`/plugin marketplace update <marketplace>` compares the `version` declared
in the source `plugin.json` against the cached version. If they match,
**update is a no-op** — the cache stays as it is, edits are not propagated.

This is by design: it prevents accidental drift when the plugin developer is
also a plugin user. The cost is that the dev loop is non-obvious.

## Fix

To pick up source edits, bump the version in two coordinated steps:

1. **Edit `plugin.json`** — bump `version`:
   ```json
   { "version": "0.1.0" }   →   { "version": "0.1.1" }
   ```

2. **Refresh the cache:**
   ```
   /plugin marketplace update <marketplace-name>
   /plugin update <plugin-name>@<marketplace-name>
   /reload-plugins
   ```

If the update path misbehaves, the brutal alternative for fast dev iteration:

```
/plugin uninstall <plugin>@<marketplace>
/plugin install <plugin>@<marketplace>
/reload-plugins
```

This forces a fresh copy regardless of version.

## How to recognize it in the future

The 30-second check: after editing a plugin source file, run
`/reload-plugins` and observe whether the new behavior takes effect. If
not:

```bash
diff <plugin-source>/<edited-file> ~/.claude/plugins/cache/<plugin-name>/<version>/<edited-file>
```

If the diff is non-empty → the cache is stale. Bump version and update.

Alternative: if `cat ~/.claude/plugins/cache/<plugin-name>/.metadata.json`
shows a different `version` than the source `plugin.json`, you've already
bumped but didn't run the `update` step.

## Files touched

- `plugins/lessons-learned/.claude-plugin/plugin.json` — `version`
  incremented on every meaningful edit

## Related lessons

- [Marketplace and plugin cannot share the same root](2026-05-19-marketplace-plugin-not-in-same-root.md) — fix this first; cache refresh is meaningless if the install never landed
- [Hook auto-discovery requires `hooks/hooks.json`](2026-05-19-hooks-auto-discovery-filename.md) — same dev-loop awareness applies when changing hook files
