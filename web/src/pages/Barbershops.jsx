// src/pages/Barbershops.jsx
import React, { useEffect, useState } from 'react'
import { Link }                       from 'react-router-dom'
import { supabase }                   from '../supabase/client.js'
import styles                         from '../components/Card.module.css'

// 1) Alle 19 Bilder importieren
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
import shop19 from '../assets/barbershops/shop19.jpg'

// 2) Mapping mit lowercased Keys
const IMAGE_MAP = {
  'barber king':            shop1,
  'classic cuts':           shop2,
  'urban fade':             shop3,
  'retro shave':            shop4,
  'gentlemens den':         shop5,
  "gentlemen's den":        shop5,
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

// 3) Dein lokaler Placeholder für das große Bild
import placeholder from '../assets/placeholder.jpg'

// 4) Neuer Placeholder für das Logo-Avatar
import placeholderLogo from '../assets/placeholder_logo.jpg'

export default function Barbershops() {
  const [shops,   setShops]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const { data, error } = await supabase
        .from('barbershops')
        .select('id, name, logo_url, image_url')
        .order('name')
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
      <h1 style={{ fontFamily: 'inherit', textAlign:'center' }}>Barbershops</h1>
      <div className={styles.cardGrid}>
        {shops.map(shop => {
          const rawTitle = shop.name ?? '– Unbekannt –'
          const title    = rawTitle.trim().replace(/’/g, "'")
          const key      = title.toLowerCase()

          // Großes Header-Bild
          const hasCustomImage =
            shop.image_url &&
            shop.image_url.trim() !== '' &&
            !shop.image_url.includes('placeholder.com')
          const imgSrc = hasCustomImage
            ? shop.image_url
            : (IMAGE_MAP[key] || placeholder)

          // Logo-Avatar oder placeholderLogo
          const avatarSrc = shop.logo_url && shop.logo_url.trim() !== ''
            ? shop.logo_url
            : placeholderLogo

          return (
            <Link
              key={shop.id}
              to={`/barbershops/${shop.id}`}
              className={`${styles.card} animate-bounce-in`}
            >
              <img
                src={imgSrc}
                alt={title}
                className={styles.cardImage}
              />
              <div className={styles.cardHeader}>
                <img
                  src={avatarSrc}
                  alt={`${title} Logo`}
                  className={styles.avatar}
                />
                <h3 className={styles.cardTitle}>{title}</h3>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
