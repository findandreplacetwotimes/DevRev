import { useState } from "react"

/**
 * Canvas - Right pane for AI Computer mode showing steps, generated files, and workspace files.
 * Matches design from screenshot with Arcade design system.
 */
export function Canvas({ onClose, onMinimize, sharedFiles: externalFiles }) {
  const [steps] = useState([
    {
      id: "step-1",
      title: "Create design system architecture and token structure",
      completed: true,
    },
  ])

  // Use externally provided files or default mock data
  const sharedFiles = externalFiles && externalFiles.length > 0
    ? externalFiles.map(f => ({
        id: f.id,
        name: f.name,
        icon: f.icon || (f.name.endsWith('.html') ? '🌐' : f.name.endsWith('.md') ? '📄' : f.name.endsWith('.png') || f.name.endsWith('.jpg') ? '🖼️' : '📄')
      }))
    : [
        { id: "1", name: "SKILL.md", icon: "📄" },
        { id: "2", name: "sprint-changelog-sprint-17.html", icon: "🌐" },
        { id: "3", name: "sprint-changelog-sprint-19.html", icon: "🌐" },
      ]

  return (
    <aside className="flex h-full w-[360px] shrink-0 flex-col border-l border-[hsl(var(--border-outline-01))] bg-white">
      {/* Header */}
      <div className="flex h-[56px] items-center justify-between border-b border-[hsl(var(--border-outline-01))] px-[20px]">
        <h2 className="text-[14px] font-[540] leading-[20px] text-[hsl(var(--fg-neutral-prominent))]">
          Canvas
        </h2>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-[20px] py-[16px]">
        {/* Steps dropdown */}
        <div className="mb-[20px]">
          <button
            type="button"
            className="flex w-full items-center justify-between rounded-[8px] border border-[hsl(var(--border-outline-01))] bg-white px-[12px] py-[8px] text-left text-[13px] text-[hsl(var(--fg-neutral-prominent))] transition-colors hover:bg-[hsl(var(--bg-layer-02))]"
          >
            <span className="font-[440]">{steps.length} step</span>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* Steps list */}
        <div className="mb-[24px] space-y-[8px]">
          {steps.map((step) => (
            <div key={step.id} className="flex items-start gap-[10px]">
              <div className="mt-[2px] flex h-[16px] w-[16px] shrink-0 items-center justify-center">
                <input
                  type="checkbox"
                  checked={step.completed}
                  readOnly
                  className="h-[14px] w-[14px] cursor-default rounded-[3px] border border-[hsl(var(--border-outline-01))]"
                  style={{ accentColor: "hsl(var(--shuiguo-500))" }}
                />
              </div>
              <p
                className={`flex-1 text-[13px] leading-[18px] ${
                  step.completed
                    ? "text-[hsl(var(--fg-neutral-tertiary))] line-through"
                    : "text-[hsl(var(--fg-neutral-prominent))]"
                }`}
              >
                {step.title}
              </p>
            </div>
          ))}
        </div>

        {/* Shared Generated files */}
        <div className="mb-[24px]">
          <h3 className="mb-[12px] text-[12px] font-[540] uppercase tracking-[0.5px] text-[hsl(var(--fg-neutral-tertiary))]">
            Shared Generated files
          </h3>
          <div className="space-y-[4px]">
            {sharedFiles.map((file) => (
              <button
                key={file.id}
                type="button"
                className="flex w-full items-center gap-[8px] rounded-[6px] px-[8px] py-[6px] text-left transition-colors hover:bg-[hsl(var(--bg-layer-02))]"
              >
                <span className="text-[14px]">{file.icon}</span>
                <span className="flex-1 truncate text-[13px] text-[hsl(var(--fg-neutral-prominent))]">
                  {file.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* My files */}
        <div>
          <h3 className="mb-[12px] text-[12px] font-[540] uppercase tracking-[0.5px] text-[hsl(var(--fg-neutral-tertiary))]">
            My files
          </h3>
          <div className="rounded-[8px] border border-[hsl(var(--border-outline-01))] bg-[hsl(var(--bg-layer-02))] px-[12px] py-[32px] text-center">
            <p className="mb-[12px] text-[13px] leading-[18px] text-[hsl(var(--fg-neutral-secondary))]">
              Add folders to allow computer to work with them
            </p>
            <button
              type="button"
              className="mx-auto flex h-[28px] w-[28px] items-center justify-center rounded-full border border-[hsl(var(--border-outline-01))] bg-white text-[hsl(var(--fg-neutral-secondary))] transition-colors hover:bg-[hsl(var(--bg-layer-02))]"
              aria-label="Add folder"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </aside>
  )
}
