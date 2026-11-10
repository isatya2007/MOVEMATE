import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import Loader from '../components/common/Loader.jsx'

const primaryLink =
  'inline-flex h-12 items-center justify-center rounded-xl bg-brand-700 px-6 text-base font-semibold text-white transition hover:bg-brand-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-100'
const secondaryLink =
  'inline-flex h-12 items-center justify-center rounded-xl border border-slate-300 bg-white px-6 text-base font-semibold text-slate-800 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-200'

const FEATURES = [
  {
    icon: '🚘',
    title: 'Share your ride',
    text: 'Offer empty seats and connect with people travelling in the same direction.',
  },
  {
    icon: '💰',
    title: 'Split the cost',
    text: 'Make travelling more affordable by sharing the estimated journey expenses.',
  },
  {
    icon: '🤝',
    title: 'Build connections',
    text: 'Meet fellow commuters and grow a friendly travel community around you.',
  },
]

const STEPS = [
  {
    title: 'Search or offer',
    text: 'Tell us where you are going and when. Or publish a ride if you have seats to share.',
  },
  {
    title: 'Send a request',
    text: 'Pick a ride that fits and ask for a seat. Nothing is booked until the provider says yes.',
  },
  {
    title: 'Travel together',
    text: 'Once the provider accepts, your seat is confirmed and you get a notification.',
  },
]

export default function Home() {
  const { user, loading } = useAuth()

  // People who are already logged in go straight to their dashboard
  if (loading) return <Loader />
  if (user) return <Navigate to="/dashboard" replace />

  return (
    <div className="min-h-screen bg-white">
      {/* Top bar */}
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link to="/" className="text-xl font-extrabold tracking-tight text-brand-700">
            MoveMate
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link to="/login" className={`${secondaryLink} h-10 px-4 text-sm`}>
              Log in
            </Link>
            <Link to="/register" className={`${primaryLink} h-10 px-4 text-sm`}>
              Sign up
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-br from-brand-50 via-white to-brand-50">
          <div className="pointer-events-none absolute -right-24 -top-24 size-80 rounded-full bg-brand-100/60 blur-3xl" aria-hidden="true" />
          <div className="pointer-events-none absolute -bottom-32 -left-24 size-80 rounded-full bg-brand-100/50 blur-3xl" aria-hidden="true" />

          <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-14 md:grid-cols-2 md:py-24">
            <div>
              <span className="inline-block rounded-full bg-brand-50 px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-brand-700 ring-1 ring-inset ring-brand-100">
                Smarter travel. Stronger community.
              </span>

              <h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                Every journey is better{' '}
                <span className="bg-gradient-to-r from-brand-700 to-emerald-500 bg-clip-text text-transparent">
                  together.
                </span>
              </h1>

              <p className="mt-5 max-w-lg text-lg leading-relaxed text-slate-600">
                Connect with people travelling your way. Share rides, split costs and make everyday journeys
                affordable.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link to="/register" className={primaryLink}>
                  Find your ride
                </Link>
                <Link to="/register" className={secondaryLink}>
                  Offer a ride
                </Link>
              </div>

              <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-slate-700">
                {['Community driven', 'Affordable travel', 'Easy booking'].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span className="text-brand-700" aria-hidden="true">
                      ✓
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Illustration (decorative) */}
            <div className="relative mx-auto size-72 sm:size-96" aria-hidden="true">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-brand-100 to-brand-50 shadow-inner" />
              <div className="absolute inset-0 flex items-center justify-center text-8xl sm:text-9xl">🚙</div>
              <div className="absolute -left-2 top-8 animate-float rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-800 shadow-lg ring-1 ring-slate-100 sm:-left-8">
                📍 Your next destination
              </div>
              <div className="absolute -right-2 bottom-10 animate-float rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-800 shadow-lg ring-1 ring-slate-100 [animation-delay:1s] sm:-right-8">
                💚 Share. Save. Travel.
              </div>
            </div>
          </div>
        </section>

        {/* Why MoveMate */}
        <section className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-brand-700">Why MoveMate?</p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Travel smarter, together.
            </h2>
            <p className="mt-3 text-slate-600">Everything you need for a better everyday commute.</p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {FEATURES.map((f) => (
              <article
                key={f.title}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-brand-100 hover:shadow-lg sm:p-8"
              >
                <div className="flex size-14 items-center justify-center rounded-2xl bg-brand-50 text-3xl" aria-hidden="true">
                  {f.icon}
                </div>
                <h3 className="mt-5 text-lg font-bold text-slate-900">{f.title}</h3>
                <p className="mt-2 leading-relaxed text-slate-600">{f.text}</p>
              </article>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="bg-slate-50">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-xs font-bold uppercase tracking-widest text-brand-700">How it works</p>
              <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                Three simple steps.
              </h2>
            </div>

            <ol className="mt-10 grid gap-6 md:grid-cols-3">
              {STEPS.map((s, i) => (
                <li key={s.title} className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
                  <span className="flex size-10 items-center justify-center rounded-full bg-brand-700 text-lg font-bold text-white" aria-hidden="true">
                    {i + 1}
                  </span>
                  <h3 className="mt-4 text-lg font-bold text-slate-900">
                    <span className="sr-only">Step {i + 1}: </span>
                    {s.title}
                  </h3>
                  <p className="mt-2 leading-relaxed text-slate-600">{s.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Call to action */}
        <section className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-700 to-brand-800 px-6 py-12 text-white sm:px-12 sm:py-14">
            <div className="pointer-events-none absolute -right-20 -top-28 size-72 rounded-full border-[40px] border-white/10" aria-hidden="true" />
            <div className="relative flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-brand-100">Your journey starts here</p>
                <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
                  Don&rsquo;t travel alone. Move together.
                </h2>
                <p className="mt-3 max-w-xl text-brand-50">Join the community and make every journey count.</p>
              </div>
              <Link
                to="/register"
                className="inline-flex h-12 shrink-0 items-center justify-center rounded-xl bg-white px-6 text-base font-semibold text-brand-800 shadow-lg transition hover:bg-brand-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/40"
              >
                Join MoveMate
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-slate-50">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-lg font-extrabold tracking-tight text-brand-700">MoveMate</p>
            <p>Making everyday journeys better, together.</p>
          </div>
          <p className="max-w-md sm:text-right">
            Verification labels show what has been checked. They are not a guarantee of safety. Fares are only
            estimates.
          </p>
        </div>
        <p className="border-t border-slate-200 py-4 text-center text-xs text-slate-500">
          &copy; {new Date().getFullYear()} MoveMate. All rights reserved.
        </p>
      </footer>
    </div>
  )
}