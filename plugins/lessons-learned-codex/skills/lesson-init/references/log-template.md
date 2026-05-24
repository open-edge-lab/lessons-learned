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

<!--
Examples (delete once real entries start landing). Domains intentionally mixed
to illustrate that this knowledge base is not software-only.

## [2026-05-19] ingest | VPN audio mute
## [2026-05-20] ingest | Printer duplex jam on heavy paper
## [2026-05-20] supersede | Firmware-side fix supersedes the paper-tray workaround for printer duplex jam
## [2026-05-21] update | VPN audio mute — added Wireshark check
## [2026-06-10] archive | Legacy NAT helper notes (no longer applicable post-migration)
## [2026-06-15] ingest | Procurement approval requires two cost centers above 5k
-->
