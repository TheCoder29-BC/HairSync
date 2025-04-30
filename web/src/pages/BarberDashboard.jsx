import React from 'react'

const barberAppointments = [
  { id: 'b1', customer: 'Lisa Schmidt', service: 'Haarschnitt', datetime: '2025-04-30T10:00' },
  { id: 'b2', customer: 'Tom Weber',    service: 'Rasur',      datetime: '2025-05-01T11:30' },
]

export default function BarberDashboard() {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Barber Dashboard</h1>
      {barberAppointments.length === 0 ? (
        <p>Keine anstehenden Termine.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, marginTop: '1rem' }}>
          {barberAppointments.map((a) => (
            <li key={a.id} style={{
              marginBottom: '1rem',
              padding: '1rem',
              border: '1px solid #ddd',
              borderRadius: 4
            }}>
              <strong>{new Date(a.datetime).toLocaleString()}</strong> – {a.customer}, {a.service}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}