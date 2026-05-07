import { Link } from "react-router-dom"
import { Icon } from "./Icon"

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

function renderSegment(segment, index, total) {
  const isLast = index === total - 1
  const useRouterLink = segment.href != null && isInternalAppPath(segment.href)
  const showLeadingIcon = index === 0 && segment.showIcon !== false
  const className = `${rootClusterClass}${segment.href ? " cursor-pointer" : ""}`

  if (!isLast && useRouterLink) {
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

/**
 * Path-aware breadcrumbs.
 * - Prefer `segments` for up to three levels, e.g. `Projects > Project-0001 > Issue-0001`.
 * - Legacy props (`root/item/itemSuffix`) are still supported.
 */
export function Breadcrumbs({ root = "Sprint", item = "Issue", itemSuffix = "-0001", rootHref, segments }) {
  const normalizedSegments =
    Array.isArray(segments) && segments.length > 0
      ? segments
      : (() => {
          const showItem = item != null && !(typeof item === "string" && item.trim().length === 0)
          return [
            { label: root, href: rootHref, iconName: "team", showIcon: true },
            ...(showItem ? [{ label: item, suffix: itemSuffix, showIcon: false }] : []),
          ]
        })()

  return (
    <nav aria-label="Breadcrumb" className="inline-flex min-w-0">
      <div className={shellClass}>
        <div className="flex min-w-0 shrink items-center overflow-visible">
          {normalizedSegments.map((segment, index) => (
            <div key={`${segment.label}-${index}`} className="inline-flex min-w-0 items-center">
              {renderSegment(segment, index, normalizedSegments.length)}
              {index < normalizedSegments.length - 1 && !(normalizedSegments.length === 3 && index === 0) ? (
                <span aria-hidden className="inline-flex h-[28px] w-[16px] shrink-0 items-center justify-center">
                  {/* Figma trailing is 16×28, not 16×16 — avoid squashing */}
                  <img src={BREADCRUMB_CHEVRON} alt="" className="h-[28px] w-[16px]" draggable={false} />
                </span>
              ) : null}
            </div>
          ))}

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
    </nav>
  )
}
