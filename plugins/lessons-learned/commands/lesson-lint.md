---
description: Maintenance pass over the lessons-learned knowledge base. Detects broken cross-refs, orphans, stale index, and (with --deep) contradictions.
argument-hint: "[--fix] [--deep]"
---

# /lesson-lint

Health check for the knowledge base. Prints a Markdown report; does not save it.

## Arguments

- `--fix` — apply **safe** fixes automatically: regenerate `index.md` from
  page frontmatter, remove dead cross-references, propagate `status:
  superseded` when a newer page declares `supersedes: [...]`. Unsafe fixes
  (merging suspected duplicates, resolving contradictions) are **always**
  proposed, never auto-applied.
- `--deep` — enable LLM-based contradiction detection between pages with
  overlapping symptoms but divergent fixes. Costs more — opt-in only.

## Checks performed

| # | Check | Severity | Safe to auto-fix? |
|---|---|---|---|
| 1 | **Broken cross-references** — `related:` frontmatter pointing to a non-existent file; Markdown links to a non-existent page | error | yes (remove) |
| 2 | **Orphan pages** — file in `pages/` not listed in `index.md` | warning | yes (insert) |
| 3 | **Stale index** — `index.md` lists a page that no longer exists in `pages/` | error | yes (remove) |
| 4 | **Superseded but still active** — page A says `supersedes: [B]` but B's `status` is `active` | warning | yes (set B to `superseded`) |
| 5 | **Tag/category drift** — tags appearing in only 1 page (likely typo), categories not declared in `schema.md` | warning | no (human review) |
| 6 | **Duplicate suspicion** — pages with ≥3 tags in common and similar symptom keywords | warning | no (flag) |
| 7 | **Frontmatter validity** — missing required fields, invalid `status`, malformed `date` | error | no (flag with location) |
| 8 | **Contradictions** *(--deep only)* — pages with symptom overlap but divergent fixes; possible knowledge conflict | warning | no (flag for human) |

## Procedure

1. **Locate the knowledge base.** Resolve as in other commands. If absent →
   suggest `/lesson-init` and stop.

2. **Enumerate pages.** Read all `pages/*.md`. Parse frontmatter.

3. **Build maps.**
   - `slug → frontmatter` for every page
   - `tag → [slugs using it]`
   - Set of categories declared in `schema.md`
   - Set of slugs referenced in `index.md`

4. **Run checks 1–7.** Collect findings per check.

5. **Run check 8** only if `--deep` was passed. Compare each pair of pages
   with ≥1 shared tag for symptom/fix divergence.

6. **Emit report.** Markdown structure:

   ```
   # Lessons learned — lint report

   ## Summary
   - errors: N
   - warnings: N
   - pages scanned: N

   ## Errors
   ### Broken cross-references
   - `pages/foo.md` → links to `bar.md` (not found)
   ...

   ## Warnings
   ...
   ```

7. **Apply `--fix` if requested.** Only the rows marked "safe" in the table
   above. Print exactly what was changed. Refuse to apply unsafe fixes even
   if `--fix` is set.

## Output discipline

- The report is never saved to a file. It's session output.
- `--fix` and `--deep` are independent.
- When in doubt, classify as warning (not error). Errors are reserved for
  things that break the knowledge base's structural invariants.
- Always print a one-line "OK" summary at the end if all checks passed.
