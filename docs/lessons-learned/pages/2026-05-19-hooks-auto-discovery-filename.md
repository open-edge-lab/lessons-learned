---
title: Hook auto-discovery requires `hooks/hooks.json`
date: 2026-05-19
categories: [plugin-dev]
tags: [claude-code, hooks, auto-discovery]
status: active
supersedes: []
related:
  - 2026-05-19-marketplace-plugin-not-in-same-root.md
  - 2026-05-19-plugin-cache-version-bump.md
---

# Hook auto-discovery requires `hooks/hooks.json`

## Symptom

A plugin ships a hook configuration in its `hooks/` directory under a
descriptive name (e.g., `hooks/pre-commit-reminder.json`). The plugin
installs and loads, slash commands and skills become available, but the
hook never fires. `/reload-plugins` reports zero hooks loaded for this
plugin even though the JSON file is present and valid.

## Root cause

Claude Code's plugin auto-discovery follows fixed filename conventions for
each component type:

| Component | Default discovery path |
|---|---|
| Skills | `skills/<name>/SKILL.md` |
| Commands | `commands/*.md` |
| Hooks | **`hooks/hooks.json`** — exact filename |

If `hooks/` contains a JSON file with any other name, auto-discovery skips
it. The plugin doesn't error out — the hook is just silently absent.

Non-default filenames are still supported but require an explicit
declaration in `.claude-plugin/plugin.json`:

```json
{
  "hooks": "hooks/pre-commit-reminder.json"
}
```

## Fix

Two options, pick one:

**Option A — convention (preferred for simplicity):** rename the file.

```bash
mv hooks/pre-commit-reminder.json hooks/hooks.json
```

No `plugin.json` changes needed; auto-discovery picks it up.

**Option B — explicit declaration:** keep the descriptive name, declare it.

```json
{
  "name": "my-plugin",
  "hooks": "hooks/pre-commit-reminder.json"
}
```

Option A is recommended unless you have multiple hook bundles to ship (in
which case Option B is the only way).

After either fix, force a reinstall to refresh the plugin cache (see the
[version-bump lesson](2026-05-19-plugin-cache-version-bump.md)).

## How to recognize it in the future

After `/reload-plugins`, the summary line reports a `... hooks` count. If
that count is lower than the number of hook bundles you expect:

```bash
ls -la <plugin-root>/hooks/
```

If the directory has files other than `hooks.json` and the plugin manifest
doesn't list them in the `hooks` field → auto-discovery is skipping them.

## Files touched

- `hooks/pre-commit-reminder.json` → renamed to `hooks/hooks.json`
- `.claude-plugin/plugin.json` — `hooks` field removed (no longer needed
  since the file follows convention)

## Related lessons

- [Marketplace and plugin cannot share the same root](2026-05-19-marketplace-plugin-not-in-same-root.md) — same silent-failure category: the plugin loads but a sub-component is invisibly missing
- [Plugin edits require a version bump to reach cache](2026-05-19-plugin-cache-version-bump.md) — required to actually pick up the rename
