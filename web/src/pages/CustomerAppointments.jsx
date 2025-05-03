// src/pages/CustomerAppointments.jsx
import React, { useEffect, useState } from 'react'
import { supabase } from '../supabase/client.js'
import styles from './CustomerAppointments.module.css'

// Bilder für Fallback
import placeholder  from '../assets/placeholder.jpg'
import shop1        from '../assets/barbershops/shop1.jpg'
import shop2        from '../assets/barbershops/shop2.jpg'
import shop3        from '../assets/barbershops/shop3.jpg'
import shop4        from '../assets/barbershops/shop4.jpg'
import shop5        from '../assets/barbershops/shop5.jpg'
import shop6        from '../assets/barbershops/shop6.jpg'
import shop7        from '../assets/barbershops/shop7.jpg'
import shop8        from '../assets/barbershops/shop8.jpg'
import shop9        from '../assets/barbershops/shop9.jpg'
import shop10       from '../assets/barbershops/shop10.jpg'
import shop11       from '../assets/barbershops/shop11.jpg'
import shop12       from '../assets/barbershops/shop12.jpg'
import shop13       from '../assets/barbershops/shop13.jpg'
import shop14       from '../assets/barbershops/shop14.jpg'
import shop15       from '../assets/barbershops/shop15.jpg'
import shop16       from '../assets/barbershops/shop16.jpg'
import shop17       from '../assets/barbershops/shop17.jpg'
import shop18       from '../assets/barbershops/shop18.jpg'

const IMAGE_MAP = {
  'barber king':          shop1,
  'classic cuts':         shop2,
  'urban fade':           shop3,
  'retro shave':          shop4,
  "gentlemens den":       shop5,
  "gentlemen's den":      shop5,
  'modern mane':          shop6,
  'the buzz stop':        shop7,
  'fade & blade':         shop8,
  'sharp lines':          shop9,
  'clippers club':        shop10,
  'downtown cuts':        shop11,
  'fresh fades':          shop12,
  'köln style cuts':      shop13,
  'hamburg fades':        shop14,
  'stuttgart fresh look': shop15,
  'münchen style lounge': shop16,
  'berlin barber shop':   shop17,
  'hair':                 shop18,
}

export default function CustomerAppointments() {
  const [appointments, setAppointments] = useState([])
  const [shops,         setShops]       = useState([])
  const [barbers,       setBarbers]     = useState([])
  const [services,      setServices]    = useState([])
  const [ratings,       setRatings]     = useState({})
  const [submitted,     setSubmitted]   = useState({})
  const [loading,       setLoading]     = useState(true)
  const [error,         setError]       = useState(null)

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      const { data: { session }, error: sessErr } = await supabase.auth.getSession()
      if (sessErr || !session?.user) {
        setError('Bitte einloggen, um Termine zu sehen.')
        setLoading(false)
        return
      }
      const userId = session.user.id

      const [ shopsRes, barbersRes, servicesRes, apptsRes ] = await Promise.all([
        supabase.from('barbershops').select('id, name, image_url'),
        supabase.from('barbers').select('id, full_name, barbershop_id'),
        supabase.from('services').select('id, name'),
        supabase
          .from('appointments')
          .select('*, service_rating, cleanliness_rating')
          .eq('user_id', userId)
          .order('appointment_time', { ascending: true }),
      ])

      if (shopsRes.error || barbersRes.error || servicesRes.error || apptsRes.error) {
        console.error(shopsRes.error || barbersRes.error || servicesRes.error || apptsRes.error)
        setError('Fehler beim Laden der Daten.')
      } else {
        setShops(shopsRes.data)
        setBarbers(barbersRes.data)
        setServices(servicesRes.data)
        setAppointments(apptsRes.data)

        const initRatings   = {}
        const initSubmitted = {}
        apptsRes.data.forEach(a => {
          initRatings[a.id]   = {
            service:     a.service_rating    || 0,
            cleanliness: a.cleanliness_rating || 0
          }
          initSubmitted[a.id] = (a.service_rating || 0) > 0 || (a.cleanliness_rating || 0) > 0
        })
        setRatings(initRatings)
        setSubmitted(initSubmitted)
      }
      setLoading(false)
    })()
  }, [])

  const handleRating = (id, type, value) => {
    if (submitted[id]) return
    setRatings(prev => ({
      ...prev,
      [id]: { ...prev[id], [type]: value }
    }))
  }

  const handleSubmitRating = async (id) => {
    const { service, cleanliness } = ratings[id]
    const { error: updateError } = await supabase
      .from('appointments')
      .update({ service_rating: service, cleanliness_rating: cleanliness })
      .eq('id', id)
    if (updateError) {
      setError('Bewertung konnte nicht gespeichert werden.')
    } else {
      setSubmitted(prev => ({ ...prev, [id]: true }))
    }
  }

  const handleCancel = async (id) => {
    const { error } = await supabase
      .from('appointments')
      .update({ status: 'canceled' })
      .eq('id', id)
    if (error) setError('Konnte nicht stornieren.')
    else setAppointments(a => a.map(t => t.id === id ? { ...t, status:'canceled' } : t))
  }
  const handleRemove = id => setAppointments(a => a.filter(t => t.id !== id))

  if (loading) return <p className={styles.message}>…Lade Termine</p>
  if (error)   return <p className={styles.message} style={{ color:'crimson' }}>{error}</p>
  if (!appointments.length) return <p className={styles.message}>Du hast noch keine Termine.</p>

  return (
    <div className={styles.wrapper}>
      <h1 className={styles.header}>Meine Termine</h1>
      <ul className={styles.list}>
        {appointments.map(a => {
          const barber  = barbers.find(b => b.id === a.barber_id)        || {}
          const shop    = shops.find(s => s.id === barber.barbershop_id) || {}
          const service = services.find(s => s.id === a.service_id)      || {}
          const dt      = new Date(a.appointment_time)
          const date    = dt.toLocaleDateString('de-DE',{ day:'2-digit',month:'2-digit',year:'numeric' })
          const time    = dt.toLocaleTimeString('de-DE',{ hour:'2-digit',minute:'2-digit' })
          const isPast  = dt.getTime() < Date.now()

          const key    = shop.name?.toLowerCase().trim() || ''
          const imgSrc = shop.image_url && !shop.image_url.includes('placeholder.com')
            ? shop.image_url
            : (IMAGE_MAP[key] || placeholder)

          return (
            <li key={a.id} className={styles.card}>
              <img src={imgSrc} alt={shop.name || 'Barbershop'} className={styles.avatar} />

              <div className={styles.info}>
                <div className={styles.shopName}>{shop.name}</div>
                <div className={styles.when}>
                  {date} <span className={styles.clock}>⏰ {time}</span>
                </div>
                <div className={styles.detail}>Leistung: <em>{service.name}</em></div>
                <div className={styles.detail}>Barber: <em>{barber.full_name}</em></div>
                <div className={styles.detail}>Status: <em>{a.status}</em></div>
                {isPast && <div className={styles.pastLabel}>Termin liegt in der Vergangenheit</div>}

                {isPast && (
                  <div className={styles.ratingSection}>
                    <span>Service Zufriedenheit:</span>
                    <div>
                      {[1,2,3,4,5].map(n => (
                        <span
                          key={n}
                          className={`${styles.star} ${ratings[a.id]?.service >= n ? styles.filled : ''} ${
                            !submitted[a.id] ? styles.clickable : ''
                          }`}
                          onClick={() => handleRating(a.id, 'service', n)}
                        >
                          {ratings[a.id]?.service >= n ? '★' : '☆'}
                        </span>
                      ))}
                    </div>

                    <span>Sauberkeit:</span>
                    <div>
                      {[1,2,3,4,5].map(n => (
                        <span
                          key={n}
                          className={`${styles.star} ${ratings[a.id]?.cleanliness >= n ? styles.filled : ''} ${
                            !submitted[a.id] ? styles.clickable : ''
                          }`}
                          onClick={() => handleRating(a.id, 'cleanliness', n)}
                        >
                          {ratings[a.id]?.cleanliness >= n ? '★' : '☆'}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className={styles.actions}>
                {isPast ? (
                  <button className={styles.cancel} onClick={() => handleRemove(a.id)}>
                    Aus der Ansicht entfernen
                  </button>
                ) : (
                  <button className={styles.cancel} onClick={() => handleCancel(a.id)}>
                    Stornieren
                  </button>
                )}

                {isPast && !submitted[a.id] && (
                  <button className={styles.submitButton} onClick={() => handleSubmitRating(a.id)}>
                    Bewertung senden
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
