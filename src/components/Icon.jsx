/** SVG glyphs from Figma (App — Arcade v0.3 SOR). Arrow.right `6003:7021`: `Icons/Arrow.up` rotated 90° in 28×28. */
const ICON_MAP = {
  /** Nav / project chip — Figma `6044:7714` Icons/Project, 28×28. */
  project: "/icons/project-nav.png",
  team: "/icons/team-bolt.svg",
  calendar: "/icons/calendar.svg",
  search: "/icons/search.svg",
  check: "/icons/check.svg",
  circle: "/icons/circle.svg",
  selected: "/icons/selected.svg",
  person: "/icons/person.svg",
  agent: "/icons/agent.svg",
  inbox: "/icons/inbox.svg",
  discover: "/icons/discover.svg",
  filter: "/icons/filter.svg",
  clock: "/icons/clock.svg",
  computer: "/icons/computer-chat.svg",
  messageBubble: "/icons/message-bubble-tail.svg",
  close: "/icons/close.svg",
  arrowUp: "/icons/arrow-up.svg",
  arrowUpLarge: "/icons/arrow-up-large.svg",
  plusSmall: "/icons/plus-small.svg",
  plus: "/icons/plus.svg",
  chevronDown: "/icons/chevron-down.svg",
  more: "/icons/more-horizontal.svg",
  page: "/icons/page.svg",
}

export function Icon({ name = "team", className = "", size = "default" }) {
  const isLarge = size === "large"
  const wrap = `relative inline-flex ${isLarge ? "size-[40px]" : "size-[28px]"} shrink-0 overflow-hidden ${className}`

  if (name === "project") {
    return (
      <span className={wrap}>
        <img
          src={ICON_MAP.project}
          alt=""
          className="pointer-events-none absolute left-0 top-0 size-[28px] max-w-none select-none object-contain"
          draggable={false}
        />
      </span>
    )
  }

  if (name === "team") {
    return (
      <span className={wrap}>
        {/* Figma components set: team tile 18×18 @ (5,5), Dragonfruit/200, regular corners (2px). */}
        <span className="absolute left-[5px] top-[5px] size-[18px] rounded-[2px] bg-[var(--dragonfruit-200)]">
          {/* Figma `5662:256813`: inset 23.75% vertical, 27.5% horizontal inside 18×18 */}
          <span
            className="absolute block"
            style={{
              top: "23.75%",
              bottom: "23.75%",
              left: "27.5%",
              right: "27.5%",
            }}
          >
            <img
              src={ICON_MAP.team}
              alt=""
              className="absolute inset-0 block size-full max-h-none max-w-none select-none"
              draggable={false}
            />
          </span>
        </span>
      </span>
    )
  }

  if (name === "chat") {
    return (
      <span className={wrap}>
        <span className="absolute left-[5px] top-[5px] size-[18px] rounded-[20px] bg-[var(--dragonfruit-200)]">
          <span
            className="absolute block"
            style={{
              top: "23.75%",
              bottom: "23.75%",
              left: "27.5%",
              right: "27.5%",
            }}
          >
            <img
              src={ICON_MAP.team}
              alt=""
              className="absolute inset-0 block size-full max-h-none max-w-none select-none"
              draggable={false}
            />
          </span>
        </span>
      </span>
    )
  }

  if (name === "computer") {
    return (
      <span className={wrap}>
        <span className="absolute left-[5px] top-[5px] size-[18px] rounded-[2px] bg-[var(--foreground-primary)]">
          <span
            className="absolute block"
            style={{
              top: "24.16%",
              bottom: "47.15%",
              left: "33.33%",
              right: "29.16%",
            }}
          >
            <img
              src={ICON_MAP.computer}
              alt=""
              className="absolute inset-0 block size-full max-h-none max-w-none select-none"
              draggable={false}
            />
          </span>
        </span>
      </span>
    )
  }

  if (name === "avatarWhite") {
    return (
      <span className={wrap}>
        <span className="absolute left-[5px] top-[5px] size-[18px] overflow-hidden rounded-full border border-[#eceaeb] bg-white">
          <span className="absolute left-1/2 top-1/2 h-[11px] w-[18px] -translate-x-1/2 -translate-y-1/2 text-center text-[9.9px] leading-[11px] text-[var(--foreground-secondary)]">
            M
          </span>
        </span>
      </span>
    )
  }

  if (name === "chevronUp") {
    return (
      <span className={wrap}>
        {/* Figma `5662:256740`: 16×16 @ (6,6), chevron.down flipped */}
        <span className="absolute left-[6px] top-[6px] flex size-[16px] items-center justify-center">
          <span className="flex-none scale-y-[-1]">
            <span className="relative block size-[16px]">
              <img
                src={ICON_MAP.chevronDown}
                alt=""
                className="absolute inset-0 block size-full max-w-none select-none"
                draggable={false}
              />
            </span>
          </span>
        </span>
      </span>
    )
  }

  if (name === "plus") {
    return (
      <span className={wrap}>
        <span
          className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 ${
            isLarge ? "size-[20px]" : "size-[16px]"
          }`}
        >
          <img
            src={isLarge ? ICON_MAP.plus : ICON_MAP.plusSmall}
            alt=""
            className="absolute inset-0 block size-full max-w-none select-none"
            draggable={false}
          />
        </span>
      </span>
    )
  }

  if (name === "arrowUp") {
    return (
      <span className={wrap}>
        <span
          className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 ${
            isLarge ? "size-[20px]" : "size-[16px]"
          }`}
        >
          <img
            src={isLarge ? ICON_MAP.arrowUpLarge : ICON_MAP.arrowUp}
            alt=""
            className="absolute inset-0 block size-full max-w-none select-none"
            draggable={false}
          />
        </span>
      </span>
    )
  }

  if (name === "arrowRight") {
    return (
      <span className={wrap}>
        <span
          className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 ${
            isLarge ? "size-[20px]" : "size-[16px]"
          }`}
        >
          <span className="relative block size-full rotate-90">
            <img
              src={isLarge ? ICON_MAP.arrowUpLarge : ICON_MAP.arrowUp}
              alt=""
              className="absolute inset-0 block size-full max-h-none max-w-none select-none"
              draggable={false}
            />
          </span>
        </span>
      </span>
    )
  }

  if (name === "circle" || name === "selected") {
    return (
      <span className={wrap}>
        {/* Table row `Selector`: Figma ~`5938:41981` • 16×16 @ optical center */}
        <span
          className={`absolute left-1/2 top-[calc(50%+0.5px)] -translate-x-1/2 -translate-y-1/2 ${
            isLarge ? "size-[20px]" : "size-[16px]"
          }`}
        >
          <img
            src={ICON_MAP[name]}
            alt=""
            className="absolute inset-0 block size-full max-w-none select-none"
            draggable={false}
          />
        </span>
      </span>
    )
  }

  if (name === "clock") {
    return (
      <span className={wrap}>
        {/* Figma `5906:39439` Icons/Clock (nav `5906:38856`): 16×16 centered, +0.5px optical offset */}
        <span
          className={`absolute left-1/2 top-[calc(50%+0.5px)] -translate-x-1/2 -translate-y-1/2 ${
            isLarge ? "size-[20px]" : "size-[16px]"
          }`}
        >
          <img
            src={ICON_MAP.clock}
            alt=""
            className="absolute inset-0 block size-full max-w-none select-none"
            draggable={false}
          />
        </span>
      </span>
    )
  }

  const src = ICON_MAP[name] ?? ICON_MAP.team

  return (
    <span className={wrap}>
      {/* Figma `5662:256708` etc.: glyph 16×16 @ (6,6) inside 28×28 */}
      <span
        className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 ${
          isLarge ? "size-[20px]" : "size-[16px]"
        }`}
      >
        <img src={src} alt="" className="absolute inset-0 block size-full max-w-none select-none" draggable={false} />
      </span>
    </span>
  )
}
