// src/pages/ShopDetail.jsx
import React, { useEffect, useState } from 'react'
import { useParams, Link }            from 'react-router-dom'
import Calendar                        from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import { Toaster, toast }              from 'react-hot-toast'
import { useAuth }                     from '../context/AuthContext.jsx'
import { supabase }                    from '../supabase/client.js'
import styles                          from './ShopDetail.module.css'

// 1) Lokale Bilder importieren
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

// 2) Name → lokales Bild (lowercased keys!)
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
  // 'dein 19. name':      shop19,
}

export default function ShopDetail() {
  const { session } = useAuth()
  const { id: barbershopId } = useParams()

  const [shop, setShop]             = useState(null)
  const [barbers, setBarbers]       = useState([])
  const [services, setServices]     = useState([])
  const [date, setDate]             = useState(new Date())
  const [time, setTime]             = useState('')
  const [selectedBarber, setBarber] = useState('')
  const [selectedService, setService] = useState('')
  const [loading, setLoading]       = useState(false)
  const [appointment, setAppointment] = useState(null)

  const slots = Array.from({ length: 9 }, (_, i) => `${9 + i}:00`)

  useEffect(() => {
    if (!session) return
    ;(async () => {
      // Shop-Daten
      const { data: shopData, error: shopErr } = await supabase
        .from('barbershops')
        .select('id, name, image_url')
        .eq('id', barbershopId)
        .single()
      if (shopErr || !shopData) {
        toast.error('Shop nicht gefunden.')
        return
      }
      setShop(shopData)

      // Friseure laden
      const { data: barberData, error: barberErr } = await supabase
        .from('barbers')
        .select('id, full_name')
        .eq('barbershop_id', barbershopId)
        .order('full_name')
      if (barberErr) toast.error('Fehler beim Laden der Friseure.')
      else setBarbers(barberData)

      // Leistungen laden
      const { data: svcData, error: svcErr } = await supabase
        .from('services')
        .select('id, name')
        .order('name')
      if (svcErr) toast.error('Fehler beim Laden der Leistungen.')
      else setServices(svcData)
    })()
  }, [session, barbershopId])

  if (!session) return null
  if (!shop)     return <div className={styles.loading}>Lade Shop…</div>

  // *** Bildquelle: zuerst IMAGE_MAP, sonst DB.image_url
  const key   = shop.name.trim().toLowerCase()
  const thumb = IMAGE_MAP[key] || shop.image_url

  const handleBooking = async e => {
    e.preventDefault()
    setLoading(true)

    // Datum + Uhrzeit kombinieren
    const dt = new Date(date)
    const [h, m] = time.split(':').map(Number)
    dt.setHours(h, m, 0, 0)

    // jetzt status: 'pending' verwenden
    const { data, error } = await supabase
      .from('appointments')
      .insert([{
        appointment_time: dt.toISOString(),
        status          : 'pending',
        user_id         : session.user.id,
        barbershop_id   : barbershopId,
        barber_id       : selectedBarber,
        service_id      : selectedService,
      }])
      .single()

    setLoading(false)
    if (error) {
      toast.error('Fehler beim Buchen: ' + error.message)
    } else {
      toast.success('Termin erfolgreich gebucht! (status pending)')
      setAppointment(data)
      setTime('')
      setBarber('')
      setService('')
      // falls gewünscht: navigate('/appointments')
    }
  }

  return (
    <div className={styles.wrapper}>
      <Toaster position="top-center" />
      <div className={styles.card}>
        {loading && (
          <div className={styles.spinnerOverlay}>
            <div className={styles.spinner}><div/><div/><div/></div>
          </div>
        )}

        {/* Linke Spalte */}
        <div className={styles.left}>
          <Link to="/barbershops" className={styles.backLink}>
            ← alle Barbershops
          </Link>
          <h1 className={styles.title}>{shop.name}</h1>
          {thumb && (
            <img
              src={thumb}
              alt={shop.name}
              className={styles.thumbnail}
            />
          )}
        </div>

        {/* Rechte Spalte */}
        <div className={styles.right}>
          <div className={styles.calendarWrapper}>
            <Calendar
              onChange={setDate}
              value={date}
              minDate={new Date()}
            />
          </div>

          <form onSubmit={handleBooking} className={styles.form}>
            <input
              readOnly
              className={styles.input}
              value={date.toLocaleDateString('de-DE')}
            />

            <select
              required
              value={time}
              onChange={e => setTime(e.target.value)}
              className={styles.select}
            >
              <option value="">– Uhrzeit wählen –</option>
              {slots.map(s => <option key={s} value={s}>{s}</option>)}
            </select>

            <select
              required
              value={selectedBarber}
              onChange={e => setBarber(e.target.value)}
              className={styles.select}
            >
              <option value="">– Barber wählen –</option>
              {barbers.map(b => (
                <option key={b.id} value={b.id}>{b.full_name}</option>
              ))}
            </select>

            <select
              required
              value={selectedService}
              onChange={e => setService(e.target.value)}
              className={styles.select}
            >
              <option value="">– Leistung wählen –</option>
              {services.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>

            <button
              type="submit"
              disabled={loading}
              className={styles.button}
            >
              Termin buchen
            </button>
          </form>

          {appointment && (
            <div className={styles.bookingCard}>
              <h2>Dein Termin</h2>
              <p>
                <strong>Datum:</strong>{' '}
                {new Date(appointment.appointment_time)
                  .toLocaleString('de-DE',{ dateStyle:'short', timeStyle:'short' })}
              </p>
              <p>
                <strong>Barber:</strong>{' '}
                {barbers.find(b => b.id === appointment.barber_id)?.full_name}
              </p>
              <p>
                <strong>Leistung:</strong>{' '}
                {services.find(s => s.id === appointment.service_id)?.name}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
