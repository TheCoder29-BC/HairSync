import React from 'react'
import { useAuth } from '../context/AuthContext'

export default function Dashboard() {
  const { user, logout } = useAuth()

  return (
    <div>
      <h2>Willkommen, {user?.user?.email}</h2>
      <button onClick={logout}>Logout</button>
    </div>
  )
}