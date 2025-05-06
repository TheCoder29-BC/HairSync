// src/pages/ShopDetail.jsx
import React, { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
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

// Generiert Zeiten im Intervall (in Minuten) zwischen open und close
function generateSlots(openTime, closeTime, interval = 30) {
  if (!openTime || !closeTime) return []
  const [oh, om] = openTime.split(':').map(Number)
  const [ch, cm] = closeTime.split(':').map(Number)
  const slots = []
  let cur = new Date(0, 0, 0, oh, om)
  const end = new Date(0, 0, 0, ch, cm)
  while (cur < end) {
    slots.push(
      cur.toLocaleTimeString('de-DE', {
        hour: '2-digit',
        minute: '2-digit',
      })
    )
    cur = new Date(cur.getTime() + interval * 60000)
  }
  return slots
}

export default function ShopDetail() {
  const { session }    = useAuth()
  const { id: shopId } = useParams()
  const navigate       = useNavigate()

  // Shop-States
  const [shop, setShop]                 = useState(null)
  const [openingHours, setOpeningHours] = useState([])
  const [barbers, setBarbers]           = useState([])
  const [services, setServices]         = useState([])

  // Booking-Form States
  const [date, setDate]               = useState(new Date())
  const [barberId, setBarberId]       = useState('')   // Barbers.id
  const [time, setTime]               = useState('')
  const [serviceId, setServiceId]     = useState('')
  const [appointment, setAppointment] = useState(null)

  // Loading & Error
  const [loadingData, setLoadingData] = useState(true)
  const [loading, setLoading]         = useState(false)
  const [errorMsg, setErrorMsg]       = useState('')

  // Slot-Filtering States
  const [bookedSlots, setBookedSlots] = useState([])
  const [timeOptions, setTimeOptions] = useState([])

  // 1) Lade Shop + Öffnungszeiten + Barbers + Services
  useEffect(() => {
    if (!session) return
    ;(async () => {
      setLoadingData(true)
      setErrorMsg('')
      try {
        // Shop inkl. owner_user_id
        const { data: shopData, error: shopErr } = await supabase
          .from('barbershops')
          .select('id,name,image_url,owner_user_id')
          .eq('id', shopId)
          .single()
        if (shopErr) throw shopErr
        setShop(shopData)

        // Öffnungszeiten
        const { data: hoursData, error: hoursErr } = await supabase
          .from('opening_hours')
          .select('day_of_week,open_time,close_time,is_closed')
          .eq('barbershop_id', shopId)
          .order('day_of_week')
        if (hoursErr) throw hoursErr
        setOpeningHours(hoursData)

        // Friseure mit user_id (Profile-ID)
        const { data: barbersData, error: barbersErr } = await supabase
          .from('barbers')
          .select('id,full_name,user_id')
          .eq('barbershop_id', shopId)
          .order('full_name')
        if (barbersErr) throw barbersErr
        setBarbers(barbersData)

        // Leistungen
        const { data: svcData, error: svcErr } = await supabase
          .from('shop_services')
          .select('id,name,price')
          .eq('barbershop_id', shopId)
          .order('name')
        if (svcErr) throw svcErr
        setServices(svcData)

      } catch (err) {
        setErrorMsg(err.message)
      }
      setLoadingData(false)
    })()
  }, [session, shopId])

  // 2) Lade gebuchte Slots (appointments.barber_id = profiles.id)
  useEffect(() => {
    if (!barberId) {
      setBookedSlots([]); return
    }
    const day  = date.toISOString().slice(0, 10)
    const from = `${day}T00:00:00Z`
    const to   = `${day}T23:59:59Z`
    ;(async () => {
      const profileId = barbers.find(b => b.id === barberId)?.user_id
      if (!profileId) return

      const { data, error } = await supabase
        .from('appointments')
        .select('appointment_time')
        .eq('barber_id', profileId)
        .eq('status', 'confirmed')
        .gte('appointment_time', from)
        .lte('appointment_time', to)

      if (!error) {
        setBookedSlots(
          data.map(a =>
            new Date(a.appointment_time).toLocaleTimeString('de-DE', {
              hour: '2-digit',
              minute: '2-digit',
            })
          )
        )
      }
    })()
  }, [barberId, date, barbers])

  // 3) Generiere und filtere timeOptions
  useEffect(() => {
    const weekday = date.getDay() === 0 ? 7 : date.getDay()
    const todays  = openingHours.find(h => h.day_of_week === weekday)
    if (!todays || todays.is_closed || !barberId) {
      setTimeOptions([]); setTime(''); return
    }
    const slots    = generateSlots(todays.open_time, todays.close_time)
    setTimeOptions(slots.filter(s => !bookedSlots.includes(s)))
    if (!slots.includes(time)) setTime('')
  }, [openingHours, barberId, bookedSlots, date, time])

  // 4) Buchungs-Handler
  const handleBooking = async e => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')
    try {
      const dt = new Date(date)
      const [h, m] = time.split(':').map(Number)
      dt.setHours(h, m, 0, 0)

      const profileId = barbers.find(b => b.id === barberId)?.user_id
      if (!profileId) throw new Error('Bitte Barber auswählen')

      const { data, error } = await supabase
        .from('appointments')
        .insert([{
          appointment_time: dt.toISOString(),
          status:           'pending',
          user_id:          session.user.id,
          barbershop_id:    shopId,
          barber_id:        profileId,
          service_id,
        }])
        .single()
      if (error) throw error

      setAppointment(data)
      toast.success('Termin erfolgreich gebucht!')
      setTime(''); setBarberId(''); setServiceId('')
    } catch (err) {
      setErrorMsg('Fehler: ' + err.message)
    }
    setLoading(false)
  }

  if (!session)      return null
  if (loadingData)   return <p className={styles.loading}>Lade Shop …</p>
  if (errorMsg)      return <div className={styles.errorBanner}>{errorMsg}</div>

  const key   = shop.name.trim().toLowerCase()
  const thumb = IMAGE_MAP[key] || shop.image_url

  return (
    <div className={styles.wrapper}>
      <Toaster position="top-center" />

      <div className={styles.card}>
        {/* Linke Spalte */}
        <div className={styles.left}>
          <Link to="/barbershops" className={styles.backLink}>
            ← alle Barbershops
          </Link>
          <h1 className={styles.title}>{shop.name}</h1>
          {thumb && <img src={thumb} alt={shop.name} className={styles.thumbnail} />}

          {/* Chat starten mit dem Shop */}
          <Link
            to={`/chat/${shopId}`}
            className={styles.chatButton}
          >
            💬 Chat starten
          </Link>
        </div>

        {/* Mittlere Spalte: Kalender */}
        <div className={styles.calendarWrapper}>
          <Calendar
            onChange={setDate}
            value={date}
            minDate={new Date()}
          />
        </div>

        {/* Rechte Spalte: Öffnungszeiten & Preise */}
        <div className={styles.info}>
          <div className={styles.infoSection}>
            <h2>Öffnungszeiten</h2>
            <ul className={styles.hoursList}>
              {openingHours.map(h => {
                const days  = ['Mo','Di','Mi','Do','Fr','Sa','So']
                const label = days[h.day_of_week - 1]
                const times = h.is_closed
                  ? 'geschlossen'
                  : `${h.open_time.slice(0,5)}–${h.close_time.slice(0,5)}`
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

        {/* Buchungs-Formular */}
        <form onSubmit={handleBooking} className={styles.form}>
          <input
            readOnly
            className={styles.input}
            value={date.toLocaleDateString('de-DE')}
          />

          <select
            required
            className={styles.select}
            value={barberId}
            onChange={e => { setBarberId(e.target.value); setTime('') }}
          >
            <option value="">– Barber wählen –</option>
            {barbers.map(b => (
              <option key={b.id} value={b.id}>{b.full_name}</option>
            ))}
          </select>

          <select
            required
            className={styles.select}
            value={time}
            onChange={e => setTime(e.target.value)}
          >
            <option value="">– Uhrzeit wählen –</option>
            {timeOptions.map(s => (
              <option key={s} value={s}>{s}</option>
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

          <button type="submit" disabled={loading} className={styles.button}>
            {loading ? 'Buchen …' : 'Termin buchen'}
          </button>
        </form>

        {/* Buchungs-Bestätigung */}
        {appointment && (
          <div className={styles.bookingCard}>
            <h2>Dein Termin</h2>
            <p>
              <strong>Datum:</strong>{' '}
              {new Date(appointment.appointment_time).toLocaleString('de-DE', {
                dateStyle: 'short',
                timeStyle: 'short',
              })}
            </p>
            <p>
              <strong>Barber:</strong>{' '}
              {barbers.find(b => b.user_id === appointment.barber_id)?.full_name}
            </p>
            <p>
              <strong>Leistung:</strong>{' '}
              {services.find(s => s.id === appointment.service_id)?.name}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
