import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import { getFieldErrors } from '../services/api.js'
import Input from '../components/common/Input.jsx'
import Button from '../components/common/Button.jsx'
import Alert from '../components/common/Alert.jsx'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const goTo = location.state?.from?.pathname || '/dashboard'

  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setFormError('')

    // Quick checks first, so people get instant feedback
    const errors = {}
    if (!identifier.trim()) errors.identifier = 'Enter your email or phone number'
    if (!password) errors.password = 'Enter your password'
    setFieldErrors(errors)
    if (Object.keys(errors).length) return

    setLoading(true)
    try {
      await login(identifier.trim(), password)
      navigate(goTo, { replace: true })
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
      <h1 className="text-2xl font-bold text-slate-900">Welcome back</h1>
      <p className="mt-1 text-slate-600">Log in to find or share a ride.</p>

      {formError && (
        <div className="mt-4">
          <Alert>{formError}</Alert>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
        <Input
          label="Email or phone number"
          name="identifier"
          autoComplete="username"
          autoCapitalize="none"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          error={fieldErrors.identifier}
        />
        <Input
          label="Password"
          name="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={fieldErrors.password}
        />

        <Button type="submit" loading={loading} className="w-full">
          Log in
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        New to MoveMate?{' '}
        <Link to="/register" className="font-semibold text-brand-700 hover:underline">
          Create an account
        </Link>
      </p>
    </>
  )
}
