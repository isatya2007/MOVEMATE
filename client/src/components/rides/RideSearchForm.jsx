import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PlaceInput from '../common/PlaceInput.jsx'
import Button from '../common/Button.jsx'
import { defaultSearchTime, toLocalInputValue } from '../../utils/formatDate.js'
import { MAX_SEARCH_PASSENGERS } from '../../utils/constants.js'

// The "From -> To -> When" card.
// `initial` lets the results page fill the form with the search that is on screen.
export default function RideSearchForm({ initial }) {
  const navigate = useNavigate()
  const [from, setFrom] = useState(initial?.from || null)
  const [to, setTo] = useState(initial?.to || null)
  const [when, setWhen] = useState(initial?.when || (() => toLocalInputValue(defaultSearchTime())))
  const [passengers, setPassengers] = useState(initial?.passengers || 1)
  const [errors, setErrors] = useState({})
  const [minWhen] = useState(() => toLocalInputValue(new Date()))

  function handleSubmit(e) {
    e.preventDefault()

    const next = {}
    if (!from) next.from = 'Choose your pickup place from the suggestions'
    if (!to) next.to = 'Choose your drop-off place from the suggestions'
    if (from && to && from.coordinates.join() === to.coordinates.join()) {
      next.to = 'Pickup and drop-off must be different places'
    }
    const date = new Date(when)
    if (!when || Number.isNaN(date.getTime())) next.when = 'Choose a date and time'
    else if (date.getTime() < Date.now() - 5 * 60 * 1000) next.when = 'Choose a time that has not passed'

    setErrors(next)
    if (Object.keys(next).length) return

    const params = new URLSearchParams({
      fromLabel: from.label,
      fromLat: String(from.coordinates[1]),
      fromLng: String(from.coordinates[0]),
      toLabel: to.label,
      toLat: String(to.coordinates[1]),
      toLng: String(to.coordinates[0]),
      when: date.toISOString(),
      passengers: String(passengers),
    })
    navigate(`/search?${params.toString()}`)
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <PlaceInput label="From" placeholder="Pickup place" value={from} onChange={setFrom} error={errors.from} />
        <PlaceInput label="To" placeholder="Drop-off place" value={to} onChange={setTo} error={errors.to} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="search-when" className="mb-1.5 block text-sm font-medium text-slate-700">
            When
          </label>
          <input
            id="search-when"
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
          <label htmlFor="search-passengers" className="mb-1.5 block text-sm font-medium text-slate-700">
            Passengers
          </label>
          <select
            id="search-passengers"
            value={passengers}
            onChange={(e) => setPassengers(Number(e.target.value))}
            className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-base text-slate-900 outline-none transition focus:border-brand-600 focus:ring-4 focus:ring-brand-100"
          >
            {Array.from({ length: MAX_SEARCH_PASSENGERS }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {n} {n === 1 ? 'passenger' : 'passengers'}
              </option>
            ))}
          </select>
        </div>
      </div>

      <Button type="submit" className="w-full">
        Search rides
      </Button>
    </form>
  )
}