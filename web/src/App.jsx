import React from 'react'
import { Routes, Route, Link, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'

import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Appointments from './pages/Appointments.jsx'

function PrivateRoute({ children }) {
  const { isLoggedIn } = useAuth()
  return isLoggedIn ? children : <Navigate to="/login" />
}

function AppContent() {
  const { user, logout, isLoggedIn } = useAuth()

  return (
    <>
      <nav style={{ marginBottom: '1rem', borderBottom: '1px solid #ccc', paddingBottom: '0.5rem' }}>
        {isLoggedIn ? (
          <>
            <span style={{ marginRight: '1rem' }}>
              👋 Willkommen, <strong>{user?.user?.email}</strong>
            </span>
            <Link to="/dashboard">Dashboard</Link> |{' '}
            <Link to="/appointments">Termine</Link> |{' '}
            <button onClick={logout} style={{ marginLeft: '1rem' }}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link> |{' '}
            <Link to="/register">Register</Link>
          </>
        )}
      </nav>

      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/appointments"
          element={
            <PrivateRoute>
              <Appointments />
            </PrivateRoute>
          }
        />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
