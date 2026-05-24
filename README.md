# lessons-learned

A **"lessons learned" knowledge base** for any repo, in the style of
[Karpathy's LLM Wiki](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f) —
it captures hard-won problem-solving insights (software bugs, hardware quirks,
process gotchas, non-obvious decisions, research findings) before they evaporate
at the end of a session.

The knowledge base is plain markdown under `docs/lessons-learned/`. It is created
and maintained by a **native plugin** for your AI coding tool:

| Plugin | Tool | Location |
|---|---|---|
| `lessons-learned` | Claude Code | [`plugins/lessons-learned/`](plugins/lessons-learned/) |
| `lessons-learned-opencode` | opencode | [`plugins/lessons-learned-opencode/`](plugins/lessons-learned-opencode/) |

Both plugins read and write the same on-disk format, so a repo's
`docs/lessons-learned/` can be used from either tool. Support for additional
CLIs is added the same way — one native plugin per tool, under `plugins/`.

---

## What it does

- **Consult** — before investigating a non-trivial problem, surface prior
  lessons that match the symptoms.
- **Record** — after a non-trivial resolution (cross-domain, multi-factor, or
  non-obvious diagnosis), capture it as a new page.
- **Search & lint** — query the index and health-check the knowledge base.

Software is a first-class use case, but the machinery is domain-agnostic.

---

## Install

### Claude Code

This repo doubles as a Claude Code plugin marketplace
(`.claude-plugin/marketplace.json` at the root):

```text
/plugin marketplace add open-edge-lab/lessons-learned
/plugin install lessons-learned@lessons-learned-oe
/reload-plugins
```

Then, in any repo: `/lesson-init`. See
[`plugins/lessons-learned/README.md`](plugins/lessons-learned/README.md) for
commands, configuration, and design notes.

### opencode

Add the plugin to your `opencode.json`:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": ["lessons-learned-opencode"]
}
```

Then ask the agent to run `lesson-init`. See
[`plugins/lessons-learned-opencode/README.md`](plugins/lessons-learned-opencode/README.md)
for details.

---

## Repo layout

```
.
├── .claude-plugin/
│   └── marketplace.json          # Claude Code marketplace manifest
├── core/                         # single source of truth (dev only — not shipped)
│   ├── templates/                # knowledge-base templates: index, log, schema, readme, page
│   └── config-schema.json        # config JSON schema
├── scripts/
│   └── sync-core.mjs             # regenerates each plugin's artifacts from core/
├── plugins/
│   ├── lessons-learned/          # Claude Code native plugin (commands, skills, hooks)
│   └── lessons-learned-opencode/ # opencode native plugin (TypeScript tools)
└── docs/
    └── lessons-learned/          # dogfood: this repo's own knowledge base
```

The marketplace manifest and the Claude Code plugin live in **separate roots**
on purpose — see
[`docs/lessons-learned/pages/2026-05-19-marketplace-plugin-not-in-same-root.md`](docs/lessons-learned/pages/2026-05-19-marketplace-plugin-not-in-same-root.md).

---

## Configuration

Optional, per repo. Place `lessons-learned.config.json` in the repo root (or
`.claude-plugin/lessons-learned.config.json` for backward compatibility). Both
plugins read it. Schema and defaults: [`core/config-schema.json`](core/config-schema.json).

---

## Contributing

The knowledge-base templates and config schema are owned by **`core/`** — the
single source of truth. Each plugin needs its own copy in a tool-specific form
(committed markdown files for Claude Code, an inlined TypeScript module for
opencode), so `scripts/sync-core.mjs` generates them:

```sh
node scripts/sync-core.mjs           # regenerate plugin artifacts from core/
node scripts/sync-core.mjs --check   # CI: fail if any artifact is stale
```

Edit `core/`, never the generated copies, then run the sync script and commit.
To add a plugin for a new CLI: create `plugins/lessons-learned-<tool>/`, consume
`core/`, and extend `sync-core.mjs` if the tool needs a new artifact form.

---

## License

[MIT](LICENSE).
