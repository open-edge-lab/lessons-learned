# Lessons Learned — Log

Append-only chronological record. Newest at the bottom.

Each entry uses the parseable prefix:

```
## [YYYY-MM-DD] <op> | <title>
```

Where `<op>` is one of: `ingest`, `update`, `supersede`, `archive`, `migrate`.

The format is intentionally grep/awk-friendly. Vocabulary follows Karpathy's
"LLM Wiki" convention (https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f).

---

## [2026-05-19] ingest | Marketplace and plugin cannot share the same root
## [2026-05-19] ingest | Hook auto-discovery requires hooks/hooks.json
## [2026-05-19] ingest | Plugin edits require a version bump to reach cache
