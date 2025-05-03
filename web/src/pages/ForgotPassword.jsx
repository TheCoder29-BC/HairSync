// src/pages/ForgotPassword.jsx
import React, { useState } from 'react'
import { Link }            from 'react-router-dom'
import { supabase }        from '../supabase/client.js'
import styles              from './ForgotPassword.module.css'

export default function ForgotPassword() {
  const [email, setEmail]         = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError]         = useState(null)

  const handleReset = async e => {
    e.preventDefault()
    setError(null)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      // Link in der E-Mail führt auf deine Reset-Seite
      redirectTo: window.location.origin + '/reset-password'
    })
    if (error) setError(error.message)
    else       setSubmitted(true)
  }

  // nach Absenden: Hinweis anzeigen
  if (submitted) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <h2 className={styles.title}>Check Deine E-Mail</h2>
          <p className={styles.message}>
            Falls existierend, haben wir an <strong>{email}</strong> einen Link
            zum Zurücksetzen verschickt.
          </p>
          <Link to="/login" className={styles.link}>Zurück zum Login</Link>
        </div>
      </div>
    )
  }

  // Standard-Formular
  return (
    <div className={styles.container}>
      <form onSubmit={handleReset} className={styles.card}>
        <h2 className={styles.title}>Passwort zurücksetzen</h2>
        {error && <p className={styles.error}>{error}</p>}
        <div className={styles.field}>
          <label>E-Mail</label>
          <input
            type="email"
            value={email}
            onChange={e=>setEmail(e.target.value)}
            required
          />
        </div>
        <button type="submit" className={styles.button}>
          Link senden
        </button>
        <Link to="/login" className={styles.link}>Abbrechen</Link>
      </form>
    </div>
  )
}
