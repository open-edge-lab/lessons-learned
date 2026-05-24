import { tool } from "@opencode-ai/plugin"
import { resolveKbRoot } from "../shared.js"

export const lessonSearch = (root: string) =>
  tool({
    description:
      "Search the lessons-learned knowledge base by symptom, category, or tag. Returns the top matching entries from the index.",
    args: {
      query: tool.schema
        .string()
        .describe("Free-form search query matched against categories, tags, and one-line hooks in the index"),
      full: tool.schema
        .boolean()
        .default(false)
        .describe("If true, also read and display the top match's full page"),
    },
    async execute(args) {
      const kbRoot = await resolveKbRoot(root)
      const indexPath = `${root}/${kbRoot}/index.md`

      let indexContent: string
      try {
        indexContent = await Bun.file(indexPath).text()
      } catch {
        return `Knowledge base not found at ${kbRoot}/. Run lesson-init to create it.`
      }

      const queryLower = args.query.toLowerCase()
      const queryTokens = queryLower.split(/\s+/).filter(Boolean)

      const lines = indexContent.split("\n")
      const entries: { line: string; score: number }[] = []

      for (let i = 0; i < lines.length; i++) {
        const trimmed = lines[i].trim()
        if (!trimmed.startsWith("- [")) continue

        const lineLower = trimmed.toLowerCase()
        let score = 0

        for (const token of queryTokens) {
          if (lineLower.includes(token)) {
            score += 1
          }
        }

        if (lineLower.includes(queryLower)) {
          score += 5
        }

        // Walk back from the current line to the nearest "## " category heading.
        const categoryMatch = lines
          .slice(0, i)
          .reverse()
          .find((l) => l.startsWith("## "))
        if (categoryMatch) {
          const cat = categoryMatch.replace("## ", "").toLowerCase()
          if (queryTokens.some((t) => cat.includes(t))) {
            score += 2
          }
        }

        if (score > 0) {
          entries.push({ line: trimmed, score })
        }
      }

      entries.sort((a, b) => b.score - a.score)
      const top = entries.slice(0, 5)

      if (top.length === 0) {
        return `No lessons found matching "${args.query}".`
      }

      let result = `Lessons matching "${args.query}":\n\n`
      for (let i = 0; i < top.length; i++) {
        result += `${i + 1}. ${top[i].line}\n`
      }

      if (args.full) {
        const linkMatch = top[0].line.match(/\((pages\/[^)]+)\)/)
        if (linkMatch) {
          const pagePath = `${root}/${kbRoot}/${linkMatch[1]}`
          try {
            const pageContent = await Bun.file(pagePath).text()
            result += `\n---\n\n${pageContent}`
          } catch {
            result += `\n\n(Could not read page: ${linkMatch[1]})`
          }
        }
      }

      return result
    },
  })
