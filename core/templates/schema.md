# Lessons Learned — Schema

This file is the **human-readable schema** for this repo's lessons learned
knowledge base. It mirrors `lessons-learned.config.json` (if present) but with
prose explanations. Any AI agent and humans should read this when ingesting,
querying, or linting.

Edit freely as the knowledge base grows. The defaults below are domain-agnostic
— rename, add, or remove categories to fit this repo's actual subject matter.

---

## Categories

Top-level buckets used in `index.md`. Add or remove as needed for this repo's
domain. Keep the list short (≤10) — finer-grained grouping happens via tags.

- **software** — code, builds, runtime, integration, deployment, performance
- **hardware** — devices, electronics, infrastructure, physical setup
- **process** — workflows, procedures, organizational, administrative
- **decision** — non-obvious trade-offs and choices worth documenting
- **research** — investigation methods, sources, learning from external material
- **other** — anything that doesn't fit; rename a category when a cluster emerges

A lesson may belong to multiple categories (frontmatter `categories: [a, b]`).

---

## Inclusion criteria

A problem-solving session qualifies as a "lesson learned" if **at least one** of
the following holds:

1. **Cross-domain** — the problem or its resolution spanned ≥2 distinct
   domains/layers (e.g., software + hardware, technical + organizational, code
   + config, mechanical + electronic).
2. **Multi-factor** — ≥2 distinct components, factors, or causes were involved.
3. **Non-obvious diagnosis** — the cause was not visible from the immediate
   symptoms; required correlating evidence, experiments, or external sources.

Trivial single-step fixes, typos, and well-documented gotchas do **not**
qualify. When in doubt, skip — a manual record is always available as an
override.

---

## File path conventions

- One lesson per file: `pages/YYYY-MM-DD-kebab-case-title.md`
- Cross-references use standard Markdown links: `[text](other-slug.md)`
- Frontmatter `related:` array mirrors the links in the "Related lessons"
  section of each page

---

## Log operations

| op | when |
|---|---|
| `ingest` | new page added |
| `update` | substantive edit to an existing page (typo fixes don't count) |
| `supersede` | new lesson supersedes (or invalidates) a prior one |
| `archive` | page kept for history but no longer applicable |
| `migrate` | page came from a legacy flat-file format |

---

## Status field

Each page's frontmatter `status` is one of:

- `active` — current, applicable
- `superseded` — newer page replaced this one (see frontmatter `supersedes:`
  on the newer page)
- `archived` — kept for history but no longer current

The lessons-learned lint tool flags pages with inconsistent supersede/status
state.
