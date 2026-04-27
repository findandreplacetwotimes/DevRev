const variants = {
  primary: "bg-indigo-500 text-white hover:bg-indigo-400",
  secondary: "bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700",
}

export function Button({ children, variant = "primary", className = "", ...props }) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
