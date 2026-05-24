---
name: lesson-init
description: Use when the user asks to bootstrap, initialize, or set up the lessons-learned knowledge base in this repo, or to migrate a legacy docs/LESSONS_LEARNED.md flat-file. Idempotent — safe to invoke on already-initialized repos.
metadata:
  short-description: Bootstrap or migrate the lessons-learned knowledge base
---

# Initialize the lessons-learned knowledge base

One-time setup for a repo. Detects existing state and either bootstraps
fresh, migrates a legacy flat-file, or skips with a friendly message.

## Procedure

### Step 1 — Resolve target path

Read `lessons-learned.config.json` (or, for backward compatibility,
`.claude-plugin/lessons-learned.config.json`) if present and pick
`knowledgeBaseRoot`. Otherwise default to `docs/lessons-learned/`. Refer
to this resolved path as `<KB>/` below.

### Step 2 — Detect existing state

| State | Action |
|---|---|
| `<KB>/` already exists | Tell the user; suggest `$lesson-lint` instead. Stop. |
| `docs/LESSONS_LEARNED.md` exists (legacy flat-file) | Go to **migration** (Step 3a). |
| Nothing exists | Go to **bootstrap fresh** (Step 3b). |

### Step 3a — Migration from a legacy flat-file

1. Read `docs/LESSONS_LEARNED.md` end-to-end.
2. Split on `## YYYY-MM-DD —` headings. Each becomes a candidate page.
3. For each section:
   - Extract title from the heading (after the date).
   - Generate filename: `YYYY-MM-DD-<kebab-title>.md`.
   - Translate subsection headings to the canonical schema:
     - `### Sintomo` / `### Symptom` → `## Symptom`
     - `### Root cause` / `### Causa` → `## Root cause`
     - `### Fix` → `## Fix`
     - `### How to recognize it` / `### Riconoscimento` → `## How to recognize it in the future`
     - `### Files` / `### File toccati` / `### Artifacts` → `## Artifacts touched`
   - Infer `categories` and `tags` from content. Ask the user to
     confirm before writing.
   - Frontmatter defaults: `status: active`, empty `supersedes` and
     `related`.
4. Write all pages under `<KB>/pages/` using `references/page-template.md`
   as the skeleton for any field you cannot derive.
5. Generate `<KB>/index.md` from `references/index-template.md`,
   replacing the commented examples with the migrated entries under
   their categories.
6. Generate `<KB>/log.md` from `references/log-template.md`, with one
   entry per migrated page using the form
   `## [YYYY-MM-DD] migrate | <title>`.
7. Generate `<KB>/README.md` from `references/readme-template.md` and
   `<KB>/schema.md` from `references/schema-template.md`.
8. Move the original to `docs/LESSONS_LEARNED.md.archive` (don't delete
   — git history is enough, but the archive is safer).
9. Show the diff. Let the user review before committing.

### Step 3b — Bootstrap fresh

1. Create `<KB>/` directory.
2. Copy `references/readme-template.md` → `<KB>/README.md`.
3. Copy `references/index-template.md` → `<KB>/index.md` (with all empty
   category sections).
4. Copy `references/log-template.md` → `<KB>/log.md`.
5. Copy `references/schema-template.md` → `<KB>/schema.md`.
6. Create `<KB>/pages/` with a `.gitkeep` file so git tracks the empty
   dir.

### Step 4 — AGENTS.md snippet

Prime Codex to use the knowledge base in future sessions by adding a
guidance block to `AGENTS.md` at the repo root.

1. Render `references/agents-md-snippet.md`, substituting every
   `{{KB_PATH}}` placeholder with the actual `<KB>` path resolved in
   Step 1. Strip the leading HTML comment block (it's an editor-only
   notice).

2. **Check for an existing block.** If `AGENTS.md` already contains the
   heading `## Lessons learned knowledge base`, the snippet is installed
   — skip (idempotent).

3. **Propose the change.**
   - If `AGENTS.md` exists, offer to append the rendered block.
     Append-only — never overwrite existing content; ensure a blank line
     separates the new block from what precedes it.
   - If `AGENTS.md` does not exist, offer to create it with the block.
   - Offer "show diff first" and "no, I'll paste it myself" as
     alternatives.

4. **On accept**, write the change with a single edit and confirm:
   `Appended Lessons learned block to AGENTS.md (N lines).`

### Step 5 — Idempotency check

Running `$lesson-init` again on an already-initialized repo must be a
no-op. The detection in Step 2 handles this.

## Output discipline

- For migration, **always** show the planned page splits before writing
  anything. Let the user say "merge these two" or "skip that section".
- Translate Italian subsection headings on a best-effort basis. If a
  section is in a language other than English/Italian, ask the user.
- The archive file (`.archive`) is mandatory — never delete the original
  flat-file outright.
- The AGENTS.md block written in Step 4 is what makes
  `$consulting-lessons` and `$recording-lesson` auto-fire usefully in
  later sessions — make sure it lands.

## References

- `references/{readme,index,log,schema,page}-template.md` —
  knowledge-base templates, verbatim copies of the canonical
  `core/templates/*.md` sources. Write them to disk as-is (substituting
  placeholders only inside `pages/` entries you actually create).
- `references/agents-md-snippet.md` — block to append to AGENTS.md in
  Step 4, with `{{KB_PATH}}` placeholder.
