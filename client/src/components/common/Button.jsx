const variants = {
  primary: 'bg-brand-700 text-white hover:bg-brand-800 focus-visible:ring-brand-100',
  secondary: 'border border-slate-300 bg-white text-slate-800 hover:bg-slate-50 focus-visible:ring-slate-200',
}

export default function Button({
  children,
  loading = false,
  variant = 'primary',
  type = 'button',
  className = '',
  disabled,
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`inline-flex h-12 items-center justify-center gap-2 rounded-xl px-5 text-base font-semibold transition focus-visible:outline-none focus-visible:ring-4 disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${className}`}
      {...props}
    >
      {loading && (
        <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden="true" />
      )}
      {children}
    </button>
  )
}
