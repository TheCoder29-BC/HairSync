// web/src/pages/Dashboard.jsx
import React from 'react'

/**
 * @param {{ user: import('@supabase/supabase-js').User }} props
 */
export default function Dashboard({ user }) {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Dashboard</h1>
      <p>
        👋 Hallo, <strong>{user.email}</strong>!
      </p>
      <p>Willkommen im Barber-App Dashboard.</p>
      {/* Weitere Dashboard-Inhalte hier */}
    </div>
  )
}
