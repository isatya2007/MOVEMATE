const STATUS = {
  // requests
  pending: { label: 'Waiting for reply', style: 'bg-amber-50 text-amber-800 ring-amber-200' },
  accepted: { label: 'Confirmed', style: 'bg-emerald-50 text-emerald-800 ring-emerald-200' },
  rejected: { label: 'Declined', style: 'bg-red-50 text-red-800 ring-red-200' },
  cancelled: { label: 'Cancelled', style: 'bg-slate-100 text-slate-700 ring-slate-200' },
  completed: { label: 'Completed', style: 'bg-brand-50 text-brand-800 ring-brand-100' },
  no_show: { label: 'No-show', style: 'bg-slate-100 text-slate-700 ring-slate-200' },
  // rides
  published: { label: 'Open for requests', style: 'bg-emerald-50 text-emerald-800 ring-emerald-200' },
  in_progress: { label: 'On the way', style: 'bg-brand-50 text-brand-800 ring-brand-100' },
  departed: { label: 'Departed', style: 'bg-slate-100 text-slate-700 ring-slate-200' },
}

// Colour AND words, so the meaning never depends on colour alone
export default function StatusBadge({ status }) {
  const s = STATUS[status] || STATUS.cancelled
  return (
    <span className={`inline-block rounded-full px-3 py-1 text-sm font-semibold ring-1 ring-inset ${s.style}`}>
      {s.label}
    </span>
  )
}