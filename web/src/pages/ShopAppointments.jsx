// src/pages/ShopAppointments.jsx
import React, { useEffect, useState } from 'react'
import { useAuth }                    from '../context/AuthContext.jsx'
import { supabase }                   from '../supabase/client.js'
import styles                         from './ShopAppointments.module.css'

export default function ShopAppointments() {
  const { session } = useAuth()
  const [appts,    setAppts]    = useState([])
  const [barbers,  setBarbers]  = useState([])
  const [services, setServices] = useState([])
  const [profiles, setProfiles] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState(null)

  useEffect(() => {
    if (!session) return
    ;(async () => {
      setLoading(true)
      try {
        // 1) Shop‐ID holen
        const { data: shop, error: shopErr } = await supabase
          .from('barbershops')
          .select('id')
          .eq('owner_user_id', session.user.id)
          .maybeSingle()
        if (shopErr || !shop) throw new Error('Kein Shop gefunden')
        const shopId = shop.id

        // 2) parallel alle Daten laden
        const [
          { data: apptsData,    error: apptsErr    },
          { data: barbersData,  error: barbersErr  },
          { data: servicesData, error: servicesErr },
          { data: profilesData, error: profilesErr },
        ] = await Promise.all([
          supabase
            .from('appointments')
            .select('*')
            .eq('barbershop_id', shopId)
            .order('appointment_time', { ascending: true }),
          supabase
            .from('barbers')
            .select('id, full_name')
            .eq('barbershop_id', shopId),
          supabase
            .from('shop_services')
            .select('id, name')
            .eq('barbershop_id', shopId),
          supabase
            .from('profiles')
            .select('id, first_name, last_name, phone'),
        ])

        if (apptsErr || barbersErr || servicesErr || profilesErr) {
          throw apptsErr || barbersErr || servicesErr || profilesErr
        }

        setAppts(apptsData)
        setBarbers(barbersData)
        setServices(servicesData)
        setProfiles(profilesData)
      } catch (err) {
        console.error(err)
        setError('Fehler beim Laden der Termine.')
      } finally {
        setLoading(false)
      }
    })()
  }, [session])

  // entfernt einen Termin nur aus der aktuellen Ansicht
  function removeFromView(id) {
    setAppts(a => a.filter(x => x.id !== id))
  }

  async function handleConfirm(id) {
    const { error } = await supabase
      .from('appointments')
      .update({ status: 'confirmed' })
      .eq('id', id)
    if (error) {
      console.error(error)
      setError('Fehler beim Bestätigen.')
    } else {
      setAppts(a => a.map(x => x.id === id ? { ...x, status:'confirmed' } : x))
    }
  }

  if (loading) return <p className={styles.message}>…Lade Termine</p>
  if (error)   return <p className={styles.message} style={{ color:'crimson' }}>{error}</p>
  if (!appts.length) return <p className={styles.message}>Keine Termine.</p>

  const now = new Date()

  return (
    <div className={styles.wrapper}>
      <h1 className={styles.header}>Shop-Termine</h1>
      <ul className={styles.list}>
        {appts.map(a => {
          const dt       = new Date(a.appointment_time)
          const isPast   = dt < now
          const day      = dt.toLocaleDateString('de-DE',{ day:'2-digit',month:'2-digit',year:'numeric' })
          const time     = dt.toLocaleTimeString  ('de-DE',{ hour:'2-digit',minute:'2-digit'})

          const barberObj  = barbers.find(b => b.id === a.barber_id)   || {}
          const serviceObj = services.find(s => s.id === a.service_id) || {}
          const profObj    = profiles.find(p => p.id === a.user_id)    || {}

          const customer = profObj.first_name || profObj.last_name
            ? `${profObj.first_name} ${profObj.last_name}`.trim()
            : '–'
          const phone = profObj.phone || '–'

          // Status-Icon
          const statusIcon = a.status === 'pending'
            ? '❓'
            : a.status === 'confirmed'
              ? '👍'
              : ''

          return (
            <li key={a.id} className={styles.card}>
              <div className={styles.info}>
                <div><strong>Datum:</strong> {day} ⏰ {time}</div>
                <div><strong>Service:</strong> {serviceObj.name || '–'}</div>
                <div><strong>Barber:</strong> {barberObj.full_name || '–'}</div>
                <div><strong>Kunde:</strong> {customer}</div>
                <div><strong>Tel.:</strong> {phone}</div>
                <div>
                  <strong>Status:</strong>{' '}
                  <em>{a.status}</em> {statusIcon}
                </div>
                {isPast && (
                  <div style={{ color:'crimson', marginTop:'0.5rem' }}>
                    Termin liegt in der Vergangenheit
                  </div>
                )}
              </div>

              <div className={styles.actions}>
                {a.status === 'pending' && !isPast && (
                  <button
                    className={styles.confirmBtn}
                    onClick={() => handleConfirm(a.id)}
                  >
                    Bestätigen
                  </button>
                )}
                {isPast && (
                  <button
                    className={styles.removeBtn}
                    onClick={() => removeFromView(a.id)}
                  >
                    Aus der Ansicht entfernen
                  </button>
                )}
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
