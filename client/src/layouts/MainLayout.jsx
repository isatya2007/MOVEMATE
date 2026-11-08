import { useState } from 'react'
import { Link, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import Button from '../components/common/Button.jsx'

export default function MainLayout() {
  const { user, logout } = useAuth()
  const [leaving, setLeaving] = useState(false)

  async function handleLogout() {
    setLeaving(true)
    await logout()
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
          <Link to="/dashboard" className="text-xl font-extrabold tracking-tight text-brand-700">
            MoveMate
          </Link>

          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-slate-600 sm:inline">{user?.name}</span>
            <Button variant="secondary" className="h-10 px-4 text-sm" loading={leaving} onClick={handleLogout}>
              Log out
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 sm:py-10">
        <Outlet />
      </main>
    </div>
  )
}
