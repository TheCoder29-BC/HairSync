// src/pages/CustomerAppointments.jsx
import React, { useEffect, useState } from 'react'
import { supabase }                  from '../supabase/client.js'
import { useTranslation }            from 'react-i18next'
import styles                        from './CustomerAppointments.module.css'
import placeholder                   from '../assets/placeholder.jpg'

// Bilder für Fallback
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

export default function CustomerAppointments() {
  const { t, i18n } = useTranslation()
  const [appointments, setAppointments] = useState([])
  const [shops, setShops]               = useState([])
  const [barbers, setBarbers]           = useState([])
  const [services, setServices]         = useState([])
  const [ratings, setRatings]           = useState({})
  const [submitted, setSubmitted]       = useState({})
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState(null)

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      const { data: authData, error: authErr } = await supabase.auth.getSession()
      if (authErr || !authData.session?.user) {
        setError(t('please_login_to_view'))
        setLoading(false)
        return
      }
      const userId = authData.session.user.id

      // Parallel alle Tabellen laden
      const [shopsRes, barbersRes, servicesRes, apptsRes] = await Promise.all([
        supabase.from('barbershops').select('id,name,image_url'),
        supabase.from('barbers').select('id,full_name,barbershop_id'),
        supabase.from('shop_services').select('id,name,price'),
        supabase
          .from('appointments')
          .select('id,appointment_time,status,barber_id,service_id,barbershop_id')
          .eq('user_id', userId)
          .order('appointment_time', { ascending: true })
      ])

      if (shopsRes.error || barbersRes.error || servicesRes.error || apptsRes.error) {
        console.error(shopsRes.error || barbersRes.error || servicesRes.error || apptsRes.error)
        setError(t('error_loading_appointments'))
      } else {
        setShops(shopsRes.data)
        setBarbers(barbersRes.data)
        setServices(servicesRes.data)
        setAppointments(apptsRes.data)

        // Ratings initialisieren
        const initRatings = {}
        const initSub     = {}
        apptsRes.data.forEach(a => {
          initRatings[a.id] = { service: 0, cleanliness: 0 }
          initSub[a.id]     = false
        })
        setRatings(initRatings)
        setSubmitted(initSub)
      }
      setLoading(false)
    })()
  }, [t])

  const handleRating = (id, type, value) => {
    if (submitted[id]) return
    setRatings(prev => ({
      ...prev,
      [id]: { ...prev[id], [type]: value }
    }))
  }

  const handleSubmitRating = async id => {
    const { service, cleanliness } = ratings[id]
    const { error: updErr } = await supabase
      .from('appointments')
      .update({ service_rating: service, cleanliness_rating: cleanliness })
      .eq('id', id)
    if (updErr) setError(t('error_rating_save'))
    else       setSubmitted(prev => ({ ...prev, [id]: true }))
  }

  const handleCancel = async (id, isPast) => {
    if (!isPast) {
      const { error: cancelErr } = await supabase
        .from('appointments')
        .update({ status: 'canceled' })
        .eq('id', id)
      if (cancelErr) setError(t('error_cancel'))
      else setAppointments(prev =>
        prev.map(a => a.id === id ? { ...a, status: 'canceled' } : a)
      )
    } else {
      setAppointments(prev => prev.filter(a => a.id !== id))
    }
  }

  if (loading) return <p className={styles.message}>{t('loading')}</p>
  if (error)   return <p className={styles.messageError}>{error}</p>
  if (!appointments.length) return <p className={styles.message}>{t('no_appointments')}</p>

  return (
    <div className={styles.wrapper}>
      <h1 className={styles.header}>{t('my_appointments')}</h1>
      <ul className={styles.list}>
        {appointments.map(a => {
          const dt     = new Date(a.appointment_time)
          const date   = dt.toLocaleDateString(i18n.language, { day:'2-digit', month:'2-digit', year:'numeric' })
          const time   = dt.toLocaleTimeString(i18n.language, { hour:'2-digit', minute:'2-digit' })
          const isPast = dt.getTime() < Date.now()

          // Lookup
          const shop    = shops.find(s => s.id === a.barbershop_id)   || {}
          const barber  = barbers.find(b => b.id === a.barber_id)     || {}
          const service = services.find(sv => sv.id === a.service_id) || {}

          // Fallback-Bild
          const key = shop.name?.toLowerCase().trim() || ''
          const img = shop.image_url && !shop.image_url.includes('placeholder')
                      ? shop.image_url
                      : IMAGE_MAP[key] || placeholder

          return (
            <li key={a.id} className={styles.card}>
              <img src={img} alt={shop.name} className={styles.avatar} />

              <div className={styles.info}>
                <div className={styles.shopName}>{shop.name}</div>
                <div className={styles.when}>
                  {date} <span className={styles.clock}>⏰ {time}</span>
                </div>
                <div className={styles.detail}>
                  <strong>{t('service')}:</strong> {service.name} {service.price ? `(${service.price}€)` : ''}
                </div>
                <div className={styles.detail}>
                  <strong>{t('barber')}:</strong> {barber.full_name}
                </div>
                <div className={styles.detail}>
                  <strong>{t('status')}:</strong> {t(a.status)}
                </div>
                {isPast && (
                  <div className={styles.pastLabel}>{t('past_appointment')}</div>
                )}
              </div>

              <div className={styles.actions}>
                {!isPast && (
                  <button
                    className={styles.cancel}
                    onClick={() => handleCancel(a.id, false)}
                  >
                    {t('cancel')}
                  </button>
                )}
                {isPast && !submitted[a.id] && (
                  <button
                    className={styles.submitButton}
                    onClick={() => handleSubmitRating(a.id)}
                  >
                    {t('submit_rating')}
                  </button>
                )}
                {isPast && submitted[a.id] && (
                  <button
                    className={styles.cancel}
                    onClick={() => handleCancel(a.id, true)}
                  >
                    {t('remove_view')}
                  </button>
                )}
              </div>

              {/* Rating-Stars */}
              {isPast && (
                <div className={styles.ratingSection}>
                  <div>
                    {[1,2,3,4,5].map(n => (
                      <span
                        key={n}
                        className={`${styles.star} ${ratings[a.id]?.service >= n ? styles.filled : ''} ${!submitted[a.id] ? styles.clickable : ''}`}
                        onClick={() => handleRating(a.id, 'service', n)}
                      >
                        {ratings[a.id]?.service >= n ? '★' : '☆'}
                      </span>
                    ))}
                  </div>
                  <div>
                    {[1,2,3,4,5].map(n => (
                      <span
                        key={n}
                        className={`${styles.star} ${ratings[a.id]?.cleanliness >= n ? styles.filled : ''} ${!submitted[a.id] ? styles.clickable : ''}`}
                        onClick={() => handleRating(a.id, 'cleanliness', n)}
                      >
                        {ratings[a.id]?.cleanliness >= n ? '★' : '☆'}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
