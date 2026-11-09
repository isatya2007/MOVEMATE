import { useState } from 'react'
import { api, getFieldErrors } from '../../services/api.js'
import Input from '../common/Input.jsx'
import Button from '../common/Button.jsx'
import Alert from '../common/Alert.jsx'
import { MAX_PASSENGERS, VEHICLE_TYPES } from '../../utils/constants.js'

const selectClass =
  'h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-base text-slate-900 outline-none transition focus:border-brand-600 focus:ring-4 focus:ring-brand-100'

// Adds a vehicle. `onCreated` receives the new vehicle, `onCancel` (optional) closes the form.
export default function VehicleForm({ onCreated, onCancel }) {
  const [type, setType] = useState('car')
  const [make, setMake] = useState('')
  const [model, setModel] = useState('')
  const [colour, setColour] = useState('')
  const [registration, setRegistration] = useState('')
  const [capacity, setCapacity] = useState(3)
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [loading, setLoading] = useState(false)

  // A bike cannot offer 3 seats, so keep the seat count within the type's limit
  function handleTypeChange(next) {
    setType(next)
    setCapacity((c) => Math.min(c, MAX_PASSENGERS[next]))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setFormError('')
    setLoading(true)

    try {
      const data = await api('/vehicles', {
        method: 'POST',
        body: {
          type,
          make: make.trim(),
          model: model.trim(),
          colour: colour.trim(),
          registrationPrivate: registration.trim(),
          capacity,
        },
      })
      onCreated(data.vehicle)
    } catch (err) {
      const fields = getFieldErrors(err)
      setErrors(fields)
      if (!Object.keys(fields).length) setFormError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {formError && <Alert>{formError}</Alert>}

      <div>
        <label htmlFor="vehicle-type" className="mb-1.5 block text-sm font-medium text-slate-700">
          Vehicle type
        </label>
        <select id="vehicle-type" value={type} onChange={(e) => handleTypeChange(e.target.value)} className={selectClass}>
          {VEHICLE_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Make" placeholder="Maruti" value={make} onChange={(e) => setMake(e.target.value)} error={errors.make} />
        <Input label="Model" placeholder="Swift" value={model} onChange={(e) => setModel(e.target.value)} error={errors.model} />
      </div>

      <Input
        label="Colour (optional)"
        placeholder="White"
        value={colour}
        onChange={(e) => setColour(e.target.value)}
        error={errors.colour}
        hint="Helps travellers recognise your vehicle."
      />

      <Input
        label="Registration number (optional)"
        autoCapitalize="characters"
        value={registration}
        onChange={(e) => setRegistration(e.target.value)}
        error={errors.registrationPrivate}
        hint="Only you can see this. It is never shown to travellers."
      />

      <div>
        <label htmlFor="vehicle-capacity" className="mb-1.5 block text-sm font-medium text-slate-700">
          Passenger seats
        </label>
        <select
          id="vehicle-capacity"
          value={capacity}
          onChange={(e) => setCapacity(Number(e.target.value))}
          aria-describedby="vehicle-capacity-hint"
          className={selectClass}
        >
          {Array.from({ length: MAX_PASSENGERS[type] }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n}>
              {n} {n === 1 ? 'seat' : 'seats'}
            </option>
          ))}
        </select>
        <p id="vehicle-capacity-hint" className="mt-1.5 text-sm text-slate-500">
          Do not count the driver.
        </p>
        {errors.capacity && <p className="mt-1.5 text-sm text-red-600">{errors.capacity}</p>}
      </div>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        {onCancel && (
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" loading={loading}>
          Save vehicle
        </Button>
      </div>
    </form>
  )
}