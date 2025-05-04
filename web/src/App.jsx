import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Login from './pages/Login.jsx'
import ForgotPassword from './pages/ForgotPassword.jsx'
import ResetPassword from './pages/ResetPassword.jsx'
import Register from './pages/Register.jsx'
import RegisterBarbershop from './pages/RegisterBarbershop.jsx'
import Barbershops from './pages/Barbershops.jsx'
import ShopDetail from './pages/ShopDetail.jsx'
import CustomerAppointments from './pages/CustomerAppointments.jsx'
import BarbershopDashboard from './pages/BarbershopDashboard.jsx'
import ShopAppointments from './pages/ShopAppointments.jsx'
import BarbershopSchedule from './pages/BarbershopSchedule.jsx'
import Profile from './pages/Profile.jsx'
import BookAppointment from './pages/BookAppointment.jsx'
import BookingPage from './pages/BookingPage.jsx'
import { useAuth } from './context/AuthContext.jsx'

function RequireAuth({ children, role }) {
  const { session } = useAuth()
  if (session === undefined) return null      // noch am Laden
  if (!session)           return <Navigate to="/login" replace />
  if (role && session.user.user_metadata.role !== role) {
    return <Navigate to="/login" replace />
  }
  return children
}

export default function App() {
  return (
    <>
      <Navbar />

      <Routes>
        {/* Standard-Weiterleitung */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Public */}
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/register" element={<Register />} />
        <Route path="/register-barbershop" element={<RegisterBarbershop />} />

        {/* Buchungs-Flow (Customer) */}
        <Route
          path="/book"
          element={
            <RequireAuth role="customer">
              <BookAppointment />
            </RequireAuth>
          }
        />
        <Route
          path="/book/:shopId"
          element={
            <RequireAuth role="customer">
              <BookingPage />
            </RequireAuth>
          }
        />

        {/* Customer-Bereich */}
        <Route
          path="/barbershops"
          element={
            <RequireAuth role="customer">
              <Barbershops />
            </RequireAuth>
          }
        />
        <Route
          path="/barbershops/:id"
          element={
            <RequireAuth role="customer">
              <ShopDetail />
            </RequireAuth>
          }
        />
        <Route
          path="/appointments"
          element={
            <RequireAuth role="customer">
              <CustomerAppointments />
            </RequireAuth>
          }
        />
        <Route
          path="/profile"
          element={
            <RequireAuth>
              <Profile />
            </RequireAuth>
          }
        />

        {/* Barbershop-Bereich */}
        <Route
          path="/barbershop-dashboard"
          element={
            <RequireAuth role="barbershop">
              <BarbershopDashboard />
            </RequireAuth>
          }
        />
        <Route
          path="/shop-appointments"
          element={
            <RequireAuth role="barbershop">
              <ShopAppointments />
            </RequireAuth>
          }
        />
        <Route
          path="/barbershop-schedule"
          element={
            <RequireAuth role="barbershop">
              <BarbershopSchedule />
            </RequireAuth>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  )
}
