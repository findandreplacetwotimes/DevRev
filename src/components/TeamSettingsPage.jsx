import { useEffect, useState } from "react"
import { Breadcrumbs } from "./Breadcrumbs"
import { Control } from "./Control"
import { MembersSelector } from "./MembersSelector"
import { TabPageTitle } from "./TabPageTitle"
import {
  CadenceRow,
  CheckboxOption,
  Divider,
  RadioOption,
  SelectDropdown,
  SettingsSection,
  SubSection,
  Toggle,
  ToggleRow,
} from "./SettingsPrimitives"
import {
  labelStyle,
  sectionDescStyle,
  valueStyle,
} from "../lib/settingsStyles"
import { OWNERS } from "../lib/owners"
import {
  CONFIDENCE_OPTIONS,
  LINK_SCOPE_OPTIONS,
  MEMORY_CATEGORY_OPTIONS,
  MEMORY_RETENTION_OPTIONS,
  REVIEW_TIMEOUT_OPTIONS,
  REVIEW_WINDOW_OPTIONS,
  loadTeamAgentSettings,
  saveTeamAgentSettings,
  summarizeTeamAgentSettings,
} from "../lib/teamAgentSettings"

const TEAM_NAME = "Cherny"

/** Explains the effect of a setting in the agent's own words — keeps the policy legible. */
function PolicyNote({ children }) {
  return (
    <div className="flex items-start gap-[8px] rounded-[4px] bg-[#faf8ff] px-[10px] py-[8px]">
      <span aria-hidden className="mt-[1px] shrink-0 text-[12px] leading-[16px]">✨</span>
      <span className="text-[#737072]" style={sectionDescStyle}>{children}</span>
    </div>
  )
}

/** Off-state placeholder so a disabled policy still explains what the agent does instead. */
function DisabledNote({ children }) {
  return (
    <span className="text-[#939393]" style={sectionDescStyle}>{children}</span>
  )
}

function FieldRow({ label, description, children }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-[8px] py-[6px]">
      <div className="flex min-w-0 flex-col gap-[1px]">
        <span className="text-[var(--foreground-primary)]" style={labelStyle}>{label}</span>
        {description && <span className="text-[#939393]" style={sectionDescStyle}>{description}</span>}
      </div>
      {children}
    </div>
  )
}

function SectionToggle({ enabled, onToggle, label }) {
  return (
    <span className="flex shrink-0 items-center gap-[8px]">
      <span className="text-[#939393]" style={{ ...valueStyle, fontSize: "12px" }}>{enabled ? "On" : "Off"}</span>
      <Toggle enabled={enabled} onToggle={onToggle} label={label} />
    </span>
  )
}

function MeetingLinkingSection({ config, patch }) {
  return (
    <div className="flex flex-col gap-[16px]">
      {!config.enabled ? (
        <DisabledNote>
          Meetings won't be linked automatically. Team members can still link a meeting to an enhancement by hand,
          and the agent will only read a meeting when someone points it at one.
        </DisabledNote>
      ) : (
        <>
          <SubSection title="What gets linked">
            <div className="flex flex-col gap-[10px]">
              {LINK_SCOPE_OPTIONS.map((option) => (
                <RadioOption
                  key={option.id}
                  selected={config.scope === option.id}
                  onClick={() => patch({ scope: option.id })}
                  label={option.label}
                />
              ))}
            </div>
            <FieldRow
              label="Match threshold"
              description="How sure the agent must be before it links a meeting on its own."
            >
              <SelectDropdown
                value={config.confidence}
                options={CONFIDENCE_OPTIONS}
                onChange={(id) => patch({ confidence: id })}
              />
            </FieldRow>
          </SubSection>

          <Divider />

          <SubSection
            title="Content access"
            description="Linking a meeting is metadata. Reading what was said inside it needs a person's consent."
          >
            <ToggleRow
              label="Let the agent ask for content access"
              description="Attendees who are also project members get a daily digest with grant, keep-private, and unlink controls."
              enabled={config.allowContentAccessRequests}
              onToggle={() => patch({ allowContentAccessRequests: !config.allowContentAccessRequests })}
            />
            {config.allowContentAccessRequests ? (
              <ToggleRow
                label="Remember repeat approvals"
                description="After three consecutive grants on the same recurring meeting, offer to auto-grant future instances."
                enabled={config.allowStandingRules}
                onToggle={() => patch({ allowStandingRules: !config.allowStandingRules })}
              />
            ) : (
              <DisabledNote>
                Linked meetings contribute metadata only — title, participants, time, and detected topics. Briefings and
                status updates will note that a meeting happened without citing anything from it.
              </DisabledNote>
            )}
            <ToggleRow
              label="Post link activity to the project chat"
              description="A running ledger of what was linked, granted, revoked, or unlinked — and by whom."
              enabled={config.postLedgerToProjectChat}
              onToggle={() => patch({ postLedgerToProjectChat: !config.postLedgerToProjectChat })}
            />
          </SubSection>
        </>
      )}
    </div>
  )
}

function WeeklyStatusSection({ config, patch }) {
  const humanInLoop = config.approvalMode === "human"

  if (!config.enabled) {
    return (
      <DisabledNote>
        The agent won't draft status updates on a schedule. Anyone can still ask it for a draft in the project chat
        with "draft status".
      </DisabledNote>
    )
  }

  return (
    <div className="flex flex-col gap-[16px]">
      <SubSection title="Cadence" description="When the agent prepares the update for the week.">
        <CadenceRow config={config.cadence} onChange={(cadence) => patch({ cadence })} />
      </SubSection>

      <Divider />

      <SubSection title="Who publishes it">
        <div className="flex flex-col gap-[12px]">
          <RadioOption
            selected={humanInLoop}
            onClick={() => patch({ approvalMode: "human" })}
            label="Human in the loop"
            description="The agent posts a draft in the project chat. A reviewer edits and approves before anything goes out."
          >
            <div className="flex flex-col gap-[10px] pt-[2px]">
              <FieldRow
                label="Review window"
                description="How long the draft waits for a reviewer."
              >
                <SelectDropdown
                  value={config.reviewWindow}
                  options={REVIEW_WINDOW_OPTIONS}
                  onChange={(id) => patch({ reviewWindow: id })}
                />
              </FieldRow>
              <FieldRow label="If nobody reviews in time">
                <SelectDropdown
                  value={config.onReviewTimeout}
                  options={REVIEW_TIMEOUT_OPTIONS}
                  onChange={(id) => patch({ onReviewTimeout: id })}
                />
              </FieldRow>
              <FieldRow
                label="Reviewers"
                description="The project lead can always approve. Add anyone else who should be able to."
              >
                <MembersSelector
                  owners={OWNERS}
                  selectedMemberIds={config.reviewerIds}
                  onChange={(reviewerIds) => patch({ reviewerIds })}
                />
              </FieldRow>
            </div>
          </RadioOption>

          <RadioOption
            selected={config.approvalMode === "auto"}
            onClick={() => patch({ approvalMode: "auto" })}
            label="Auto-publish"
            description="The agent posts the update to the timeline on schedule, with no approval step."
          >
            <PolicyNote>
              Heads up — stakeholders see the update before anyone on the team has read it. Best for teams whose
              projects are already well-instrumented and low-surprise.
            </PolicyNote>
          </RadioOption>
        </div>
      </SubSection>

      <Divider />

      <ToggleRow
        label="Update official project health on publish"
        description={
          humanInLoop
            ? "The health value in the approved update becomes the project's official health."
            : "The health value the agent proposes becomes the project's official health automatically."
        }
        enabled={config.syncOfficialHealth}
        onToggle={() => patch({ syncOfficialHealth: !config.syncOfficialHealth })}
      />
    </div>
  )
}

function ProjectMemorySection({ config, patch }) {
  function toggleCategory(id) {
    const next = config.categories.includes(id)
      ? config.categories.filter((c) => c !== id)
      : [...config.categories, id]
    patch({ categories: next })
  }

  if (!config.enabled) {
    return (
      <div className="flex flex-col gap-[12px]">
        <DisabledNote>
          The agent starts every run from scratch: it reads live issues, meetings, and PRs, answers the question, and
          keeps nothing. Decisions and action items it surfaced won't be there next week unless someone wrote them
          down as issues or comments.
        </DisabledNote>
        <PolicyNote>
          Opting in lets the agent build the team's shared memory — a decision trail, open action items, and how health
          moved over time — stored on the project record where anyone can inspect it.
        </PolicyNote>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-[16px]">
      <SubSection
        title="What the agent remembers"
        description="Stored on the project record, inspectable and deletable at any time."
      >
        <div className="flex flex-col gap-[10px]">
          {MEMORY_CATEGORY_OPTIONS.map((option) => (
            <CheckboxOption
              key={option.id}
              checked={config.categories.includes(option.id)}
              onChange={() => toggleCategory(option.id)}
              label={option.label}
              description={option.description}
            />
          ))}
        </div>
        {config.categories.length === 0 && (
          <DisabledNote>
            Nothing selected — memory is on but the agent has nowhere to write. Pick at least one category.
          </DisabledNote>
        )}
        {config.categories.includes("meeting-content") && (
          <PolicyNote>
            Meeting excerpts are only ever stored for meetings someone granted content access to. Revoking access
            removes the excerpts from memory.
          </PolicyNote>
        )}
      </SubSection>

      <Divider />

      <FieldRow label="Retention" description="How long memory survives before the agent drops it.">
        <SelectDropdown
          value={config.retention}
          options={MEMORY_RETENTION_OPTIONS}
          onChange={(id) => patch({ retention: id })}
        />
      </FieldRow>

      <ToggleRow
        label={`Readable by everyone in ${TEAM_NAME}`}
        description="Off means only the project's own members can see what the agent remembered."
        enabled={config.shareAcrossTeam}
        onToggle={() => patch({ shareAcrossTeam: !config.shareAcrossTeam })}
      />
    </div>
  )
}

/**
 * Team-level PM Agent settings (CHE-39): meeting linking, weekly status updates (auto vs
 * human-in-the-loop), and project memory opt-in. Every project in the team inherits these.
 */
export function TeamSettingsPage() {
  const [settings, setSettings] = useState(loadTeamAgentSettings)

  useEffect(() => {
    saveTeamAgentSettings(settings)
  }, [settings])

  function patchGroup(group, updates) {
    setSettings((prev) => ({ ...prev, [group]: { ...prev[group], ...updates } }))
  }

  const summary = summarizeTeamAgentSettings(settings)

  return (
    <section className="flex h-full min-h-0 w-full min-w-0 flex-col rounded-[2px] bg-white" aria-label="Team settings">
      <div className="min-h-[56px] w-full shrink-0">
        <header className="w-full p-[14px]">
          <div className="flex w-full items-start justify-between gap-[8px]">
            <div className="flex min-w-0 flex-wrap items-center gap-[4px]">
              <Breadcrumbs
                segments={[
                  { label: "About", href: "/about", iconName: "team", showIcon: true },
                  { label: "Settings", showIcon: false },
                ]}
              />
            </div>
            <Control type="iconOnly" leadingIcon="more" label="" />
          </div>
        </header>
      </div>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto overscroll-y-contain">
        <div className="mx-auto w-full min-w-0 max-w-[828px] px-[44px] pb-[40px] pt-[36px]">
          <div className="mx-auto flex w-full max-w-[640px] flex-col gap-[24px]">
            <TabPageTitle>Settings</TabPageTitle>

            <div className="flex w-full flex-col gap-[16px]">
              <div className="flex flex-col gap-[4px]">
                <span className="text-[var(--foreground-primary)]" style={labelStyle}>PM Agent</span>
                <span className="text-[#939393]" style={sectionDescStyle}>
                  Team defaults for {TEAM_NAME}. Every project inherits these; a project can tighten them in its own
                  settings but can't loosen them.
                </span>
              </div>

              <SettingsSection
                title="Automatic meeting linking"
                description={summary.meetingLinking}
                defaultOpen
                headerAction={
                  <SectionToggle
                    enabled={settings.meetingLinking.enabled}
                    onToggle={() => patchGroup("meetingLinking", { enabled: !settings.meetingLinking.enabled })}
                    label="Automatic meeting linking"
                  />
                }
              >
                <MeetingLinkingSection
                  config={settings.meetingLinking}
                  patch={(updates) => patchGroup("meetingLinking", updates)}
                />
              </SettingsSection>

              <SettingsSection
                title="Weekly status updates"
                description={summary.weeklyStatus}
                headerAction={
                  <SectionToggle
                    enabled={settings.weeklyStatus.enabled}
                    onToggle={() => patchGroup("weeklyStatus", { enabled: !settings.weeklyStatus.enabled })}
                    label="Weekly status updates"
                  />
                }
              >
                <WeeklyStatusSection
                  config={settings.weeklyStatus}
                  patch={(updates) => patchGroup("weeklyStatus", updates)}
                />
              </SettingsSection>

              <SettingsSection
                title="Project memory"
                description={summary.projectMemory}
                headerAction={
                  <SectionToggle
                    enabled={settings.projectMemory.enabled}
                    onToggle={() => patchGroup("projectMemory", { enabled: !settings.projectMemory.enabled })}
                    label="Project memory"
                  />
                }
              >
                <ProjectMemorySection
                  config={settings.projectMemory}
                  patch={(updates) => patchGroup("projectMemory", updates)}
                />
              </SettingsSection>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
