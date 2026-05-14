import { useState } from "react"

/**
 * Modal for converting a chat into a project
 * Shows preview of the project that will be created
 */
export function ProjectConversionModal({ isOpen, onClose, onConfirm, chatData }) {
  const [isConverting, setIsConverting] = useState(false)

  if (!isOpen || !chatData) return null

  const handleConfirm = async () => {
    setIsConverting(true)
    try {
      await onConfirm(chatData)
    } finally {
      setIsConverting(false)
    }
  }

  const memberCount = chatData.participants?.length || 0
  const fileCount = chatData.files?.length || 0
  const projectTitle = chatData.title || "Untitled Project"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="relative w-full max-w-[480px] rounded-[12px] border border-[hsl(var(--border-outline-01))] bg-white shadow-lg">
        {/* Header */}
        <div className="border-b border-[hsl(var(--border-outline-01))] px-[24px] py-[20px]">
          <h2 className="text-[16px] font-[540] leading-[22px] text-[hsl(var(--fg-neutral-prominent))]">
            Convert to Project
          </h2>
        </div>

        {/* Content */}
        <div className="px-[24px] py-[20px]">
          <div className="mb-[16px] rounded-[8px] border border-[hsl(var(--border-outline-01))] bg-[hsl(var(--bg-layer-02))] p-[16px]">
            <h3 className="mb-[12px] text-[14px] font-[540] text-[hsl(var(--fg-neutral-prominent))]">
              {projectTitle}
            </h3>

            <div className="space-y-[8px] text-[13px] text-[hsl(var(--fg-neutral-secondary))]">
              <div className="flex items-center gap-[8px]">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
                  <path d="M8 8a2 2 0 100-4 2 2 0 000 4zM12 13c0-2.21-1.79-4-4-4s-4 1.79-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <span>{memberCount} {memberCount === 1 ? "member" : "members"}</span>
              </div>

              <div className="flex items-center gap-[8px]">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
                  <path d="M9 2H5a2 2 0 00-2 2v8a2 2 0 002 2h6a2 2 0 002-2V6l-4-4z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9 2v4h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>{fileCount} {fileCount === 1 ? "file" : "files"}</span>
              </div>
            </div>
          </div>

          <p className="text-[13px] leading-[18px] text-[hsl(var(--fg-neutral-secondary))]">
            This will create a new project in your workspace with all conversation members and files.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-[12px] border-t border-[hsl(var(--border-outline-01))] px-[24px] py-[16px]">
          <button
            type="button"
            onClick={onClose}
            disabled={isConverting}
            className="h-[32px] cursor-pointer rounded-[6px] bg-[#E5E5E5] px-[16px] text-[13px] font-[500] text-[#2D2D2D] transition-all hover:bg-[#D4D4D4] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isConverting}
            className="h-[32px] cursor-pointer rounded-[6px] bg-[#2D2D2D] px-[16px] text-[13px] font-[500] text-white transition-all hover:bg-[#1F1F1F] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isConverting ? "Creating..." : "Create Project"}
          </button>
        </div>
      </div>
    </div>
  )
}
