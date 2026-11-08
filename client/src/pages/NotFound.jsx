import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <p className="text-5xl font-extrabold text-brand-700">404</p>
      <h1 className="mt-3 text-xl font-bold text-slate-900">We could not find that page</h1>
      <Link to="/" className="mt-6 font-semibold text-brand-700 hover:underline">
        Go to the home page
      </Link>
    </div>
  )
}
