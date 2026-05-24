---
name: lesson-search
description: Use when the user asks to search, look up, or find prior lessons in the lessons-learned knowledge base by symptom, category, or tag. Reads index.md first (cheap), optionally reads the top page in full.
metadata:
  short-description: Search prior lessons by symptom, category, or tag
---

# Search the lessons-learned knowledge base

Find prior lessons that match a query. Reads `index.md` first (cheap),
then optionally reads matched pages.

The user's query is the rest of their message after invoking the skill
(e.g., `$lesson-search vpn audio mute` → query is `vpn audio mute`). If
they ask for the "full page" or pass `--full`, also display the top
match's full page inline.

## Procedure

1. **Locate the knowledge base.** Resolve in this order:
   - Read `lessons-learned.config.json` (or
     `.claude-plugin/lessons-learned.config.json`) if present →
     `knowledgeBaseRoot` field.
   - Otherwise default to `docs/lessons-learned/`.

   If the resolved path does not exist, tell the user and suggest
   running `$lesson-init`. Stop.

2. **Read `<KB>/index.md`.** Don't read individual pages yet.

3. **Score entries against the query.** For each catalog line, combine:
   - Category match (boost if the query mentions a category name)
   - Tag overlap (count of query tokens that appear in the entry's tags)
   - Substring / semantic match against the entry's title and one-line
     hook

4. **Return top 5.** Format:

   ```
   1. [Title](pages/<slug>.md) — tags — one-line hook
   2. ...
   ```

5. **Full-page expansion** — if the user asked for full content, read
   the top match's page and display it after the list. The user can
   re-run with the desired page selected if they want a different one
   expanded.

## Promoting a synthesis (Karpathy "file back into the wiki")

If, while answering the user's query, you produce **new** synthesis
worth keeping — a comparison between two prior lessons, a recurring
pattern, an analysis that connects multiple pages — propose promotion at
the end:

> The pattern across these three lessons is worth recording on its own.
> Want me to file it via `$lesson-add`?

This implements the Karpathy LLM-Wiki principle that "good answers can
be filed back into the wiki as new pages."

Don't promote trivially. Promote when the answer adds information that
wasn't already in any single page.

## Output discipline

- If zero results, say so explicitly. Do not invent.
- Score is heuristic. If the top match's score is low, say
  "best guess — none of these may apply."
- Keep the result list under 5 entries even if more match. The index is
  for triage, not exhaustive listing.
