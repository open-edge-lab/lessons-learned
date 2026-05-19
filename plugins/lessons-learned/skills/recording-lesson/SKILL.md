---
name: recording-lesson
description: Use when a non-trivial problem is resolved and the resolution involved multiple domains, factors, or non-obvious diagnosis. Applies inclusion criteria from the project's schema, and if met, proposes adding a new entry to the lessons-learned knowledge base.
---

# Recording a new lesson learned

This skill runs at the **end** of a problem-solving session, after a
resolution has been validated. Its job is to capture non-trivial knowledge in
the knowledge base before it evaporates with the session.

The knowledge base is domain-agnostic — software, hardware, process,
decisions, research. Don't restrict yourself to debugging contexts.

## Procedure

1. **Locate the knowledge base.** Same resolution as `consulting-lessons`:
   read `.claude-plugin/lessons-learned.config.json` for `knowledgeBaseRoot`,
   else default to `docs/lessons-learned/`. Silent skip if absent.

2. **Read the schema.** Open `<KB>/schema.md` and any
   `inclusionCriteria` from the config JSON.

3. **Apply inclusion criteria.** The default criteria (overridable in config):
   - **Cross-domain** — resolution spanned ≥2 distinct domains/layers (e.g.,
     software + hardware, technical + organizational, code + config,
     mechanical + electronic).
   - **Multi-factor** — ≥2 distinct components, factors, or causes were
     involved.
   - **Non-obvious diagnosis** — the cause was not visible from the immediate
     symptoms; required correlating evidence, experiments, or external sources.

   A session qualifies if **at least one** criterion holds (unless
   `requireNonObviousDiagnosis: true`, in which case the diagnosis criterion
   is mandatory).

4. **Silent skip if criteria not met.** Do not propose, do not nag. Trivial
   resolutions don't belong in the knowledge base.

5. **Propose recording if criteria met.** Phrase it as:

   > This looks like it qualifies as a lesson learned because:
   > - <criterion 1 that applied, with concrete evidence>
   > - <criterion 2 that applied, with concrete evidence>
   >
   > Want me to record it?

6. **Draft the page.** On accept, build a draft from session context using
   `templates/page.md` as skeleton. Fill in:
   - `title` — concise, symptom-oriented (e.g., "Printer duplex jam",
     "VPN audio mute")
   - `date` — today's date in `YYYY-MM-DD`
   - `categories` — pick from `schema.md` list
   - `tags` — 3–5 keywords useful for search
   - `status: active`, empty `supersedes` and `related` for now
   - **Symptom**: what was observed (exact log lines/errors for software;
     concrete signals/behaviors for other domains)
   - **Root cause**: per-domain or per-factor breakdown if cross-domain or
     multi-factor
   - **Fix**: ordered steps with concrete references (file paths, part
     numbers, URLs, documents, etc.)
   - **How to recognize it in the future**: the single 30-second check
   - **Artifacts touched**: code files, hardware parts, processes, external
     sources, etc.

7. **Show the draft and let the user edit.** Do not write yet. Iterate until
   the user accepts.

8. **Write the page.** Filename: `<KB>/pages/YYYY-MM-DD-<kebab-slug>.md`.

9. **Update the index.** Open `<KB>/index.md`, insert a line under the correct
   category section:
   ```
   - [Title](pages/<slug>.md) — tag1, tag2 — one-line hook
   ```
   The hook should be a compressed "how to recognize it" phrase.

10. **Append to the log.** Add to `<KB>/log.md`:
    ```
    ## [YYYY-MM-DD] ingest | <title>
    ```
    Note: vocabulary follows Karpathy's LLM Wiki convention — `ingest`, not
    `add`. Other ops are `update`, `supersede`, `archive`, `migrate`.

11. **Cross-reference detection.** If `autoCrossReference` is true (default):
    - Scan `index.md` for entries with overlapping tags or category.
    - For each plausible match, propose adding a `related:` link.
    - On accept, update **both** pages' frontmatter and "Related lessons"
      section — links are bidirectional.

12. **Confirm and stop.** Summarize: page written, index updated, log
    appended, N cross-references added.

## Output discipline

- The proposal in step 5 must list **concrete evidence**, not generic claims.
- Drafts in step 6 should mirror the wording used during the actual session —
  verbatim quotes from logs, manuals, conversations are gold for future search.
- Never write files until the user accepts the draft.
