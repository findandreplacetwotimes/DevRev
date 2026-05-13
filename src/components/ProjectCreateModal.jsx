import { createPortal } from "react-dom"
import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useProjects } from "../context/IssuesContext"
import { OWNERS } from "../lib/owners"
import { DueDateSelector } from "./DueDateSelector"
import { MembersSelector } from "./MembersSelector"
import { OwnerSelector } from "./OwnerSelector"

const modalShadow =
  "0px 6px 13px rgba(0,0,0,0.10), 0px 23px 23px rgba(0,0,0,0.09), 0px 52px 31px rgba(0,0,0,0.05), 0px 92px 37px rgba(0,0,0,0.01), 0px 144px 40px rgba(0,0,0,0)"

const titleStyle = {
  fontFamily: '"Chip Display Variable", -apple-system, BlinkMacSystemFont, sans-serif',
  fontSize: "24px",
  lineHeight: "32px",
  letterSpacing: "-0.24px",
  fontVariationSettings: '"wght" 500',
}

const descriptionStyle = {
  fontFamily: '"Chip Text Variable", -apple-system, BlinkMacSystemFont, sans-serif',
  fontSize: "14px",
  lineHeight: "22px",
  letterSpacing: "-0.14px",
  fontVariationSettings: '"wght" 420',
}

function ProjectIcon() {
  return (
    <span className="inline-flex size-[32px] items-center justify-center rounded-[4px] bg-[var(--background-primary-subtle)]">
      <img src="/icons/page.svg" alt="" className="block size-[16px]" draggable={false} />
    </span>
  )
}

export function ProjectCreateModal({ open, onClose }) {
  const navigate = useNavigate()
  const { addProject } = useProjects()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [leadId, setLeadId] = useState(null)
  const [memberIds, setMemberIds] = useState([])
  const [dueDateId, setDueDateId] = useState(null)
  const panelRef = useRef(null)
  const titleInputRef = useRef(null)

  useEffect(() => {
    if (open && titleInputRef.current) {
      titleInputRef.current.focus()
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onEsc = (e) => {
      if (e.key === "Escape") onClose?.()
    }
    document.addEventListener("keydown", onEsc)
    return () => document.removeEventListener("keydown", onEsc)
  }, [open, onClose])

  function resetForm() {
    setTitle("")
    setDescription("")
    setLeadId(null)
    setMemberIds([])
    setDueDateId(null)
  }

  function handleCreate() {
    const newId = addProject({ title, description, ownerId: leadId, memberIds, dueDateId })
    resetForm()
    onClose?.()
    if (newId) {
      navigate(`/projects/${encodeURIComponent(newId)}`, { state: { justCreated: true } })
    }
  }

  function handleCancel() {
    resetForm()
    onClose?.()
  }

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={handleCancel} />
      <div
        ref={panelRef}
        className="relative z-[1] flex w-full max-w-[640px] flex-col rounded-[8px] bg-white"
        style={{ boxShadow: modalShadow, maxHeight: "85vh" }}
      >
        <div className="flex items-center justify-between border-b border-[#f2f2f3] px-[20px] py-[12px]">
          <div className="flex items-center gap-[8px]">
            <span
              className="text-[13px] text-[#939393]"
              style={{
                fontFamily: '"Chip Text Variable", -apple-system, BlinkMacSystemFont, sans-serif',
                fontVariationSettings: '"wght" 460',
              }}
            >
              New project
            </span>
          </div>
          <button
            type="button"
            onClick={handleCancel}
            className="inline-flex size-[28px] items-center justify-center rounded-[2px] border-0 bg-transparent p-0 text-[var(--foreground-primary)] hover:bg-[var(--control-bg-hover)] appearance-none"
          >
            <img src="/icons/close.svg" alt="Close" className="block size-[16px]" draggable={false} />
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-[24px] py-[20px]">
          <div className="mb-[12px]">
            <ProjectIcon />
          </div>

          <input
            ref={titleInputRef}
            type="text"
            placeholder="Project name"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border-0 bg-transparent p-0 text-[var(--foreground-primary)] outline-none placeholder:text-[#c4c2c3]"
            style={titleStyle}
          />

          <div className="mt-[12px] flex flex-wrap items-center gap-[4px]">
            <OwnerSelector
              owners={OWNERS}
              selectedOwnerId={leadId}
              onChange={setLeadId}
            />
            <MembersSelector
              owners={OWNERS}
              selectedMemberIds={memberIds}
              onChange={setMemberIds}
            />
            <DueDateSelector
              value={dueDateId}
              onChange={setDueDateId}
            />
          </div>

          <div className="mt-[16px] border-t border-[#f2f2f3] pt-[16px]">
            <textarea
              placeholder="Write a description, a project brief, or collect ideas..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
              className="w-full resize-none border-0 bg-transparent p-0 text-[var(--foreground-primary)] outline-none placeholder:text-[#c4c2c3]"
              style={descriptionStyle}
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-[8px] border-t border-[#f2f2f3] px-[20px] py-[12px]">
          <button
            type="button"
            onClick={handleCancel}
            className="inline-flex h-[32px] items-center rounded-[4px] border border-[#e0dfe0] bg-white px-[14px] text-[13px] text-[var(--foreground-primary)] hover:bg-[var(--control-bg-hover)] appearance-none"
            style={{
              fontFamily: '"Chip Text Variable", -apple-system, BlinkMacSystemFont, sans-serif',
              fontVariationSettings: '"wght" 480',
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleCreate}
            className="inline-flex h-[32px] items-center rounded-[4px] border-0 bg-[#6e56cf] px-[14px] text-[13px] text-white hover:bg-[#5b45b0] appearance-none"
            style={{
              fontFamily: '"Chip Text Variable", -apple-system, BlinkMacSystemFont, sans-serif',
              fontVariationSettings: '"wght" 520',
            }}
          >
            Create project
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
