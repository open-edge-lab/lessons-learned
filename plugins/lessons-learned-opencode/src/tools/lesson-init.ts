import { tool } from "@opencode-ai/plugin"
import { resolveKbRoot } from "../shared.js"
import {
  indexTemplate,
  logTemplate,
  schemaTemplate,
  readmeTemplate,
} from "../generated/templates.js"

/** Guidance block appended to AGENTS.md so the agent knows when to use the tools. */
function agentsBlock(kbRoot: string): string {
  return `## Lessons learned knowledge base

This repo maintains a lessons-learned knowledge base at \`${kbRoot}/\`, managed by
the lessons-learned opencode plugin. It captures problem-solving insights across
any domain (software, hardware, process, decisions, research) — not just
debugging.

**When investigating a non-trivial problem** — use the \`lesson-search\` tool to
find prior lessons matching the symptoms before diving in. Surface the matching
"how to recognize it" checks to the user before proposing solutions.

**When a non-trivial problem is resolved** — if it spanned ≥2 domains, ≥2
distinct factors, or required non-obvious diagnosis (see \`${kbRoot}/schema.md\`),
use the \`lesson-add\` tool to record it.

**Periodically** — use the \`lesson-lint\` tool to check for broken
cross-references, orphan pages, and stale state.
`
}

export const lessonInit = (root: string) =>
  tool({
    description:
      "Bootstrap the lessons-learned knowledge base in this repo. Creates docs/lessons-learned/ with index.md, log.md, schema.md, README.md, and pages/, then wires a guidance block into AGENTS.md. Idempotent — skips if already initialized.",
    args: {},
    async execute() {
      const kbRoot = await resolveKbRoot(root)
      const kbDir = `${root}/${kbRoot}`
      const pagesDir = `${kbDir}/pages`

      // Idempotency check. The Bun.write calls below create the parent
      // directories on demand, so no probe file is needed.
      const existing = await Bun.file(`${kbDir}/index.md`).exists()
      if (existing) {
        return `Knowledge base already exists at ${kbRoot}/. Run lesson-lint for a health check.`
      }

      // Templates come from core/ via scripts/sync-core.mjs — see
      // src/generated/templates.ts. Edit core/templates/, not the generated file.
      await Bun.write(`${kbDir}/index.md`, indexTemplate)
      await Bun.write(`${kbDir}/log.md`, logTemplate)
      await Bun.write(`${kbDir}/README.md`, readmeTemplate)
      await Bun.write(`${kbDir}/schema.md`, schemaTemplate)
      await Bun.write(`${pagesDir}/.gitkeep`, "")

      // Wire the knowledge base into AGENTS.md so the agent knows when to use
      // the tools. Append-only — never overwrite existing content.
      const agentsPath = `${root}/AGENTS.md`
      const agentsFile = Bun.file(agentsPath)
      let agentsNote: string
      if (await agentsFile.exists()) {
        const current = await agentsFile.text()
        if (current.includes("## Lessons learned knowledge base")) {
          agentsNote = "AGENTS.md already references the knowledge base — left unchanged."
        } else {
          const separator = current.endsWith("\n") ? "\n" : "\n\n"
          await Bun.write(agentsPath, current + separator + agentsBlock(kbRoot))
          agentsNote = "Appended a lessons-learned section to AGENTS.md."
        }
      } else {
        await Bun.write(agentsPath, agentsBlock(kbRoot))
        agentsNote = "Created AGENTS.md with a lessons-learned section."
      }

      return `Lessons-learned knowledge base initialized at ${kbRoot}/.

Created:
- ${kbRoot}/README.md
- ${kbRoot}/index.md
- ${kbRoot}/log.md
- ${kbRoot}/schema.md
- ${kbRoot}/pages/ (.gitkeep)

${agentsNote}`
    },
  })
