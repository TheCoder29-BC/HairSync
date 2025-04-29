// web/src/pages/LoginChoice.jsx
import React from 'react'
import { Link } from 'react-router-dom'
import styles from './LoginChoice.module.css'

export default function LoginChoice() {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Willkommen bei HairSync</h1>
        <div className={styles.buttons}>
          <Link to="/login/customer" className={styles.button}>
            Kunden-Login
          </Link>
          <Link to="/login/barber" className={styles.button}>
            Barbershop-Login
          </Link>
        </div>
        <div className={styles.register}>
          Noch keinen Account? <Link to="/register">Hier registrieren</Link>
        </div>
      </div>
    </div>
  )
}
