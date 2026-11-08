import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.js'
import Loader from './Loader.jsx'

// Pages that need a login. Others are sent to /login (and brought back afterwards).
export function ProtectedRoute() {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <Loader />
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />
  return <Outlet />
}

// Login and register pages: a logged-in person goes straight to the dashboard.
export function GuestRoute() {
  const { user, loading } = useAuth()

  if (loading) return <Loader />
  if (user) return <Navigate to="/dashboard" replace />
  return <Outlet />
}
