import { Icon } from "./Icon"

export function SessionTabAddControl({ onAddSession }) {
  return (
    <div className="inline-flex shrink-0 items-center overflow-hidden rounded-[28px] bg-[var(--control-bg-rest-white)]">
      <button
        type="button"
        aria-label="Add session"
        onClick={() => onAddSession?.()}
        className="inline-flex size-[28px] items-center justify-center border-0 bg-transparent text-[var(--foreground-primary)] transition-colors duration-150 hover:bg-[var(--control-bg-hover)] appearance-none"
      >
        <Icon name="plus" />
      </button>
    </div>
  )
}
