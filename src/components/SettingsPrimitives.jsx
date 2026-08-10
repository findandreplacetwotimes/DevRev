import { useState } from "react"
import {
  DAY_OPTIONS,
  FREQUENCY_OPTIONS,
  TIME_SLOT_OPTIONS,
  labelStyle,
  sectionDescStyle,
  sectionTitleStyle,
  subHeaderStyle,
  valueStyle,
} from "../lib/settingsStyles"

/** Shared settings-surface controls, used by `ProjectSettingsTab` and `TeamSettingsPage`. */

export function SettingsSection({ title, description, headerAction, children, defaultOpen = false }) {
  const [expanded, setExpanded] = useState(defaultOpen)

  return (
    <div className="w-full rounded-[4px] border border-[#f2f2f3] bg-white">
      <div className="flex w-full items-center gap-[8px] px-[16px] py-[14px]">
        <button
          type="button"
          className="flex min-w-0 flex-1 flex-col gap-[2px] text-left appearance-none border-0 bg-transparent p-0"
          aria-expanded={expanded}
          onClick={() => setExpanded((v) => !v)}
        >
          <span className="text-[var(--foreground-primary)]" style={sectionTitleStyle}>{title}</span>
          <span className="text-[#939393]" style={sectionDescStyle}>{description}</span>
        </button>
        {headerAction}
        <button
          type="button"
          aria-label={expanded ? `Collapse ${title}` : `Expand ${title}`}
          onClick={() => setExpanded((v) => !v)}
          className={`inline-flex size-[28px] shrink-0 items-center justify-center appearance-none border-0 bg-transparent p-0 transition-transform duration-150 ${expanded ? "rotate-180" : ""}`}
        >
          <img src="/icons/chevron-down.svg" alt="" className="block size-[16px]" draggable={false} />
        </button>
      </div>
      {expanded && (
        <div className="border-t border-[#f2f2f3] px-[16px] py-[14px]">
          {children}
        </div>
      )}
    </div>
  )
}

export function SettingsRow({ label, value, action }) {
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

export function Toggle({ enabled, onToggle, label }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      role="switch"
      aria-checked={enabled}
      aria-label={label}
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
  )
}

export function ToggleRow({ label, description, enabled, onToggle }) {
  return (
    <div className="flex items-center justify-between gap-[16px] py-[8px]">
      <div className="flex flex-col gap-[1px]">
        <span className="text-[var(--foreground-primary)]" style={labelStyle}>{label}</span>
        {description && <span className="text-[#939393]" style={sectionDescStyle}>{description}</span>}
      </div>
      <Toggle enabled={enabled} onToggle={onToggle} label={label} />
    </div>
  )
}

export function RadioOption({ selected, onClick, label, description, children }) {
  return (
    <div className="flex flex-col gap-[8px]">
      <button
        type="button"
        onClick={onClick}
        className="flex items-start gap-[8px] appearance-none border-0 bg-transparent p-0 text-left"
      >
        <span
          className={`mt-[1px] inline-flex size-[16px] shrink-0 items-center justify-center rounded-full border-[1.5px] ${
            selected ? "border-[#6e56cf]" : "border-[#c8c7c8]"
          }`}
        >
          {selected && <span className="block size-[8px] rounded-full bg-[#6e56cf]" />}
        </span>
        <span className="flex min-w-0 flex-col gap-[2px]">
          <span className="text-[var(--foreground-primary)]" style={labelStyle}>{label}</span>
          {description && <span className="text-[#939393]" style={sectionDescStyle}>{description}</span>}
        </span>
      </button>
      {selected && children && <div className="ml-[24px] flex flex-col gap-[8px]">{children}</div>}
    </div>
  )
}

export function CheckboxOption({ checked, onChange, label, description }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className="flex items-start gap-[8px] appearance-none border-0 bg-transparent p-0 text-left"
    >
      <span
        className={`mt-[1px] inline-flex size-[16px] shrink-0 items-center justify-center rounded-[3px] border-[1.5px] ${
          checked ? "border-[#6e56cf] bg-[#6e56cf]" : "border-[#c8c7c8]"
        }`}
      >
        {checked && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      <span className="flex min-w-0 flex-col gap-[2px]">
        <span className="text-[var(--foreground-primary)]" style={valueStyle}>{label}</span>
        {description && <span className="text-[#939393]" style={sectionDescStyle}>{description}</span>}
      </span>
    </button>
  )
}

export function SelectDropdown({ value, options, onChange }) {
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

export function TagInput({ tags, onChange, placeholder = "Add keyword..." }) {
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

export function SubSection({ title, description, children }) {
  return (
    <div className="flex flex-col gap-[12px]">
      <div className="flex flex-col gap-[2px]">
        <span className="text-[var(--foreground-primary)]" style={subHeaderStyle}>{title}</span>
        {description && <span className="text-[#939393]" style={sectionDescStyle}>{description}</span>}
      </div>
      {children}
    </div>
  )
}

export function Divider({ strong = false }) {
  return <div className={`h-px w-full ${strong ? "bg-[#e0dfe0]" : "bg-[#f2f2f3]"}`} />
}

/** Frequency + day + time-slot picker for a scheduled agent skill. */
export function CadenceRow({ label, description, config, onChange, frequencyOptions = FREQUENCY_OPTIONS }) {
  function patch(updates) {
    onChange({ ...config, ...updates })
  }

  return (
    <div className="flex flex-col gap-[8px]">
      {(label || description) && (
        <div className="flex flex-col gap-[2px]">
          {label && <span className="text-[var(--foreground-primary)]" style={labelStyle}>{label}</span>}
          {description && <span className="text-[#939393]" style={sectionDescStyle}>{description}</span>}
        </div>
      )}
      <div className="flex flex-wrap items-center gap-[8px]">
        <SelectDropdown
          value={config.frequency}
          options={frequencyOptions}
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
