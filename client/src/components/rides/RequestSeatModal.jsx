import { useState } from 'react'
import { api } from '../../services/api.js'
import Modal from '../common/Modal.jsx'
import PlaceInput from '../common/PlaceInput.jsx'
import Button from '../common/Button.jsx'
import Alert from '../common/Alert.jsx'
import { formatDeparture } from '../../utils/formatDate.js'

function RequestForm({ ride, search, onClose, onSuccess }) {
  const maxPassengers = Math.min(ride.seatsAvailable, 6)

  // Start with what the person already chose in their search
  const [pickup, setPickup] = useState(search?.from || null)
  const [dropoff, setDropoff] = useState(search?.to || null)
  const [passengers, setPassengers] = useState(Math.min(search?.passengers || 1, maxPassengers))
  const [message, setMessage] = useState('')
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setFormError('')

    const next = {}
    if (!pickup) next.pickup = 'Choose your pickup place from the suggestions'
    if (!dropoff) next.dropoff = 'Choose your drop-off place from the suggestions'
    setErrors(next)
    if (Object.keys(next).length) return

    setLoading(true)
    try {
      await api(`/rides/${ride.id}/requests`, {
        method: 'POST',
        body: {
          pickup: { label: pickup.label, coordinates: pickup.coordinates },
          dropoff: { label: dropoff.label, coordinates: dropoff.coordinates },
          passengerCount: passengers,
          ...(message.trim() ? { message: message.trim() } : {}),
        },
      })
      onSuccess(ride.id)
    } catch (err) {
      setFormError(err.details?.[0]?.message || err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <p className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
        <span className="block font-semibold text-slate-900">{ride.provider?.name}</span>
        {formatDeparture(ride.departureAt)} · {ride.seatsAvailable} {ride.seatsAvailable === 1 ? 'seat' : 'seats'} left
      </p>

      {formError && <Alert>{formError}</Alert>}

      <PlaceInput label="Your pickup place" value={pickup} onChange={setPickup} error={errors.pickup} />
      <PlaceInput label="Your drop-off place" value={dropoff} onChange={setDropoff} error={errors.dropoff} />

      <div>
        <label htmlFor="request-passengers" className="mb-1.5 block text-sm font-medium text-slate-700">
          Passengers
        </label>
        <select
          id="request-passengers"
          value={passengers}
          onChange={(e) => setPassengers(Number(e.target.value))}
          className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-base text-slate-900 outline-none transition focus:border-brand-600 focus:ring-4 focus:ring-brand-100"
        >
          {Array.from({ length: maxPassengers }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n}>
              {n} {n === 1 ? 'passenger' : 'passengers'}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="request-message" className="mb-1.5 block text-sm font-medium text-slate-700">
          Message (optional)
        </label>
        <textarea
          id="request-message"
          rows={2}
          maxLength={200}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="For example: I will be at the main gate."
          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-600 focus:ring-4 focus:ring-brand-100"
        />
      </div>

      <p className="text-sm text-slate-500">
        The provider will review your request. No seat is held until they accept. Your phone number stays private.
      </p>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          Send request
        </Button>
      </div>
    </form>
  )
}

export default function RequestSeatModal({ ride, search, onClose, onSuccess }) {
  return (
    <Modal open={Boolean(ride)} onClose={onClose} title="Request a seat">
      {ride && <RequestForm key={ride.id} ride={ride} search={search} onClose={onClose} onSuccess={onSuccess} />}
    </Modal>
  )
}
