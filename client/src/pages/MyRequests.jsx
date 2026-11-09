import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../services/api.js'
import { formatDeparture } from '../utils/formatDate.js'
import StatusBadge from '../components/common/StatusBadge.jsx'
import Button from '../components/common/Button.jsx'
import Alert from '../components/common/Alert.jsx'
import EmptyState from '../components/common/EmptyState.jsx'

// A plain-language line for each status, so nobody has to guess what happens next
function statusMessage(request) {
  const provider = request.ride?.providerName || 'The provider'
  switch (request.status) {
    case 'pending':
      return `Waiting for ${provider} to reply. No seat is held until they accept.`
    case 'accepted':
      return 'Your seat is confirmed.'
    case 'rejected':
      return request.rejectReason ? `Declined: ${request.rejectReason}` : 'The provider could not take this request.'
    case 'cancelled':
      return request.cancelReason ? `Cancelled: ${request.cancelReason}` : 'This request was cancelled.'
    default:
      return ''
  }
}

function RequestCard({ request, onCancelled }) {
  const { ride } = request
  const [confirming, setConfirming] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const canCancel = ['pending', 'accepted'].includes(request.status) && ride?.status === 'published'

  async function cancel() {
    setBusy(true)
    setError('')
    try {
      await api(`/ride-requests/${request.id}`, {
        method: 'PATCH',
        body: { status: 'cancelled', reason: 'Cancelled by traveler' },
      })
      setConfirming(false)
      onCancelled(request.id)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-lg font-bold text-slate-900">{ride ? formatDeparture(ride.departureAt) : 'Ride unavailable'}</p>
          <p className="text-sm text-slate-600">
            {request.passengerCount} {request.passengerCount === 1 ? 'passenger' : 'passengers'}
            {ride?.providerName && ` · with ${ride.providerName}`}
          </p>
        </div>
        <StatusBadge status={request.status} />
      </div>

      {ride && (
        <ol className="mt-4 space-y-3 border-l-2 border-slate-200 pl-4">
          <li className="relative">
            <span className="absolute -left-[1.4rem] top-1.5 size-3 rounded-full border-2 border-brand-700 bg-white" aria-hidden="true" />
            <p className="font-medium text-slate-900">{ride.origin.label}</p>
          </li>
          <li className="relative">
            <span className="absolute -left-[1.4rem] top-1.5 size-3 rounded-full bg-brand-700" aria-hidden="true" />
            <p className="font-medium text-slate-900">{ride.destination.label}</p>
          </li>
        </ol>
      )}

      <p className="mt-4 text-sm text-slate-700">{statusMessage(request)}</p>

      {request.message && <p className="mt-2 text-sm text-slate-500">Your message: “{request.message}”</p>}

      {error && (
        <div className="mt-3">
          <Alert>{error}</Alert>
        </div>
      )}

      {canCancel &&
        (confirming ? (
          <div className="mt-4 rounded-xl bg-slate-50 p-4">
            <p className="text-sm font-medium text-slate-900">
              Cancel this request?
              {request.status === 'accepted' && ' Your confirmed seat will be given back.'}
            </p>
            <div className="mt-3 flex flex-col gap-3 sm:flex-row">
              <Button className="h-11" loading={busy} onClick={cancel}>
                Yes, cancel it
              </Button>
              <Button variant="secondary" className="h-11" disabled={busy} onClick={() => setConfirming(false)}>
                Keep it
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-4">
            <Button variant="secondary" className="h-11 w-full sm:w-auto" onClick={() => setConfirming(true)}>
              Cancel request
            </Button>
          </div>
        ))}
    </article>
  )
}

function Skeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5" aria-hidden="true">
      <div className="h-5 w-44 rounded bg-slate-200" />
      <div className="mt-2 h-4 w-32 rounded bg-slate-100" />
      <div className="mt-5 h-4 w-3/4 rounded bg-slate-100" />
      <div className="mt-3 h-4 w-2/3 rounded bg-slate-100" />
    </div>
  )
}

export default function MyRequests() {
  const [attempt, setAttempt] = useState(0)
  const [state, setState] = useState({ key: -1, requests: [], error: '' })
  const loading = state.key !== attempt

  useEffect(() => {
    let cancelled = false
    api('/ride-requests/mine')
      .then((data) => {
        if (!cancelled) setState({ key: attempt, requests: data.requests, error: '' })
      })
      .catch((err) => {
        if (!cancelled) setState({ key: attempt, requests: [], error: err.message })
      })
    return () => {
      cancelled = true
    }
  }, [attempt])

  // Update the list on screen without loading everything again
  function markCancelled(id) {
    setState((s) => ({
      ...s,
      requests: s.requests.map((r) =>
        r.id === id ? { ...r, status: 'cancelled', cancelReason: 'Cancelled by traveler' } : r
      ),
    }))
  }

  const active = state.requests
    .filter((r) => ['pending', 'accepted'].includes(r.status))
    .sort((a, b) => new Date(a.ride?.departureAt) - new Date(b.ride?.departureAt))
  const past = state.requests.filter((r) => !['pending', 'accepted'].includes(r.status))

  return (
    <section>
      <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">My requests</h1>
      <p className="mt-1 text-slate-600">Rides you have asked to join.</p>

      <div className="mt-6" aria-live="polite">
        {loading ? (
          <div className="space-y-4">
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
        ) : state.requests.length === 0 ? (
          <EmptyState title="No requests yet">
            When you ask to join a ride, it shows up here.{' '}
            <Link to="/dashboard" className="font-semibold text-brand-700 underline">
              Find a ride
            </Link>
          </EmptyState>
        ) : (
          <div className="space-y-8">
            {active.length > 0 && (
              <div>
                <h2 className="mb-3 text-lg font-semibold text-slate-900">Active</h2>
                <div className="space-y-4">
                  {active.map((r) => (
                    <RequestCard key={r.id} request={r} onCancelled={markCancelled} />
                  ))}
                </div>
              </div>
            )}

            {past.length > 0 && (
              <div>
                <h2 className="mb-3 text-lg font-semibold text-slate-900">Past</h2>
                <div className="space-y-4">
                  {past.map((r) => (
                    <RequestCard key={r.id} request={r} onCancelled={markCancelled} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}