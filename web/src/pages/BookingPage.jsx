// src/pages/BookingPage.jsx
import React from 'react'
import { useParams, Link } from 'react-router-dom'
import SlotScheduler from '../components/SlotScheduler.jsx'
import styles from './BookingPage.module.css'

export default function BookingPage() {
  const { shopId } = useParams()

  return (
    <div style={{ padding: '1rem' }}>
      <h1>Termin buchen</h1>
      <Link to="/book" style={{ marginBottom: '1rem', display: 'inline-block', textDecoration: 'none' }}>
        ← {/** Du kannst diese Übersetzung mit i18n machen, z.B. t('back_to_list') */}Zurück zur Übersicht
      </Link>

      <SlotScheduler shopId={shopId} />
    </div>
  )
}
