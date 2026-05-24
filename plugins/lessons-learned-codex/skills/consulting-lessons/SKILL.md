---
name: consulting-lessons
description: Use when the user reports a problem, failure, or unexpected behavior whose causes may span multiple domains or factors (software, hardware, process, integration, concurrency, deployment, organizational). Reads the project's lessons-learned knowledge base before any investigation begins and surfaces relevant prior incidents.
metadata:
  short-description: Surface prior lessons matching the reported symptoms
---

# Consulting prior lessons learned

This skill runs **before** investigation. Its job is to make sure Codex does
not re-derive knowledge that already lives in the repo's lessons-learned
knowledge base.

The knowledge base may cover any domain — software, hardware, process,
decisions, research. Don't assume the problem is software just because the
project is.

## Procedure

1. **Locate the knowledge base.** Resolve the root in this order:
   - Read `lessons-learned.config.json` (or, for backward compatibility,
     `.claude-plugin/lessons-learned.config.json`) if present →
     `knowledgeBaseRoot` field.
   - Otherwise default to `docs/lessons-learned/`.

2. **Silent skip if absent.** If the resolved path does not exist, stop
   here. Do NOT propose `$lesson-init` — that's the user's choice to make
   explicitly.

3. **Read `index.md` only.** This is the cheap step. Do not read individual
   pages yet.

4. **Match symptoms against the index.** Score each entry by:
   - Category match against the suspected problem domain
   - Tag overlap with keywords from the user's report
   - Substring/semantic match against the one-line hook

5. **Read top candidates.** For up to 3 best-scoring entries, read the full
   page from `pages/`.

6. **Surface findings before investigating.** Present a short bullet list:

   > Prior lessons that might apply:
   > - **[Title](path)** — *how to recognize it*: `<the 30-second check>`
   > - **[Title](path)** — *how to recognize it*: `<the 30-second check>`
   >
   > I'll check these first before investigating further. If none apply,
   > we'll continue with a fresh diagnosis.

   Then perform each "how to recognize it" check against the current
   symptoms. Only proceed with fresh investigation if all checks miss.

## When to skip

- The user reports a feature request or pure refactor — not a problem.
- The user asks a comprehension question, not a problem-solving question.
- The symptoms are clearly bounded to a single, trivial unit (single
  file, single component, single step).
- The knowledge base is empty or missing.

## Output discipline

- Stay brief. The surfaced bullet list should fit on screen.
- Quote the "how to recognize it" line verbatim from the page — that's
  the whole point of having a 30-second check.
- Never read more than 3 pages. If none of the top 3 fit, fall back to
  fresh investigation rather than expanding the search.
