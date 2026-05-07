import { useEffect, useState } from "react"
import { Link, useOutletContext } from "react-router-dom"
import { Breadcrumbs } from "./Breadcrumbs"
import { Control } from "./Control"

const aboutLabelStyle = {
  fontFamily: '"Chip Text Variable", -apple-system, BlinkMacSystemFont, sans-serif',
  fontSize: "13px",
  lineHeight: "16px",
  letterSpacing: "-0.13px",
  fontVariationSettings: '"wght" 460',
}

const aboutWidgetTitleStyle = {
  fontFamily: '"Chip Display Variable", "Chip Text Variable", -apple-system, BlinkMacSystemFont, sans-serif',
  fontSize: "22px",
  lineHeight: "28px",
  letterSpacing: "0px",
  fontVariationSettings: '"wght" 650',
  fontFeatureSettings: '"lnum" 1, "tnum" 1',
  color: "rgba(48, 46, 47, 0.94)",
}

const aboutBigNumberStyle = {
  fontFamily: '"Chip Display Variable", "Chip Text Variable", -apple-system, BlinkMacSystemFont, sans-serif',
  fontSize: "100px",
  lineHeight: "120px",
  letterSpacing: "0px",
  fontVariationSettings: '"wght" 650',
  fontFeatureSettings: '"lnum" 1, "tnum" 1',
  color: "rgba(48, 46, 47, 0.94)",
}

const aboutIssuesBigNumberStyle = {
  ...aboutBigNumberStyle,
  lineHeight: "100px",
}

const aboutSprintBigNumberStyle = {
  ...aboutBigNumberStyle,
  lineHeight: "100px",
}

function useCountUp(target, durationMs = 1000) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    let rafId = 0
    const start = performance.now()
    const easeOutCubic = (x) => 1 - Math.pow(1 - x, 3)
    const tick = (now) => {
      const t = Math.min(1, (now - start) / durationMs)
      setValue(Math.round(target * easeOutCubic(t)))
      if (t < 1) rafId = window.requestAnimationFrame(tick)
    }
    rafId = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(rafId)
  }, [target, durationMs])

  return value
}

export function AboutPage() {
  const { openBuildTeamChat } = useOutletContext() ?? {}
  const issuesCount = useCountUp(256, 1000)
  const sprintCount = useCountUp(18, 1000)

  return (
    <section className="flex h-full min-h-0 w-full min-w-0 flex-col rounded-[2px] bg-white" aria-label="About">
      <div className="relative flex min-h-0 min-w-0 flex-1 bg-[var(--control-bg-rest)]">
        <header className="absolute left-0 top-0 z-[1] w-full p-[14px]">
          <div className="flex w-full items-start justify-between gap-[8px]">
            <div className="flex min-w-0 flex-wrap items-center gap-[4px] ">
              <Breadcrumbs root="About" item={null} />
            </div>
            <Control type="iconOnly" leadingIcon="more" label="" />
          </div>
        </header>
        <div className="absolute inset-0 flex items-center justify-center px-[44px] py-[40px]">
          <img
            src="/Build_team.png"
            alt="Build Team"
            className="h-auto w-[393px] max-w-full"
            draggable={false}
          />
        </div>
      </div>

      <div className="grid min-h-0 w-full flex-1 grid-cols-3 border-t border-[#ececec]">
        <Link
          to="/sprints"
          className="group flex min-h-0 flex-col justify-between border-r border-[#ececec] px-[20px] pt-[16px] pb-[5px] text-inherit no-underline transition-colors duration-150 hover:bg-[var(--control-bg-rest)]"
          aria-label="Open sprints page"
        >
          <div className="flex flex-col gap-[4px]">
            <p className="m-0 w-[211px]" style={aboutWidgetTitleStyle}>Sprint 5 is running</p>
            <p className="m-0 w-[196px] text-[var(--foreground-primary)]" style={aboutLabelStyle}>Done issues so far</p>
            <span className="m-0 w-fit text-[var(--foreground-primary)] underline-offset-2 group-hover:underline" style={aboutLabelStyle}>
              Check it out
            </span>
          </div>
          <span className="m-0 w-fit text-[rgba(48,46,47,0.94)]" style={aboutSprintBigNumberStyle}>
            {sprintCount}
          </span>
        </Link>
        <Link
          to="/issues"
          className="group flex min-h-0 flex-col justify-between border-r border-[#ececec] px-[20px] pt-[16px] pb-[5px] text-inherit no-underline transition-colors duration-150 hover:bg-[var(--control-bg-rest)]"
          aria-label="Open issues page"
        >
          <div className="flex flex-col gap-[8px]">
            <p className="m-0 w-[211px]" style={aboutWidgetTitleStyle}>Issues</p>
            <span className="m-0 w-fit text-[var(--foreground-primary)] underline-offset-2 group-hover:underline" style={aboutLabelStyle}>
              See all
            </span>
          </div>
          <span className="m-0 w-fit text-[rgba(48,46,47,0.94)]" style={aboutIssuesBigNumberStyle}>
            {issuesCount}
          </span>
        </Link>
        <div className="flex min-h-0 flex-col justify-between px-[20px] pt-[14px] pb-[18px]">
          <p className="m-0 w-[211px]" style={aboutWidgetTitleStyle}>Useful stuff</p>
          <div className="flex flex-col gap-[4px]">
            <button
              type="button"
              className="m-0 w-fit border-0 bg-transparent p-0 text-[var(--foreground-primary)] text-left hover:underline"
              style={aboutLabelStyle}
              onClick={() => openBuildTeamChat?.()}
            >
              Team chat
            </button>
            <Link to="/team-members" className="m-0 w-fit text-[var(--foreground-primary)] hover:underline" style={aboutLabelStyle}>
              Team members
            </Link>
            <Link to="/settings" className="m-0 w-fit text-[var(--foreground-primary)] hover:underline" style={aboutLabelStyle}>
              Settings
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
