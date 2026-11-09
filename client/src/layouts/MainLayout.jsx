import { useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import Button from '../components/common/Button.jsx'

// One list of links, used by the top bar (bigger screens) and the bottom bar (phones).
// `short` is the shorter name that fits on a phone.
const LINKS = [
  { to: '/dashboard', label: 'Find a ride', short: 'Find' },
  { to: '/offer', label: 'Offer a ride', short: 'Offer' },
  { to: '/my-rides', label: 'My rides', short: 'My rides' },
  { to: '/requests', label: 'My requests', short: 'Requests' },
]

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
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-4 px-4">
          <Link to="/dashboard" className="text-xl font-extrabold tracking-tight text-brand-700">
            MoveMate
          </Link>

          {/* Top links: tablets and computers */}
          <nav aria-label="Main" className="hidden gap-1 md:flex">
            {LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2 text-sm font-semibold ${
                    isActive ? 'bg-brand-50 text-brand-800' : 'text-slate-600 hover:bg-slate-100'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-slate-600 lg:inline">{user?.name}</span>
            <Button variant="secondary" className="h-10 px-4 text-sm" loading={leaving} onClick={handleLogout}>
              Log out
            </Button>
          </div>
        </div>
      </header>

      {/* extra space at the bottom on phones so the bottom bar never covers content */}
      <main className="mx-auto max-w-5xl px-4 py-6 pb-28 md:py-10 md:pb-10">
        <Outlet />
      </main>

      {/* Bottom bar: phones only */}
      <nav
        aria-label="Main"
        className="fixed inset-x-0 bottom-0 z-10 flex border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)] md:hidden"
      >
        {LINKS.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            aria-label={link.label}
            className={({ isActive }) =>
              `flex h-16 flex-1 items-center justify-center px-1 text-center text-sm font-semibold ${
                isActive ? 'text-brand-700' : 'text-slate-500'
              }`
            }
          >
            {link.short}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}