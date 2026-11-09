import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../services/api.js'
import { formatDeparture } from '../utils/formatDate.js'
import StatusBadge from '../components/common/StatusBadge.jsx'
import RideRequestsList from '../components/rides/RideRequestsList.jsx'
import Button from '../components/common/Button.jsx'
import Alert from '../components/common/Alert.jsx'
import EmptyState from '../components/common/EmptyState.jsx'

const CANCEL_REASONS = ['My plans changed', 'Vehicle problem', 'Bad weather or road conditions', 'Other']

const selectClass =
  'mt-1.5 h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-base text-slate-900 outline-none transition focus:border-brand-600 focus:ring-4 focus:ring-brand-100'

function MyRideCard({ ride, upcoming, onPatch }) {
  const [confirming, setConfirming] = useState(false)
  const [choice, setChoice] = useState('')
  const [other, setOther] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const booked = ride.seatsTotal - ride.seatsAvailable
  const badge = ride.status === 'published' && !upcoming ? 'departed' : ride.status

  async function cancelRide() {
    const reason = choice === 'Other' ? other.trim() : choice
    if (!reason) {
      setError('Choose a reason so travellers know what happened.')
      return
    }
    if (reason.length < 3) {
      setError('Please write a little more (at least 3 characters).')
      return
    }

    setBusy(true)
    setError('')
    try {
      await api(`/rides/${ride.id}`, { method: 'DELETE', body: { reason } })
      onPatch(ride.id, { status: 'cancelled', cancelReason: reason })
    } catch (err) {
      setError(err.details?.[0]?.message || err.message)
    } finally {
      setBusy(false)
    }
  }

  const vehicle = ride.vehicle
    ? [ride.vehicle.colour, ride.vehicle.make, ride.vehicle.model].filter(Boolean).join(' ') || ride.vehicle.type
    : ''

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-lg font-bold text-slate-900">{formatDeparture(ride.departureAt)}</p>
          <p className="text-sm text-slate-600">
            {booked} of {ride.seatsTotal} {ride.seatsTotal === 1 ? 'seat' : 'seats'} booked
            {ride.farePerSeat != null && ` · ${ride.farePerSeat === 0 ? 'Free' : `About ₹${ride.farePerSeat} per seat`}`}
          </p>
        </div>
        <StatusBadge status={badge} />
      </div>

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

      {vehicle && <p className="mt-3 text-sm text-slate-500">Vehicle: {vehicle}</p>}

      {ride.status === 'cancelled' && (
        <p className="mt-3 text-sm text-slate-600">
          You cancelled this ride{ride.cancelReason ? `: ${ride.cancelReason}` : '.'}
        </p>
      )}

      {upcoming && (
        <>
          <RideRequestsList
            rideId={ride.id}
            onSeatsChanged={(id, seatsAvailable) => onPatch(id, { seatsAvailable })}
          />

          <div className="mt-5 border-t border-slate-100 pt-4">
            {error && (
              <div className="mb-3">
                <Alert>{error}</Alert>
              </div>
            )}

            {confirming ? (
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-sm font-medium text-slate-900">Cancel this ride?</p>
                <p className="mt-1 text-sm text-slate-600">
                  Everyone who asked for a seat will see their request as cancelled in My requests.
                </p>

                <label htmlFor={`cancel-${ride.id}`} className="mt-3 block text-sm font-medium text-slate-700">
                  Reason
                </label>
                <select id={`cancel-${ride.id}`} value={choice} onChange={(e) => setChoice(e.target.value)} className={selectClass}>
                  <option value="">Choose a reason</option>
                  {CANCEL_REASONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>

                {choice === 'Other' && (
                  <input
                    type="text"
                    maxLength={200}
                    value={other}
                    onChange={(e) => setOther(e.target.value)}
                    aria-label="Write your reason"
                    placeholder="Write your reason"
                    className={selectClass}
                  />
                )}

                <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                  <Button className="h-11" loading={busy} onClick={cancelRide}>
                    Yes, cancel the ride
                  </Button>
                  <Button variant="secondary" className="h-11" disabled={busy} onClick={() => setConfirming(false)}>
                    Keep the ride
                  </Button>
                </div>
              </div>
            ) : (
              <Button variant="secondary" className="h-11 w-full sm:w-auto" onClick={() => setConfirming(true)}>
                Cancel ride
              </Button>
            )}
          </div>
        </>
      )}
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

export default function MyRides() {
  const [attempt, setAttempt] = useState(0)
  const [state, setState] = useState({ key: -1, rides: [], error: '' })
  const [now] = useState(() => Date.now()) // when this page was opened
  const loading = state.key !== attempt

  useEffect(() => {
    let cancelled = false
    api('/rides/mine')
      .then((data) => {
        if (!cancelled) setState({ key: attempt, rides: data.rides, error: '' })
      })
      .catch((err) => {
        if (!cancelled) setState({ key: attempt, rides: [], error: err.message })
      })
    return () => {
      cancelled = true
    }
  }, [attempt])

  function patchRide(id, changes) {
    setState((s) => ({ ...s, rides: s.rides.map((r) => (r.id === id ? { ...r, ...changes } : r)) }))
  }

  const isUpcoming = (r) => r.status === 'published' && new Date(r.departureAt).getTime() > now
  const upcoming = state.rides
    .filter(isUpcoming)
    .sort((a, b) => new Date(a.departureAt) - new Date(b.departureAt))
  const past = state.rides.filter((r) => !isUpcoming(r))

  return (
    <section className="mx-auto max-w-3xl">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">My rides</h1>
          <p className="mt-1 text-slate-600">Rides you are offering, and the people who asked to join.</p>
        </div>
        <Link
          to="/offer"
          className="inline-flex h-11 items-center rounded-xl bg-brand-700 px-5 text-sm font-semibold text-white hover:bg-brand-800"
        >
          Offer a ride
        </Link>
      </div>

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
        ) : state.rides.length === 0 ? (
          <EmptyState title="You have not offered a ride yet">
            Going somewhere with empty seats?{' '}
            <Link to="/offer" className="font-semibold text-brand-700 underline">
              Offer a ride
            </Link>
          </EmptyState>
        ) : (
          <div className="space-y-8">
            {upcoming.length > 0 && (
              <div>
                <h2 className="mb-3 text-lg font-semibold text-slate-900">Upcoming</h2>
                <div className="space-y-4">
                  {upcoming.map((r) => (
                    <MyRideCard key={r.id} ride={r} upcoming onPatch={patchRide} />
                  ))}
                </div>
              </div>
            )}

            {past.length > 0 && (
              <div>
                <h2 className="mb-3 text-lg font-semibold text-slate-900">Past and cancelled</h2>
                <div className="space-y-4">
                  {past.map((r) => (
                    <MyRideCard key={r.id} ride={r} upcoming={false} onPatch={patchRide} />
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