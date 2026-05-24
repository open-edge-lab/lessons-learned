import { tool } from "@opencode-ai/plugin"
import { resolveKbRoot } from "../shared.js"

export const lessonLint = (root: string) =>
  tool({
    description:
      "Health check for the lessons-learned knowledge base. Detects broken cross-refs, orphan pages, stale index, and status inconsistencies. Read-only — reports issues without modifying any files.",
    args: {},
    async execute() {
      const kbRoot = await resolveKbRoot(root)
      const kbDir = `${root}/${kbRoot}`
      const pagesDir = `${kbDir}/pages`

      const kbExists = await Bun.file(`${kbDir}/index.md`).exists()
      if (!kbExists) {
        return `Knowledge base not found at ${kbRoot}/. Run lesson-init to create it.`
      }

      const errors: string[] = []
      const warnings: string[] = []

      const pageFiles = new Set<string>()
      try {
        const dir = await Array.fromAsync(new Bun.Glob("*.md").scan({ cwd: pagesDir }))
        for (const f of dir) {
          pageFiles.add(f)
        }
      } catch {
        errors.push("pages/ directory not found or not readable")
      }

      const pageFrontmatter = new Map<string, Record<string, unknown>>()
      for (const file of pageFiles) {
        try {
          const content = await Bun.file(`${pagesDir}/${file}`).text()
          const fmMatch = content.match(/^---\n([\s\S]*?)\n---/)
          if (!fmMatch) {
            errors.push(`pages/${file}: missing frontmatter`)
            continue
          }
          const yaml = fmMatch[1]
          const fm: Record<string, unknown> = {}
          for (const line of yaml.split("\n")) {
            const m = line.match(/^(\w+):\s*(.*)$/)
            if (m) {
              const key = m[1]
              const raw = m[2].trim()
              let val: string | string[] = raw
              if (raw === "[]") {
                val = []
              } else if (raw.startsWith("[") && raw.endsWith("]")) {
                val = raw
                  .slice(1, -1)
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean)
              }
              fm[key] = val
            }
          }
          pageFrontmatter.set(file, fm)

          if (!fm.title) errors.push(`pages/${file}: missing 'title' in frontmatter`)
          if (!fm.date) errors.push(`pages/${file}: missing 'date' in frontmatter`)
          if (!fm.status || !["active", "superseded", "archived"].includes(fm.status as string)) {
            errors.push(`pages/${file}: invalid or missing 'status' (must be active|superseded|archived)`)
          }

          const related = fm.related as string[] | undefined
          if (related) {
            for (const ref of related) {
              if (!pageFiles.has(ref)) {
                errors.push(`pages/${file}: broken cross-reference → ${ref} (not found)`)
              }
            }
          }
        } catch (e) {
          errors.push(`pages/${file}: could not read — ${e}`)
        }
      }

      // Second pass: supersede/status consistency (needs all frontmatter parsed).
      for (const [file, fm] of pageFrontmatter) {
        const supersedes = fm.supersedes as string[] | undefined
        if (supersedes && supersedes.length > 0) {
          for (const sup of supersedes) {
            const supFm = pageFrontmatter.get(sup)
            if (supFm && supFm.status === "active") {
              warnings.push(
                `pages/${file}: supersedes ${sup}, but ${sup} is still 'active' (should be 'superseded')`,
              )
            }
          }
        }
      }

      const indexContent = await Bun.file(`${kbDir}/index.md`).text()
      const indexRefs = new Set<string>()
      for (const line of indexContent.split("\n")) {
        // Only real entry lines ("- [Title](pages/...)") count — skip the
        // format example in the index header, which also contains "pages/".
        if (!line.trim().startsWith("- [")) continue
        const m = line.match(/\(pages\/([^)]+)\)/)
        if (m) indexRefs.add(m[1])
      }

      for (const ref of indexRefs) {
        if (!pageFiles.has(ref)) {
          errors.push(`index.md: references pages/${ref} which does not exist (stale index)`)
        }
      }

      for (const file of pageFiles) {
        if (!indexRefs.has(file)) {
          warnings.push(`pages/${file}: not listed in index.md (orphan page)`)
        }
      }

      let result = `# Lessons learned — lint report\n\n`
      result += `## Summary\n- errors: ${errors.length}\n- warnings: ${warnings.length}\n- pages scanned: ${pageFiles.size}\n\n`

      if (errors.length > 0) {
        result += `## Errors\n`
        for (const e of errors) result += `- ${e}\n`
        result += "\n"
      }

      if (warnings.length > 0) {
        result += `## Warnings\n`
        for (const w of warnings) result += `- ${w}\n`
        result += "\n"
      }

      if (errors.length === 0 && warnings.length === 0) {
        result += `All checks passed. Knowledge base is healthy.\n`
      }

      return result
    },
  })
