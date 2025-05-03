// src/pages/ShopAppointments.jsx
import React, { useEffect, useState, useMemo } from 'react'
import { useAuth }                    from '../context/AuthContext.jsx'
import { supabase }                   from '../supabase/client.js'
import { Bar }                        from 'react-chartjs-2'
import 'chart.js/auto'
import styles                         from './ShopAppointments.module.css'

export default function ShopAppointments() {
  const { session } = useAuth()
  const [appts,    setAppts]    = useState([])
  const [barbers,  setBarbers]  = useState([])
  const [services, setServices] = useState([])
  const [profiles, setProfiles] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState(null)

  // Id des Barbers, null = alle
  const [filterBarberId, setFilterBarberId] = useState(null)

  useEffect(() => {
    if (!session) return
    ;(async () => {
      setLoading(true)
      try {
        // Shop-ID holen
        const { data: shop, error: shopErr } = await supabase
          .from('barbershops')
          .select('id')
          .eq('owner_user_id', session.user.id)
          .maybeSingle()
        if (shopErr || !shop) throw new Error('Kein Shop gefunden')
        const shopId = shop.id

        // parallel alle Daten laden
        const [
          { data: apptsData,    error: apptsErr    },
          { data: barbersData,  error: barbersErr  },
          { data: servicesData, error: servicesErr },
          { data: profilesData, error: profilesErr },
        ] = await Promise.all([
          supabase
            .from('appointments')
            .select('id, appointment_time, status, barber_id, user_id, service_rating, cleanliness_rating')
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
        if (apptsErr || barbersErr || servicesErr || profilesErr)
          throw apptsErr||barbersErr||servicesErr||profilesErr

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

  // Helfer für Termin-Statistiken
  const aggregate = unit => {
    const buckets = {}
    appts.forEach(a => {
      if (filterBarberId && a.barber_id !== filterBarberId) return
      const d = new Date(a.appointment_time)
      let key
      switch (unit) {
        case 'week': {
          const ys = new Date(d.getFullYear(),0,1)
          const dayNum = Math.floor((d - ys)/(24*60*60*1000)) + ys.getDay()+1
          const week  = Math.ceil(dayNum/7)
          key = `${d.getFullYear()}-W${week}`
          break
        }
        case 'month':
          key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`
          break
        case 'year':
          key = String(d.getFullYear())
          break
        default:
          key = 'all'
      }
      if (!buckets[key]) buckets[key] = { booked:0, canceled:0 }
      if (a.status === 'canceled') buckets[key].canceled++
      else                          buckets[key].booked++
    })
    const labels = Object.keys(buckets).sort()
    return {
      labels,
      datasets: [
        { label: 'Gebucht',  data: labels.map(l => buckets[l].booked),    backgroundColor: 'rgba(79,70,229,0.7)' },
        { label: 'Storniert', data: labels.map(l => buckets[l].canceled), backgroundColor: 'rgba(239,68,68,0.7)' }
      ]
    }
  }

  // Chart-Daten
  const weekData  = useMemo(() => aggregate('week'),  [appts, filterBarberId])
  const monthData = useMemo(() => aggregate('month'), [appts, filterBarberId])
  const yearData  = useMemo(() => aggregate('year'),  [appts, filterBarberId])

  // Kundenzufriedenheit
  const avgRatingData = useMemo(() => {
    const subset = filterBarberId ? appts.filter(a => a.barber_id === filterBarberId) : appts
    const total = subset.length
    const sumS = subset.reduce((sum, a) => sum + (a.service_rating||0), 0)
    const sumC = subset.reduce((sum, a) => sum + (a.cleanliness_rating||0), 0)
    const avgS = total>0 ? sumS/total : 0
    const avgC = total>0 ? sumC/total : 0
    return {
      labels: ['Service','Sauberkeit'],
      datasets:[{ label:'Kundenzufriedenheit', data:[avgS.toFixed(1),avgC.toFixed(1)], backgroundColor:['rgba(79,70,229,0.7)','rgba(239,68,68,0.7)'] }]
    }
  }, [appts, filterBarberId])

  if (loading) return <p className={styles.message}>…Lade Termine</p>
  if (error)   return <p className={styles.message} style={{color:'crimson'}}>{error}</p>
  if (!appts.length) return <p className={styles.message}>Keine Termine.</p>

  const now = new Date()

  return (
    <div className={styles.wrapper}>

      {/* 1) Shop-Termine */}
      <h1 className={styles.header}>Shop-Termine</h1>
      <ul className={styles.list}>
        {appts.map(a => {
          const d = new Date(a.appointment_time)
          const isPast = d < now
          const day  = d.toLocaleDateString('de-DE',{day:'2-digit',month:'2-digit',year:'numeric'})
          const time = d.toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit'})
          const barber = barbers.find(b=>b.id===a.barber_id)||{}
          const service= services.find(s=>s.id===a.service_id)||{}
          const prof   = profiles.find(p=>p.id===a.user_id)||{}
          const customer = prof.first_name||prof.last_name ? `${prof.first_name} ${prof.last_name}`.trim():'–'
          const phone  = prof.phone||'–'
          const icon   = a.status==='pending'?'❓':'👍'
          return (
            <li key={a.id} className={styles.card}>
              <div className={styles.info}>
                <div><strong>Datum:</strong> {day} ⏰ {time}</div>
                <div><strong>Service:</strong> {service.name||'–'}</div>
                <div><strong>Barber:</strong> {barber.full_name||'–'}</div>
                <div><strong>Kunde:</strong> {customer}</div>
                <div><strong>Tel.:</strong> {phone}</div>
                <div><strong>Status:</strong> <em>{a.status}</em> {icon}</div>
                {isPast && <div className={styles.pastLabel}>Termin liegt in der Vergangenheit</div>}
              </div>
              <div className={styles.actions}>
                {!isPast && a.status==='pending' && (
                  <button className={styles.confirmBtn} onClick={async()=>{
                    const { error } = await supabase.from('appointments').update({status:'confirmed'}).eq('id',a.id)
                    if(!error) setAppts(xs=>xs.map(x=>x.id===a.id?{...x,status:'confirmed'}:x))
                  }}>Bestätigen</button>
                )}
                {isPast && (
                  <button className={styles.removeBtn} onClick={()=>setAppts(xs=>xs.filter(x=>x.id!==a.id))}>Aus der Ansicht entfernen</button>
                )}
              </div>
            </li>
          )
        })}
      </ul>

      {/* 2) Filter */}
      <div className={styles.filter}>
        <label htmlFor="barberSelect">Statistik für:</label>
        <select id="barberSelect" value={filterBarberId||''} onChange={e=>setFilterBarberId(e.target.value||null)}>
          <option value="">👥 Alle Barbers</option>
          {barbers.map(b=><option key={b.id} value={b.id}>{b.full_name}</option>)}
        </select>
      </div>

      {/* 3) Shop-Statistiken */}
      <h1 className={styles.header}>Shop-Statistiken</h1>
      <div className={styles.chartsGrid}>
        <div className={styles.chartSection}>
          <h2>Termine pro Woche</h2>
          <Bar data={weekData} />
        </div>
        <div className={styles.chartSection}>
          <h2>Termine pro Monat</h2>
          <Bar data={monthData} />
        </div>
        <div className={styles.chartSection}>
          <h2>Termine pro Jahr</h2>
          <Bar data={yearData} />
        </div>
        <div className={styles.chartSection}>
          <h2>Kundenzufriedenheit</h2>
          <Bar data={avgRatingData}
            options={{ responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, max: 5 } } }}
          />
        </div>
      </div>
    </div>
  )
}
