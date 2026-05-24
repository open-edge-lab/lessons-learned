---
name: lesson-add
description: Use when the user asks to manually record, add, or file a lesson into the lessons-learned knowledge base, bypassing the automatic inclusion criteria. Useful for single-step fixes worth capturing, post-mortems written elsewhere, or promoting a search synthesis into a permanent page.
metadata:
  short-description: Manually record a lesson, bypassing inclusion criteria
---

# Add a lesson to the knowledge base

Manual ingest. Same flow as `$recording-lesson`, **minus** the
inclusion-criteria check. Use this when:

- You want to record a resolution the automatic skill would have skipped
  (e.g., a single-step fix that nonetheless captures hard-won
  knowledge).
- You're promoting a synthesis from `$lesson-search` results into a
  permanent page.
- You want to seed the knowledge base from a post-mortem, note, or
  external source written elsewhere.

The user's title for the lesson (if any) is in the rest of their
invoking message.

## Procedure

1. **Locate the knowledge base.** Resolve via
   `lessons-learned.config.json` (or
   `.claude-plugin/lessons-learned.config.json`) → `knowledgeBaseRoot`,
   default `docs/lessons-learned/`. If it doesn't exist, suggest
   `$lesson-init` and stop.

2. **Gather inputs.**
   - Use the title from the invoking message if present.
   - Pull whatever else you can from session context (recent edits,
     commands run, logs discussed).
   - Ask the user for anything missing — at minimum the symptom and the
     fix.

3. **Apply (or note) inclusion criteria.** Read `<KB>/schema.md` and
   any `inclusionCriteria` from the config JSON. Defaults:
   - **Cross-domain** — resolution spanned ≥2 distinct domains/layers.
   - **Multi-factor** — ≥2 distinct components, factors, or causes.
   - **Non-obvious diagnosis** — the cause was not visible from the
     immediate symptoms.

   `$lesson-add` does **not** gate on these — the user opted in. But if
   none of them hold, mention it briefly: "this is a single-step fix
   with one factor; recording anyway because you asked".

4. **Draft the page.** Use `references/page-template.md` as the
   skeleton. Fill in:
   - `title` — concise, symptom-oriented (e.g., "Printer duplex jam",
     "VPN audio mute").
   - `date` — today's date in `YYYY-MM-DD`.
   - `categories` — pick from `<KB>/schema.md` list.
   - `tags` — 3–5 keywords useful for search.
   - `status: active`, empty `supersedes` and `related` for now.
   - **Symptom** — concrete signals (exact log lines for software;
     observed behaviors for other domains).
   - **Root cause** — per-domain or per-factor breakdown if
     cross-domain or multi-factor.
   - **Fix** — ordered steps with concrete references (file paths, part
     numbers, URLs, etc.).
   - **How to recognize it in the future** — the single 30-second
     check.
   - **Artifacts touched** — code files, hardware parts, processes,
     external sources.

   Mark any field you cannot determine with `TODO:`. Do not silently
   leave blanks.

5. **Show the draft and iterate.** Do not write yet. Let the user edit
   until they accept.

6. **Write the page.** Filename:
   `<KB>/pages/YYYY-MM-DD-<kebab-slug>.md`.

7. **Update the index.** Open `<KB>/index.md`, insert a line under the
   correct category section:
   ```
   - [Title](pages/<slug>.md) — tag1, tag2 — one-line hook
   ```
   The hook should be a compressed "how to recognize it" phrase.

8. **Append to the log.** Add to `<KB>/log.md`:
   ```
   ## [YYYY-MM-DD] ingest | <title>
   ```
   Vocabulary follows the Karpathy LLM Wiki convention — `ingest`, not
   `add`. Other ops are `update`, `supersede`, `archive`, `migrate`.

9. **Cross-reference detection.** If `autoCrossReference` is true (the
   default):
   - Scan `<KB>/index.md` for entries with overlapping tags or
     category.
   - For each plausible match, propose adding a `related:` link.
   - On accept, update **both** pages' frontmatter and "Related
     lessons" section — links are bidirectional.

10. **Confirm and stop.** Summarize: page written, index updated, log
    appended, N cross-references added.

## Output discipline

- Drafts should mirror the wording used during the actual session —
  verbatim quotes from logs, manuals, conversations are gold for future
  search.
- Never write files until the user accepts the draft.

## References

- `references/page-template.md` — page skeleton. Copy structure, do not
  write the literal `{{title}}` etc. placeholders into the new page.
