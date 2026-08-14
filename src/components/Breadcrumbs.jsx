import { useEffect, useRef, useState } from "react"
import { useLocation } from "react-router-dom"
import { useWorkspaceOutletContext } from "../context/WorkspaceOutletContext"
import { useWorkspaceNavigate } from "../hooks/useWorkspaceNavigate"
import { Icon } from "./Icon"
import { RightPanelNavMenu } from "./RightPanelNavMenu"

/** Figma breadcrumbs (`5662:256760`): leading pictogram + root, Trailing chevron (`5662:256682`), then “Issue” + “-####”. */

const BREADCRUMB_CHEVRON = "/icons/breadcrumb-chevron.svg"

const chipSystemTextStyle = {
  fontFamily: '"Chip Text Variable", -apple-system, BlinkMacSystemFont, sans-serif',
  fontSize: "13px",
  lineHeight: "16px",
  letterSpacing: "-0.13px",
  fontVariationSettings: '"wght" 460',
}

/** Suffix / id segment — Figma `5662:256686`: Inter, tabular numerals, tighter tracking. */
const suffixTextStyle = {
  fontFamily: '"Chip Text Variable", -apple-system, BlinkMacSystemFont, sans-serif',
  fontSize: "13px",
  lineHeight: "16px",
  letterSpacing: "-0.13px",
  fontVariationSettings: '"wght" 460',
  color: "rgba(0, 0, 0, 0.9)",
}

const shellClass =
  "inline-flex h-[28px] min-w-0 max-w-full items-center rounded-[2px] bg-[var(--breadcrumb-bg)] pr-[10px] transition-colors duration-150 hover:bg-[var(--control-bg-hover)]"

const rootClusterClass =
  "inline-flex shrink-0 items-center rounded-[2px] text-inherit no-underline outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--foreground-primary)]"

/**
 * Pass `item={null}` (or empty string after trim) so only `root` shows (Issues hub pattern).
 */
function isInternalAppPath(href) {
  return typeof href === "string" && href.startsWith("/") && !href.startsWith("//")
}

function renderSegmentContent(segment, showLeadingIcon) {
  return (
    <>
      {showLeadingIcon ? <Icon name={segment.iconName ?? "team"} /> : null}
      {segment.showLabel === false ? null : (
        <span className="whitespace-nowrap text-[var(--foreground-primary)]" style={chipSystemTextStyle}>
          {segment.label}
        </span>
      )}
      {segment.suffix ? (
        <span className="min-w-0 overflow-hidden text-ellipsis" style={suffixTextStyle}>
          {segment.suffix}
        </span>
      ) : null}
    </>
  )
}

function renderSegment(segment, index, total, onInternalNavigate) {
  const isLast = index === total - 1
  const useRouterLink = segment.href != null && isInternalAppPath(segment.href)
  const showLeadingIcon = index === 0 && segment.showIcon !== false
  const className = rootClusterClass

  if (!isLast && useRouterLink) {
    if (onInternalNavigate) {
      return (
        <button type="button" className={className} onClick={() => onInternalNavigate(segment.href)}>
          {renderSegmentContent(segment, showLeadingIcon)}
        </button>
      )
    }
    return (
      <Link to={segment.href} className={className}>
        {renderSegmentContent(segment, showLeadingIcon)}
      </Link>
    )
  }

  if (!isLast && segment.href != null) {
    return (
      <a href={segment.href} className={className}>
        {renderSegmentContent(segment, showLeadingIcon)}
      </a>
    )
  }

  return (
    <span aria-current={isLast ? "page" : undefined} className={rootClusterClass}>
      {renderSegmentContent(segment, showLeadingIcon)}
    </span>
  )
}

function projectIdFromHref(href) {
  if (typeof href !== "string") return null
  const match = /^\/project\/([^/?#]+)/.exec(href) ?? /^\/projects\/([^/?#]+)/.exec(href)
  return match ? decodeURIComponent(match[1]) : null
}

function projectIdFromLabel(label) {
  if (typeof label !== "string") return null
  const match = /^Project-(\d+)$/i.exec(label.trim())
  return match ? `Project-${match[1]}` : null
}

function projectIdFromSuffix(root, suffix) {
  if (root !== "Projects" || typeof suffix !== "string") return null
  const match = /^-(\d+)$/.exec(suffix.trim())
  return match ? `Project-${match[1]}` : null
}

function inferProjectId({ explicitProjectId, normalizedSegments, root, itemSuffix, pathname }) {
  if (explicitProjectId) return explicitProjectId

  for (const segment of normalizedSegments) {
    const fromHref = projectIdFromHref(segment.href)
    if (fromHref) return fromHref
    const fromLabel = projectIdFromLabel(segment.label)
    if (fromLabel) return fromLabel
  }

  const fromSuffix = projectIdFromSuffix(root, itemSuffix)
  if (fromSuffix) return fromSuffix

  return projectIdFromHref(pathname)
}

function selectedHrefFromLocation(location) {
  const path = location.pathname
  if (path.startsWith("/project/")) {
    return path
  }
  if (path.startsWith("/projects/")) {
    const params = new URLSearchParams(location.search)
    const tab = params.get("tab")
    return tab ? `${path}?tab=${tab}` : path
  }
  return path
}

/**
 * Path-aware breadcrumbs.
 * - Prefer `segments` for up to three levels, e.g. `Projects > Project-0001 > Issue-0001`.
 * - Legacy props (`root/item/itemSuffix`) are still supported.
 */
export function Breadcrumbs({
  root = "Sprint",
  item = "Issue",
  itemSuffix = "-0001",
  rootHref,
  segments,
  projectId,
  menuEnabled,
  defaultMenuOpen = false,
  /** Leading pictogram on the first segment (`5662:256760`). */
  iconName = "team",
}) {
  const workspaceNavigate = useWorkspaceNavigate()
  const location = useLocation()
  const outletContext = useWorkspaceOutletContext()
  const resolvedMenuEnabled = menuEnabled ?? outletContext?.breadcrumbsMenuEnabled ?? true
  const menuTeamId = outletContext?.navContext?.teamId ?? outletContext?.workspaceScope?.teamId
  const triggerRef = useRef(null)
  const menuRef = useRef(null)
  const [menuOpen, setMenuOpen] = useState(defaultMenuOpen)
  const normalizedSegments =
    Array.isArray(segments) && segments.length > 0
      ? segments
      : (() => {
          const showItem = item != null && !(typeof item === "string" && item.trim().length === 0)
          return [
            { label: root, href: rootHref, iconName, showIcon: true },
            ...(showItem ? [{ label: item, suffix: itemSuffix, showIcon: false }] : []),
          ]
        })()
  const menuProjectId = inferProjectId({
    explicitProjectId: projectId,
    normalizedSegments,
    root,
    itemSuffix,
    pathname: location.pathname,
  })
  const selectedHref = selectedHrefFromLocation(location)

  useEffect(() => {
    if (!menuOpen) return undefined
    const onDocumentPointerDown = (event) => {
      const target = event.target
      if (triggerRef.current?.contains(target) || menuRef.current?.contains(target)) return
      setMenuOpen(false)
    }
    document.addEventListener("pointerdown", onDocumentPointerDown)
    return () => document.removeEventListener("pointerdown", onDocumentPointerDown)
  }, [menuOpen])

  useEffect(() => {
    if (resolvedMenuEnabled) return
    // Close the menu as soon as the trigger becomes non-interactive.
    window.requestAnimationFrame(() => setMenuOpen(false))
  }, [resolvedMenuEnabled])

  return (
    <nav aria-label="Breadcrumb" className="inline-flex min-w-0">
      <div className={shellClass}>
        <div className="flex min-w-0 shrink items-center overflow-visible">
          {normalizedSegments.map((segment, index) => {
            const showLeadingIcon = index === 0 && segment.showIcon !== false
            const segmentForText = showLeadingIcon ? { ...segment, showIcon: false } : segment
            const hasSegmentText = segmentForText.showLabel !== false || Boolean(segmentForText.suffix)
            return (
              <div key={`${segment.label}-${index}`} className="inline-flex min-w-0 items-center">
                {showLeadingIcon ? (
                  resolvedMenuEnabled ? (
                    <button
                      ref={triggerRef}
                      type="button"
                      className="inline-flex h-[28px] shrink-0 items-center justify-center rounded-[2px] bg-transparent p-0 transition-colors duration-150 hover:bg-[var(--control-bg-hover)]"
                      aria-label="Open navigation menu"
                      aria-haspopup="menu"
                      aria-expanded={menuOpen}
                      onClick={() => setMenuOpen((value) => !value)}
                    >
                      <Icon name={segment.iconName ?? "team"} />
                    </button>
                  ) : (
                    <span
                      ref={triggerRef}
                      className="inline-flex h-[28px] shrink-0 items-center justify-center rounded-[2px] bg-transparent p-0"
                      aria-hidden
                    >
                      <Icon name={segment.iconName ?? "team"} />
                    </span>
                  )
                ) : null}
                {hasSegmentText ? renderSegment(segmentForText, index, normalizedSegments.length, workspaceNavigate) : null}
                {index < normalizedSegments.length - 1 && !(normalizedSegments.length === 3 && index === 0) ? (
                  <span aria-hidden className="inline-flex h-[28px] w-[16px] shrink-0 items-center justify-center">
                    {/* Figma trailing is 16×28, not 16×16 — avoid squashing */}
                    <img src={BREADCRUMB_CHEVRON} alt="" className="h-[28px] w-[16px]" draggable={false} />
                  </span>
                ) : null}
              </div>
            )
          })}

          {normalizedSegments.length === 0 ? (
            <>
              <span aria-hidden className="inline-flex h-[28px] w-[16px] shrink-0 items-center justify-center">
                {/* Figma trailing is 16×28, not 16×16 — avoid squashing */}
                <img src={BREADCRUMB_CHEVRON} alt="" className="h-[28px] w-[16px]" draggable={false} />
              </span>

              <div
                className="flex min-w-0 shrink items-center overflow-hidden leading-[0] whitespace-nowrap"
                aria-current="page"
              >
                <span className="shrink-0 whitespace-nowrap text-[var(--foreground-primary)]" style={chipSystemTextStyle} />
              </div>
            </>
          ) : null}
        </div>
      </div>
      <RightPanelNavMenu
        open={menuOpen}
        anchorRef={triggerRef}
        menuRef={menuRef}
        projectId={outletContext?.workspaceScope?.projectId ?? outletContext?.navContext?.projectId}
        project={outletContext?.workspaceScope?.project ?? outletContext?.activeProject}
        activeTeam={outletContext?.activeTeam}
        teamId={menuTeamId}
        selectedHref={selectedHref}
        onClose={() => setMenuOpen(false)}
        onNavigate={(href) => outletContext?.navigateInSession?.(href) ?? workspaceNavigate(href)}
      />
    </nav>
  )
}
