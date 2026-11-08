export default function Loader({ label = 'Loading…' }) {
  return (
    <div className="flex min-h-[40vh] items-center justify-center" role="status" aria-live="polite">
      <span
        className="size-8 animate-spin rounded-full border-4 border-brand-100 border-t-brand-700"
        aria-hidden="true"
      />
      <span className="sr-only">{label}</span>
    </div>
  )
}
