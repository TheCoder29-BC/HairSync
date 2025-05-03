// src/pages/ShopDetail.jsx
import React, { useEffect, useState } from 'react'
import { useParams, Link }            from 'react-router-dom'
import Calendar                        from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import { Toaster, toast }              from 'react-hot-toast'
import { useAuth }                     from '../context/AuthContext.jsx'
import { supabase }                    from '../supabase/client.js'
import styles                          from './ShopDetail.module.css'

// Lokale Fallback-Bilder
import shop1  from '../assets/barbershops/shop1.jpg'
import shop2  from '../assets/barbershops/shop2.jpg'
import shop3  from '../assets/barbershops/shop3.jpg'
import shop4  from '../assets/barbershops/shop4.jpg'
import shop5  from '../assets/barbershops/shop5.jpg'
import shop6  from '../assets/barbershops/shop6.jpg'
import shop7  from '../assets/barbershops/shop7.jpg'
import shop8  from '../assets/barbershops/shop8.jpg'
import shop9  from '../assets/barbershops/shop9.jpg'
import shop10 from '../assets/barbershops/shop10.jpg'
import shop11 from '../assets/barbershops/shop11.jpg'
import shop12 from '../assets/barbershops/shop12.jpg'
import shop13 from '../assets/barbershops/shop13.jpg'
import shop14 from '../assets/barbershops/shop14.jpg'
import shop15 from '../assets/barbershops/shop15.jpg'
import shop16 from '../assets/barbershops/shop16.jpg'
import shop17 from '../assets/barbershops/shop17.jpg'
import shop18 from '../assets/barbershops/shop18.jpg'

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

export default function ShopDetail() {
  const { session }    = useAuth()
  const { id: shopId } = useParams()

  const [shop, setShop]               = useState(null)
  const [barbers, setBarbers]         = useState([])
  const [services, setServices]       = useState([])
  const [openingHours, setOpeningHours] = useState([])
  const [date, setDate]               = useState(new Date())
  const [time, setTime]               = useState('')
  const [barberId, setBarberId]       = useState('')
  const [serviceId, setServiceId]     = useState('')
  const [appointment, setAppointment] = useState(null)
  const [loading, setLoading]         = useState(false)

  // Slots 9–17 Uhr
  const slots = Array.from({ length: 9 }, (_, i) => `${9 + i}:00`)

  useEffect(() => {
    if (!session) return
    ;(async () => {
      // --- 1) Shop-Daten
      const { data: shopData, error: shopErr } = await supabase
        .from('barbershops')
        .select('id, name, image_url')
        .eq('id', shopId)
        .single()
      if (shopErr) {
        toast.error('Shop nicht gefunden.')
        return
      }
      setShop(shopData)

      // --- 2) Öffnungszeiten
      const { data: hoursData, error: hoursErr } = await supabase
        .from('opening_hours')
        .select('day_of_week, open_time, close_time, is_closed')
        .eq('barbershop_id', shopId)
        .order('day_of_week')
      if (hoursErr) toast.error('Fehler beim Laden der Öffnungszeiten.')
      else          setOpeningHours(hoursData)

      // --- 3) Friseure
      const { data: barbersData, error: barbersErr } = await supabase
        .from('barbers')
        .select('id, full_name')
        .eq('barbershop_id', shopId)
        .order('full_name')
      if (barbersErr) toast.error('Fehler beim Laden der Friseure.')
      else            setBarbers(barbersData)

      // --- 4) shop_services (id, name, price)
      const { data: svcData, error: svcErr } = await supabase
        .from('shop_services')
        .select('id, name, price')
        .eq('barbershop_id', shopId)
        .order('name')
      if (svcErr) {
        toast.error('Fehler beim Laden der Leistungen.')
      } else {
        setServices(svcData)
      }
    })()
  }, [session, shopId])

  if (!session) return null
  if (!shop)    return <div className={styles.loading}>Lade Shop…</div>

  // Thumbnail-Fallback
  const key   = shop.name.trim().toLowerCase()
  const thumb = IMAGE_MAP[key] || shop.image_url

  const handleBooking = async e => {
    e.preventDefault()
    setLoading(true)

    // Datum + Zeit kombinieren
    const dt = new Date(date)
    const [h, m] = time.split(':').map(Number)
    dt.setHours(h, m, 0, 0)

    const { data, error } = await supabase
      .from('appointments')
      .insert([{
        appointment_time: dt.toISOString(),
        status:          'pending',
        user_id:         session.user.id,
        barbershop_id:   shopId,
        barber_id:       barberId,
        service_id:      serviceId,  // das ist jetzt eine gültige shop_services.id
      }])
      .single()

    setLoading(false)
    if (error) {
      toast.error('Fehler beim Buchen: ' + error.message)
    } else {
      toast.success('Termin erfolgreich gebucht!')
      setAppointment(data)
      setTime(''); setBarberId(''); setServiceId('')
    }
  }

  return (
    <div className={styles.wrapper}>
      <Toaster position="top-center" />
      <div className={styles.card}>

        {/* Spalte 1: Shop-Info */}
        <div className={styles.left}>
          <Link to="/barbershops" className={styles.backLink}>
            ← alle Barbershops
          </Link>
          <h1 className={styles.title}>{shop.name}</h1>
          {thumb && <img src={thumb} alt={shop.name} className={styles.thumbnail}/> }
        </div>

        {/* Spalte 2: Kalender */}
        <div className={styles.calendarWrapper}>
          <Calendar onChange={setDate} value={date} minDate={new Date()} />
        </div>

        {/* Spalte 3: Öffnungszeiten & Preise */}
        <div className={styles.info}>
          <div className={styles.infoSection}>
            <h2>Öffnungszeiten</h2>
            <ul className={styles.hoursList}>
              {openingHours.map(h => {
                const days  = ['Mo','Di','Mi','Do','Fr','Sa','So']
                const label = days[h.day_of_week - 1]
                const fmt   = t => t?.slice(0,5)
                const times = h.is_closed
                  ? 'geschlossen'
                  : `${fmt(h.open_time)}–${fmt(h.close_time)}`
                return (
                  <li key={h.day_of_week}>
                    <span className={styles.day}>{label}</span>
                    <span className={styles.time}>{times}</span>
                  </li>
                )
              })}
            </ul>
          </div>
          <div className={styles.infoSection}>
            <h2>Leistungen & Preise</h2>
            <ul className={styles.servicesList}>
              {services.map(s => (
                <li key={s.id}>
                  <span>{s.name}</span>
                  <span className={styles.price}>
                    {parseFloat(s.price).toFixed(2)} €
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Formular (breit über Spalten 2+3) */}
        <form onSubmit={handleBooking} className={styles.form}>
          <input
            readOnly
            className={styles.input}
            value={date.toLocaleDateString('de-DE')}
          />

          <select
            required
            className={styles.select}
            value={time}
            onChange={e => setTime(e.target.value)}
          >
            <option value="">– Uhrzeit wählen –</option>
            {slots.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          <select
            required
            className={styles.select}
            value={barberId}
            onChange={e => setBarberId(e.target.value)}
          >
            <option value="">– Barber wählen –</option>
            {barbers.map(b => (
              <option key={b.id} value={b.id}>{b.full_name}</option>
            ))}
          </select>

          <select
            required
            className={styles.select}
            value={serviceId}
            onChange={e => setServiceId(e.target.value)}
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

        {/* Bestätigung */}
        {appointment && (
          <div className={styles.bookingCard}>
            <h2>Dein Termin</h2>
            <p>
              <strong>Datum:</strong>{' '}
              {new Date(appointment.appointment_time)
                .toLocaleString('de-DE',{
                  dateStyle: 'short',
                  timeStyle: 'short'
                })}
            </p>
            <p>
              <strong>Barber:</strong>{' '}
              {barbers.find(b => b.id === appointment.barber_id)
                 ?.full_name}
            </p>
            <p>
              <strong>Leistung:</strong>{' '}
              {services.find(s => s.id === appointment.service_id)
                 ?.name}
            </p>
          </div>
        )}

        {/* Spinner Overlay */}
        {loading && (
          <div className={styles.spinnerOverlay}>
            <div className={styles.spinner}>
              <div/><div/><div/>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
