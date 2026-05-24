<!--
Paste the block below into the project's AGENTS.md. It primes the Codex
agent to consult the lessons-learned knowledge base before tackling a
non-trivial problem and update it after non-trivial resolutions.

$lesson-init does this automatically (idempotent). The standalone copy
here is for reference / manual install.

Replace `{{KB_PATH}}` with the actual knowledge-base path (default
`docs/lessons-learned`).
-->

## Lessons learned knowledge base

This repo maintains a lessons-learned knowledge base at `{{KB_PATH}}/`,
managed by the [`lessons-learned`](https://github.com/open-edge-lab/lessons-learned)
Codex skills. It captures problem-solving insights across any domain
(software, hardware, process, decisions, research) — not just
debugging.

**When investigating a non-trivial problem** — read
`{{KB_PATH}}/index.md` first. Match the reported symptoms against
categories, tags, and one-line hooks. For the top candidates, read the
full page in `{{KB_PATH}}/pages/`. Surface the matching "how to
recognize it" checks to the user before proposing solutions. The
`$consulting-lessons` skill automates this and should fire on its own
when a problem is reported; `$lesson-search` is the manual form.

**When a non-trivial problem is resolved** — if the resolution spanned
≥2 domains, ≥2 distinct factors, or required non-obvious diagnosis (see
`{{KB_PATH}}/schema.md`), the `$recording-lesson` skill proposes
capturing it. To record outside the inclusion criteria, use
`$lesson-add` explicitly.

**Periodically** — run `$lesson-lint` to detect broken cross-references,
orphan pages, and stale state.
