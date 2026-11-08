import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { api } from '../services/api.js'
import { toLocalInputValue } from '../utils/formatDate.js'
import RideSearchForm from '../components/rides/RideSearchForm.jsx'
import RideCard, { RideCardSkeleton } from '../components/rides/RideCard.jsx'
import Alert from '../components/common/Alert.jsx'
import Button from '../components/common/Button.jsx'
import EmptyState from '../components/common/EmptyState.jsx'

// Reads the search out of the page address (?fromLat=...&when=...)
function parseSearch(params) {
  const number = (key) => {
    const raw = params.get(key)
    return raw === null || raw === '' ? NaN : Number(raw)
  }

  const fromLat = number('fromLat')
  const fromLng = number('fromLng')
  const toLat = number('toLat')
  const toLng = number('toLng')
  const passengers = number('passengers') || 1
  const when = new Date(params.get('when') || '')

  const valid = [fromLat, fromLng, toLat, toLng].every(Number.isFinite) && !Number.isNaN(when.getTime())
  if (!valid) return { valid: false }

  return {
    valid: true,
    // what the backend needs
    request: { fromLat, fromLng, toLat, toLng, when: when.toISOString(), passengers },
    // what the form needs to show the same search again
    form: {
      from: { label: params.get('fromLabel') || 'Pickup', coordinates: [fromLng, fromLat] },
      to: { label: params.get('toLabel') || 'Drop-off', coordinates: [toLng, toLat] },
      when: toLocalInputValue(when),
      passengers,
    },
  }
}

export default function RideSearch() {
  const [searchParams] = useSearchParams()
  const queryKey = searchParams.toString()
  const [attempt, setAttempt] = useState(0)
  const [result, setResult] = useState({ key: null, rides: [], total: 0, error: '' })

  const search = parseSearch(searchParams)
  const requestKey = `${queryKey}#${attempt}`
  const loading = search.valid && result.key !== requestKey

  useEffect(() => {
    const parsed = parseSearch(new URLSearchParams(queryKey))
    if (!parsed.valid) return

    let cancelled = false
    api('/rides/search', { params: parsed.request })
      .then((data) => {
        if (!cancelled) setResult({ key: requestKey, rides: data.rides, total: data.total, error: '' })
      })
      .catch((err) => {
        if (!cancelled) setResult({ key: requestKey, rides: [], total: 0, error: err.message })
      })

    return () => {
      cancelled = true
    }
  }, [queryKey, requestKey])

  return (
    <section>
      <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Find a ride</h1>

      <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <RideSearchForm key={queryKey} initial={search.valid ? search.form : undefined} />
      </div>

      <div className="mt-8" aria-live="polite">
        {!search.valid ? (
          <EmptyState title="Where do you want to go?">
            Choose a pickup place, a drop-off place and a time, then tap Search rides.
          </EmptyState>
        ) : loading ? (
          <div className="space-y-4">
            <RideCardSkeleton />
            <RideCardSkeleton />
            <RideCardSkeleton />
          </div>
        ) : result.error ? (
          <div className="space-y-4">
            <Alert>{result.error}</Alert>
            <Button variant="secondary" onClick={() => setAttempt((n) => n + 1)}>
              Try again
            </Button>
          </div>
        ) : result.rides.length === 0 ? (
          <EmptyState title="No rides match yet">
            Try a different time, fewer passengers, or a pickup place closer to a main road. New rides are
            published all the time.
          </EmptyState>
        ) : (
          <>
            <p className="mb-4 text-sm text-slate-600">
              {result.total} {result.total === 1 ? 'ride' : 'rides'} found, best matches first
              {result.total > result.rides.length && ` (showing the top ${result.rides.length})`}
            </p>
            <div className="space-y-4">
              {result.rides.map((ride) => (
                <RideCard key={ride.id} ride={ride} />
              ))}
            </div>
            <p className="mt-6 text-center text-xs text-slate-500">
              Verification labels show what has been checked. They are not a guarantee of safety. Fares are
              estimates.
            </p>
          </>
        )}
      </div>
    </section>
  )
}