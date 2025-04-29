// src/pages/Barbershops.jsx
import React, { useEffect, useState } from 'react'
import { Link }                     from 'react-router-dom'
import { supabase }                 from '../supabase/client.js'
import styles                       from '../components/Card.module.css'

// 1) Alle 19 Bilder importieren
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
import shop19 from '../assets/barbershops/shop19.jpg'  // optional 19. Bild

// 2) Mapping mit lowercased Keys
const IMAGE_MAP = {
  'barber king':            shop1,
  'classic cuts':           shop2,
  'urban fade':             shop3,
  'retro shave':            shop4,
  'gentlemens den':         shop5,   // ohne Apostroph
  "gentlemen's den":        shop5,   // sicherheitshalber mit Apostroph
  'modern mane':            shop6,
  'the buzz stop':          shop7,
  'fade & blade':           shop8,
  'sharp lines':            shop9,
  'clippers club':          shop10,
  'downtown cuts':          shop11,
  'fresh fades':            shop12,
  'köln style cuts':        shop13,
  'hamburg fades':          shop14,
  'stuttgart fresh look':   shop15,
  'münchen style lounge':   shop16,
  'berlin barber shop':     shop17,
  'hair':                   shop18,
  // 'dein 19. name hier':    shop19,
}

export default function Barbershops() {
  const [shops,   setShops]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const { data, error } = await supabase
        .from('barbershops')
        .select('id, name, image_url')  // nur existierende Spalten!
      if (error) {
        console.error('Fehler beim Laden der Barbershops:', error)
        setError(error.message)
      } else {
        setShops(data)
      }
      setLoading(false)
    }
    load()
  }, [])

  if (loading)       return <div style={{ padding:'2rem' }}>Lade Barbershops…</div>
  if (error)         return <div style={{ padding:'2rem', color:'crimson' }}>Fehler: {error}</div>
  if (!shops.length) return <div style={{ padding:'2rem' }}>Keine Barbershops gefunden.</div>

  return (
    <div style={{ maxWidth:1200, margin:'2rem auto', padding:'0 1rem' }}>
      <h1>Barbershops</h1>
      <div className={styles.cardGrid}>
        {shops.map(shop => {
          // Roh-Titel aus der DB
          const rawTitle = shop.name ?? '– Unbekannt –'
          // normalize (trim + typographischen Apostroph ersetzen)
          const title    = rawTitle.trim().replace(/’/g, "'")
          const key      = title.toLowerCase()

          // 3) Bildquelle wählen:
          // a) echte DB-URL (falls vorhanden)
          // b) lokales Mapping IMAGE_MAP[key]
          // c) lokales Platzhalter-Bild aus public/placeholder.jpg
          const imgSrc =
            (shop.image_url && !shop.image_url.includes('placeholder.com'))
              ? shop.image_url
              : IMAGE_MAP[key] || '/placeholder.jpg'

          return (
            <Link
              key={shop.id}
              to={`/barbershops/${shop.id}`}
              className={styles.card}
            >
              <img
                src={imgSrc}
                alt={title}
                style={{ objectFit:'cover', width:'100%', height:200 }}
              />
              <h3>{title}</h3>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
