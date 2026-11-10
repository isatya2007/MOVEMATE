import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../services/api.js'
import { timeAgo } from '../utils/formatDate.js'
import { useNotifications } from '../hooks/useNotifications.js'
import Alert from '../components/common/Alert.jsx'
import Button from '../components/common/Button.jsx'
import EmptyState from '../components/common/EmptyState.jsx'

// Where tapping each kind of notification takes you
const DESTINATION = {
  ride_request: '/my-rides',
  request_cancelled: '/my-rides',
  request_accepted: '/requests',
  request_rejected: '/requests',
  ride_cancelled: '/requests',
}

function Skeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-slate-200 bg-white p-4" aria-hidden="true">
      <div className="h-4 w-40 rounded bg-slate-200" />
      <div className="mt-3 h-4 w-3/4 rounded bg-slate-100" />
    </div>
  )
}

export default function Notifications() {
  const navigate = useNavigate()
  const { unreadCount, setUnreadCount } = useNotifications()
  const [attempt, setAttempt] = useState(0)
  const [state, setState] = useState({ key: -1, items: [], error: '' })
  const [now] = useState(() => Date.now()) // when this page was opened
  const [busy, setBusy] = useState(false)
  const [actionError, setActionError] = useState('')
  const loading = state.key !== attempt

  useEffect(() => {
    let cancelled = false
    api('/notifications')
      .then((data) => {
        if (cancelled) return
        setState({ key: attempt, items: data.notifications, error: '' })
        setUnreadCount(data.unreadCount)
      })
      .catch((err) => {
        if (!cancelled) setState({ key: attempt, items: [], error: err.message })
      })
    return () => {
      cancelled = true
    }
  }, [attempt, setUnreadCount])

  // Tapping a notification marks it as read, then takes you to the right page
  function open(item) {
    if (!item.read) {
      setState((s) => ({ ...s, items: s.items.map((n) => (n.id === item.id ? { ...n, read: true } : n)) }))
      setUnreadCount((c) => Math.max(0, c - 1))
      api(`/notifications/${item.id}/read`, { method: 'PATCH' }).catch(() => {})
    }
    navigate(DESTINATION[item.type] || '/dashboard')
  }

  async function markAllRead() {
    setBusy(true)
    setActionError('')
    try {
      await api('/notifications/read-all', { method: 'PATCH' })
      setState((s) => ({ ...s, items: s.items.map((n) => ({ ...n, read: true })) }))
      setUnreadCount(0)
    } catch (err) {
      setActionError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="mx-auto max-w-2xl">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Notifications</h1>
          <p className="mt-1 text-slate-600">
            {unreadCount > 0 ? `${unreadCount} unread` : 'You are all caught up.'}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="secondary" className="h-11" loading={busy} onClick={markAllRead}>
            Mark all as read
          </Button>
        )}
      </div>

      {actionError && (
        <div className="mt-4">
          <Alert>{actionError}</Alert>
        </div>
      )}

      <div className="mt-6" aria-live="polite">
        {loading ? (
          <div className="space-y-3">
            <Skeleton />
            <Skeleton />
            <Skeleton />
          </div>
        ) : state.error ? (
          <div className="space-y-4">
            <Alert>{state.error}</Alert>
            <Button variant="secondary" onClick={() => setAttempt((n) => n + 1)}>
              Try again
            </Button>
          </div>
        ) : state.items.length === 0 ? (
          <EmptyState title="No notifications yet">
            When someone asks for a seat on your ride, or replies to your request, you will see it here.
          </EmptyState>
        ) : (
          <ul className="space-y-3">
            {state.items.map((n) => (
              <li key={n.id}>
                <button
                  type="button"
                  onClick={() => open(n)}
                  className={`flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition hover:shadow-sm focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-100 ${
                    n.read ? 'border-slate-200 bg-white' : 'border-brand-100 bg-brand-50'
                  }`}
                >
                  <span
                    className={`mt-1.5 size-2.5 shrink-0 rounded-full ${n.read ? 'bg-transparent' : 'bg-brand-700'}`}
                    aria-hidden="true"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold text-slate-900">
                      {!n.read && <span className="sr-only">Unread: </span>}
                      {n.title}
                    </span>
                    <span className="mt-0.5 block text-sm text-slate-700">{n.body}</span>
                    <span className="mt-1 block text-xs text-slate-500">{timeAgo(n.createdAt, now)}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}