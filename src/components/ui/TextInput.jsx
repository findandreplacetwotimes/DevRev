export function TextInput({ className = "", ...props }) {
  return (
    <input
      className={`w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none ${className}`}
      {...props}
    />
  )
}
