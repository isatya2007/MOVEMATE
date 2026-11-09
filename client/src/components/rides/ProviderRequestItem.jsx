import { useState } from 'react'
import { api } from '../../services/api.js'
import StatusBadge from '../common/StatusBadge.jsx'
import Button from '../common/Button.jsx'
import Alert from '../common/Alert.jsx'
import { verificationChips } from '../../utils/verification.js'

// One traveler's request, as the ride provider sees it.
// onUpdated(requestId, changes, seatsAvailable) tells the list what changed.
export default function ProviderRequestItem({ request, onUpdated }) {
  const { requester } = request
  const chips = verificationChips(requester?.verificationStatus)

  const [declining, setDeclining] = useState(false)
  const [reason, setReason] = useState('')
  const [busy, setBusy] = useState('') // '', 'accepted' or 'rejected'
  const [error, setError] = useState('')

  async function respond(status, why) {
    setBusy(status)
    setError('')
    try {
      const data = await api(`/ride-requests/${request.id}`, {
        method: 'PATCH',
        body: { status, ...(why ? { reason: why } : {}) },
      })
      onUpdated(request.id, { status: data.request.status, rejectReason: data.request.rejectReason }, data.seatsAvailable)
    } catch (err) {
      setError(err.details?.[0]?.message || err.message)
    } finally {
      setBusy('')
    }
  }

  function decline() {
    const why = reason.trim()
    if (why && why.length < 3) {
      setError('A reason needs at least 3 characters, or leave it empty.')
      return
    }
    respond('rejected', why)
  }

  return (
    <li className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate font-semibold text-slate-900">{requester?.name || 'Traveller'}</p>
          {requester?.community && <p className="truncate text-sm text-slate-600">{requester.community}</p>}
        </div>
        <StatusBadge status={request.status} />
      </div>

      <div className="mt-2 flex flex-wrap gap-1.5">
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

      <dl className="mt-3 space-y-1 text-sm text-slate-700">
        <div className="flex gap-2">
          <dt className="w-20 shrink-0 text-slate-500">Seats</dt>
          <dd>{request.passengerCount}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="w-20 shrink-0 text-slate-500">Pickup</dt>
          <dd>{request.pickup.label}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="w-20 shrink-0 text-slate-500">Drop-off</dt>
          <dd>{request.dropoff.label}</dd>
        </div>
        {request.message && (
          <div className="flex gap-2">
            <dt className="w-20 shrink-0 text-slate-500">Message</dt>
            <dd>“{request.message}”</dd>
          </div>
        )}
      </dl>

      {request.status === 'rejected' && request.rejectReason && (
        <p className="mt-3 text-sm text-slate-500">Your reason: {request.rejectReason}</p>
      )}

      {error && (
        <div className="mt-3">
          <Alert>{error}</Alert>
        </div>
      )}

      {request.status === 'pending' &&
        (declining ? (
          <div className="mt-4 rounded-xl bg-slate-50 p-4">
            <label htmlFor={`reason-${request.id}`} className="block text-sm font-medium text-slate-900">
              Reason (optional)
            </label>
            <input
              id={`reason-${request.id}`}
              type="text"
              maxLength={200}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="For example: the pickup is too far for me"
              className="mt-1.5 h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-600 focus:ring-4 focus:ring-brand-100"
            />
            <div className="mt-3 flex flex-col gap-3 sm:flex-row">
              <Button className="h-11" loading={busy === 'rejected'} onClick={decline}>
                Decline request
              </Button>
              <Button variant="secondary" className="h-11" disabled={Boolean(busy)} onClick={() => setDeclining(false)}>
                Go back
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <Button className="h-11" loading={busy === 'accepted'} disabled={Boolean(busy)} onClick={() => respond('accepted')}>
              Accept
            </Button>
            <Button variant="secondary" className="h-11" disabled={Boolean(busy)} onClick={() => setDeclining(true)}>
              Decline
            </Button>
          </div>
        ))}
    </li>
  )
}