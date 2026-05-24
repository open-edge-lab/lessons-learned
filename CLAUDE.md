## Lessons learned knowledge base

This repo maintains a lessons-learned knowledge base at `docs/lessons-learned/`,
managed by the [`lessons-learned`](https://github.com/open-edge-lab/lessons-learned)
plugin. The knowledge base captures problem-solving insights
across any domain (software, hardware, process, decisions, research) — not
just debugging.

**When investigating a non-trivial problem** — read `docs/lessons-learned/index.md`
first. Match the reported symptoms against categories, tags, and one-line
hooks. For the top candidates, read the full page in
`docs/lessons-learned/pages/`. Surface the matching "how to recognize it"
checks to the user before proposing solutions.

**When a non-trivial problem is resolved** — if the resolution spanned ≥2
domains, ≥2 distinct factors, or required non-obvious diagnosis (see
`docs/lessons-learned/schema.md`), propose recording it. On accept, write a
new page under `docs/lessons-learned/pages/`, update
`docs/lessons-learned/index.md`, append to `docs/lessons-learned/log.md`, and
add bidirectional cross-references to related existing pages.

The `consulting-lessons` and `recording-lesson` skills automate both flows
when the plugin is installed. Manual access via `/lesson-search`,
`/lesson-add`, `/lesson-lint`.
