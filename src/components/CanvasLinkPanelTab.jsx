import { ChatRelatedLinksContent } from "./ChatRelatedLinksMenu"

export const CANVAS_LINK_PANEL_WIDTH = 400

/** Figma `6238:12809` — link panel as a canvas tab body (400px, not full page width). */
export function CanvasLinkPanelTab({
  sections = [],
  currentChatId = null,
  projectId = null,
  onSelect,
  onSelectChat,
  onNavigate,
}) {
  const linksLabel = "LINKS"

  return (
    <section
      className="flex h-full min-h-0 w-[400px] shrink-0 flex-col overflow-hidden bg-white px-[12px] pb-[14px]"
      aria-label={linksLabel}
    >
      <div className="h-[14px] w-full shrink-0 bg-white" />
      <div className="min-h-0 flex-1 overflow-y-auto">
        <ChatRelatedLinksContent
          sections={sections.map((section) =>
            section.kind === "record" ? { ...section, label: linksLabel } : section
          )}
          currentChatId={currentChatId}
          projectId={projectId}
          onSelect={onSelect}
          onSelectChat={onSelectChat}
          onNavigate={onNavigate}
          linkItemIcon="page"
        />
      </div>
      <div className="h-[20px] w-full shrink-0 bg-white" />
    </section>
  )
}
