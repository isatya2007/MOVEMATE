export default function EmptyState({ title, children }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center">
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      {children && <div className="mx-auto mt-2 max-w-md text-sm text-slate-600">{children}</div>}
    </div>
  )
}