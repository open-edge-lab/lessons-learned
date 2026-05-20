# Lessons Learned

This folder is a **problem-solving knowledge base** for this repo, maintained
by the [lessons-learned](https://github.com/open-edge-lab/lessons-learned) Claude
Code plugin in the style of
[Karpathy's LLM Wiki](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f).

It captures hard-won insights across any domain — software, hardware, process,
decisions, research — not just debugging.

## What's here

| File | Purpose |
|---|---|
| `README.md` | This file — humans start here |
| `index.md` | Categorized catalog of all lessons. Read this first when looking for prior art |
| `log.md` | Append-only chronological log of changes to the knowledge base |
| `schema.md` | This repo's categories, inclusion criteria, and conventions |
| `pages/` | One lesson per markdown file: `YYYY-MM-DD-kebab-title.md` |

## When to read it

- **Before investigating a non-trivial problem** — Claude consults `index.md`
  automatically when you report symptoms that might span multiple domains or
  factors. You can also browse manually, or run `/lesson-search <query>`.
- **When onboarding** — `pages/` is a curated tour of the project's
  hardest-won knowledge.

## When to update it

- **After a non-trivial resolution** — Claude proposes recording automatically
  when a session ends and the inclusion criteria in `schema.md` are met.
  Accept the proposal or decline (it stays out of the way otherwise).
- **Manually** — `/lesson-add` to record a lesson regardless of criteria.
- **Periodically** — `/lesson-lint` to surface broken cross-references,
  orphan pages, and stale state.

## What qualifies as a lesson

See [schema.md](schema.md). In short: cross-domain problems, multi-factor
resolutions, non-obvious diagnoses. Trivial single-step fixes don't qualify.

## Plugin reference

Install: see the plugin README. The plugin provides:
- Skills: `consulting-lessons`, `recording-lesson` (auto-activated)
- Commands: `/lesson-init`, `/lesson-add`, `/lesson-search`, `/lesson-lint`
- Optional: pre-commit reminder hook
