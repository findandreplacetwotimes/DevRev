/**
 * Animated chat bubble → X icon toggle.
 * Arcade design system styling with smooth rotation animation.
 */
export function ChatToggleIcon({ isOpen = false }) {
  return (
    <span className="relative inline-flex size-[28px] shrink-0 items-center justify-center overflow-visible">
      {/* Background with hover effect */}
      <span
        className="absolute inset-0 rounded-lg"
        style={{
          background: isOpen ? "hsl(var(--bg-interactive-tertiary-hovered))" : "transparent",
          transition: "background 0.3s ease",
        }}
      />

      {/* Animated icon container */}
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10"
        style={{
          color: "hsl(var(--text-color-primary))",
          overflow: "visible",
        }}
      >
        <g
          style={{
            transformOrigin: "center",
            transform: isOpen ? "rotate(90deg) scale(0.95)" : "rotate(0deg) scale(1)",
            transition: "transform 0.6s cubic-bezier(0.34, 1.2, 0.64, 1)",
          }}
        >
          {isOpen ? (
            // X icon (close)
            <path
              d="M4 4 L12 12 M12 4 L4 12"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                opacity: 1,
                transition: "opacity 0.3s ease 0.15s",
              }}
            />
          ) : (
            // Chat bubble icon (stroke-based to match other icons)
            <path
              d="M2.5 3.5 C2.5 2.95 2.95 2.5 3.5 2.5 L12.5 2.5 C13.05 2.5 13.5 2.95 13.5 3.5 L13.5 9.5 C13.5 10.05 13.05 10.5 12.5 10.5 L5.5 10.5 L2.5 13.5 Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              style={{
                opacity: 1,
                transition: "opacity 0.3s ease 0.15s",
              }}
            />
          )}
        </g>
      </svg>
    </span>
  )
}
