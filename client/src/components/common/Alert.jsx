const styles = {
  error: 'border-red-200 bg-red-50 text-red-800',
  info: 'border-brand-100 bg-brand-50 text-brand-800',
}

export default function Alert({ children, tone = 'error' }) {
  return (
    <div role={tone === 'error' ? 'alert' : 'status'} className={`rounded-xl border px-4 py-3 text-sm ${styles[tone]}`}>
      {children}
    </div>
  )
}
