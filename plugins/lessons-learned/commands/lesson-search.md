---
description: Search the lessons-learned knowledge base by symptom, category, or tag.
argument-hint: "<query> [--full]"
---

# /lesson-search

Find prior lessons that match a query. Reads `index.md` first (cheap), then
optionally reads matched pages.

## Arguments

- `<query>` — free-form text. Matched against categories, tags, and the
  one-line hooks in `index.md`.
- `--full` — also read the top match's full page and display it inline.

## Procedure

1. **Locate the knowledge base.** Same resolution as the skills:
   `lessons-learned.config.json` (or `.claude-plugin/lessons-learned.config.json`)
   → `knowledgeBaseRoot`, default `docs/lessons-learned/`. If absent → suggest
   `/lesson-init` and stop.

2. **Read `<KB>/index.md`.**

3. **Score entries against the query.** For each catalog line, combine:
   - Category match (boost if query mentions a category name)
   - Tag overlap (count of query tokens that appear in the entry's tags)
   - Substring/semantic match against the entry's title and one-line hook

4. **Return top 5.** Format:
   ```
   1. [Title](pages/<slug>.md) — tags — one-line hook
   2. ...
   ```

5. **`--full` flag** — read the top match's page and display it after the
   list. The user can re-run with the desired page selected.

## Promoting a synthesis (Karpathy "file back into the wiki")

If, while answering the user's query, you produce **new** synthesis worth
keeping — a comparison between two prior lessons, a recurring pattern, an
analysis that connects multiple pages — propose promotion at the end:

> The pattern across these three lessons is worth recording on its own.
> Want me to file it via `/lesson-add`?

This implements the Karpathy LLM-Wiki principle that "good answers can be
filed back into the wiki as new pages."

Don't promote trivially. Promote when the answer adds information that wasn't
already in any single page.

## Output discipline

- If zero results, say so explicitly. Do not invent.
- Score is heuristic. If the top match's score is low, say "best guess —
  none of these may apply."
- Keep the result list under 5 entries even if more match. The index is for
  triage, not exhaustive listing.
