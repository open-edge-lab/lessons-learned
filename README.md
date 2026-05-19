# lessons-learned

A Claude Code plugin that maintains a **"lessons learned" knowledge base** in any repo, in the style of [Karpathy's LLM Wiki](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f).

It captures hard-won problem-solving insights — software bugs, but also hardware quirks, process gotchas, non-obvious decisions, research findings — before they evaporate at the end of a session.

Claude can:

- **Consult** prior lessons when investigating a new problem (`consulting-lessons` skill).
- **Record** a new lesson when a non-trivial problem is resolved (`recording-lesson` skill).
- **Search**, **lint**, and **maintain** the knowledge base via slash commands.

The plugin is domain-agnostic. Software is a first-class use case, but the same machinery works for any project where non-trivial problem-solving knowledge accumulates.

---

## Install

Inside Claude Code, add this repo as a plugin marketplace and install the plugin:

```text
/plugin marketplace add open-edge/lessons-learned
/plugin install lessons-learned@lessons-learned-local
/reload-plugins
```

If you prefer a local clone (useful for hacking on the plugin), point the marketplace at the clone directory instead:

```text
/plugin marketplace add <path-to-cloned-repo>
/plugin install lessons-learned@lessons-learned-local
/reload-plugins
```

`<path-to-cloned-repo>` is the absolute path to the repo root (the directory that contains `.claude-plugin/`).

Then, in any repo where you want a knowledge base:

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

For full command reference, configuration, and design notes, see the plugin README at [`plugins/lessons-learned/README.md`](plugins/lessons-learned/README.md).

---

## Repo layout

```
.
├── .claude-plugin/
│   └── marketplace.json          # marketplace manifest (this repo as a marketplace)
├── plugins/
│   └── lessons-learned/          # the plugin itself
│       ├── .claude-plugin/plugin.json
│       ├── commands/             # /lesson-init, /lesson-add, /lesson-search, /lesson-lint
│       ├── skills/               # consulting-lessons, recording-lesson
│       ├── hooks/                # pre-commit reminder
│       ├── templates/            # files produced by /lesson-init
│       └── README.md             # full plugin documentation
└── docs/
    └── lessons-learned/          # dogfood: this repo's own knowledge base
```

The marketplace and the plugin live in **separate roots** on purpose — see [`docs/lessons-learned/pages/2026-05-19-marketplace-plugin-not-in-same-root.md`](docs/lessons-learned/pages/2026-05-19-marketplace-plugin-not-in-same-root.md) for the reason.

---

## License

[MIT](LICENSE).
