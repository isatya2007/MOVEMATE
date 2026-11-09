import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../services/api.js'
import { formatDeparture } from '../utils/formatDate.js'
import VehicleForm from '../components/rides/VehicleForm.jsx'
import OfferRideForm from '../components/rides/OfferRideForm.jsx'
import Alert from '../components/common/Alert.jsx'
import Button from '../components/common/Button.jsx'

const card = 'rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6'

export default function OfferRide() {
  const [attempt, setAttempt] = useState(0)
  const [state, setState] = useState({ key: -1, vehicles: [], error: '' })
  const [addingVehicle, setAddingVehicle] = useState(false)
  const [published, setPublished] = useState(null) // the ride that was just published
  const [formKey, setFormKey] = useState(0) // changing this gives a fresh, empty form
  const loading = state.key !== attempt

  useEffect(() => {
    let cancelled = false
    api('/vehicles', { params: { status: 'active' } })
      .then((data) => {
        if (!cancelled) setState({ key: attempt, vehicles: data.vehicles, error: '' })
      })
      .catch((err) => {
        if (!cancelled) setState({ key: attempt, vehicles: [], error: err.message })
      })
    return () => {
      cancelled = true
    }
  }, [attempt])

  function handleVehicleCreated(vehicle) {
    setState((s) => ({ ...s, vehicles: [vehicle, ...s.vehicles] }))
    setAddingVehicle(false)
    setFormKey((k) => k + 1) // the form restarts so the new vehicle is selected
  }

  function offerAnother() {
    setPublished(null)
    setFormKey((k) => k + 1)
  }

  const needsVehicle = state.vehicles.length === 0 || addingVehicle

  return (
    <section className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Offer a ride</h1>
      <p className="mt-1 text-slate-600">Share empty seats with people going your way.</p>

      <div className="mt-6" aria-live="polite">
        {loading ? (
          <div className={`${card} animate-pulse`} aria-hidden="true">
            <div className="h-5 w-40 rounded bg-slate-200" />
            <div className="mt-5 h-12 rounded-xl bg-slate-100" />
            <div className="mt-4 h-12 rounded-xl bg-slate-100" />
            <div className="mt-4 h-12 rounded-xl bg-slate-100" />
          </div>
        ) : state.error ? (
          <div className="space-y-4">
            <Alert>{state.error}</Alert>
            <Button variant="secondary" onClick={() => setAttempt((n) => n + 1)}>
              Try again
            </Button>
          </div>
        ) : published ? (
          <div className={card} role="status">
            <p className="text-sm font-semibold uppercase tracking-wide text-brand-700">Ride published</p>
            <h2 className="mt-1 text-xl font-bold text-slate-900">{formatDeparture(published.departureAt)}</h2>
            <p className="mt-2 text-slate-700">
              {published.origin.label}
              <span aria-hidden="true"> → </span>
              <span className="sr-only"> to </span>
              {published.destination.label}
            </p>
            <p className="mt-1 text-sm text-slate-600">
              {published.seatsTotal} {published.seatsTotal === 1 ? 'seat' : 'seats'} offered
            </p>
            <p className="mt-4 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
              Travellers can now find your ride and send requests. Seats are only taken when you accept a request.
            </p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <Button onClick={offerAnother}>Offer another ride</Button>
              <Link
                to="/dashboard"
                className="inline-flex h-12 items-center justify-center rounded-xl border border-slate-300 bg-white px-5 text-base font-semibold text-slate-800 hover:bg-slate-50"
              >
                Back to dashboard
              </Link>
            </div>
          </div>
        ) : needsVehicle ? (
          <div className={card}>
            <h2 className="text-lg font-semibold text-slate-900">
              {state.vehicles.length === 0 ? 'First, add your vehicle' : 'Add another vehicle'}
            </h2>
            <p className="mb-5 mt-1 text-sm text-slate-600">You only need to do this once.</p>
            <VehicleForm
              onCreated={handleVehicleCreated}
              onCancel={state.vehicles.length > 0 ? () => setAddingVehicle(false) : undefined}
            />
          </div>
        ) : (
          <div className={card}>
            <OfferRideForm
              key={formKey}
              vehicles={state.vehicles}
              onPublished={setPublished}
              onAddVehicle={() => setAddingVehicle(true)}
            />
          </div>
        )}
      </div>
    </section>
  )
}