/** SVG glyphs from Figma (App — Arcade v0.3 SOR, `5662:256702`). Arrow.right `6003:7021`: `Icons/Arrow.up` rotated 90° in 28×28. */
const ICON_MAP = {
  teamBolt: "/icons/team-bolt.svg",
  teamBoltChat: "/icons/team-bolt-chat.svg",
  projectGrid: "/icons/project-grid.svg",
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
  chatBubbles: "/icons/chat-bubbles.svg",
  /** Figma `5991:7650` — Property 1=MP, Size=Default. */
  mp: "/icons/chat-bubbles.svg",
  computer: "/icons/computer-chat.svg",
  messageBubble: "/icons/message-bubble-tail.svg",
  close: "/icons/close.svg",
  arrowUp: "/icons/arrow-up.svg",
  arrowUpLarge: "/icons/arrow-up-large.svg",
  /** Figma `6089:9419` — Icons/Arrow.right Small, 16×16 stroked glyph. */
  arrowRightSmall: "/icons/arrow-right-small.svg",
  plusSmall: "/icons/plus-small.svg",
  plus: "/icons/plus.svg",
  chevronDown: "/icons/chevron-down.svg",
  more: "/icons/more-horizontal.svg",
  page: "/icons/page.svg",
  /** Figma `6069:8208` — Icons/Reply, Size=Micro (22×22 frame). */
  reply: "/icons/reply.svg",
}

const BOLT_PICTOGRAM_INSET = {
  top: "23.75%",
  bottom: "23.75%",
  left: "27.5%",
  right: "27.5%",
}

const GRID_PICTOGRAM_INSET = {
  top: "27.5%",
  bottom: "27.5%",
  left: "27.5%",
  right: "27.5%",
}

function PictogramTile({ wrap, rounded, bgClass, glyphSrc, glyphInset = BOLT_PICTOGRAM_INSET, glyphClassName = "" }) {
  const radiusClass = rounded === "circle" ? "rounded-[20px]" : "rounded-[2px]"
  return (
    <span className={wrap}>
      <span className={`absolute left-[5px] top-[5px] size-[18px] ${radiusClass} ${bgClass}`}>
        <span className="absolute block" style={glyphInset}>
          <img
            src={glyphSrc}
            alt=""
            className={`absolute inset-0 block size-full max-h-none max-w-none select-none ${glyphClassName}`}
            draggable={false}
          />
        </span>
      </span>
    </span>
  )
}

export function Icon({ name = "team", className = "", size = "default" }) {
  const isLarge = size === "large"
  const isMicro = size === "micro"
  const wrap = `relative inline-flex ${isMicro ? "size-[18px]" : isLarge ? "size-[40px]" : "size-[28px]"} shrink-0 overflow-hidden ${className}`

  /** Centered glyph: 16×16 in micro (18 rail — Figma `6070:7937`), 20×20 in large, 16×16 default. */
  const centeredGlyph = isLarge ? "size-[20px]" : "size-[16px]"

  /** Figma `5662:256701` — Team: red square + white bolt (`#F5F5F5`). */
  if (name === "team") {
    return PictogramTile({
      wrap,
      rounded: "square",
      bgClass: "bg-[var(--dragonfruit-200)]",
      glyphSrc: ICON_MAP.teamBoltChat,
    })
  }

  /** Figma `5906:39049` — Chat: red circle + white bolt (`#F5F5F5`). */
  if (name === "chat") {
    return PictogramTile({
      wrap,
      rounded: "circle",
      bgClass: "bg-[var(--dragonfruit-200)]",
      glyphSrc: ICON_MAP.teamBoltChat,
    })
  }

  /** Figma `6044:7714` — Project: jabuticaba square + 2×2 grid. */
  if (name === "project") {
    return PictogramTile({
      wrap,
      rounded: "square",
      bgClass: "bg-[var(--jabuticaba-200)]",
      glyphSrc: ICON_MAP.projectGrid,
      glyphInset: GRID_PICTOGRAM_INSET,
    })
  }

  /** Figma `6152:15072` — Project chat: jabuticaba circle + 2×2 grid. */
  if (name === "projectChat") {
    return PictogramTile({
      wrap,
      rounded: "circle",
      bgClass: "bg-[var(--jabuticaba-200)]",
      glyphSrc: ICON_MAP.projectGrid,
      glyphInset: GRID_PICTOGRAM_INSET,
    })
  }

  if (name === "reply") {
    return (
      <span className={wrap}>
        <span className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 ${centeredGlyph}`}>
          <img
            src={ICON_MAP.reply}
            alt=""
            className="absolute inset-0 block size-full max-w-none select-none"
            draggable={false}
          />
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
        <span className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 ${centeredGlyph}`}>
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
        <span className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 ${centeredGlyph}`}>
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
        <span className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 ${centeredGlyph}`}>
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

  if (name === "arrowRightSmall") {
    return (
      <span className={wrap}>
        <span className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 ${centeredGlyph}`}>
          <img
            src={ICON_MAP.arrowRightSmall}
            alt=""
            className="absolute inset-0 block size-full max-w-none select-none"
            draggable={false}
          />
        </span>
      </span>
    )
  }

  if (name === "circle" || name === "selected") {
    return (
      <span className={wrap}>
        {/* Table row `Selector`: Figma ~`5938:41981` • 16×16 @ optical center */}
        <span
          className={`absolute left-1/2 top-[calc(50%+0.5px)] -translate-x-1/2 -translate-y-1/2 ${centeredGlyph}`}
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
          className={`absolute left-1/2 top-[calc(50%+0.5px)] -translate-x-1/2 -translate-y-1/2 ${centeredGlyph}`}
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

  const src = ICON_MAP[name] ?? ICON_MAP.teamBolt

  return (
    <span className={wrap}>
      {/* Figma `5662:256708` etc.: glyph 16×16 @ (6,6) inside 28×28 */}
      <span className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 ${centeredGlyph}`}>
        <img src={src} alt="" className="absolute inset-0 block size-full max-w-none select-none" draggable={false} />
      </span>
    </span>
  )
}
