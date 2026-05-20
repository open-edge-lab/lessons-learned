<!--
Paste the block below into the project's CLAUDE.md (or AGENTS.md). It primes
Claude to consult the lessons-learned knowledge base before tackling a
non-trivial problem and update it after non-trivial resolutions.
-->

## Lessons learned knowledge base

This repo maintains a lessons-learned knowledge base at `{{KB_PATH}}/`, managed
by the [`lessons-learned`](https://github.com/open-edge-lab/lessons-learned) Claude
Code plugin. The knowledge base captures problem-solving insights across any
domain (software, hardware, process, decisions, research) — not just debugging.

**When investigating a non-trivial problem** — read `{{KB_PATH}}/index.md` first.
Match the reported symptoms against categories, tags, and one-line hooks. For
the top candidates, read the full page in `{{KB_PATH}}/pages/`. Surface the
matching "how to recognize it" checks to the user before proposing solutions.

**When a non-trivial problem is resolved** — if the resolution spanned ≥2
domains, ≥2 distinct factors, or required non-obvious diagnosis (see
`{{KB_PATH}}/schema.md`), propose recording it. On accept, write a new page
under `{{KB_PATH}}/pages/`, update `{{KB_PATH}}/index.md`, append to
`{{KB_PATH}}/log.md`, and add bidirectional cross-references to related
existing pages.

The `consulting-lessons` and `recording-lesson` skills automate both flows when
the plugin is installed. Manual access via `/lesson-search`, `/lesson-add`,
`/lesson-lint`.
