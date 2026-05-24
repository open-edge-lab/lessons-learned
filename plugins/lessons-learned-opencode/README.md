# lessons-learned-opencode

An [opencode](https://opencode.ai) plugin for the **lessons-learned knowledge
base** — a [Karpathy-LLM-Wiki](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f)-style
store of problem-solving insights kept in any repo.

It is the opencode counterpart of the `lessons-learned` Claude Code plugin in
the same repository. Both operate on the same on-disk format
(`docs/lessons-learned/`), so a repo's knowledge base can be used from either
tool.

## What it provides

Four custom tools the agent can call:

| Tool | Purpose |
|---|---|
| `lesson-init` | Bootstrap the knowledge base (`index.md`, `log.md`, `schema.md`, `README.md`, `pages/`) and wire a guidance block into `AGENTS.md`. Idempotent. |
| `lesson-search` | Score-based search over `index.md` by symptom, category, or tag. Pass `full: true` to also return the top match's page. |
| `lesson-add` | Record a new lesson — writes a page, updates the index, appends to the log. |
| `lesson-lint` | Read-only health check: broken cross-refs, orphan pages, stale index, status inconsistencies. |

The plugin does **not** inject instructions into the system prompt —
`@opencode-ai/plugin` v0.15 exposes no hook for that. Instead, `lesson-init`
writes a short `## Lessons learned knowledge base` section into the repo's
`AGENTS.md` (which opencode reads as a rules file), telling the agent when to
use the tools.

## Install

Add the plugin to your `opencode.json`:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": ["lessons-learned-opencode"]
}
```

Or, from a local clone of this repo (run `bun run build` in this directory
first):

```json
{
  "plugin": ["./path/to/lessons-learned/plugins/lessons-learned-opencode"]
}
```

Then, in any repo, ask the agent to run `lesson-init` once.

## Configuration

Optional. Place `lessons-learned.config.json` in the repo root (or
`.claude-plugin/lessons-learned.config.json` for backward compatibility) to
override defaults — currently `knowledgeBaseRoot` (default
`docs/lessons-learned`). The config is shared with the Claude Code plugin; the
schema lives at [`../../core/config-schema.json`](../../core/config-schema.json).

## Development

```sh
bun install
bun run sync-core   # regenerate src/generated/templates.ts from core/
bun run typecheck   # tsc --noEmit
bun run build       # sync-core + .d.ts declarations + bundle to dist/
```

The knowledge-base templates this plugin writes are owned by `core/` at the repo
root; `src/generated/templates.ts` is generated from them by
`scripts/sync-core.mjs` (do not edit it by hand). `bun run build` runs the sync,
then produces `dist/index.js` (the bundle `package.json` `main` points at) plus
`.d.ts` declarations. `npm publish` runs the build automatically via
`prepublishOnly`.

## Parity with the Claude Code plugin

The opencode tools cover the core consult / record / lint flow. A few Claude
Code features are intentionally not ported:

- No `--deep` contradiction check in `lesson-lint`.
- No legacy `docs/LESSONS_LEARNED.md` migration in `lesson-init`.
- No pre-commit reminder hook.

## License

MIT.
