import { Link } from 'react-router-dom'
import { formatDeparture } from '../../utils/formatDate.js'
import Button from '../common/Button.jsx'

function matchTier(score) {
  if (score >= 80) return { label: 'Great match', style: 'bg-emerald-50 text-emerald-800 ring-emerald-200' }
  if (score >= 60) return { label: 'Good match', style: 'bg-amber-50 text-amber-800 ring-amber-200' }
  return { label: 'Possible match', style: 'bg-slate-100 text-slate-700 ring-slate-200' }
}

// Only shows what has really been checked (SRS rule BR-10)
function verificationChips(v = {}) {
  const chips = []
  if (v.phone) chips.push('Phone verified')
  if (v.email) chips.push('Email verified')
  if (v.community === 'verified') chips.push('Community verified')
  else if (v.community === 'pending') chips.push('Community check pending')
  return chips
}

function initials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
}

// requested : true once this person has sent a request for this ride
// onRequest : called with the ride when "Request seat" is tapped
export default function RideCard({ ride, requested = false, onRequest }) {
  const { provider, vehicle, match } = ride
  const tier = matchTier(match.score)
  const chips = verificationChips(provider?.verificationStatus)
  const vehicleName = vehicle ? [vehicle.colour, vehicle.make, vehicle.model].filter(Boolean).join(' ') || vehicle.type : ''

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      {/* Top row: time and match */}
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-lg font-bold text-slate-900">{formatDeparture(ride.departureAt)}</p>
          <p className="text-sm text-slate-600">
            {ride.seatsAvailable} {ride.seatsAvailable === 1 ? 'seat' : 'seats'} left
            {ride.farePerSeat != null && (
              <>
                {' · '}
                {ride.farePerSeat === 0 ? 'Free' : `About ₹${ride.farePerSeat} per seat`}
              </>
            )}
          </p>
        </div>

        <span className={`rounded-full px-3 py-1 text-sm font-semibold ring-1 ring-inset ${tier.style}`}>
          {tier.label} · {match.score}%
        </span>
      </div>

      {/* Route */}
      <ol className="mt-4 space-y-3 border-l-2 border-slate-200 pl-4">
        <li className="relative">
          <span className="absolute -left-[1.4rem] top-1.5 size-3 rounded-full border-2 border-brand-700 bg-white" aria-hidden="true" />
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">From</p>
          <p className="font-medium text-slate-900">{ride.origin.label}</p>
        </li>
        <li className="relative">
          <span className="absolute -left-[1.4rem] top-1.5 size-3 rounded-full bg-brand-700" aria-hidden="true" />
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">To</p>
          <p className="font-medium text-slate-900">{ride.destination.label}</p>
        </li>
      </ol>

      {/* Why this ride (explainable matching, SRS FR-RIDE-02) */}
      <div className="mt-4 rounded-xl bg-slate-50 px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Why this ride</p>
        <ul className="mt-1 space-y-0.5 text-sm text-slate-700">
          {match.reasons.map((reason) => (
            <li key={reason}>• {reason}</li>
          ))}
        </ul>
      </div>

      {/* Provider and vehicle */}
      <div className="mt-4 flex items-center gap-3 border-t border-slate-100 pt-4">
        <span
          className="flex size-11 shrink-0 items-center justify-center rounded-full bg-brand-100 font-bold text-brand-800"
          aria-hidden="true"
        >
          {initials(provider?.name)}
        </span>

        <div className="min-w-0">
          <p className="truncate font-semibold text-slate-900">{provider?.name}</p>
          <p className="truncate text-sm text-slate-600">
            {[vehicleName, provider?.community].filter(Boolean).join(' · ')}
          </p>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {chips.length > 0 ? (
              chips.map((chip) => (
                <span key={chip} className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-800">
                  {chip}
                </span>
              ))
            ) : (
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                No verification yet
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action */}
      {onRequest && (
        <div className="mt-4">
          {requested ? (
            <p role="status" className="rounded-xl bg-brand-50 px-4 py-3 text-center text-sm text-brand-800">
              <span className="font-semibold">Request sent.</span> Track it in{' '}
              <Link to="/requests" className="font-semibold underline">
                My requests
              </Link>
              .
            </p>
          ) : (
            <Button className="w-full" onClick={() => onRequest(ride)}>
              Request seat
            </Button>
          )}
        </div>
      )}
    </article>
  )
}

export function RideCardSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5" aria-hidden="true">
      <div className="h-5 w-40 rounded bg-slate-200" />
      <div className="mt-2 h-4 w-28 rounded bg-slate-100" />
      <div className="mt-5 h-4 w-3/4 rounded bg-slate-100" />
      <div className="mt-3 h-4 w-2/3 rounded bg-slate-100" />
      <div className="mt-5 h-16 rounded-xl bg-slate-50" />
    </div>
  )
}