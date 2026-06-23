/** SVG glyphs from Figma (App — Arcade v0.3 SOR). Arrow.right `6003:7021`: `Icons/Arrow.up` rotated 90° in 28×28. */
const ICON_MAP = {
  /** Figma `6044:7714` — jabuticaba tile + 2×2 grid glyph. */
  projectGrid: "/icons/project-grid.svg",
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
  /** Figma `6232:11970` — Icons/Dot.in.left.window (Side panel). */
  sidePanel: "/icons/side-panel.svg",
  /** Figma `6235:12006` — Icons/Three.bars.horizontal (Canvas). */
  canvas: "/icons/canvas.svg",
  page: "/icons/page.svg",
  /** Figma `6069:8208` — Icons/Reply, Size=Micro (22×22 frame). */
  reply: "/icons/reply.svg",
}

export function Icon({ name = "team", className = "", size = "default" }) {
  const isLarge = size === "large"
  const isMicro = size === "micro"
  const wrap = `relative inline-flex ${isMicro ? "size-[18px]" : isLarge ? "size-[40px]" : "size-[28px]"} shrink-0 overflow-hidden ${className}`

  /** Centered glyph: 16×16 in micro (18 rail — Figma `6070:7937`), 20×20 in large, 16×16 default. */
  const centeredGlyph = isLarge ? "size-[20px]" : "size-[16px]"

  if (name === "project") {
    const tileClass = isMicro
      ? "absolute left-1/2 top-1/2 size-[18px] -translate-x-1/2 -translate-y-1/2 rounded-[2px] bg-[var(--jabuticaba-200)]"
      : "absolute left-[5px] top-[5px] size-[18px] rounded-[2px] bg-[var(--jabuticaba-200)]"
    return (
      <span className={wrap}>
        <span className={tileClass}>
          <span
            className="absolute block"
            style={{
              top: "27.5%",
              bottom: "27.5%",
              left: "27.5%",
              right: "27.5%",
            }}
          >
            <img
              src={ICON_MAP.projectGrid}
              alt=""
              className="absolute inset-0 block size-full max-h-none max-w-none select-none"
              draggable={false}
            />
          </span>
        </span>
      </span>
    )
  }

  /** Figma `6152:15072` — Project chat: jabuticaba circle + 2×2 grid. */
  if (name === "projectChat") {
    const tileClass = isMicro
      ? "absolute left-1/2 top-1/2 size-[18px] -translate-x-1/2 -translate-y-1/2 rounded-[20px] bg-[var(--jabuticaba-200)]"
      : "absolute left-[5px] top-[5px] size-[18px] rounded-[20px] bg-[var(--jabuticaba-200)]"
    return (
      <span className={wrap}>
        <span className={tileClass}>
          <span
            className="absolute block"
            style={{
              top: "27.5%",
              bottom: "27.5%",
              left: "27.5%",
              right: "27.5%",
            }}
          >
            <img
              src={ICON_MAP.projectGrid}
              alt=""
              className="absolute inset-0 block size-full max-h-none max-w-none select-none"
              draggable={false}
            />
          </span>
        </span>
      </span>
    )
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
        <span className="absolute left-[5px] top-[5px] size-[18px] rounded-full bg-[var(--foreground-primary)]">
          <span
            className="absolute block"
            style={{
              top: "29.72%",
              right: "31.25%",
              bottom: "41.6%",
              left: "31.25%",
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

  const src = ICON_MAP[name] ?? ICON_MAP.team

  return (
    <span className={wrap}>
      {/* Figma `5662:256708` etc.: glyph 16×16 @ (6,6) inside 28×28 */}
      <span className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 ${centeredGlyph}`}>
        <img src={src} alt="" className="absolute inset-0 block size-full max-w-none select-none" draggable={false} />
      </span>
    </span>
  )
}
