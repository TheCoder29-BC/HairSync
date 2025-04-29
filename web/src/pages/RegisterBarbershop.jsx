// src/pages/Barbershops.jsx
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabase/client.js'
import styles from '../components/Card.module.css'

// 1) Lokale Bilder importieren
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

// 2) Map von Shop-Name → lokalem Bild
const IMAGE_MAP = {
  'Barber King':     shop1,
  'Classic Cuts':    shop2,
  'Urban Fade':      shop3,
  'Retro Shave':     shop4,
  "Gentlemen's Den": shop5,
  'Modern Mane':     shop6,
  'The Buzz Stop':   shop7,
  'Fade & Blade':    shop8,
  'Sharp Lines':     shop9,
  'Clippers Club':   shop10,
}

export default function Barbershops() {
  const [shops,   setShops]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    async function load() {
      setLoading(true)

      // 3) Nur id, name und image_url auslesen
      const { data, error } = await supabase
        .from('barbershops')
        .select('id, name, image_url')

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

  if (loading) {
    return <div style={{ padding: '2rem' }}>Lade Barbershops…</div>
  }
  if (error) {
    return (
      <div style={{ padding: '2rem', color: 'crimson' }}>
        Fehler: {error}
      </div>
    )
  }
  if (!shops.length) {
    return <div style={{ padding: '2rem' }}>Keine Barbershops gefunden.</div>
  }

  return (
    <div style={{ maxWidth: 1200, margin: '2rem auto', padding: '0 1rem' }}>
      <h1>Barbershops</h1>
      <div className={styles.cardGrid}>
        {shops.map(shop => {
          // Reihenfolge der Bild-Suche:
          // 1) image_url aus DB
          // 2) Lokales IMAGE_MAP[shop.name]
          // 3) Placeholder via URL mit shop.name
          const imgSrc =
            shop.image_url ||
            IMAGE_MAP[shop.name] ||
            `https://via.placeholder.com/300x200?text=${encodeURIComponent(shop.name)}`

          return (
            <Link
              key={shop.id}
              to={`/barbershops/${shop.id}`}
              className={styles.card}
            >
              <img
                src={imgSrc}
                alt={shop.name}
                style={{ objectFit: 'cover' }}
              />
              <h3>{shop.name}</h3>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
