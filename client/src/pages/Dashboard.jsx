import { useAuth } from '../hooks/useAuth.js'
import RideSearchForm from '../components/rides/RideSearchForm.jsx'

export default function Dashboard() {
  const { user } = useAuth()
  const firstName = user?.name?.split(' ')[0]

  return (
    <section>
      <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Hi {firstName} 👋</h1>
      <p className="mt-1 text-slate-600">Where are you heading today?</p>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Find a ride</h2>
        <RideSearchForm />
      </div>
    </section>
  )
}