# lessons-learned-codex

An [OpenAI Codex CLI](https://github.com/openai/codex) plugin for the
**lessons-learned knowledge base** — a
[Karpathy-LLM-Wiki](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f)-style
store of problem-solving insights kept in any repo.

It is the Codex counterpart of the `lessons-learned` Claude Code plugin
and the `lessons-learned-opencode` opencode plugin in the same
repository. All three operate on the same on-disk format
(`docs/lessons-learned/`), so a repo's knowledge base can be used from
any of the supported tools.

## What it provides

Six Codex **skills** — Codex CLI 0.114 and later loads skills from
`~/.codex/skills/<name>/` and exposes them both **implicitly**
(auto-fired when the task description matches the skill's `description:`
frontmatter) and **explicitly** (via `$skill-name`):

| Skill | Fires when | Equivalent in other plugins |
|---|---|---|
| `consulting-lessons` | User reports a non-trivial problem | Same name in Claude Code |
| `recording-lesson` | A non-trivial multi-factor resolution lands | Same name in Claude Code |
| `lesson-init` | User asks to set up / bootstrap the KB | `/lesson-init` slash command |
| `lesson-search` | User asks to search prior lessons | `/lesson-search` slash command |
| `lesson-add` | User asks to manually record a lesson | `/lesson-add` slash command |
| `lesson-lint` | User asks to health-check the KB | `/lesson-lint` slash command |

`consulting-lessons` and `recording-lesson` rely on implicit invocation
(Codex sees them in the skills list and decides when to fire). The four
action skills can be invoked either way — `$lesson-init` works the same
as "please set up the lessons-learned knowledge base in this repo".

## Install

```sh
git clone https://github.com/open-edge-lab/lessons-learned
cd lessons-learned

# Generate the per-skill references/ from core/ templates (one-time).
node scripts/sync-core.mjs

# Install the six skills into ~/.codex/skills/.
plugins/lessons-learned-codex/install.sh           # macOS / Linux
plugins/lessons-learned-codex/install.ps1          # Windows PowerShell
```

Both install scripts default to symlinks (so edits in the clone are
picked up immediately) and fall back to recursive copies if symlinks
fail (common on Windows without Developer Mode). Use `--copy`
(`-Copy` on PowerShell) to force copies, `--uninstall` (`-Uninstall`)
to remove.

**Restart any open `codex` session** after install so the skill
metadata is reloaded.

Then, in any repo:

```text
codex
$lesson-init
```

You can also let Codex's `$skill-installer` system skill pull this repo
directly:

```text
codex
$skill-installer install plugins/lessons-learned-codex/skills/lesson-init
  from open-edge-lab/lessons-learned
```

(repeat for the other five — or pass multiple `--path` values; see
`$skill-installer` for syntax.)

## Quick start

| You do | What happens |
|---|---|
| `$lesson-init` (once per repo) | Creates `docs/lessons-learned/` and primes `AGENTS.md` |
| Report a non-trivial problem | `consulting-lessons` auto-fires, surfaces matching prior lessons |
| Finish a non-trivial multi-factor resolution | `recording-lesson` auto-fires, proposes recording it |
| `$lesson-search <query>` | Returns top-5 matches from the index |
| `$lesson-add [title]` | Records a new lesson (no inclusion-criteria gate — you opted in) |
| `$lesson-lint` | Maintenance pass |

## Configuration

Optional. Place `lessons-learned.config.json` in your repo root (or
`.claude-plugin/lessons-learned.config.json` for backward
compatibility). The config is shared with the other two plugins; the
schema lives at [`config-schema.json`](config-schema.json) (a copy of
[`../../core/config-schema.json`](../../core/config-schema.json)).

```json
{
  "knowledgeBaseRoot": "docs/lessons-learned",
  "language": "en",
  "categories": ["software", "hardware", "process", "decision", "research", "other"],
  "inclusionCriteria": {
    "minDomains": 2,
    "minFactors": 2,
    "requireNonObviousDiagnosis": false
  },
  "autoCrossReference": true
}
```

The `preCommitHook` and `memoryIntegration` fields apply only to the
Claude Code plugin and are silently ignored by the Codex skills.

## How it works

Each skill is a self-contained directory:

```
skills/<skill-name>/
├── SKILL.md           # YAML frontmatter (name, description) + body instructions
├── agents/
│   └── openai.yaml    # UI metadata (display_name, short_description, default_prompt)
└── references/        # only for skills that need templates
    └── *-template.md  # copied verbatim from core/templates/ by sync-core.mjs
```

Codex loads every skill's metadata at session start; the body of a
skill is loaded only after the skill fires (either implicitly via
`description:` match, or explicitly via `$skill-name`). The
`references/` files inside each skill are loaded on demand when the
SKILL.md body instructs the agent to read them — keeping context lean.

The knowledge-base templates for `lesson-init`, `lesson-add`, and
`recording-lesson` are **generated** into each skill's `references/`
dir by `scripts/sync-core.mjs`. The single source of truth lives at
`core/templates/*.md`.

## Parity with the other plugins

The Codex skills mirror the Claude Code plugin almost feature-for-feature
because both tools use the same SKILL.md format. Differences worth
calling out:

- **No pre-commit hook.** Codex has no hook system equivalent to Claude
  Code's `PreToolUse`. The post-commit "did you mean to record a
  lesson?" nudge is unavailable.
- **No memory integration.** Codex has no per-project memory directory
  analogous to `~/.claude/projects/<encoded-cwd>/memory/`. The
  `AGENTS.md` block written by `$lesson-init` is the only persistent
  prime.
- **No CLAUDE.md.** Codex reads `AGENTS.md` (cascading from
  `~/.codex/AGENTS.md` to the repo root to subdirectories).
- **Slash commands → skills.** What were `/lesson-init`,
  `/lesson-search`, `/lesson-add`, `/lesson-lint` in Claude Code are
  skills here. Invoked as `$lesson-init`, etc., or implicitly when the
  request matches the skill's description.
- **No `agents/openai.yaml` UI assets shipped.** The skills declare
  `display_name`, `short_description`, and `default_prompt`, but
  `icon_small`/`icon_large` are omitted — add them in the cloned repo
  if you want custom chips in the Codex UI.

## Note for contributors

The per-skill `references/*.md` and `config-schema.json` are
**generated** by `scripts/sync-core.mjs` at the repo root. Edit
`core/templates/*` (single source of truth), then run:

```sh
node scripts/sync-core.mjs           # regenerate
node scripts/sync-core.mjs --check   # CI: fail if any artifact is stale
```

Do **not** edit `references/*-template.md` or `config-schema.json` by
hand — they will be overwritten. The `agents-md-snippet.md` inside
`skills/lesson-init/references/` is hand-authored and lives in the
plugin (not in `core/`) because it's Codex-specific.

## License

[MIT](../../LICENSE).
