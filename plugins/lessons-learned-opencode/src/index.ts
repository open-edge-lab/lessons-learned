import type { Plugin } from "@opencode-ai/plugin"
import { lessonInit } from "./tools/lesson-init.js"
import { lessonSearch } from "./tools/lesson-search.js"
import { lessonAdd } from "./tools/lesson-add.js"
import { lessonLint } from "./tools/lesson-lint.js"

/**
 * opencode plugin for the lessons-learned knowledge base.
 *
 * The plugin contributes four tools. `ToolContext` does not expose the project
 * directory, so the worktree path is captured here from `PluginInput` and bound
 * into each tool via a factory.
 *
 * Instructions on *when* to use the tools are not injected by the plugin —
 * `@opencode-ai/plugin` v0.15 has no system-prompt hook. Instead, `lesson-init`
 * wires a short guidance block into the repo's `AGENTS.md`.
 */
export const LessonsLearnedPlugin: Plugin = async ({ directory, worktree }) => {
  const root = worktree || directory

  return {
    tool: {
      "lesson-init": lessonInit(root),
      "lesson-search": lessonSearch(root),
      "lesson-add": lessonAdd(root),
      "lesson-lint": lessonLint(root),
    },
  }
}

export default LessonsLearnedPlugin
