---
description: Bootstrap the lessons-learned knowledge base in this repo (or migrate from a legacy flat-file).
---

# /lesson-init

One-time setup for a repo. Detects existing state and either bootstraps fresh,
migrates a legacy flat-file, or skips with a friendly message.

## Procedure

### Step 1 — Resolve target path

Read `.claude-plugin/lessons-learned.config.json` if present and pick
`knowledgeBaseRoot`. Otherwise use `docs/lessons-learned/`.

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

### Step 5 — CLAUDE.md / AGENTS.md snippet

Render `templates/claude-md-snippet.md` substituting `{{KB_PATH}}` with the
actual knowledge base path. Then handle the snippet integration in this order:

1. **Detect target file.** Look at the repo root in this order:
   - `CLAUDE.md` if present
   - `AGENTS.md` if present
   - Neither — fall through to step 4

2. **Check for an existing block.** If the target file already contains a
   heading `## Lessons learned knowledge base`, the snippet is already
   installed. Tell the user and skip (idempotent).

3. **Propose append (preferred path).** Show the rendered snippet inline,
   then ask:

   > Found `<target>` in the repo root. Want me to append this block to it?
   >
   > - **yes** — I append the snippet (preceded by a blank line) at the end
   >   of the file.
   > - **show full file diff first** — I print the planned diff before any
   >   write.
   > - **no, I'll paste it myself** — I just leave the snippet on screen.

4. **No target file present.** Ask:

   > No `CLAUDE.md` or `AGENTS.md` found at the repo root. Want me to
   > create one (defaults to `CLAUDE.md`) containing just this snippet?
   >
   > - **yes, create `CLAUDE.md`**
   > - **yes, create `AGENTS.md`**
   > - **no, leave it to me** — print the snippet on screen and stop.

5. **On accept**, write the change with a single Edit/Write call. Always
   ensure a blank line separates the new block from preceding content.
   Confirm with one line: `Appended Lessons learned block to <target>
   (N lines).`

6. **Never silently overwrite** an existing `CLAUDE.md`/`AGENTS.md`. Append
   only, or refuse and fall back to manual paste.

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
