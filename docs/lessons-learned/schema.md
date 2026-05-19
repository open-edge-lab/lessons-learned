# Lessons Learned — Schema

Per-repo schema for the `lessons-learned` plugin development knowledge
base. Mirrors `.claude-plugin/lessons-learned.config.json` (none present —
defaults plus the customizations below apply).

---

## Categories

The plugin defaults to a domain-agnostic set (`software`, `hardware`, `process`,
`decision`, `research`, `other`). For this repo, since the knowledge base
documents the plugin's own development, we add a custom category:

- **plugin-dev** *(custom for this repo)* — Claude Code plugin development:
  manifest schema, marketplace structure, hook discovery, plugin cache, slash
  command and skill loading
- **software** — code, builds, runtime, integration, deployment, performance
- **hardware** — devices, electronics, infrastructure, physical setup
- **process** — workflows, procedures, organizational, administrative
- **decision** — non-obvious trade-offs and choices worth documenting
- **research** — investigation methods, sources, learning from external material
- **other** — anything that doesn't fit

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
qualify. When in doubt, skip — `/lessons-learned:lesson-add` is always
available for manual override.

For this repo specifically, **silent failures** (no error output, install
completes but nothing happens) automatically qualify regardless of domain
count — they are the hardest to diagnose and most worth documenting.

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
| `migrate` | page came from a legacy flat-file format via `/lesson-init` |

---

## Status field

Each page's frontmatter `status` is one of:

- `active` — current, applicable
- `superseded` — newer page replaced this one (see frontmatter `supersedes:`
  on the newer page)
- `archived` — kept for history but no longer current

The `/lessons-learned:lesson-lint` command flags pages with inconsistent
supersede/status state.
