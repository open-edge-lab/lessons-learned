---
description: Bootstrap the lessons-learned knowledge base in this repo (or migrate from a legacy flat-file).
---

# /lesson-init

One-time setup for a repo. Detects existing state and either bootstraps fresh,
migrates a legacy flat-file, or skips with a friendly message.

## Procedure

### Step 1 — Resolve target path

Read `lessons-learned.config.json` (or `.claude-plugin/lessons-learned.config.json`)
if present and pick `knowledgeBaseRoot`. Otherwise use `docs/lessons-learned/`.

### Step 2 — Detect existing state

| State | Action |
|---|---|
| `<KB>/` already exists | Tell the user; suggest `/lesson-lint` instead. Stop. |
| `docs/LESSONS_LEARNED.md` exists (legacy flat-file) | Go to **migration**. |
| Nothing exists | Go to **bootstrap fresh**. |

### Step 3a — Migration from legacy flat-file

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
   - Infer `categories` and `tags` from content. Ask the user to confirm
     before writing.
   - Frontmatter defaults: `status: active`, empty `supersedes` and `related`.
4. Write all pages under `<KB>/pages/`.
5. Generate `<KB>/index.md` by categorizing the migrated entries.
6. Generate `<KB>/log.md` with one entry per migrated page:
   ```
   ## [YYYY-MM-DD] migrate | <title>
   ```
7. Generate `<KB>/README.md` and `<KB>/schema.md` from `templates/readme.md`
   and `templates/schema.md`.
8. Move the original to `docs/LESSONS_LEARNED.md.archive` (don't delete — git
   history is enough, but the archive is safer).
9. Show the diff. Let the user review before committing.

### Step 3b — Bootstrap fresh

1. Create `<KB>/` directory.
2. Copy `templates/readme.md` → `<KB>/README.md`.
3. Copy `templates/index.md` → `<KB>/index.md` (with all empty category
   sections).
4. Copy `templates/log.md` → `<KB>/log.md`.
5. Copy `templates/schema.md` → `<KB>/schema.md`.
6. Create `<KB>/pages/` with a `.gitkeep` file so git tracks the empty dir.

### Step 4 — Memory integration (opt-in)

If `memoryIntegration` is true (default) **or** the user explicitly opts in:

1. Identify the current Claude Code memory directory for this project
   (`~/.claude/projects/<encoded-cwd>/memory/`).
2. Render `templates/memory-reference.md` with `{{KB_PATH}}` replaced by the
   actual path, and write it to
   `<memory-dir>/reference_lessons_learned.md`.
3. Append a line to `<memory-dir>/MEMORY.md`:
   ```
   - [Lessons Learned reference](reference_lessons_learned.md) — knowledge base at <path>, plugin-managed
   ```
   (Create `MEMORY.md` if it doesn't exist.)

### Step 5 — CLAUDE.md snippet

Prime Claude Code to use the knowledge base by adding a block to `CLAUDE.md`.

1. Render `templates/claude-md-snippet.md`, substituting `{{KB_PATH}}` with the
   actual knowledge base path.

2. **Check for an existing block.** If `CLAUDE.md` already contains a heading
   `## Lessons learned knowledge base`, the snippet is installed — skip
   (idempotent).

3. **Propose the change.**
   - If `CLAUDE.md` exists, offer to append the rendered block. Append-only —
     never overwrite existing content; ensure a blank line separates the new
     block from what precedes it.
   - If `CLAUDE.md` does not exist, offer to create it with the block.
   - Offer "show diff first" and "no, I'll paste it myself" as alternatives.

4. **On accept**, write the change with a single Edit/Write call and confirm:
   `Appended Lessons learned block to CLAUDE.md (N lines).`

### Step 6 — Idempotency check

Running `/lesson-init` again on an already-initialized repo must be a no-op.
The detection in Step 2 handles this.

## Output discipline

- For migration, **always** show the planned page splits before writing
  anything. Let the user say "merge these two" or "skip that section".
- Translate Italian subsection headings on a best-effort basis. If a section
  is in a language other than English/Italian, ask the user.
- The archive file (`.archive`) is mandatory — never delete the original
  flat-file outright.
