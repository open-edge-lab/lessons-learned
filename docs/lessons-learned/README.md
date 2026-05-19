# Lessons Learned — `lessons-learned` plugin development

This folder is the **problem-solving knowledge base** for the plugin itself.
It's both production usage (the plugin documents its own dev) and the
canonical example of what a populated knowledge base looks like.

The plugin's scope is domain-agnostic (software, hardware, process,
decisions, research). The pages here happen to be software/plugin-dev
specific, since that's the actual subject matter of this repo.

## What's here

| File | Purpose |
|---|---|
| `README.md` | This file |
| `index.md` | Categorized catalog of all lessons. Read this first when looking for prior art |
| `log.md` | Append-only chronological log of changes |
| `schema.md` | Categories, inclusion criteria, and conventions for this repo |
| `pages/` | One lesson per markdown file: `YYYY-MM-DD-kebab-title.md` |

## When to read it

Before any plugin-dev task: open `index.md`, check the `plugin-dev` section.
Many Claude Code plugin pitfalls (silent install failures, hook discovery,
cache invalidation) are captured here.

## When to update it

After a non-trivial fix: the `recording-lesson` skill proposes recording
automatically if the inclusion criteria in `schema.md` match. Manual ingest
via `/lessons-learned:lesson-add`. Maintenance via
`/lessons-learned:lesson-lint`.

## Plugin reference

This repo is itself the source of `lessons-learned`. The plugin lives
at `plugins/lessons-learned/`. Install instructions in the top-level
`README.md`.

## Browsing via Obsidian

The files in this folder are natively compatible with Obsidian (Markdown
+ YAML frontmatter + standard MD links). No conversion or export is
needed.

### Open as a vault

Obsidian → **Open folder as vault** → select
`docs/lessons-learned/`. The folder becomes a dedicated vault; the rest
of the repo is not indexed.

### What you get out of the box

| Feature | Source |
|---|---|
| **Graph view** of `related:` links | Standard MD links in the "Related lessons" section of each page |
| **Tag panel** with categories and tags | Frontmatter `categories: [...]` and `tags: [...]` |
| Bidirectional **backlinks** | Automatic indexing of standard MD links |
| **Full-text search** | Native |

### Useful search operators

- `tag:#claude-code` — all lessons with a specific tag
- `["status": "active"]` — only active lessons (excludes `superseded` / `archived`)
- `path:pages/` — restrict the search to pages only (excludes index/MOC)

### MOC convention

Files prefixed `_moc-<category>.md` are **Maps of Content** optimized for
Obsidian navigation (the leading `_` sorts them to the top of the file
explorer). They are **additive** and do not replace `index.md`, which
remains the authoritative source read by the plugin workflows and the
linter.

Rule: create a MOC when a category reaches **≥ 2 lessons**. Empty
categories get no MOC (would just add noise).

### Don't convert links to wikilinks

`[text](slug.md)` links already work in Obsidian for backlinks and the
graph view. **Don't rewrite them** as `[[slug|text]]`: that would break
`/lessons-learned:lesson-lint`, the plugin templates (which keep
generating standard links anyway), and GitHub rendering (wikilinks are
not GFM).
