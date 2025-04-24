// src/components/Navbar.jsx
import React from 'react'
import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'

export default function Navbar() {
  const { user, logout, isLoggedIn } = useAuth()

  return (
    <nav style={{ padding: '1rem', borderBottom: '1px solid #ccc', marginBottom: '1rem' }}>
      <Link to="/dashboard">Dashboard</Link> |{' '}
      <Link to="/appointments">Termine</Link> |{' '}
      {!isLoggedIn && (
        <>
          <Link to="/login">Login</Link> |{' '}
          <Link to="/register">Register</Link>
        </>
      )}

      {isLoggedIn && (
        <>
          <span style={{ marginLeft: '1rem', color: 'green' }}>
            👤 Eingeloggt als: <strong>{user?.user?.email || 'Unbekannt'}</strong>
          </span>
          <button onClick={logout} style={{ marginLeft: '1rem' }}>Logout</button>
        </>
      )}
    </nav>
  )
}
