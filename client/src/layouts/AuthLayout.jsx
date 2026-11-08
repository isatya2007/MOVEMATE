import { Link, Outlet } from 'react-router-dom'

export default function AuthLayout() {
  return (
    <div className="flex min-h-screen flex-col items-center px-4 py-8 sm:justify-center">
      <Link to="/" className="mb-6 text-center">
        <span className="block text-3xl font-extrabold tracking-tight text-brand-700">MoveMate</span>
        <span className="mt-1 block text-sm text-slate-600">
          Travel together. Share smartly. Help each other.
        </span>
      </Link>

      <main className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <Outlet />
      </main>

      <p className="mt-6 max-w-md text-center text-xs text-slate-500">
        Verification labels show what has been checked. They are not a guarantee of safety.
      </p>
    </div>
  )
}
