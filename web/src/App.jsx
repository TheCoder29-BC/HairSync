// src/App.jsx
import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar                       from './components/Navbar.jsx'
import Login                        from './pages/Login.jsx'
import Register                     from './pages/Register.jsx'
import RegisterBarbershop           from './pages/RegisterBarbershop.jsx'
import Barbershops                  from './pages/Barbershops.jsx'
import ShopDetail                   from './pages/ShopDetail.jsx'
import CustomerAppointments         from './pages/CustomerAppointments.jsx'
import BarbershopDashboard          from './pages/BarbershopDashboard.jsx'
import ShopAppointments             from './pages/ShopAppointments.jsx'
import BarbershopSchedule           from './pages/BarbershopSchedule.jsx'  // ← neu
import Profile                      from './pages/Profile.jsx'
import { useAuth }                  from './context/AuthContext.jsx'

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
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* public */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/register-barbershop" element={<RegisterBarbershop />} />

        {/* customer */}
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

        {/* barbershop */}
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
        {/* neuer Dienstplan-Bereich */}
        <Route
          path="/barbershop-schedule"
          element={
            <RequireAuth role="barbershop">
              <BarbershopSchedule />
            </RequireAuth>
          }
        />

        {/* fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  )
}
