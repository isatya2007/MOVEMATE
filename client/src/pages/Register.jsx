import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import { getFieldErrors } from '../services/api.js'
import Input from '../components/common/Input.jsx'
import Button from '../components/common/Button.jsx'
import Alert from '../components/common/Alert.jsx'

const emptyForm = { name: '', email: '', phone: '', password: '', community: '', consent: false }

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState(emptyForm)
  const [fieldErrors, setFieldErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [loading, setLoading] = useState(false)

  const setField = (name, value) => setForm((f) => ({ ...f, [name]: value }))

  async function handleSubmit(e) {
    e.preventDefault()
    setFormError('')

    const errors = {}
    if (form.name.trim().length < 2) errors.name = 'Enter your name (at least 2 characters)'
    if (!form.email.trim() && !form.phone) errors.email = 'Add an email or a phone number'
    if (form.phone && !/^[6-9]\d{9}$/.test(form.phone)) errors.phone = 'Enter a valid 10-digit mobile number'
    if (form.password.length < 8) errors.password = 'Password must be at least 8 characters'
    else if (!/[A-Za-z]/.test(form.password) || !/\d/.test(form.password))
      errors.password = 'Password needs at least one letter and one number'
    if (!form.consent) errors.consent = 'Please accept the terms and privacy policy'
    setFieldErrors(errors)
    if (Object.keys(errors).length) return

    setLoading(true)
    try {
      await register({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone,
        password: form.password,
        community: form.community.trim(),
        consent: true,
      })
      navigate('/dashboard', { replace: true })
    } catch (err) {
      const fields = getFieldErrors(err)
      setFieldErrors(fields)
      if (!Object.keys(fields).length) setFormError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <h1 className="text-2xl font-bold text-slate-900">Create your account</h1>
      <p className="mt-1 text-slate-600">It takes less than a minute.</p>

      {formError && (
        <div className="mt-4">
          <Alert>{formError}</Alert>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
        <Input
          label="Full name"
          name="name"
          autoComplete="name"
          value={form.name}
          onChange={(e) => setField('name', e.target.value)}
          error={fieldErrors.name}
        />
        <Input
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          autoCapitalize="none"
          value={form.email}
          onChange={(e) => setField('email', e.target.value)}
          error={fieldErrors.email}
          hint="Add an email, a phone number, or both."
        />
        <Input
          label="Mobile number"
          name="phone"
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          maxLength={10}
          value={form.phone}
          onChange={(e) => setField('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
          error={fieldErrors.phone}
          hint="Other people never see your phone number."
        />
        <Input
          label="Password"
          name="password"
          type="password"
          autoComplete="new-password"
          value={form.password}
          onChange={(e) => setField('password', e.target.value)}
          error={fieldErrors.password}
          hint="At least 8 characters, with a letter and a number."
        />
        <Input
          label="Community (optional)"
          name="community"
          autoComplete="organization"
          value={form.community}
          onChange={(e) => setField('community', e.target.value)}
          error={fieldErrors.community}
          hint="For example your college, office or housing society."
        />

        <div>
          <label className="flex cursor-pointer items-start gap-3 py-1">
            <input
              type="checkbox"
              name="consent"
              checked={form.consent}
              onChange={(e) => setField('consent', e.target.checked)}
              aria-invalid={fieldErrors.consent ? 'true' : undefined}
              className="mt-0.5 size-5 shrink-0 rounded border-slate-300 accent-brand-700"
            />
            <span className="text-sm text-slate-700">I agree to the terms and privacy policy.</span>
          </label>
          {fieldErrors.consent && <p className="mt-1 text-sm text-red-600">{fieldErrors.consent}</p>}
        </div>

        <Button type="submit" loading={loading} className="w-full">
          Create account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-brand-700 hover:underline">
          Log in
        </Link>
      </p>
    </>
  )
}
