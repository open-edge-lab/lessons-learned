# lessons-learned

A Claude Code plugin that maintains a **"lessons learned" knowledge base** in any repo, in the style of [Karpathy's LLM Wiki](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f).

It captures hard-won problem-solving insights — software bugs, but also hardware quirks, process gotchas, non-obvious decisions, research findings — before they evaporate at the end of a session.

The plugin lets Claude:

- **Consult** prior lessons when investigating a new problem (`consulting-lessons` skill).
- **Record** a new lesson when a non-trivial resolution lands (`recording-lesson` skill).
- **Search**, **lint**, and **maintain** the knowledge base via slash commands.

Software is a first-class use case, but the machinery is domain-agnostic.

---

## Install

This repo doubles as a Claude Code plugin marketplace (`.claude-plugin/marketplace.json` at the root). Inside Claude Code:

```text
/plugin marketplace add open-edge/lessons-learned
/plugin install lessons-learned@lessons-learned-local
/reload-plugins
```

For local development, clone the repo and point the marketplace at the clone:

```text
/plugin marketplace add <path-to-cloned-repo>
/plugin install lessons-learned@lessons-learned-local
/reload-plugins
```

`<path-to-cloned-repo>` is the absolute path to the directory containing this
README's parent's parent (i.e. the repo root that holds `.claude-plugin/`).

Then in any repo where you want a knowledge base:

```text
/lesson-init
```

This bootstraps `docs/lessons-learned/` (or migrates an existing flat-file `docs/LESSONS_LEARNED.md`).

---

## Quick start

| You do | Claude does |
|---|---|
| Report a problem ("the printer keeps jamming on duplex jobs") | `consulting-lessons` auto-fires, surfaces matching prior lessons before investigating |
| Finish a non-trivial multi-factor resolution | `recording-lesson` auto-fires, proposes recording it |
| `/lesson-search <query>` | Returns top-5 matches from the index |
| `/lesson-add` | Manually record an entry (bypasses inclusion criteria) |
| `/lesson-lint` | Maintenance pass over the knowledge base |

---

## Commands

| Command | What it does |
|---|---|
| `/lesson-init` | One-time bootstrap; detects and migrates legacy `docs/LESSONS_LEARNED.md` |
| `/lesson-add [title]` | Manual ingest, no criteria check |
| `/lesson-search <query> [--full]` | Score-based search over `index.md`; `--full` to read the matched page |
| `/lesson-lint [--fix] [--deep]` | Health checks (orphans, broken refs, stale, etc.); `--fix` safe fixes; `--deep` LLM contradictions check |

---

## Configuration

Drop `.claude-plugin/lessons-learned.config.json` in your repo. All fields are optional.

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
  "preCommitHook": true,
  "memoryIntegration": true,
  "autoCrossReference": true
}
```

Schema lives at `config-schema.json` at the plugin root.

---

## How it works

The plugin maps [Karpathy's LLM Wiki](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f) three layers and three operations onto Claude Code primitives.

**Three layers:**
- **Wiki** — `pages/*.md`, one lesson per file, owned by the LLM.
- **Schema** — `schema.md` inside the knowledge base, plus an optional snippet in your `CLAUDE.md`. Defines categories and inclusion criteria for this repo.
- **Raw sources** — *intentionally absent on disk*. For the lessons-learned domain, raw sources are the transient session itself (conversation, diff, log excerpts, notes) rather than curated persistent documents. This is a deliberate adaptation of the Karpathy pattern to a session-driven domain.

**Three operations:**
- **Ingest** — `recording-lesson` skill + `/lesson-add` command. Writes a new page, updates `index.md`, appends to `log.md`, proposes bidirectional cross-references.
- **Query** — `consulting-lessons` skill + `/lesson-search` command. Reads `index.md` first (cheap), reads top-N pages only when promising. If a query produces a new synthesis worth keeping, the search command suggests promoting it via `/lesson-add`.
- **Lint** — `/lesson-lint` command. Detects orphans, broken cross-refs, stale index, superseded-still-active, tag drift, duplicates, and (with `--deep`) contradictions between pages.

**Log format** follows Karpathy's parseable convention:

```
## [2026-05-19] ingest | Printer duplex jam
## [2026-05-20] supersede | Firmware-side fix supersedes the paper-tray workaround
```

Operations: `ingest`, `update`, `supersede`, `archive`, `migrate`.

---

## Per-repo layout (what `/lesson-init` creates)

```
docs/lessons-learned/
├── README.md         # human entry point
├── index.md          # categorized catalog, LLM-maintained
├── log.md            # append-only chronological log
├── schema.md         # categories + inclusion criteria for THIS repo
└── pages/
    └── YYYY-MM-DD-kebab-title.md
```

---

## Limitations

- **Hook portability** — the `pre-commit-reminder` hook uses a bash + `jq` + `git` snippet. On Windows you need Git Bash in `PATH`. A PowerShell-native fallback is not yet shipped.
- **English only** — templates are English. Multi-language is out of scope for v0.1.x.
- **No database/search backend** — everything is markdown + grep + Read. Scales fine into the low hundreds of pages.
- **`--deep` lint is LLM-cost-sensitive** — it compares pages pairwise. Cache and gate behind explicit flag.

