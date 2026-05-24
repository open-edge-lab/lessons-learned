---
title: {{title}}
date: {{YYYY-MM-DD}}
categories: [{{category-1}}, {{category-2}}]
tags: [{{tag-1}}, {{tag-2}}, {{tag-3}}]
status: active            # active | superseded | archived
supersedes: []            # list of page filenames this lesson replaces
related: []               # list of page filenames cross-referenced
---

# {{title}}

## Symptom

What was observed. Be specific enough that someone hitting the same problem
recognizes it. For software: exact log lines, error messages, or commands. For
other domains: concrete signals, behaviors, or observations that pinpoint the
situation.

## Root cause

Why it happened. If cross-domain or multi-factor, enumerate each domain/factor
and how they interacted. Distinguish *what actually happened* from *what was
expected*.

## Fix

What was changed (or decided, or done), in what order, with concrete references
(file paths for code, part numbers for hardware, links for external sources,
etc.). Include the *order* if it matters (e.g., "address factor 1 first, the
others may not be needed after that").

## How to recognize it in the future

The 30-second check that points to this lesson. The single log line, the single
config field, the single command to run. Optimized for the next person (or the
next agent session) who sees a similar symptom.

## Artifacts touched

- path/to/file.ext, part #, URL, document, etc. — what changed and why

## Related lessons

- [Other lesson title](2026-MM-DD-other-slug.md) — one-line relationship

<!--
Cross-references use standard Markdown links: [text](filename.md). Filenames are
relative to this `pages/` folder. The `related:` frontmatter array should mirror
the links in this section.
-->
