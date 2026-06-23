import { projectDisplayTitle } from "./projectsApi"
import {
  createSeedRegistry,
  ensureProjectMainChatInRegistry,
  saveRelatedChatRegistry,
} from "./relatedChats"

export const LS_CANVAS_TABS = "devrev.canvasTabs.v1"
export const LS_PROJECT_ACTIVITY = "devrev.projectActivity.v1"

/**
 * Reset chat nav to static defaults and strip dynamic chats (group, branch, computer)
 * plus persisted canvas tabs and project activity from computer chat.
 *
 * @param {object[]} [projects]
 */
export function resetWorkspaceChats(projects = []) {
  let registry = createSeedRegistry()
  for (const project of projects) {
    if (!project?.id) continue
    const result = ensureProjectMainChatInRegistry(registry, project.id, projectDisplayTitle(project))
    registry = result.registry
  }
  saveRelatedChatRegistry(registry)

  if (typeof window !== "undefined") {
    try {
      window.localStorage.removeItem(LS_CANVAS_TABS)
      window.localStorage.removeItem(LS_PROJECT_ACTIVITY)
    } catch {
      /* ignore */
    }
  }

  return registry
}
