import { useState } from 'react'
import { api, getFieldErrors } from '../../services/api.js'
import PlaceInput from '../common/PlaceInput.jsx'
import Input from '../common/Input.jsx'
import Button from '../common/Button.jsx'
import Alert from '../common/Alert.jsx'
import { defaultSearchTime, toLocalInputValue } from '../../utils/formatDate.js'
import { VEHICLE_TYPES } from '../../utils/constants.js'

const selectClass =
  'h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-base text-slate-900 outline-none transition focus:border-brand-600 focus:ring-4 focus:ring-brand-100'

function vehicleName(v) {
  const name = [v.colour, v.make, v.model].filter(Boolean).join(' ')
  return name || VEHICLE_TYPES.find((t) => t.value === v.type)?.label || 'Vehicle'
}

function Check({ label, checked, onChange }) {
  return (
    <label className="flex cursor-pointer items-center gap-3 py-1.5">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="size-5 shrink-0 rounded border-slate-300 accent-brand-700"
      />
      <span className="text-sm text-slate-700">{label}</span>
    </label>
  )
}

// The "publish a ride" form. `onPublished` receives the new ride.
export default function OfferRideForm({ vehicles, onPublished, onAddVehicle }) {
  const [vehicleId, setVehicleId] = useState(vehicles[0].id)
  const [from, setFrom] = useState(null)
  const [to, setTo] = useState(null)
  const [when, setWhen] = useState(() => toLocalInputValue(defaultSearchTime()))
  const [seats, setSeats] = useState(() => Math.min(3, vehicles[0].capacity))
  const [fare, setFare] = useState('')
  const [noSmoking, setNoSmoking] = useState(true)
  const [petsAllowed, setPetsAllowed] = useState(false)
  const [luggageAllowed, setLuggageAllowed] = useState(true)
  const [notes, setNotes] = useState('')
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [loading, setLoading] = useState(false)
  const [minWhen] = useState(() => toLocalInputValue(new Date()))

  const vehicle = vehicles.find((v) => v.id === vehicleId) || vehicles[0]

  // Never offer more seats than the chosen vehicle has
  function handleVehicleChange(id) {
    const next = vehicles.find((v) => v.id === id)
    setVehicleId(id)
    setSeats((s) => Math.min(s, next.capacity))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setFormError('')

    const next = {}
    if (!from) next.from = 'Choose your starting place from the suggestions'
    if (!to) next.to = 'Choose your destination from the suggestions'
    if (from && to && from.coordinates.join() === to.coordinates.join()) {
      next.to = 'Start and destination must be different places'
    }
    const date = new Date(when)
    if (!when || Number.isNaN(date.getTime())) next.when = 'Choose a date and time'
    else if (date.getTime() < Date.now() + 5 * 60 * 1000) next.when = 'Choose a time at least 5 minutes from now'

    setErrors(next)
    if (Object.keys(next).length) return

    setLoading(true)
    try {
      const data = await api('/rides', {
        method: 'POST',
        body: {
          vehicleId: vehicle.id,
          origin: { label: from.label, coordinates: from.coordinates },
          destination: { label: to.label, coordinates: to.coordinates },
          departureAt: date.toISOString(),
          seatsTotal: seats,
          ...(fare !== '' ? { farePerSeat: Number(fare) } : {}),
          preferences: { noSmoking, petsAllowed, luggageAllowed },
          ...(notes.trim() ? { notes: notes.trim() } : {}),
        },
      })
      onPublished(data.ride)
    } catch (err) {
      const fe = getFieldErrors(err)
      const mapped = {
        from: fe['origin.label'],
        to: fe['destination'] || fe['destination.label'],
        when: fe.departureAt,
        seats: fe.seatsTotal,
        fare: fe.farePerSeat,
        notes: fe.notes,
      }
      setErrors(mapped)
      if (!Object.values(mapped).some(Boolean)) setFormError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {formError && <Alert>{formError}</Alert>}

      {/* Vehicle */}
      <div>
        <label htmlFor="ride-vehicle" className="mb-1.5 block text-sm font-medium text-slate-700">
          Vehicle
        </label>
        <select id="ride-vehicle" value={vehicleId} onChange={(e) => handleVehicleChange(e.target.value)} className={selectClass}>
          {vehicles.map((v) => (
            <option key={v.id} value={v.id}>
              {vehicleName(v)} · {v.capacity} {v.capacity === 1 ? 'seat' : 'seats'}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={onAddVehicle}
          className="mt-2 text-sm font-semibold text-brand-700 hover:underline"
        >
          + Add another vehicle
        </button>
      </div>

      {/* Route */}
      <div className="grid gap-4 md:grid-cols-2">
        <PlaceInput label="From" placeholder="Where you start" value={from} onChange={setFrom} error={errors.from} />
        <PlaceInput label="To" placeholder="Where you are going" value={to} onChange={setTo} error={errors.to} />
      </div>

      {/* Time, seats, fare */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="ride-when" className="mb-1.5 block text-sm font-medium text-slate-700">
            Departure
          </label>
          <input
            id="ride-when"
            type="datetime-local"
            value={when}
            min={minWhen}
            onChange={(e) => setWhen(e.target.value)}
            aria-invalid={errors.when ? 'true' : undefined}
            className={`h-12 w-full rounded-xl border bg-white px-4 text-base text-slate-900 outline-none transition focus:ring-4 ${
              errors.when
                ? 'border-red-500 focus:ring-red-100'
                : 'border-slate-300 focus:border-brand-600 focus:ring-brand-100'
            }`}
          />
          {errors.when && <p className="mt-1.5 text-sm text-red-600">{errors.when}</p>}
        </div>

        <div>
          <label htmlFor="ride-seats" className="mb-1.5 block text-sm font-medium text-slate-700">
            Seats you are offering
          </label>
          <select id="ride-seats" value={seats} onChange={(e) => setSeats(Number(e.target.value))} className={selectClass}>
            {Array.from({ length: vehicle.capacity }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {n} {n === 1 ? 'seat' : 'seats'}
              </option>
            ))}
          </select>
          {errors.seats && <p className="mt-1.5 text-sm text-red-600">{errors.seats}</p>}
        </div>
      </div>

      <Input
        label="Estimated cost per seat in ₹ (optional)"
        type="text"
        inputMode="numeric"
        value={fare}
        onChange={(e) => setFare(e.target.value.replace(/\D/g, '').slice(0, 5))}
        error={errors.fare}
        hint="Only an estimate to share fuel and toll costs. Leave empty if you do not want to charge."
      />

      {/* Preferences */}
      <fieldset>
        <legend className="mb-1 text-sm font-medium text-slate-700">Ride preferences</legend>
        <Check label="No smoking" checked={noSmoking} onChange={setNoSmoking} />
        <Check label="Pets are welcome" checked={petsAllowed} onChange={setPetsAllowed} />
        <Check label="Luggage is fine" checked={luggageAllowed} onChange={setLuggageAllowed} />
      </fieldset>

      <div>
        <label htmlFor="ride-notes" className="mb-1.5 block text-sm font-medium text-slate-700">
          Notes for travellers (optional)
        </label>
        <textarea
          id="ride-notes"
          rows={2}
          maxLength={300}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="For example: I leave from the main gate."
          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-600 focus:ring-4 focus:ring-brand-100"
        />
        {errors.notes && <p className="mt-1.5 text-sm text-red-600">{errors.notes}</p>}
      </div>

      <Button type="submit" loading={loading} className="w-full">
        Publish ride
      </Button>
    </form>
  )
}