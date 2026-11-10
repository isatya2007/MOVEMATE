const pad = (n) => String(n).padStart(2, '0')

// Date -> "2026-11-10T14:30" (the format an <input type="datetime-local"> understands, in local time)
export function toLocalInputValue(date) {
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}`
  )
}

// A friendly default for the search: the next full hour, two hours from now
export function defaultSearchTime() {
  const d = new Date()
  d.setMinutes(0, 0, 0)
  d.setHours(d.getHours() + 2)
  return d
}

// "Tue, 10 Nov, 2:30 pm"
export function formatDeparture(iso) {
  return new Intl.DateTimeFormat('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(iso))
}

// "Just now", "5 minutes ago", "yesterday", "3 days ago", or a date for older ones.
// `now` is passed in (a number from Date.now()) so the result stays the same while a page is open.
export function timeAgo(iso, now) {
  const seconds = Math.round((new Date(iso).getTime() - now) / 1000) // negative = in the past
  const abs = Math.abs(seconds)
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })

  if (abs < 60) return 'Just now'
  if (abs < 3600) return rtf.format(Math.round(seconds / 60), 'minute')
  if (abs < 86400) return rtf.format(Math.round(seconds / 3600), 'hour')
  if (abs < 7 * 86400) return rtf.format(Math.round(seconds / 86400), 'day')
  return new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short' }).format(new Date(iso))
}