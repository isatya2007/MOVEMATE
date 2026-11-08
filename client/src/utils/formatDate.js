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