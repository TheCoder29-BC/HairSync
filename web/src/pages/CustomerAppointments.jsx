// src/pages/CustomerAppointments.jsx
import React, { useEffect, useState } from 'react'
import { supabase } from '../supabase/client.js'
import { useAuth } from '../context/AuthContext.jsx'
import { Link } from 'react-router-dom'

export default function CustomerAppointments() {
  const { session } = useAuth()
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session) return

    async function load() {
      setLoading(true)

      const { data, error } = await supabase
        .from('appointments')
        .select(`
          id,
          appointment_time,
          status,
          barbershop:barbershop_id (
            id,
            name
          ),
          barber:barber_id (
            full_name
          ),
          service:service_id (
            name
          )
        `)
        .eq('user_id', session.user.id)
        .order('appointment_time', { ascending: false })

      if (error) {
        console.error('Fehler beim Laden der Termine:', error)
      } else {
        setAppointments(data)
      }
      setLoading(false)
    }

    load()
  }, [session])

  if (session === null) return null
  if (loading) return <div style={{ padding: '2rem' }}>Lade Termine…</div>
  if (appointments.length === 0) {
    return <div style={{ padding: '2rem' }}>Du hast noch keine Termine.</div>
  }

  return (
    <div style={{ maxWidth: 800, margin: '2rem auto', padding: '0 1rem' }}>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 600, marginBottom: '1rem' }}>
        Meine Termine
      </h1>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {appointments.map(a => {
          const shop    = a.barbershop?.name     ?? '–'
          const shopId  = a.barbershop?.id       ?? ''         // jetzt verfügbar
          const barber  = a.barber?.full_name    ?? '–'
          const service = a.service?.name        ?? '–'
          const dt      = new Date(a.appointment_time)

          return (
            <li key={a.id} style={{
              display: 'flex', alignItems: 'center',
              borderBottom: '1px solid #eee', padding: '1rem 0'
            }}>
              {/* Shop-Bild Platzhalter */}
              <div style={{
                flex: '0 0 80px', height: 80,
                background: '#f5f5f5', borderRadius: 8
              }}/>

              <div style={{ marginLeft: '1rem', flex: 1 }}>
                <strong>{shop}</strong><br/>
                {dt.toLocaleDateString('de-DE')} ⏰{' '}
                {dt.toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit'})}<br/>
                Leistung: {service}<br/>
                Barber: {barber}<br/>
                Status: {a.status}
              </div>

              <div>
                <Link
                  to={`/barbershops/${shopId}`}
                  style={{
                    marginRight: 8,
                    background: '#5c6ac4',
                    color: 'white',
                    textDecoration: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: 4
                  }}
                >
                  Umbuchen
                </Link>
                <button
                  style={{
                    background: '#e53e3e',
                    color: 'white',
                    border: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: 4,
                    cursor: 'pointer'
                  }}
                  onClick={async () => {
                    await supabase
                      .from('appointments')
                      .delete()
                      .eq('id', a.id)
                    setAppointments(prev => prev.filter(x => x.id !== a.id))
                  }}
                >
                  Stornieren
                </button>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
