---
title: Marketplace and plugin cannot share the same root
date: 2026-05-19
categories: [plugin-dev]
tags: [claude-code, marketplace, plugin-source, install-silent]
status: active
supersedes: []
related:
  - 2026-05-19-hooks-auto-discovery-filename.md
  - 2026-05-19-plugin-cache-version-bump.md
---

# Marketplace and plugin cannot share the same root

## Symptom

When developing a single-plugin marketplace locally, three commands appear to
succeed but the plugin never actually loads:

```
/plugin marketplace add D:\Projects\lessons-learned
> Successfully added marketplace: lessons-learned-local

/plugin install lessons-learned@lessons-learned-local
> (no content)

/plugin list
> (no content)
```

No error message anywhere. Skills, commands, and hooks declared in the
plugin never become available. From the user's perspective the install
silently noop'd.

## Root cause

The `.claude-plugin/marketplace.json` had `plugins[0].source = "./"`, meaning
the marketplace root and the plugin root were the same directory:

```
D:\Projects\lessons-learned\
├── .claude-plugin\
│   ├── marketplace.json     (marketplace root = this dir's parent)
│   └── plugin.json          (plugin root = same parent)
├── skills\
├── commands\
└── ...
```

Claude Code's docs (https://code.claude.com/docs/en/plugin-marketplaces.md)
state the relative-path form is "Local directory **within** the marketplace
repo" and the canonical example uses `./plugins/<plugin-name>`. When source
resolves to the same directory that already contains `.claude-plugin/`, the
install resolution is ambiguous and Claude Code refuses silently — no error,
just nothing happens.

The docs do not explicitly forbid this layout, which is exactly why the
failure is silent and confusing.

## Fix

Restructure so the marketplace lives at the repo root and the plugin lives
in a subdirectory:

```
D:\Projects\lessons-learned\
├── .claude-plugin\
│   └── marketplace.json       ← marketplace root only
└── plugins\
    └── lessons-learned\        ← plugin root
        ├── .claude-plugin\
        │   └── plugin.json
        ├── skills\
        ├── commands\
        └── ...
```

Then in `marketplace.json`:

```json
{
  "plugins": [
    { "name": "lessons-learned", "source": "./plugins/lessons-learned" }
  ]
}
```

Reinstall:

```
/plugin marketplace remove lessons-learned-local
/plugin marketplace add D:\Projects\lessons-learned
/plugin install lessons-learned@lessons-learned-local
/reload-plugins
```

## How to recognize it in the future

Triplet check after `/plugin install`:

1. `/plugin list` returns empty (no content)
2. `/plugin marketplace add` had reported success earlier
3. `marketplace.json` has `source: "./"` (or `"."`) for any plugin entry

If all three are true → marketplace root and plugin root coincide. Move
the plugin into a subdir and update `source` to `./<subdir>`.

## Files touched

- `.claude-plugin/marketplace.json` — `source` updated to `./plugins/lessons-learned`
- `plugins/lessons-learned/` — created as new subdir, all plugin content moved here

## Related lessons

- [Hook auto-discovery requires `hooks/hooks.json`](2026-05-19-hooks-auto-discovery-filename.md) — another silent-failure mode in the same plugin-load pipeline
- [Plugin edits require a version bump to reach cache](2026-05-19-plugin-cache-version-bump.md) — once layout is fixed, this is the next gotcha you'll hit when iterating
