/**
 * Config file locations, in resolution order. The neutral repo-root path is
 * preferred; the `.claude-plugin/` path is kept for backward compatibility with
 * repos configured before the multi-plugin layout.
 */
const CONFIG_PATHS = [
  "lessons-learned.config.json",
  ".claude-plugin/lessons-learned.config.json",
]

export async function resolveKbRoot(root: string): Promise<string> {
  const config = await readConfig(root)
  return (config?.knowledgeBaseRoot as string) || "docs/lessons-learned"
}

export async function readConfig(root: string): Promise<Record<string, unknown> | null> {
  for (const rel of CONFIG_PATHS) {
    try {
      const content = await Bun.file(`${root}/${rel}`).text()
      return JSON.parse(content) as Record<string, unknown>
    } catch {
      // missing or invalid JSON — try the next location
    }
  }
  return null
}
