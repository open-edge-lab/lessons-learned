---
description: Manually record a lesson in the knowledge base. Bypasses inclusion criteria — use when you want to capture something the automatic skill would skip.
argument-hint: "[optional title]"
---

# /lesson-add

Manual ingest. Same flow as the `recording-lesson` skill, **minus** the
inclusion-criteria check. Use this when:

- You want to record a resolution the skill would have skipped (e.g., a
  single-step fix that nonetheless captures hard-won knowledge).
- You're promoting a synthesis from `/lesson-search` results into a permanent
  page.
- You want to seed the knowledge base from a postmortem, note, or external
  source written elsewhere.

## Procedure

1. **Locate the knowledge base.** Resolve via `lessons-learned.config.json`
   (or `.claude-plugin/lessons-learned.config.json`) → `knowledgeBaseRoot`,
   default `docs/lessons-learned/`. If it doesn't exist, suggest `/lesson-init`
   and stop.

2. **Gather inputs.**
   - If a title was given as command argument, use it as a starting point.
   - Otherwise, ask the user for the title and the symptom.
   - Pull whatever else you can from session context (recent edits, commands
     run, logs discussed).

3. **Draft the page** using `templates/page.md`. Fill in all sections; mark
   any that you cannot determine with `TODO:`. Do not silently leave blanks.

4. **Show the draft and iterate.** Let the user edit before writing anything.

5. **Write the page** at `<KB>/pages/YYYY-MM-DD-<kebab-slug>.md`.

6. **Update `<KB>/index.md`** — insert under the matching category section
   with `- [Title](pages/<slug>.md) — tags — one-line hook`.

7. **Append `<KB>/log.md`**:
   ```
   ## [YYYY-MM-DD] ingest | <title>
   ```

8. **Cross-reference detection** (if `autoCrossReference` is true): scan
   `index.md` for overlapping tags/category, propose bidirectional `related:`
   links, on accept update both pages.

9. **Confirm and stop.** Summarize what was written and where.

## Differences from `recording-lesson` skill

- No inclusion-criteria gate — you opted in by running the command.
- The title may be supplied as argument up-front.
- Useful for promotion: if `/lesson-search` produced a useful synthesis, run
  `/lesson-add` to file that synthesis back into the wiki.
