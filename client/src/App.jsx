import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import { GuestRoute, ProtectedRoute } from './components/common/RouteGuards.jsx'
import AuthLayout from './layouts/AuthLayout.jsx'
import MainLayout from './layouts/MainLayout.jsx'
import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Dashboard from './pages/Dashboard.jsx'
import RideSearch from './pages/RideSearch.jsx'
import MyRequests from './pages/MyRequests.jsx'
import OfferRide from './pages/OfferRide.jsx'
import MyRides from './pages/MyRides.jsx'
import Notifications from './pages/Notifications.jsx'
import NotFound from './pages/NotFound.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* The public front page (logged-in people are sent to their dashboard) */}
          <Route path="/" element={<Home />} />

          {/* Only for people who are NOT logged in */}
          <Route element={<GuestRoute />}>
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Route>
          </Route>

          {/* Only for logged-in people */}
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/search" element={<RideSearch />} />
              <Route path="/requests" element={<MyRequests />} />
              <Route path="/offer" element={<OfferRide />} />
              <Route path="/my-rides" element={<MyRides />} />
              <Route path="/notifications" element={<Notifications />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}