import React, { useEffect, useState } from 'react'
import { supabase }       from '../supabase/client.js'
import styles             from './Appointments.module.css'

// 1️⃣ Alle lokalen Bilder importieren
import shop1  from '../assets/barbershops/shop1.jpg'   // Barber King
import shop2  from '../assets/barbershops/shop2.jpg'   // Classic Cuts
import shop3  from '../assets/barbershops/shop3.jpg'   // Urban Fade
import shop4  from '../assets/barbershops/shop4.jpg'   // Retro Shave
import shop5  from '../assets/barbershops/shop5.jpg'   // Gentlemens Den
import shop6  from '../assets/barbershops/shop6.jpg'   // Modern Mane
import shop7  from '../assets/barbershops/shop7.jpg'   // The Buzz Stop
import shop8  from '../assets/barbershops/shop8.jpg'   // Fade & Blade
import shop9  from '../assets/barbershops/shop9.jpg'   // Sharp Lines
import shop10 from '../assets/barbershops/shop10.jpg'  // Clippers Club
import shop11 from '../assets/barbershops/shop11.jpg'  // Downtown Cuts
import shop12 from '../assets/barbershops/shop12.jpg'  // Fresh Fades
import shop13 from '../assets/barbershops/shop13.jpg'  // Köln Style Cuts
import shop14 from '../assets/barbershops/shop14.jpg'  // Hamburg Fades
import shop15 from '../assets/barbershops/shop15.jpg'  // Stuttgart Fresh Look
import shop16 from '../assets/barbershops/shop16.jpg'  // München Style Lounge
import shop17 from '../assets/barbershops/shop17.jpg'  // Berlin Barber Shop
import shop18 from '../assets/barbershops/shop18.jpg'  // Hair
import shop19 from '../assets/barbershops/shop19.jpg'  // optional

// 2️⃣ Mapping von lowercase name → importiertes Bild
const IMAGE_MAP = {
  'barber king':          shop1,
  'classic cuts':         shop2,
  'urban fade':           shop3,
  'retro shave':          shop4,
  'gentlemens den':       shop5,
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
  // 'dein 19. name':      shop19,
}

export default function Appointments() {
  const [appointments, setAppointments] = useState([])
  const [shops,         setShops]       = useState([])
  const [barbers,       setBarbers]     = useState([])
  const [services,      setServices]    = useState([])
  const [loading,       setLoading]     = useState(true)
  const [error,         setError]       = useState(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const { data: { session }, error: sessErr } = await supabase.auth.getSession()
      if (sessErr || !session?.user) {
        setError('Bitte einloggen, um Termine zu sehen.')
        setLoading(false)
        return
      }
      const userId = session.user.id

      const [shopsRes, barbersRes, servicesRes, apptsRes] = await Promise.all([
        supabase.from('barbershops').select('id, name'),
        supabase.from('barbers').select('id, full_name, barbershop_id'),
        supabase.from('services').select('id, name'),
        supabase
          .from('appointments')
          .select('*')
          .eq('user_id', userId)
          .order('appointment_time', { ascending: true }),
      ])

      if (shopsRes.error || barbersRes.error || servicesRes.error || apptsRes.error) {
        setError('Fehler beim Laden der Daten.')
      } else {
        setShops(shopsRes.data)
        setBarbers(barbersRes.data)
        setServices(servicesRes.data)
        setAppointments(apptsRes.data)
      }
      setLoading(false)
    }
    load()
  }, [])

  async function handleCancel(id) {
    const { error: cancelErr } = await supabase
      .from('appointments')
      .update({ status: 'canceled' })
      .eq('id', id)

    if (cancelErr) setError('Konnte Termin nicht stornieren.')
    else setAppointments(a => a.map(t => t.id === id ? { ...t, status: 'canceled' } : t))
  }

  if (loading) return <p className={styles.message}>…Lade Termine</p>
  if (error)   return <p className={styles.message} style={{ color: 'crimson' }}>{error}</p>
  if (!appointments.length) {
    return <p className={styles.message}>Du hast noch keine Termine.</p>
  }

  return (
    <div className={styles.wrapper}>
      <h1 className={styles.header}>Meine Termine</h1>
      <ul className={styles.list}>
        {appointments.map(a => {
          const barber  = barbers.find(b => b.id === a.barber_id)      || {}
          const shop    = shops.find(s => s.id === barber.barbershop_id) || {}
          const service = services.find(s => s.id === a.service_id)    || {}

          const dt      = new Date(a.appointment_time)
          const date    = dt.toLocaleDateString('de-DE', { day:'2-digit', month:'2-digit', year:'numeric' })
          const time    = dt.toLocaleTimeString('de-DE', { hour:'2-digit', minute:'2-digit' })
          const isPast  = dt.getTime() < Date.now()
          
          const key     = shop.name?.toLowerCase().trim() || ''
          const imgSrc  = IMAGE_MAP[key] || '/placeholder.jpg'

          return (
            <li key={a.id} className={styles.card}>
              <img src={imgSrc} alt={shop.name} className={styles.avatar} />

              <div className={styles.info}>
                <strong className={styles.shopName}>
                  {shop.name || '– unbekannt –'}
                </strong>
                <div className={styles.when}>
                  {date} <span className={styles.clock}>⏰ {time}</span>
                </div>
                <div className={styles.detail}>
                  Leistung: <em>{service.name}</em>
                </div>
                <div className={styles.detail}>
                  Barber: <em>{barber.full_name}</em>
                </div>
                <div className={styles.detail}>
                  Status: <em>{a.status}</em>
                </div>
                {isPast && (
                  <div className={styles.pastLabel}>
                    Dieser Termin liegt in der Vergangenheit
                  </div>
                )}
              </div>

              <div className={styles.actions}>
                {!isPast && (
                  <>
                    <button className={styles.reschedule}>
                      Umbuchen
                    </button>
                    <button
                      className={styles.cancel}
                      onClick={() => handleCancel(a.id)}
                    >
                      Stornieren
                    </button>
                  </>
                )}
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
