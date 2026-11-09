import { useEffect, useState } from 'react'
import { api } from '../../services/api.js'
import ProviderRequestItem from './ProviderRequestItem.jsx'
import Alert from '../common/Alert.jsx'
import Button from '../common/Button.jsx'

// All requests for ONE ride. onSeatsChanged(rideId, seatsAvailable) keeps the ride card's seat count right.
export default function RideRequestsList({ rideId, onSeatsChanged }) {
  const [attempt, setAttempt] = useState(0)
  const [state, setState] = useState({ key: -1, requests: [], error: '' })
  const loading = state.key !== attempt

  useEffect(() => {
    let cancelled = false
    api(`/rides/${rideId}/requests`)
      .then((data) => {
        if (!cancelled) setState({ key: attempt, requests: data.requests, error: '' })
      })
      .catch((err) => {
        if (!cancelled) setState({ key: attempt, requests: [], error: err.message })
      })
    return () => {
      cancelled = true
    }
  }, [rideId, attempt])

  function handleUpdated(requestId, changes, seatsAvailable) {
    setState((s) => ({
      ...s,
      requests: s.requests.map((r) => (r.id === requestId ? { ...r, ...changes } : r)),
    }))
    if (seatsAvailable !== undefined) onSeatsChanged(rideId, seatsAvailable)
  }

  // Waiting requests first, so they are the first thing a provider sees
  const sorted = [...state.requests].sort((a, b) => {
    const rank = (r) => (r.status === 'pending' ? 0 : r.status === 'accepted' ? 1 : 2)
    return rank(a) - rank(b)
  })
  const waiting = state.requests.filter((r) => r.status === 'pending').length

  return (
    <div className="mt-5 border-t border-slate-100 pt-4">
      <h3 className="text-base font-semibold text-slate-900">
        Requests
        {!loading && !state.error && (
          <span className="ml-2 text-sm font-medium text-slate-500">
            {state.requests.length === 0 ? 'none yet' : waiting > 0 ? `${waiting} waiting for you` : 'all answered'}
          </span>
        )}
      </h3>

      <div className="mt-3" aria-live="polite">
        {loading ? (
          <p className="text-sm text-slate-500">Loading requests…</p>
        ) : state.error ? (
          <div className="space-y-3">
            <Alert>{state.error}</Alert>
            <Button variant="secondary" className="h-11" onClick={() => setAttempt((n) => n + 1)}>
              Try again
            </Button>
          </div>
        ) : state.requests.length === 0 ? (
          <p className="text-sm text-slate-600">
            Nobody has asked for a seat yet. Requests will show up here.
          </p>
        ) : (
          <ul className="space-y-3">
            {sorted.map((r) => (
              <ProviderRequestItem key={r.id} request={r} onUpdated={handleUpdated} />
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}