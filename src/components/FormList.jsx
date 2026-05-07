export function FormList({ children, className = "" }) {
  return (
    <div className={`flex w-[387px] flex-col items-start bg-[var(--background-primary-subtle)] ${className}`.trim()}>
      {children}
    </div>
  )
}
