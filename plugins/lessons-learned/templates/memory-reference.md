---
name: reference-lessons-learned
description: Project's lessons-learned knowledge base lives at {{KB_PATH}}. Consult before tackling a non-trivial problem, update after non-trivial resolutions.
metadata:
  type: reference
---

The knowledge base at `{{KB_PATH}}` collects non-trivial problem-solving
lessons in Karpathy-LLM-Wiki format. Scope is domain-agnostic — software,
hardware, process, decisions, research.

- `{{KB_PATH}}/index.md` — categorized catalog, read this first
- `{{KB_PATH}}/log.md` — append-only chronological history
- `{{KB_PATH}}/schema.md` — categories and inclusion criteria for this repo
- `{{KB_PATH}}/pages/*.md` — one lesson per file

Use the `lessons-learned` plugin's slash commands (`/lesson-search`,
`/lesson-add`, `/lesson-lint`) or let the auto-activating skills
`consulting-lessons` and `recording-lesson` handle ingest and query.

When the user reports a problem whose symptoms might span multiple domains or
factors (software, hardware, process, integration, concurrency, deployment,
human/organizational), read `index.md` *before* investigating and surface
relevant prior incidents.
