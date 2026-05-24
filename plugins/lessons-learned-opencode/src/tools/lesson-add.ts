import { tool } from "@opencode-ai/plugin"
import { resolveKbRoot } from "../shared.js"

export const lessonAdd = (root: string) =>
  tool({
    description:
      "Record a new lesson in the knowledge base. Writes a page, updates the index, and appends to the log. Bypasses inclusion criteria — use when you want to capture something the automatic flow would skip.",
    args: {
      title: tool.schema
        .string()
        .describe("Concise, symptom-oriented title (e.g., 'Printer duplex jam')"),
      categories: tool.schema
        .array(tool.schema.string())
        .describe("Categories from schema.md (e.g., ['software', 'hardware'])"),
      tags: tool.schema.array(tool.schema.string()).describe("3-5 keywords useful for search"),
      symptom: tool.schema
        .string()
        .describe("What was observed — exact log lines, error messages, signals, behaviors"),
      rootCause: tool.schema
        .string()
        .describe("Why it happened — per-domain/factor breakdown if cross-domain or multi-factor"),
      fix: tool.schema
        .string()
        .describe("What was changed, in what order, with concrete references (file paths, URLs, etc.)"),
      howToRecognize: tool.schema
        .string()
        .describe("The single 30-second check that points to this lesson"),
      artifactsTouched: tool.schema
        .string()
        .describe("Files, parts, URLs, documents that changed — one per line"),
    },
    async execute(args) {
      const kbRoot = await resolveKbRoot(root)
      const kbDir = `${root}/${kbRoot}`

      const kbExists = await Bun.file(`${kbDir}/index.md`).exists()
      if (!kbExists) {
        return `Knowledge base not found at ${kbRoot}/. Run lesson-init to create it.`
      }

      const today = new Date().toISOString().slice(0, 10)
      const slug = args.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
      const filename = `${today}-${slug}.md`
      const pagePath = `${kbDir}/pages/${filename}`

      const categoriesStr = args.categories.join(", ")
      const tagsStr = args.tags.join(", ")
      const artifactsList = args.artifactsTouched
        .split("\n")
        .map((a) => a.trim())
        .filter(Boolean)
        .map((a) => `- ${a}`)
        .join("\n")

      const pageContent = `---
title: ${args.title}
date: ${today}
categories: [${categoriesStr}]
tags: [${tagsStr}]
status: active
supersedes: []
related: []
---

# ${args.title}

## Symptom

${args.symptom}

## Root cause

${args.rootCause}

## Fix

${args.fix}

## How to recognize it in the future

${args.howToRecognize}

## Artifacts touched

${artifactsList}

## Related lessons

<!-- Add bidirectional cross-references to related pages here. -->
`

      await Bun.write(pagePath, pageContent)

      const indexContent = await Bun.file(`${kbDir}/index.md`).text()
      const hook = args.howToRecognize.split("\n")[0].substring(0, 120)
      const indexLine = `- [${args.title}](pages/${filename}) — ${args.tags.join(", ")} — ${hook}`

      const indexLines = indexContent.split("\n")

      // Insert `entry` right after the first line whose trimmed text matches one
      // of `headings`. Returns null if no heading matched.
      const insertUnder = (headings: string[], entry: string): string[] | null => {
        const out: string[] = []
        let inserted = false
        for (const line of indexLines) {
          out.push(line)
          if (!inserted && headings.includes(line.trim())) {
            out.push(entry)
            inserted = true
          }
        }
        return inserted ? out : null
      }

      const newLines =
        // Prefer a section matching one of the lesson's categories.
        insertUnder(
          args.categories.map((c) => `## ${c}`),
          indexLine,
        ) ??
        // Fall back to the existing "## other" section.
        insertUnder(["## other"], indexLine) ??
        // No "## other" section either — append one.
        [...indexLines, "", "## other", indexLine]

      await Bun.write(`${kbDir}/index.md`, newLines.join("\n"))

      const logEntry = `\n## [${today}] ingest | ${args.title}\n`
      const logContent = await Bun.file(`${kbDir}/log.md`).text()
      await Bun.write(`${kbDir}/log.md`, logContent + logEntry)

      return `Lesson recorded:

- Page: ${kbRoot}/pages/${filename}
- Index: ${kbRoot}/index.md updated under ${args.categories[0] || "other"}
- Log: ${kbRoot}/log.md appended

Title: ${args.title}
Categories: ${categoriesStr}
Tags: ${tagsStr}

Consider adding bidirectional \`related:\` cross-references between this page and
any related lessons.`
    },
  })
