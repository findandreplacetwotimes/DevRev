import { useEffect, useMemo, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { Control } from "./Control"

const sectionTitleStyle = {
  fontFamily: '"Chip Text Variable", -apple-system, BlinkMacSystemFont, sans-serif',
  fontSize: "14px",
  lineHeight: "20px",
  letterSpacing: "-0.14px",
  fontVariationSettings: '"wght" 560',
}

const sectionDescStyle = {
  fontFamily: '"Chip Text Variable", -apple-system, BlinkMacSystemFont, sans-serif',
  fontSize: "13px",
  lineHeight: "18px",
  letterSpacing: "-0.13px",
  fontVariationSettings: '"wght" 420',
}

const labelStyle = {
  fontFamily: '"Chip Text Variable", -apple-system, BlinkMacSystemFont, sans-serif',
  fontSize: "13px",
  lineHeight: "16px",
  letterSpacing: "-0.13px",
  fontVariationSettings: '"wght" 520',
}

const valueStyle = {
  fontFamily: '"Chip Text Variable", -apple-system, BlinkMacSystemFont, sans-serif',
  fontSize: "13px",
  lineHeight: "16px",
  letterSpacing: "-0.13px",
  fontVariationSettings: '"wght" 420',
}

const subHeaderStyle = {
  fontFamily: '"Chip Text Variable", -apple-system, BlinkMacSystemFont, sans-serif',
  fontSize: "13px",
  lineHeight: "16px",
  letterSpacing: "-0.13px",
  fontVariationSettings: '"wght" 560',
}

const GRANOLA_FOLDERS = [
  { id: "product-meetings", label: "Product Meetings" },
  { id: "engineering-syncs", label: "Engineering Syncs" },
  { id: "design-reviews", label: "Design Reviews" },
  { id: "stakeholder-updates", label: "Stakeholder Updates" },
]

const TIME_WINDOW_OPTIONS = [
  { id: "30d", label: "Last 30 days" },
  { id: "90d", label: "Last 90 days" },
  { id: "6m", label: "Last 6 months" },
  { id: "all", label: "All time" },
]

function SettingsSection({ title, description, children, defaultOpen = false }) {
  const [expanded, setExpanded] = useState(defaultOpen)

  return (
    <div className="w-full rounded-[4px] border border-[#f2f2f3] bg-white">
      <button
        type="button"
        className="flex w-full items-center justify-between px-[16px] py-[14px] text-left appearance-none border-0 bg-transparent"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex flex-col gap-[2px]">
          <span className="text-[var(--foreground-primary)]" style={sectionTitleStyle}>{title}</span>
          <span className="text-[#939393]" style={sectionDescStyle}>{description}</span>
        </div>
        <span
          className={`inline-flex size-[28px] items-center justify-center transition-transform duration-150 ${expanded ? "rotate-180" : ""}`}
        >
          <img src="/icons/chevron-down.svg" alt="" className="block size-[16px]" draggable={false} />
        </span>
      </button>
      {expanded && (
        <div className="border-t border-[#f2f2f3] px-[16px] py-[14px]">
          {children}
        </div>
      )}
    </div>
  )
}

function SettingsRow({ label, value, action }) {
  return (
    <div className="flex items-center justify-between py-[8px]">
      <span className="text-[var(--control-content-secondary)]" style={labelStyle}>{label}</span>
      <div className="flex items-center gap-[8px]">
        <span className="text-[var(--foreground-primary)]" style={valueStyle}>{value}</span>
        {action}
      </div>
    </div>
  )
}

function ToggleRow({ label, description, enabled, onToggle }) {
  return (
    <div className="flex items-center justify-between py-[8px]">
      <div className="flex flex-col gap-[1px]">
        <span className="text-[var(--foreground-primary)]" style={labelStyle}>{label}</span>
        {description && <span className="text-[#939393]" style={sectionDescStyle}>{description}</span>}
      </div>
      <button
        type="button"
        onClick={onToggle}
        className={`relative inline-flex h-[20px] w-[36px] shrink-0 items-center rounded-[10px] border-0 p-0 transition-colors duration-150 appearance-none ${
          enabled ? "bg-[#6e56cf]" : "bg-[#e0dfe0]"
        }`}
      >
        <span
          className={`inline-block size-[16px] rounded-full bg-white shadow-sm transition-transform duration-150 ${
            enabled ? "translate-x-[18px]" : "translate-x-[2px]"
          }`}
        />
      </button>
    </div>
  )
}

function RadioOption({ selected, onClick, label, children }) {
  return (
    <div className="flex flex-col gap-[8px]">
      <button
        type="button"
        onClick={onClick}
        className="flex items-center gap-[8px] appearance-none border-0 bg-transparent p-0 text-left"
      >
        <span
          className={`inline-flex size-[16px] shrink-0 items-center justify-center rounded-full border-[1.5px] ${
            selected ? "border-[#6e56cf]" : "border-[#c8c7c8]"
          }`}
        >
          {selected && <span className="block size-[8px] rounded-full bg-[#6e56cf]" />}
        </span>
        <span className="text-[var(--foreground-primary)]" style={labelStyle}>{label}</span>
      </button>
      {selected && children && <div className="ml-[24px] flex flex-col gap-[8px]">{children}</div>}
    </div>
  )
}

function CheckboxOption({ checked, onChange, label }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className="flex items-center gap-[8px] appearance-none border-0 bg-transparent p-0 text-left"
    >
      <span
        className={`inline-flex size-[16px] shrink-0 items-center justify-center rounded-[3px] border-[1.5px] ${
          checked ? "border-[#6e56cf] bg-[#6e56cf]" : "border-[#c8c7c8]"
        }`}
      >
        {checked && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      <span className="text-[var(--foreground-primary)]" style={valueStyle}>{label}</span>
    </button>
  )
}

function SelectDropdown({ value, options, onChange }) {
  const [open, setOpen] = useState(false)
  const selected = options.find((o) => o.id === value)

  return (
    <div className="relative inline-flex">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-[28px] items-center gap-[4px] rounded-[2px] bg-[var(--background-primary-subtle)] px-[10px] transition-colors duration-150 hover:bg-[var(--control-bg-hover)] appearance-none border-0"
        style={valueStyle}
      >
        <span className="text-[var(--foreground-primary)]">{selected?.label ?? "Select..."}</span>
        <img src="/icons/chevron-down.svg" alt="" className="block size-[12px]" draggable={false} />
      </button>
      {open && (
        <div className="absolute top-[32px] left-0 z-[100] min-w-[160px] rounded-[4px] border border-[#f2f2f3] bg-white p-[4px] shadow-lg">
          {options.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => { onChange(opt.id); setOpen(false) }}
              className={`flex w-full items-center rounded-[2px] px-[10px] py-[6px] text-left appearance-none border-0 transition-colors duration-100 ${
                opt.id === value ? "bg-[#f5f3ff]" : "bg-transparent hover:bg-[var(--control-bg-hover)]"
              }`}
              style={valueStyle}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function TagInput({ tags, onChange, placeholder = "Add keyword..." }) {
  const [inputValue, setInputValue] = useState("")

  function handleKeyDown(e) {
    if (e.key === "Enter" && inputValue.trim()) {
      e.preventDefault()
      onChange([...tags, inputValue.trim()])
      setInputValue("")
    } else if (e.key === "Backspace" && !inputValue && tags.length > 0) {
      onChange(tags.slice(0, -1))
    }
  }

  function removeTag(index) {
    onChange(tags.filter((_, i) => i !== index))
  }

  return (
    <div className="flex min-h-[28px] flex-wrap items-center gap-[4px] rounded-[2px] bg-[var(--background-primary-subtle)] px-[8px] py-[4px]">
      {tags.map((tag, i) => (
        <span
          key={`${tag}-${i}`}
          className="inline-flex items-center gap-[4px] rounded-[2px] bg-[#ede9fe] px-[6px] py-[2px] text-[#6e56cf]"
          style={{ ...valueStyle, fontSize: "12px" }}
        >
          {tag}
          <button
            type="button"
            onClick={() => removeTag(i)}
            className="inline-flex size-[14px] items-center justify-center rounded-full appearance-none border-0 bg-transparent p-0 text-[#6e56cf] hover:text-[#5b45b0]"
          >
            ×
          </button>
        </span>
      ))}
      <input
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={tags.length === 0 ? placeholder : ""}
        className="min-w-[80px] flex-1 border-0 bg-transparent py-[2px] text-[var(--foreground-primary)] outline-none placeholder:text-[#939393]"
        style={valueStyle}
      />
    </div>
  )
}

function SourceSubSection({ title, children }) {
  return (
    <div className="flex flex-col gap-[12px]">
      <span className="text-[var(--foreground-primary)]" style={subHeaderStyle}>{title}</span>
      {children}
    </div>
  )
}

function MeetingsSourceConfig({ config, onChange }) {
  const { connected, scopeType, folderId, keywords, matchParticipants, timeWindow, behavior } = config

  function patch(updates) {
    onChange({ ...config, ...updates })
  }

  return (
    <div className="flex flex-col gap-[16px]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-[8px]">
          <span className="text-[var(--foreground-primary)]" style={labelStyle}>Connector</span>
          <span
            className="inline-flex h-[24px] items-center rounded-[2px] bg-[#ede9fe] px-[8px] text-[#6e56cf]"
            style={{ ...valueStyle, fontSize: "12px", fontVariationSettings: '"wght" 520' }}
          >
            Granola
          </span>
        </div>
        <Control
          type="textOnly"
          label={connected ? "Connected" : "Connect"}
          state={connected ? "inline" : "rest"}
          onClick={() => patch({ connected: !connected })}
        />
      </div>

      {connected && (
        <>
          <div className="h-px w-full bg-[#f2f2f3]" />

          <div className="flex flex-col gap-[4px]">
            <span className="text-[#939393]" style={{ ...sectionDescStyle, fontVariationSettings: '"wght" 520' }}>Scope</span>
            <div className="flex flex-col gap-[10px] pt-[4px]">
              <RadioOption
                selected={scopeType === "folder"}
                onClick={() => patch({ scopeType: "folder" })}
                label="Specific folder/space (deterministic)"
              >
                <SelectDropdown
                  value={folderId}
                  options={GRANOLA_FOLDERS}
                  onChange={(id) => patch({ folderId: id })}
                />
              </RadioOption>
              <RadioOption
                selected={scopeType === "auto"}
                onClick={() => patch({ scopeType: "auto" })}
                label="Auto-discover within workspace (fuzzy)"
              >
                <div className="flex flex-col gap-[10px]">
                  <div className="flex flex-col gap-[4px]">
                    <span className="text-[#939393]" style={sectionDescStyle}>Keywords</span>
                    <TagInput tags={keywords} onChange={(kw) => patch({ keywords: kw })} />
                  </div>
                  <CheckboxOption
                    checked={matchParticipants}
                    onChange={() => patch({ matchParticipants: !matchParticipants })}
                    label="Match by participants: Project members"
                  />
                  <div className="flex items-center gap-[8px]">
                    <span className="text-[#939393]" style={sectionDescStyle}>Time window:</span>
                    <SelectDropdown
                      value={timeWindow}
                      options={TIME_WINDOW_OPTIONS}
                      onChange={(tw) => patch({ timeWindow: tw })}
                    />
                    <span className="text-[#939393]" style={sectionDescStyle}>onwards</span>
                  </div>
                </div>
              </RadioOption>
            </div>
          </div>

          <div className="h-px w-full bg-[#f2f2f3]" />

          <div className="flex flex-col gap-[4px]">
            <span className="text-[#939393]" style={{ ...sectionDescStyle, fontVariationSettings: '"wght" 520' }}>Behavior</span>
            <span className="text-[#939393]" style={sectionDescStyle}>When a match is found:</span>
            <div className="flex flex-col gap-[8px] pt-[4px]">
              <RadioOption
                selected={behavior === "auto-link"}
                onClick={() => patch({ behavior: "auto-link" })}
                label="Auto-link (high confidence matches)"
              />
              <RadioOption
                selected={behavior === "suggest"}
                onClick={() => patch({ behavior: "suggest" })}
                label="Suggest for review (all matches)"
              />
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function GithubSourceConfig({ config, onChange }) {
  return (
    <div className="flex flex-col gap-[12px]">
      <div className="flex items-center justify-between">
        <span className="text-[var(--foreground-primary)]" style={labelStyle}>Connector</span>
        <Control type="textOnly" label="Connect" state="rest" />
      </div>
      <span className="text-[#939393]" style={sectionDescStyle}>
        Connect GitHub to link PRs, CI status, and code changes to this project.
      </span>
    </div>
  )
}

function DocumentsSourceConfig({ config, onChange }) {
  return (
    <div className="flex flex-col gap-[12px]">
      <div className="flex items-center justify-between">
        <span className="text-[var(--foreground-primary)]" style={labelStyle}>Connector</span>
        <Control type="textOnly" label="Connect" state="rest" />
      </div>
      <span className="text-[#939393]" style={sectionDescStyle}>
        Connect a document source to link specs, RFCs, and design docs to this project.
      </span>
    </div>
  )
}

const FREQUENCY_OPTIONS = [
  { id: "daily", label: "Every day" },
  { id: "weekly", label: "Every week" },
  { id: "biweekly", label: "Every 2 weeks" },
]

const DAY_OPTIONS = [
  { id: "monday", label: "Monday" },
  { id: "tuesday", label: "Tuesday" },
  { id: "wednesday", label: "Wednesday" },
  { id: "thursday", label: "Thursday" },
  { id: "friday", label: "Friday" },
]

const TIME_SLOT_OPTIONS = [
  { id: "09:00-10:00", label: "09:00 – 10:00" },
  { id: "10:00-11:00", label: "10:00 – 11:00" },
  { id: "11:00-12:00", label: "11:00 – 12:00" },
  { id: "13:00-14:00", label: "13:00 – 14:00" },
  { id: "14:00-15:00", label: "14:00 – 15:00" },
  { id: "15:00-16:00", label: "15:00 – 16:00" },
  { id: "16:00-17:00", label: "16:00 – 17:00" },
]

function CadenceRow({ label, description, config, onChange }) {
  function patch(updates) {
    onChange({ ...config, ...updates })
  }

  return (
    <div className="flex flex-col gap-[8px]">
      <div className="flex flex-col gap-[2px]">
        <span className="text-[var(--foreground-primary)]" style={labelStyle}>{label}</span>
        {description && <span className="text-[#939393]" style={sectionDescStyle}>{description}</span>}
      </div>
      <div className="flex flex-wrap items-center gap-[8px]">
        <SelectDropdown
          value={config.frequency}
          options={FREQUENCY_OPTIONS}
          onChange={(v) => patch({ frequency: v })}
        />
        {config.frequency !== "daily" && (
          <>
            <span className="text-[#939393]" style={sectionDescStyle}>on</span>
            <SelectDropdown
              value={config.day}
              options={DAY_OPTIONS}
              onChange={(v) => patch({ day: v })}
            />
          </>
        )}
        <span className="text-[#939393]" style={sectionDescStyle}>between</span>
        <SelectDropdown
          value={config.time}
          options={TIME_SLOT_OPTIONS}
          onChange={(v) => patch({ time: v })}
        />
      </div>
    </div>
  )
}

const DEFAULT_SKILLS = [
  { id: "status-update", label: "Generating status update", enabled: true, description: "Produces a structured status update summarizing progress, blockers, and next steps for stakeholders." },
  { id: "risk-signals", label: "Detecting risks & signals", enabled: true, description: "Monitors project signals to surface items that are stalled, unowned, or at risk of slipping." },
  { id: "meeting-discovery", label: "Discovering relevant meetings", enabled: true, description: "Scans connected meeting sources to find conversations related to this project." },
  { id: "meeting-processing", label: "Processing meeting notes to post action items, scope changes and open decisions", enabled: true, description: "Extracts action items, scope changes, and open decisions from meeting transcripts and posts them to the project." },
  { id: "internal-rundown", label: "Posting internal team rundown", enabled: true, description: "Compiles a regular internal digest covering what happened, what's next, and what needs attention." },
  { id: "dependency-detection", label: "Detecting dependencies or blockers on other teams", enabled: true, description: "Identifies cross-team dependencies and blockers that could impact project delivery." },
]

const MARKETPLACE_SKILLS = [
  { id: "sprint-planning", label: "Sprint planning assistant", scope: "org", description: "Helps plan sprint capacity, suggests issue assignments based on velocity and expertise." },
  { id: "standup-summary", label: "Standup summarizer", scope: "org", description: "Aggregates async standup updates and posts a consolidated summary." },
  { id: "pr-review-digest", label: "PR review digest", scope: "team", description: "Summarizes open PRs needing review and highlights stale ones." },
  { id: "changelog-gen", label: "Changelog generator", scope: "org", description: "Generates release changelogs from merged PRs and linked issues." },
  { id: "stakeholder-nudge", label: "Stakeholder follow-up", scope: "team", description: "Detects unanswered questions from stakeholders and nudges for responses." },
  { id: "retro-prep", label: "Retrospective prep", scope: "org", description: "Compiles metrics, incidents, and highlights to prepare sprint retrospectives." },
  { id: "onboarding-buddy", label: "New member onboarding", scope: "team", description: "Guides new team members through project context, key docs, and team norms." },
  { id: "deadline-tracker", label: "Deadline tracker", scope: "org", description: "Monitors approaching deadlines and alerts when items are at risk of missing them." },
]

const modalShadow =
  "0px 6px 13px rgba(0,0,0,0.10), 0px 23px 23px rgba(0,0,0,0.09), 0px 52px 31px rgba(0,0,0,0.05), 0px 92px 37px rgba(0,0,0,0.01), 0px 144px 40px rgba(0,0,0,0)"

const marketplaceTitleStyle = {
  fontFamily: '"Chip Text Variable", -apple-system, BlinkMacSystemFont, sans-serif',
  fontSize: "20px",
  lineHeight: "28px",
  letterSpacing: "-0.2px",
  fontVariationSettings: '"wght" 600',
}

function SkillMarketplaceModal({ onAdd, onClose, existingSkillIds }) {
  const [query, setQuery] = useState("")
  const [activeTab, setActiveTab] = useState("org")
  const [creatingNew, setCreatingNew] = useState(false)
  const [newName, setNewName] = useState("")
  const [newDescription, setNewDescription] = useState("")
  const modalRef = useRef(null)

  useEffect(() => {
    const onEsc = (e) => { if (e.key === "Escape") onClose() }
    document.addEventListener("keydown", onEsc)
    return () => document.removeEventListener("keydown", onEsc)
  }, [onClose])

  const filtered = useMemo(() => {
    return MARKETPLACE_SKILLS.filter((s) => {
      if (existingSkillIds.includes(s.id)) return false
      if (activeTab !== "all" && s.scope !== activeTab) return false
      if (query.trim()) {
        const q = query.toLowerCase()
        return s.label.toLowerCase().includes(q) || s.description.toLowerCase().includes(q)
      }
      return true
    })
  }, [query, activeTab, existingSkillIds])

  function handleCreateNew() {
    if (!newName.trim()) return
    onAdd({
      id: `custom-${Date.now()}`,
      label: newName.trim(),
      description: newDescription.trim() || "Custom skill",
      enabled: true,
    })
    setCreatingNew(false)
    setNewName("")
    setNewDescription("")
  }

  const tabs = [
    { id: "org", label: "Org Skills" },
    { id: "team", label: "Team Skills" },
    { id: "all", label: "All" },
  ]

  const modal = (
    <div className="fixed inset-0 z-[300] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div
        ref={modalRef}
        className="relative z-[1] flex max-h-[85vh] w-full max-w-[860px] flex-col rounded-[8px] bg-white"
        style={{ boxShadow: modalShadow }}
      >
        <div className="flex items-center justify-between border-b border-[#f2f2f3] px-[24px] py-[20px]">
          <span className="text-[var(--foreground-primary)]" style={marketplaceTitleStyle}>Marketplace</span>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex size-[32px] items-center justify-center rounded-[4px] appearance-none border-0 bg-transparent text-[var(--foreground-primary)] hover:bg-[var(--control-bg-hover)]"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="flex flex-col gap-[16px] px-[24px] pt-[16px]">
          <div className="flex items-center rounded-[6px] border border-[#e0dfe0] bg-white px-[12px] focus-within:border-[#6e56cf]">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0 text-[#939393]">
              <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M11 11L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search"
              className="min-w-0 flex-1 border-0 bg-transparent py-[10px] pl-[8px] text-[var(--foreground-primary)] outline-none placeholder:text-[#939393]"
              style={valueStyle}
              autoFocus
            />
          </div>

          <div className="flex items-center gap-[4px] border-b border-[#f2f2f3]">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`relative inline-flex items-center px-[12px] pb-[10px] pt-[2px] appearance-none border-0 bg-transparent transition-colors duration-100 ${
                  activeTab === tab.id ? "text-[var(--foreground-primary)]" : "text-[#939393] hover:text-[var(--foreground-primary)]"
                }`}
                style={{ ...labelStyle, fontVariationSettings: activeTab === tab.id ? '"wght" 560' : '"wght" 460' }}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <span className="absolute bottom-0 left-[12px] right-[12px] h-[2px] rounded-full bg-[var(--foreground-primary)]" />
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-[24px] py-[16px]">
          <div className="grid grid-cols-3 gap-[12px]">
            <button
              type="button"
              onClick={() => setCreatingNew(true)}
              className="flex min-h-[160px] flex-col items-center justify-center gap-[8px] rounded-[8px] border border-dashed border-[#c8c7c8] bg-transparent appearance-none transition-colors duration-150 hover:border-[#6e56cf] hover:bg-[#faf9ff]"
            >
              <span className="text-[20px] leading-none text-[#737072]">+</span>
              <span className="text-[#737072]" style={{ ...labelStyle, fontVariationSettings: '"wght" 460' }}>Create new skill</span>
            </button>

            {filtered.map((skill) => (
              <div
                key={skill.id}
                className="flex min-h-[160px] flex-col justify-between rounded-[8px] border border-[#e0dfe0] bg-white p-[16px] transition-colors duration-150 hover:border-[#c8c7c8]"
              >
                <div className="flex flex-col gap-[8px]">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-[#737072]">
                    <path d="M3 7h14M3 13h14M7 3v14M13 3v14" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                  </svg>
                  <span className="text-[var(--foreground-primary)] line-clamp-1" style={labelStyle}>{skill.label}</span>
                  <span className="text-[#939393] line-clamp-2" style={sectionDescStyle}>{skill.description}</span>
                </div>
                <div className="pt-[12px]">
                  <button
                    type="button"
                    onClick={() => onAdd({ ...skill, enabled: true })}
                    className="inline-flex h-[32px] items-center rounded-[4px] bg-[#f5f5f5] px-[12px] appearance-none border-0 transition-colors duration-150 hover:bg-[#eceaeb]"
                    style={{ ...labelStyle, fontVariationSettings: '"wght" 460' }}
                  >
                    Add to agent
                  </button>
                </div>
              </div>
            ))}

            {filtered.length === 0 && (
              <div className="col-span-3 flex items-center justify-center py-[40px]">
                <span className="text-[#939393]" style={sectionDescStyle}>No matching skills found</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {creatingNew && (
        <div className="fixed inset-0 z-[310] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/20" onClick={() => setCreatingNew(false)} />
          <div className="relative z-[1] flex w-full max-w-[440px] flex-col gap-[16px] rounded-[8px] bg-white p-[24px]" style={{ boxShadow: modalShadow }}>
            <span className="text-[var(--foreground-primary)]" style={sectionTitleStyle}>Create new skill</span>
            <div className="flex flex-col gap-[8px]">
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Skill name"
                className="w-full rounded-[4px] border border-[#e0dfe0] bg-white px-[12px] py-[10px] text-[var(--foreground-primary)] outline-none placeholder:text-[#939393] focus:border-[#6e56cf]"
                style={valueStyle}
                autoFocus
              />
              <textarea
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Describe what this skill does..."
                rows={4}
                className="w-full resize-y rounded-[4px] border border-[#e0dfe0] bg-white px-[12px] py-[10px] text-[var(--foreground-primary)] outline-none placeholder:text-[#939393] focus:border-[#6e56cf]"
                style={valueStyle}
              />
            </div>
            <div className="flex items-center gap-[8px]">
              <button
                type="button"
                onClick={handleCreateNew}
                className="inline-flex h-[36px] items-center rounded-[4px] bg-[#6e56cf] px-[16px] text-white appearance-none border-0 transition-colors duration-150 hover:bg-[#5b45b0]"
                style={{ ...labelStyle, color: "white" }}
              >
                Create skill
              </button>
              <Control type="textOnly" label="Cancel" state="inline" onClick={() => setCreatingNew(false)} />
            </div>
          </div>
        </div>
      )}
    </div>
  )

  return createPortal(modal, document.body)
}

function AgentPersonalisationPage({ onBack }) {
  const [guidance, setGuidance] = useState("")
  const [skills, setSkills] = useState(DEFAULT_SKILLS)
  const [editingSkill, setEditingSkill] = useState(null)
  const [editValue, setEditValue] = useState("")
  const [showMarketplace, setShowMarketplace] = useState(false)

  function toggleSkill(id) {
    setSkills((prev) => prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s)))
  }

  function startEditSkill(skill) {
    setEditingSkill(skill.id)
    setEditValue(skill.description)
  }

  function saveEditSkill() {
    setSkills((prev) => prev.map((s) => (s.id === editingSkill ? { ...s, description: editValue } : s)))
    setEditingSkill(null)
    setEditValue("")
  }

  function addSkillFromMarketplace(skill) {
    setSkills((prev) => [...prev, skill])
  }

  return (
    <div className="w-full shrink-0 px-[44px] pb-[40px] pt-[24px]">
      <div className="mx-auto flex w-full max-w-[640px] flex-col gap-[24px]">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-[6px] appearance-none border-0 bg-transparent p-0 text-left"
        >
          <img src="/icons/breadcrumb-chevron.svg" alt="" className="block size-[16px] rotate-180" draggable={false} />
          <span className="text-[var(--foreground-primary)]" style={labelStyle}>Back to Settings</span>
        </button>

        <div className="flex flex-col gap-[4px]">
          <span className="text-[var(--foreground-primary)]" style={sectionTitleStyle}>PM Agent Personalisation</span>
          <span className="text-[#939393]" style={sectionDescStyle}>Customise the agent's guidance and skills for this project</span>
        </div>

        <div className="flex flex-col gap-[8px]">
          <span className="text-[var(--foreground-primary)]" style={subHeaderStyle}>Guidance</span>
          <span className="text-[#939393]" style={sectionDescStyle}>Provide custom instructions that shape how the agent behaves for this project</span>
          <textarea
            value={guidance}
            onChange={(e) => setGuidance(e.target.value)}
            placeholder="e.g. Focus on delivery risks over process improvements. Keep updates concise and action-oriented. Flag anything blocking the mobile team immediately."
            rows={5}
            className="w-full resize-y rounded-[4px] border border-[#e0dfe0] bg-[var(--background-primary-subtle)] px-[12px] py-[10px] text-[var(--foreground-primary)] outline-none placeholder:text-[#939393] focus:border-[#6e56cf]"
            style={valueStyle}
          />
        </div>

        <div className="h-px w-full bg-[#e0dfe0]" />

        <div className="flex flex-col gap-[12px]">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-[2px]">
              <span className="text-[var(--foreground-primary)]" style={subHeaderStyle}>Skills</span>
              <span className="text-[#939393]" style={sectionDescStyle}>Toggle skills on or off, and customise their behaviour</span>
            </div>
              <Control type="textOnly" label="+ Add Skill" onClick={() => setShowMarketplace(true)} />
          </div>

          {showMarketplace && (
            <SkillMarketplaceModal
              existingSkillIds={skills.map((s) => s.id)}
              onAdd={(skill) => addSkillFromMarketplace(skill)}
              onClose={() => setShowMarketplace(false)}
            />
          )}

          <div className="flex flex-col divide-y divide-[#f2f2f3]">
            {skills.map((skill) => (
              <div key={skill.id} className="flex flex-col gap-[8px] py-[10px]">
                {editingSkill === skill.id ? (
                  <div className="flex flex-col gap-[8px]">
                    <div className="flex items-center justify-between">
                      <span className="text-[var(--foreground-primary)]" style={labelStyle}>{skill.label}</span>
                    </div>
                    <textarea
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      rows={3}
                      className="w-full resize-y rounded-[4px] border border-[#6e56cf] bg-white px-[12px] py-[10px] text-[var(--foreground-primary)] outline-none"
                      style={valueStyle}
                    />
                    <div className="flex items-center gap-[8px]">
                      <Control type="textOnly" label="Save" onClick={saveEditSkill} />
                      <Control type="textOnly" label="Cancel" state="inline" onClick={() => setEditingSkill(null)} />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex min-w-0 flex-1 flex-col gap-[2px] pr-[12px]">
                      <span className="text-[var(--foreground-primary)]" style={labelStyle}>{skill.label}</span>
                      <span className="text-[#939393] line-clamp-1" style={sectionDescStyle}>{skill.description}</span>
                    </div>
                    <div className="flex shrink-0 items-center gap-[8px]">
                      <Control type="textOnly" label="Edit" state="inline" onClick={() => startEditSkill(skill)} />
                      <button
                        type="button"
                        onClick={() => toggleSkill(skill.id)}
                        className={`relative inline-flex h-[20px] w-[36px] shrink-0 items-center rounded-[10px] border-0 p-0 transition-colors duration-150 appearance-none ${
                          skill.enabled ? "bg-[#6e56cf]" : "bg-[#e0dfe0]"
                        }`}
                      >
                        <span
                          className={`inline-block size-[16px] rounded-full bg-white shadow-sm transition-transform duration-150 ${
                            skill.enabled ? "translate-x-[18px]" : "translate-x-[2px]"
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// eslint-disable-next-line no-unused-vars -- props reserved for persisting settings to project
export function ProjectSettingsTab({ project, patchProject }) {
  const [meetingsConfig, setMeetingsConfig] = useState({
    connected: false,
    scopeType: "auto",
    folderId: "product-meetings",
    keywords: [],
    matchParticipants: true,
    timeWindow: "90d",
    behavior: "suggest",
  })
  const [statusCadence, setStatusCadence] = useState({
    frequency: "weekly",
    day: "friday",
    time: "14:00-15:00",
  })
  const [rundownCadence, setRundownCadence] = useState({
    frequency: "daily",
    day: "monday",
    time: "09:00-10:00",
  })
  const [showPersonalisation, setShowPersonalisation] = useState(false)

  if (showPersonalisation) {
    return <AgentPersonalisationPage onBack={() => setShowPersonalisation(false)} />
  }

  return (
    <div className="w-full shrink-0 px-[44px] pb-[40px] pt-[24px]">
      <div className="mx-auto flex w-full max-w-[640px] flex-col gap-[16px]">
        <SettingsSection
          title="Sources"
          description="External systems the agent watches for this project"
          defaultOpen
        >
          <div className="flex flex-col gap-[24px]">
            <SourceSubSection title="Meetings">
              <MeetingsSourceConfig config={meetingsConfig} onChange={setMeetingsConfig} />
            </SourceSubSection>

            <div className="h-px w-full bg-[#e0dfe0]" />

            <SourceSubSection title="GitHub">
              <GithubSourceConfig config={{}} onChange={() => {}} />
            </SourceSubSection>

            <div className="h-px w-full bg-[#e0dfe0]" />

            <SourceSubSection title="Documents">
              <DocumentsSourceConfig config={{}} onChange={() => {}} />
            </SourceSubSection>
          </div>
        </SettingsSection>

        <SettingsSection
          title="Cadence policy"
          description="When the agent delivers status updates and internal rundowns"
        >
          <div className="flex flex-col gap-[20px]">
            <CadenceRow
              label="Status Update frequency"
              description="External-facing updates shared with stakeholders"
              config={statusCadence}
              onChange={setStatusCadence}
            />
            <div className="h-px w-full bg-[#f2f2f3]" />
            <CadenceRow
              label="Team's Internal Rundown frequency"
              description="Internal digest for the project team"
              config={rundownCadence}
              onChange={setRundownCadence}
            />
          </div>
        </SettingsSection>

        <button
          type="button"
          onClick={() => setShowPersonalisation(true)}
          className="flex w-full items-center justify-between rounded-[4px] border border-[#f2f2f3] bg-white px-[16px] py-[14px] text-left appearance-none transition-colors duration-150 hover:bg-[#fafafa]"
        >
          <div className="flex flex-col gap-[2px]">
            <span className="text-[var(--foreground-primary)]" style={sectionTitleStyle}>PM Agent personalisation</span>
            <span className="text-[#939393]" style={sectionDescStyle}>Guidance, skills, and MCP servers for this project's agent</span>
          </div>
          <span className="inline-flex size-[28px] items-center justify-center">
            <img src="/icons/breadcrumb-chevron.svg" alt="" className="block size-[16px]" draggable={false} />
          </span>
        </button>
      </div>
    </div>
  )
}
